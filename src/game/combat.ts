import { CHAIN_RANGE, PROJECTILE_FEEL, isTroopHall, u } from './constants';
import { ENEMIES } from './enemies';
import { Enemy, Projectile, Tower, type BeamFx } from './entities';
import { dist, lerpAngle } from '../shared/math';
import type { Vec2 } from '../shared/math';
import { MUFFLE_FIRE, SANDSTORM_FIRE, isJarlFreeze, isSandstorm, isWardenSeal, muffledTowerIds, towerDamageMul, untargetable } from './verbs';
import { spawnVortex, stepVortices, type Vortex } from './vortices';
import { voidPullEvery } from './forks';

export interface CombatWorld {
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  beams: BeamFx[];
  waypoints: Vec2[];
  vortices: Vortex[];
}

export interface CombatHooks {
  /** Multiplies shot damage and status DPS. Default 1. */
  damageMul?: number;
  onMuzzle?(t: Tower): void;
  onChainHop?(e: Enemy, hop: number, color: string): void;
  onChainDone?(): void;
  onImpact?(p: Projectile): void;
  onDamage?(e: Enemy, amount: number): void;
  afterHits?(): void;
}

function jaggedBolt(x1: number, y1: number, x2: number, y2: number): Vec2[] {
  const pts: Vec2[] = [{ x: x1, y: y1 }];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const segs = 5;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const off = (Math.random() - 0.5) * u(22);
    pts.push({ x: x1 + dx * t + px * off, y: y1 + dy * t + py * off });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

export function canTarget(t: Tower, e: Enemy): boolean {
  if (!e.alive) return false;
  if (untargetable(e)) return false;
  if (t.kind === 'cannon' && e.flying) return false;
  return true;
}

export function pickTarget(t: Tower, enemies: Enemy[]): Enemy | null {
  const inRange = enemies.filter((e) => canTarget(t, e) && dist({ x: t.x, y: t.y }, e.pos) <= t.range);
  if (!inRange.length) return null;
  inRange.sort((a, b) => b.progress - a.progress);
  return inRange[0];
}

/** Full damage inside 40% of splash, 65% out to the edge, 0 beyond. */
export function splashMultiplier(distance: number, splash: number): number {
  if (splash <= 0 || distance > splash) return 0;
  return distance < splash * 0.4 ? 1 : 0.65;
}

/** Where the shot is flying toward — chest on fodder, nearer the eyes on bosses. */
export function enemyAimPoint(e: Enemy): Vec2 {
  const role = ENEMIES[e.kind].role;
  let k = 0.85;
  if (e.flying) k = 1.7;
  else if (role === 'boss') k = 2.35;
  else if (role === 'champion') k = 1.75;
  else if (role === 'special') k = 1.15;
  return { x: e.pos.x, y: e.pos.y - e.radius * k };
}

function hurt(e: Enemy, raw: number, pierce: boolean, hooks: CombatHooks): void {
  e.takeDamage(raw, pierce);
  hooks.onDamage?.(e, raw);
}

function applyPayload(e: Enemy, p: Projectile, mul: number, hooks: CombatHooks): void {
  hurt(e, p.damage * mul, p.pierceArmor, hooks);
  if (p.slow > 0) e.applySlow(p.slow, p.slowDuration);
  if (p.burnDps > 0) e.applyBurn(p.burnDps * mul, p.burnDuration);
  if (p.poisonDps > 0) e.applyPoison(p.poisonDps * mul, p.poisonDuration);
}

export function shotDamage(t: Tower, damageMul = 1): number {
  return t.damage * damageMul;
}

export function fireTower(t: Tower, target: Enemy, world: CombatWorld, hooks: CombatHooks = {}): void {
  const def = t.def;
  const damageMul = hooks.damageMul ?? 1;
  const muzzle = t.muzzlePoint();
  const aim = enemyAimPoint(target);
  t.aim = Math.atan2(aim.y - muzzle.y, aim.x - muzzle.x);
  t.recoil = 1;
  t.muzzle = 1;
  hooks.onMuzzle?.(t);

  if (t.chainAt() > 0) {
    const hit = new Set<number>();
    let current: Enemy | null = target;
    let fromX = muzzle.x;
    let fromY = muzzle.y;
    let dmg = shotDamage(t, damageMul);
    const hops = t.chainAt();
    for (let i = 0; i < hops && current; i++) {
      hit.add(current.id);
      const hop = enemyAimPoint(current);
      world.beams.push({
        x1: fromX,
        y1: fromY,
        x2: hop.x,
        y2: hop.y,
        color: def.color,
        life: 0.22,
        maxLife: 0.22,
        width: 3.2 - i * 0.4,
        points: jaggedBolt(fromX, fromY, hop.x, hop.y),
      });
      hurt(current, dmg, t.pierceArmor, hooks);
      hooks.onChainHop?.(current, i, def.color);
      if (t.slowAt() > 0) current.applySlow(t.slowAt(), t.slowDurationAt());
      if (t.burnDpsAt() > 0) current.applyBurn(t.burnDpsAt() * damageMul, t.burnDurationAt());
      if (t.poisonDpsAt() > 0) current.applyPoison(t.poisonDpsAt() * damageMul, t.poisonDurationAt());
      fromX = hop.x;
      fromY = hop.y;
      dmg *= 0.72;
      current =
        world.enemies
          .filter((e) => e.alive && !hit.has(e.id) && dist(current!.pos, e.pos) < CHAIN_RANGE)
          .sort((a, b) => dist(current!.pos, a.pos) - dist(current!.pos, b.pos))[0] ?? null;
    }
    hooks.onChainDone?.();
    return;
  }

  const feel = PROJECTILE_FEEL[t.kind];
  const mods = t.forkMods();
  const spawn = t.muzzlePoint();
  const lock = enemyAimPoint(target);
  let opensVortex = false;
  if (t.kind === 'void') {
    t.voidOrbs += 1;
    opensVortex = t.voidOrbs % voidPullEvery(t.fork) === 0;
  }
  world.projectiles.push(
    new Projectile({
      x: spawn.x,
      y: spawn.y,
      tx: lock.x,
      ty: lock.y,
      speed: feel.speed * mods.speedMul,
      damage: shotDamage(t, damageMul),
      splash: t.splash,
      pierceArmor: t.pierceArmor,
      slow: t.slowAt(),
      slowDuration: t.slowDurationAt(),
      burnDps: t.burnDpsAt() * damageMul,
      burnDuration: t.burnDurationAt(),
      poisonDps: t.poisonDpsAt() * damageMul,
      poisonDuration: t.poisonDurationAt(),
      chain: 0,
      color: def.color,
      targetId: target.id,
      trail:
        t.kind === 'arrow' ||
        t.kind === 'longshot' ||
        t.kind === 'fire' ||
        t.kind === 'ice' ||
        t.kind === 'poison' ||
        t.kind === 'void' ||
        t.kind === 'cannon',
      kind: t.kind,
      arc: feel.arc * mods.arcMul,
      homing: feel.homing,
      opensVortex,
    }),
  );
}

export function applyHit(p: Projectile, world: CombatWorld, hooks: CombatHooks = {}): void {
  hooks.onImpact?.(p);
  const enemies = world.enemies;
  const tgt = p.targetId != null ? enemies.find((e) => e.id === p.targetId) : undefined;
  const origin = tgt?.pos ?? { x: p.x, y: p.y };

  if (p.splash > 0) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (untargetable(e)) continue;
      if (p.kind === 'cannon' && e.flying) continue;
      const mul = splashMultiplier(dist(origin, e.pos), p.splash);
      if (mul > 0) applyPayload(e, p, mul, hooks);
    }
  } else if (p.targetId != null) {
    const live = enemies.find((e) => e.alive && e.id === p.targetId);
    if (live && !untargetable(live) && !(p.kind === 'cannon' && live.flying)) applyPayload(live, p, 1, hooks);
    else {
      const near = enemies.find(
        (e) =>
          e.alive &&
          !untargetable(e) &&
          !(p.kind === 'cannon' && e.flying) &&
          dist({ x: p.x, y: p.y }, e.pos) < u(20),
      );
      if (near) applyPayload(near, p, 1, hooks);
    }
  }

  if (p.opensVortex) world.vortices.push(spawnVortex(origin, p.splash));

  hooks.afterHits?.();
}

export function stepTowers(world: CombatWorld, dt: number, hooks: CombatHooks = {}): void {
  const muffles = muffledTowerIds(world.towers, world.enemies);
  for (const t of world.towers) {
    t.cooldown = Math.max(0, t.cooldown - dt);
    t.recoil = Math.max(0, t.recoil - dt * 6);
    t.muzzle = Math.max(0, t.muzzle - dt * 8);
    const tracked = t.targetId != null ? world.enemies.find((e) => canTarget(t, e) && e.id === t.targetId) : null;
    const aimAt = tracked && dist({ x: t.x, y: t.y }, tracked.pos) <= t.range ? tracked : pickTarget(t, world.enemies);
    if (aimAt) {
      const muzzle = t.muzzlePoint();
      const lock = enemyAimPoint(aimAt);
      const desired = Math.atan2(lock.y - muzzle.y, lock.x - muzzle.x);
      t.aim = lerpAngle(t.aim, desired, 1 - Math.pow(0.0008, dt));
    }
    t.choked = isSandstorm({ x: t.x, y: t.y }, world.enemies);
    t.frozen = isJarlFreeze({ x: t.x, y: t.y }, world.enemies);
    t.sealed = isWardenSeal({ x: t.x, y: t.y }, world.enemies);
    t.muffled = muffles.has(t.id);
    const haze = towerDamageMul(t.kind, { x: t.x, y: t.y }, world.enemies);
    t.hazed = haze < 1;
    if (isTroopHall(t.kind)) continue;
    if (t.frozen || t.sealed) continue;
    if (t.cooldown > 0) continue;
    const target = pickTarget(t, world.enemies);
    if (!target) continue;
    const choke = (t.choked ? SANDSTORM_FIRE : 1) * (t.muffled ? MUFFLE_FIRE : 1);
    t.cooldown = 1 / (t.fireRate * choke);
    t.targetId = target.id;
    fireTower(t, target, world, { ...hooks, damageMul: (hooks.damageMul ?? 1) * haze });
  }
}

export function stepProjectiles(world: CombatWorld, dt: number, hooks: CombatHooks = {}): void {
  for (const p of world.projectiles) {
    if (p.targetId != null && p.homing > 0) {
      const tgt = world.enemies.find((e) => e.alive && !untargetable(e) && e.id === p.targetId);
      if (tgt) {
        const k = 1 - Math.pow(1 - p.homing, dt * 8);
        const lock = enemyAimPoint(tgt);
        p.tx += (lock.x - p.tx) * k;
        p.ty += (lock.y - p.ty) * k;
      }
    }
    if (p.update(dt)) applyHit(p, world, hooks);
  }
  world.projectiles = world.projectiles.filter((p) => p.alive);
}

export function stepCombat(world: CombatWorld, dt: number, hooks: CombatHooks = {}): void {
  stepTowers(world, dt, hooks);
  stepProjectiles(world, dt, hooks);
  world.vortices = stepVortices(world.vortices, world.enemies, world.waypoints, dt);
  world.beams = world.beams.map((b) => ({ ...b, life: b.life - dt })).filter((b) => b.life > 0);
}
