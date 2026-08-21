import { u } from './constants';
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
  | 'freeze';

export const ENEMY_VERBS: Partial<Record<EnemyKind, EnemyVerb>> = {
  scorpion: 'burrow',
  duneRunner: 'dash',
  duneTyrant: 'sandstorm',
  sandKhan: 'caravan',
  frostWisp: 'phase',
  iceWolf: 'slide',
  packLord: 'rally',
  frostJarl: 'freeze',
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

export type VerbEvent =
  | { type: 'burrow' }
  | { type: 'emerge' }
  | { type: 'dash' }
  | { type: 'phase' }
  | { type: 'appear' }
  | { type: 'slide' }
  | { type: 'freeze' }
  | { type: 'thaw' }
  | { type: 'summon'; kind: EnemyKind; count: number };

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

export function towerFireMul(towerPos: Vec2, enemies: Enemy[]): number {
  if (isSandstorm(towerPos, enemies)) return SANDSTORM_FIRE;
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
