/**
 * Barracks engine: Muster and Chapter spawn up to 3 troops, rally click, 1:1 melee stall.
 * Shared by Game and tests — do not copy this math into test files.
 */
import { COLS, ROWS, TILE, isTroopHall, u, type CellKind, type TowerKind } from './constants';
import { ENEMIES } from './enemies';
import { Enemy, Tower } from './entities';
import { forkDef, type ForkId } from './forks';
import { untargetable } from './verbs';
import type { Vec2 } from '../shared/math';
import { dist } from '../shared/math';

export type TroopKind = 'warrior' | 'knight';

export interface TroopStats {
  hp: number;
  damage: number;
  speed: number;
  radius: number;
  trainTime: number;
  color: string;
}

export const TROOP_STATS: Record<TroopKind, TroopStats> = {
  warrior: {
    hp: 28,
    damage: 3,
    speed: u(95),
    radius: u(8),
    trainTime: 6,
    color: '#e8d5a0',
  },
  knight: {
    hp: 72,
    damage: 5,
    speed: u(48),
    radius: u(12),
    trainTime: 10,
    color: '#8a9bb0',
  },
};

export function troopKindFor(hallKind: TowerKind): TroopKind {
  return hallKind === 'chapter' ? 'knight' : 'warrior';
}

/** Base troop numbers stay in TROOP_STATS. Forks only multiply. */
export function troopStatsAt(hallKind: TowerKind, fork: ForkId | null): TroopStats {
  const base = TROOP_STATS[troopKindFor(hallKind)];
  const f = fork ? forkDef(hallKind, fork) : null;
  return {
    hp: Math.max(1, Math.round(base.hp * (f?.troopHpMul ?? 1))),
    damage: Math.max(1, Math.round(base.damage * (f?.troopDamageMul ?? 1))),
    speed: base.speed * (f?.troopSpeedMul ?? 1),
    radius: base.radius,
    trainTime: base.trainTime * (f?.trainTimeMul ?? 1),
    color: base.color,
  };
}

export function troopStatsFor(hall: Tower): TroopStats {
  return troopStatsAt(hall.kind, hall.fork);
}

export function applyHallForkToTroops(hall: Tower, troops: Troop[]): void {
  const stats = troopStatsFor(hall);
  for (const tr of troops) {
    if (tr.hallId !== hall.id || !tr.alive) continue;
    const ratio = tr.maxHp > 0 ? tr.hp / tr.maxHp : 1;
    tr.maxHp = stats.hp;
    tr.hp = Math.max(1, Math.round(stats.hp * ratio));
    tr.damage = stats.damage;
    tr.speed = stats.speed;
  }
}

export const TROOP_CAP = 3;
export const TROOP_MELEE_RATE = 1;
export const TROOP_AGGRO = u(56);
export const TROOP_STAGGER = 0.4;
export const TROOP_SLOT_SPREAD = u(18);
/** Walk-cycle loops per second. Visual only — travel speed stays in TROOP_STATS. */
export const TROOP_WALK_HZ: Record<TroopKind, number> = {
  warrior: 1.0,
  knight: 0.75,
};
export const TROOP_IDLE_HZ = 0.55;
const TROOP_ARRIVE = u(6);
const LOCK_LEASH = TROOP_AGGRO * 1.8;

let nextTroopId = 1;
function troopId(): number {
  return nextTroopId++;
}

export class Troop {
  id = troopId();
  kind: TroopKind;
  hallId: number;
  slot: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  pos: Vec2;
  alive = true;
  cooldown = 0;
  /** Enemy this troop is punching. */
  lockId: number | null = null;
  /** True when joining a locker — deals damage, does not take it. */
  pileOn = false;
  hitFlash = 0;
  facing = 0;
  /** Walk/idle cycle clock. One revolution = one sheet loop. */
  bob = 0;
  /** True while the body is actually sliding toward rally or a lock. */
  moving = false;
  radius: number;
  color: string;

  constructor(hallId: number, slot: number, pos: Vec2, kind: TroopKind, stats: TroopStats = TROOP_STATS[kind]) {
    this.kind = kind;
    this.hallId = hallId;
    this.slot = slot;
    this.pos = { ...pos };
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.damage = stats.damage;
    this.speed = stats.speed;
    this.radius = stats.radius;
    this.color = stats.color;
  }

  takeDamage(raw: number): void {
    this.hp -= raw;
    if (raw > 0.4) this.hitFlash = 1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }
}

export interface TroopWorld {
  towers: Tower[];
  enemies: Enemy[];
  troops: Troop[];
  waypoints: Vec2[];
  grid: CellKind[][];
}

export function hallRallyPos(t: Tower): Vec2 {
  return {
    x: t.rallyCol * TILE + TILE / 2,
    y: t.rallyRow * TILE + TILE / 2,
  };
}

export function canRallyAt(t: Tower, grid: CellKind[][], c: number, r: number): boolean {
  if (!isTroopHall(t.kind)) return false;
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;
  const cell = grid[r][c];
  if (cell !== 'grass' && cell !== 'path') return false;
  const x = c * TILE + TILE / 2;
  const y = r * TILE + TILE / 2;
  return dist({ x: t.x, y: t.y }, { x, y }) <= t.range + 1;
}

export function nearestPathFrom(
  grid: CellKind[][],
  from: Vec2,
  range: number,
): { c: number; r: number } | null {
  let best: { c: number; r: number; d: number } | null = null;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== 'path') continue;
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      const d = dist(from, { x, y });
      if (d > range) continue;
      if (!best || d < best.d) best = { c, r, d };
    }
  }
  return best ? { c: best.c, r: best.r } : null;
}

export function nearestPathCell(
  grid: CellKind[][],
  fromC: number,
  fromR: number,
  range: number,
): { c: number; r: number } | null {
  return nearestPathFrom(grid, { x: fromC * TILE + TILE / 2, y: fromR * TILE + TILE / 2 }, range);
}

export function assignDefaultRally(t: Tower, grid: CellKind[][]): void {
  const near = nearestPathFrom(grid, { x: t.x, y: t.y }, t.range);
  if (near) {
    t.rallyCol = near.c;
    t.rallyRow = near.r;
  }
}

export function setRallyPoint(t: Tower, grid: CellKind[][], c: number, r: number): boolean {
  if (!canRallyAt(t, grid, c, r)) return false;
  t.rallyCol = c;
  t.rallyRow = r;
  return true;
}

export function canLockEnemy(e: Enemy): boolean {
  if (!e.alive) return false;
  if (e.flying) return false;
  if (untargetable(e)) return false;
  return true;
}

function pathTangentAt(waypoints: Vec2[], pos: Vec2): Vec2 {
  if (waypoints.length < 2) return { x: 1, y: 0 };
  let bestI = 0;
  let bestD = Infinity;
  for (let i = 0; i < waypoints.length; i++) {
    const d = dist(waypoints[i], pos);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  const a = waypoints[Math.max(0, bestI - 1)];
  const b = waypoints[Math.min(waypoints.length - 1, bestI + 1)];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export function troopSlotPos(t: Tower, slot: number, waypoints: Vec2[]): Vec2 {
  const rally = hallRallyPos(t);
  const tangent = pathTangentAt(waypoints, rally);
  const offset = (slot - 1) * TROOP_SLOT_SPREAD;
  return {
    x: rally.x + tangent.x * offset,
    y: rally.y + tangent.y * offset,
  };
}

function moveToward(pos: Vec2, target: Vec2, speed: number, dt: number): boolean {
  const d = dist(pos, target);
  if (d <= TROOP_ARRIVE) {
    pos.x = target.x;
    pos.y = target.y;
    return true;
  }
  const step = speed * dt;
  if (step >= d) {
    pos.x = target.x;
    pos.y = target.y;
    return true;
  }
  pos.x += ((target.x - pos.x) / d) * step;
  pos.y += ((target.y - pos.y) / d) * step;
  return false;
}

function enemyMeleeDps(e: Enemy): number {
  const role = ENEMIES[e.kind].role;
  if (role === 'boss') return 35;
  if (role === 'champion') return 20;
  if (role === 'special') return 12;
  return 8;
}

function lockerFor(enemyId: number, troops: Troop[]): Troop | undefined {
  return troops.find((tr) => tr.alive && tr.lockId === enemyId && !tr.pileOn);
}

function spawnTroop(world: TroopWorld, hall: Tower): void {
  const used = new Set(world.troops.filter((tr) => tr.alive && tr.hallId === hall.id).map((tr) => tr.slot));
  let slot = 0;
  while (used.has(slot) && slot < TROOP_CAP) slot += 1;
  if (slot >= TROOP_CAP) return;
  world.troops.push(new Troop(hall.id, slot, { x: hall.x, y: hall.y }, troopKindFor(hall.kind), troopStatsFor(hall)));
}

export function dropHallLocks(troops: Troop[], hallId: number): void {
  for (const tr of troops) {
    if (tr.hallId === hallId) {
      tr.lockId = null;
      tr.pileOn = false;
    }
  }
}

export function stepHalls(world: TroopWorld, dt: number): void {
  for (const e of world.enemies) e.meleeHold = false;

  const halls = world.towers.filter((t) => isTroopHall(t.kind));
  const hallIds = new Set(halls.map((t) => t.id));
  world.troops = world.troops.filter((tr) => hallIds.has(tr.hallId) && tr.alive);

  for (const hall of halls) {
    const alive = world.troops.filter((tr) => tr.hallId === hall.id).length;
    if (alive >= TROOP_CAP) continue;
    hall.trainCooldown -= dt;
    if (hall.trainCooldown > 0) continue;
    spawnTroop(world, hall);
    const nowAlive = world.troops.filter((tr) => tr.hallId === hall.id && tr.alive).length;
    const train = troopStatsFor(hall).trainTime;
    hall.trainCooldown = nowAlive < TROOP_CAP ? TROOP_STAGGER : train;
  }

  for (const tr of world.troops) {
    if (!tr.alive) continue;
    tr.hitFlash = Math.max(0, tr.hitFlash - dt * 5);
    tr.cooldown = Math.max(0, tr.cooldown - dt);
    const hall = halls.find((t) => t.id === tr.hallId);
    if (!hall) continue;

    if (tr.lockId != null) {
      const foe = world.enemies.find((e) => e.id === tr.lockId);
      if (!foe || !canLockEnemy(foe) || dist(tr.pos, foe.pos) > LOCK_LEASH) {
        tr.lockId = null;
        tr.pileOn = false;
      }
    }

    if (tr.lockId == null) {
      const nearby = world.enemies
        .filter((e) => canLockEnemy(e) && dist(tr.pos, e.pos) <= TROOP_AGGRO)
        .sort((a, b) => dist(tr.pos, a.pos) - dist(tr.pos, b.pos));
      const fresh = nearby.find((e) => !lockerFor(e.id, world.troops));
      const join = nearby.find((e) => lockerFor(e.id, world.troops));
      if (fresh) {
        tr.lockId = fresh.id;
        tr.pileOn = false;
      } else if (join) {
        tr.lockId = join.id;
        tr.pileOn = true;
      }
    }
  }

  for (const tr of world.troops) {
    if (!tr.alive) continue;
    const hall = halls.find((t) => t.id === tr.hallId);
    if (!hall) continue;
    const foe = tr.lockId != null ? world.enemies.find((e) => e.id === tr.lockId && e.alive) : null;
    const before = { x: tr.pos.x, y: tr.pos.y };
    if (foe) {
      const reach = tr.radius + foe.radius + u(8);
      const d = dist(tr.pos, foe.pos);
      tr.facing = Math.atan2(foe.pos.y - tr.pos.y, foe.pos.x - tr.pos.x);
      if (d > reach) moveToward(tr.pos, foe.pos, tr.speed, dt);
    } else {
      const slot = troopSlotPos(hall, tr.slot, world.waypoints);
      tr.facing = Math.atan2(slot.y - tr.pos.y, slot.x - tr.pos.x);
      moveToward(tr.pos, slot, tr.speed, dt);
    }
    tr.moving = dist(before, tr.pos) > 0.4;
    tr.bob += dt * (tr.moving ? TROOP_WALK_HZ[tr.kind] : TROOP_IDLE_HZ) * Math.PI * 2;
  }

  for (const tr of world.troops) {
    if (!tr.alive || tr.lockId == null) continue;
    const foe = world.enemies.find((e) => e.id === tr.lockId && e.alive);
    if (!foe) continue;
    const reach = tr.radius + foe.radius + u(8);
    if (dist(tr.pos, foe.pos) > reach + 1) continue;
    const locker = lockerFor(foe.id, world.troops);
    if (locker?.id === tr.id) foe.meleeHold = true;
    if (tr.cooldown <= 0) {
      foe.takeDamage(tr.damage, false);
      tr.cooldown = 1 / TROOP_MELEE_RATE;
    }
    if (locker?.id === tr.id && !tr.pileOn) {
      tr.takeDamage(enemyMeleeDps(foe) * dt);
    }
  }

  world.troops = world.troops.filter((tr) => tr.alive);
}

export { isTroopHall };
