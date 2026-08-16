import { CHAIN_RANGE, PROJECTILE_FEEL, u } from './constants';
import { Enemy, Projectile, Tower, type BeamFx } from './entities';
import { dist, lerpAngle } from '../shared/math';
import type { Vec2 } from '../shared/math';

export interface CombatWorld {
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  beams: BeamFx[];
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
  const status = t.statusScale();
  t.aim = Math.atan2(target.pos.y - t.y, target.pos.x - t.x);
  t.recoil = 1;
  t.muzzle = 1;
  hooks.onMuzzle?.(t);

  if (def.chain > 0) {
    const hit = new Set<number>();
    let current: Enemy | null = target;
    let fromX = t.x;
    let fromY = t.y;
    let dmg = shotDamage(t, damageMul);
    for (let i = 0; i < def.chain && current; i++) {
      hit.add(current.id);
      world.beams.push({
        x1: fromX,
        y1: fromY,
        x2: current.pos.x,
        y2: current.pos.y,
        color: def.color,
        life: 0.22,
        maxLife: 0.22,
        width: 3.2 - i * 0.4,
        points: jaggedBolt(fromX, fromY, current.pos.x, current.pos.y),
      });
      hurt(current, dmg, def.pierceArmor, hooks);
      hooks.onChainHop?.(current, i, def.color);
      if (def.slow > 0) current.applySlow(def.slow, def.slowDuration);
      if (def.burnDps > 0) current.applyBurn(def.burnDps * status * damageMul, def.burnDuration);
      if (def.poisonDps > 0) current.applyPoison(def.poisonDps * status * damageMul, def.poisonDuration);
      fromX = current.pos.x;
      fromY = current.pos.y;
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
  world.projectiles.push(
    new Projectile({
      x: t.x,
      y: t.y,
      tx: target.pos.x,
      ty: target.pos.y,
      speed: feel.speed,
      damage: shotDamage(t, damageMul),
      splash: def.splash,
      pierceArmor: def.pierceArmor,
      slow: def.slow,
      slowDuration: def.slowDuration,
      burnDps: def.burnDps * status * damageMul,
      burnDuration: def.burnDuration,
      poisonDps: def.poisonDps * status * damageMul,
      poisonDuration: def.poisonDuration,
      chain: 0,
      color: def.color,
      targetId: target.id,
      trail: t.kind === 'arrow' || t.kind === 'fire' || t.kind === 'ice' || t.kind === 'poison' || t.kind === 'cannon',
      kind: t.kind,
      arc: feel.arc,
      homing: feel.homing,
    }),
  );
}

export function applyHit(p: Projectile, enemies: Enemy[], hooks: CombatHooks = {}): void {
  hooks.onImpact?.(p);

  if (p.splash > 0) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (p.kind === 'cannon' && e.flying) continue;
      const mul = splashMultiplier(dist({ x: p.x, y: p.y }, e.pos), p.splash);
      if (mul > 0) applyPayload(e, p, mul, hooks);
    }
  } else if (p.targetId != null) {
    const tgt = enemies.find((e) => e.alive && e.id === p.targetId);
    if (tgt && !(p.kind === 'cannon' && tgt.flying)) applyPayload(tgt, p, 1, hooks);
    else {
      const near = enemies.find(
        (e) => e.alive && !(p.kind === 'cannon' && e.flying) && dist({ x: p.x, y: p.y }, e.pos) < u(20),
      );
      if (near) applyPayload(near, p, 1, hooks);
    }
  }

  hooks.afterHits?.();
}

export function stepTowers(world: CombatWorld, dt: number, hooks: CombatHooks = {}): void {
  for (const t of world.towers) {
    t.cooldown = Math.max(0, t.cooldown - dt);
    t.recoil = Math.max(0, t.recoil - dt * 6);
    t.muzzle = Math.max(0, t.muzzle - dt * 8);
    const tracked = t.targetId != null ? world.enemies.find((e) => canTarget(t, e) && e.id === t.targetId) : null;
    const aimAt = tracked && dist({ x: t.x, y: t.y }, tracked.pos) <= t.range ? tracked : pickTarget(t, world.enemies);
    if (aimAt) {
      const desired = Math.atan2(aimAt.pos.y - t.y, aimAt.pos.x - t.x);
      t.aim = lerpAngle(t.aim, desired, 1 - Math.pow(0.0008, dt));
    }
    if (t.cooldown > 0) continue;
    const target = pickTarget(t, world.enemies);
    if (!target) continue;
    t.cooldown = 1 / t.fireRate;
    t.targetId = target.id;
    fireTower(t, target, world, hooks);
  }
}

export function stepProjectiles(world: CombatWorld, dt: number, hooks: CombatHooks = {}): void {
  for (const p of world.projectiles) {
    if (p.targetId != null && p.homing > 0) {
      const tgt = world.enemies.find((e) => e.alive && e.id === p.targetId);
      if (tgt) {
        const k = 1 - Math.pow(1 - p.homing, dt * 8);
        p.tx += (tgt.pos.x - p.tx) * k;
        p.ty += (tgt.pos.y - p.ty) * k;
      }
    }
    if (p.update(dt)) applyHit(p, world.enemies, hooks);
  }
  world.projectiles = world.projectiles.filter((p) => p.alive);
}

export function stepCombat(world: CombatWorld, dt: number, hooks: CombatHooks = {}): void {
  stepTowers(world, dt, hooks);
  stepProjectiles(world, dt, hooks);
  world.beams = world.beams.map((b) => ({ ...b, life: b.life - dt })).filter((b) => b.life > 0);
}
