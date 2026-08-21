import { u } from './constants';
import { Enemy } from './entities';
import type { EnemyKind } from './enemies';
import { dist } from '../shared/math';
import type { Vec2 } from '../shared/math';

export type EnemyVerb = 'burrow' | 'dash' | 'sandstorm' | 'caravan';

export const ENEMY_VERBS: Partial<Record<EnemyKind, EnemyVerb>> = {
  scorpion: 'burrow',
  duneRunner: 'dash',
  duneTyrant: 'sandstorm',
  sandKhan: 'caravan',
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

export type VerbEvent =
  | { type: 'burrow' }
  | { type: 'emerge' }
  | { type: 'dash' }
  | { type: 'summon'; kind: EnemyKind; count: number };

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
  }
  return out;
}

export function towerFireMul(towerPos: Vec2, enemies: Enemy[]): number {
  for (const e of enemies) {
    if (!e.alive || e.kind !== 'duneTyrant') continue;
    if (dist(towerPos, e.pos) <= SANDSTORM_RANGE) return SANDSTORM_FIRE;
  }
  return 1;
}
