import { u, type TowerKind } from './constants';
import { Enemy } from './entities';
import type { EnemyKind } from './enemies';
import { dist } from '../shared/math';
import type { Vec2 } from '../shared/math';

export type EnemyVerb =
  | 'burrow'
  | 'dash'
  | 'sandstorm'
  | 'caravan'
  | 'phase'
  | 'slide'
  | 'rally'
  | 'freeze'
  | 'smolder'
  | 'crust'
  | 'heat'
  | 'erupt'
  | 'hex'
  | 'plate'
  | 'seal'
  | 'warp';

export const ENEMY_VERBS: Partial<Record<EnemyKind, EnemyVerb>> = {
  scorpion: 'burrow',
  duneRunner: 'dash',
  duneTyrant: 'sandstorm',
  sandKhan: 'caravan',
  frostWisp: 'phase',
  iceWolf: 'slide',
  packLord: 'rally',
  frostJarl: 'freeze',
  magmaHound: 'smolder',
  cinderBrute: 'crust',
  cinderKing: 'heat',
  ashTitan: 'erupt',
  shade: 'hex',
  hexKnight: 'plate',
  hexWarden: 'seal',
  magician: 'warp',
};

export const BURROW_UP = 3.2;
export const BURROW_DOWN = 1.35;
export const BURROW_SPEED = 0.55;

export const DASH_EVERY = 3.8;
export const DASH_FOR = 0.5;
export const DASH_MUL = 2.35;

export const SANDSTORM_RANGE = u(118);
export const SANDSTORM_FIRE = 0.55;

export const CARAVAN_FIRST = 5.2;
export const CARAVAN_EVERY = 11;
export const CARAVAN_COUNT = 2;

export const PHASE_UP = 2.15;
export const PHASE_DOWN = 1.05;

export const SLIDE_EVERY = 3.8;
export const SLIDE_FOR = 0.5;
export const SLIDE_MUL = 2.2;

export const RALLY_RANGE = u(132);
export const RALLY_MUL = 1.38;

export const FREEZE_EVERY = 7.6;
export const FREEZE_FOR = 2.05;
export const FREEZE_RANGE = u(122);

/** Magma Hound knits HP back unless a Fire tower has it burning. */
export const SMOLDER_HP = 9;

/** Cinder Brute shell. Fire burn cracks it; Cannon pierce ignores it. */
export const CRUST_ARMOR = 0.58;
export const CRUST_MELTED = 0.14;

/** Cinder King haze. Shots still leave — they just hit softer. Fire keeps ignore it. */
export const HEAT_RANGE = u(124);
export const HEAT_DMG = 0.5;

export const ERUPT_FIRST = 5.2;
export const ERUPT_EVERY = 11;
export const ERUPT_COUNT = 2;

/** Shade hex. One nearby keep fires slower — not a Wisp flicker. */
export const MUFFLE_RANGE = u(110);
export const MUFFLE_FIRE = 0.48;

/** Hex Knight plate. Poison melts it; Cannon pierce ignores it. */
export const PLATE_ARMOR = 0.62;
export const PLATE_MELTED = 0.14;

/** Hex Warden seal. Tight bubble — keeps inside cannot fire. Ground, so Cannon still answers. */
export const SEAL_RANGE = u(88);

/** Magician warp. One skip down the path — cover the landing. */
export const WARP_AT = 5.5;
export const WARP_SKIP = 0.16;

export type VerbEvent =
  | { type: 'burrow' }
  | { type: 'emerge' }
  | { type: 'dash' }
  | { type: 'phase' }
  | { type: 'appear' }
  | { type: 'slide' }
  | { type: 'freeze' }
  | { type: 'thaw' }
  | { type: 'summon'; kind: EnemyKind; count: number }
  | { type: 'warp' };

export function untargetable(e: Enemy): boolean {
  return e.burrowed || e.phased;
}

/** Local tricks live here so combat.ts can ask “may I shoot this?” without owning timers. */
export function stepEnemyVerb(e: Enemy, dt: number): VerbEvent[] {
  const verb = ENEMY_VERBS[e.kind];
  if (!verb) return [];
  const out: VerbEvent[] = [];
  e.verbT += dt;

  if (verb === 'burrow') {
    const cycle = BURROW_UP + BURROW_DOWN;
    const t = e.verbT % cycle;
    const next = t >= BURROW_UP;
    if (next !== e.burrowed) {
      e.burrowed = next;
      out.push(next ? { type: 'burrow' } : { type: 'emerge' });
    }
    e.verbSpeedMul = e.burrowed ? BURROW_SPEED : 1;
    return out;
  }

  if (verb === 'dash') {
    const t = e.verbT % (DASH_EVERY + DASH_FOR);
    const dashing = t >= DASH_EVERY;
    if (dashing && e.verbSpeedMul < 1.5) out.push({ type: 'dash' });
    e.verbSpeedMul = dashing ? DASH_MUL : 1;
    return out;
  }

  if (verb === 'sandstorm') {
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'caravan') {
    e.verbSpeedMul = 1;
    if (e.verbT >= e.nextSummonAt) {
      e.nextSummonAt = e.verbT + CARAVAN_EVERY;
      out.push({ type: 'summon', kind: 'duneRunner', count: CARAVAN_COUNT });
    }
    return out;
  }

  if (verb === 'phase') {
    const cycle = PHASE_UP + PHASE_DOWN;
    const t = e.verbT % cycle;
    const next = t >= PHASE_UP;
    if (next !== e.phased) {
      e.phased = next;
      out.push(next ? { type: 'phase' } : { type: 'appear' });
    }
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'slide') {
    const t = e.verbT % (SLIDE_EVERY + SLIDE_FOR);
    const sliding = t >= SLIDE_EVERY;
    if (sliding && e.verbSpeedMul < 1.5) out.push({ type: 'slide' });
    e.verbSpeedMul = sliding ? SLIDE_MUL : 1;
    return out;
  }

  if (verb === 'rally') {
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'freeze') {
    const t = e.verbT % (FREEZE_EVERY + FREEZE_FOR);
    const next = t >= FREEZE_EVERY;
    if (next !== e.freezing) {
      e.freezing = next;
      out.push(next ? { type: 'freeze' } : { type: 'thaw' });
    }
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'smolder') {
    e.verbSpeedMul = 1;
    if (e.burnTimer <= 0) {
      e.hp = Math.min(e.maxHp, e.hp + SMOLDER_HP * dt);
    }
    return out;
  }

  if (verb === 'crust') {
    e.verbSpeedMul = 1;
    e.armor = e.burnTimer > 0 ? CRUST_MELTED : CRUST_ARMOR;
    return out;
  }

  if (verb === 'heat') {
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'erupt') {
    e.verbSpeedMul = 1;
    if (e.verbT >= e.nextSummonAt) {
      e.nextSummonAt = e.verbT + ERUPT_EVERY;
      out.push({ type: 'summon', kind: 'magmaHound', count: ERUPT_COUNT });
    }
    return out;
  }

  if (verb === 'hex') {
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'plate') {
    e.verbSpeedMul = 1;
    e.armor = e.poisonTimer > 0 ? PLATE_MELTED : PLATE_ARMOR;
    return out;
  }

  if (verb === 'seal') {
    e.verbSpeedMul = 1;
    return out;
  }

  if (verb === 'warp') {
    e.verbSpeedMul = 1;
    if (!e.warped && e.verbT >= WARP_AT) {
      e.warped = true;
      e.progress = Math.min(0.88, e.progress + WARP_SKIP);
      out.push({ type: 'warp' });
    }
    return out;
  }
  return out;
}

export function isSandstorm(towerPos: Vec2, enemies: Enemy[]): boolean {
  for (const e of enemies) {
    if (!e.alive || e.kind !== 'duneTyrant') continue;
    if (dist(towerPos, e.pos) <= SANDSTORM_RANGE) return true;
  }
  return false;
}

export function isJarlFreeze(towerPos: Vec2, enemies: Enemy[]): boolean {
  for (const e of enemies) {
    if (!e.alive || e.kind !== 'frostJarl' || !e.freezing) continue;
    if (dist(towerPos, e.pos) <= FREEZE_RANGE) return true;
  }
  return false;
}

export function isHeatHaze(towerPos: Vec2, enemies: Enemy[]): boolean {
  for (const e of enemies) {
    if (!e.alive || e.kind !== 'cinderKing') continue;
    if (dist(towerPos, e.pos) <= HEAT_RANGE) return true;
  }
  return false;
}

export function isWardenSeal(towerPos: Vec2, enemies: Enemy[]): boolean {
  for (const e of enemies) {
    if (!e.alive || e.kind !== 'hexWarden') continue;
    if (dist(towerPos, e.pos) <= SEAL_RANGE) return true;
  }
  return false;
}

/** Each Shade hexes its nearest keep in range. */
export function muffledTowerIds(towers: { id: number; x: number; y: number }[], enemies: Enemy[]): Set<number> {
  const ids = new Set<number>();
  for (const e of enemies) {
    if (!e.alive || e.kind !== 'shade') continue;
    let bestId: number | null = null;
    let bestD = MUFFLE_RANGE;
    for (const t of towers) {
      const d = dist({ x: t.x, y: t.y }, e.pos);
      if (d <= bestD) {
        bestD = d;
        bestId = t.id;
      }
    }
    if (bestId != null) ids.add(bestId);
  }
  return ids;
}

export function towerFireMul(towerPos: Vec2, enemies: Enemy[]): number {
  if (isSandstorm(towerPos, enemies)) return SANDSTORM_FIRE;
  return 1;
}

/** Fire keeps were born in this heat — everyone else hits at half. */
export function towerDamageMul(kind: TowerKind, towerPos: Vec2, enemies: Enemy[]): number {
  if (kind === 'fire') return 1;
  if (isHeatHaze(towerPos, enemies)) return HEAT_DMG;
  return 1;
}

/** Pack Lord speeds nearby Ice Wolves that are not already sliding. */
export function applyPackRally(enemies: Enemy[]): void {
  const lords = enemies.filter((e) => e.alive && e.kind === 'packLord');
  if (!lords.length) return;
  for (const wolf of enemies) {
    if (!wolf.alive || wolf.kind !== 'iceWolf') continue;
    if (wolf.verbSpeedMul > 1.5) continue;
    for (const lord of lords) {
      if (dist(wolf.pos, lord.pos) <= RALLY_RANGE) {
        wolf.verbSpeedMul = RALLY_MUL;
        break;
      }
    }
  }
}
