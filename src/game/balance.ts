import { TOWERS, WAVES_PER_LEVEL } from './constants';
import { ENEMIES } from './enemies';
import { buildWave } from './levels';

export type DifficultyId = 'easy' | 'normal' | 'hard';

export interface DifficultyMods {
  label: string;
  blurb: string;
  /** Kill gold, wave bonus, starting gold. */
  gold: number;
  /** Tower shot / DoT damage. */
  damage: number;
  /** Enemy max HP. */
  hp: number;
  /** Starting lives. */
  lives: number;
}

/**
 * Normal is the tuned baseline.
 *
 * Easy/Hard move gold + lives by 25% (the feel you asked for).
 * Damage and enemy HP move less (~12%) so the three levers don't stack
 * into "twice as easy" — that would happen if every lever also got 25%.
 */
export const DIFFICULTY: Record<DifficultyId, DifficultyMods> = {
  easy: {
    label: 'Easy',
    blurb: '+25% gold & lives, you hit harder, foes are squishier',
    gold: 1.25,
    damage: 1.12,
    hp: 0.88,
    lives: 1.25,
  },
  normal: {
    label: 'Normal',
    blurb: 'The intended campaign balance',
    gold: 1,
    damage: 1,
    hp: 1,
    lives: 1,
  },
  hard: {
    label: 'Hard',
    blurb: '−20% gold & lives, foes tougher, your shots sting less',
    gold: 0.8,
    damage: 0.88,
    hp: 1.12,
    lives: 0.8,
  },
};

/** Clear-wave stipend. Wave 1 = 19g, wave 10 = 46g. */
export function waveClearBonus(waveIndex: number): number {
  return 16 + waveIndex * 3;
}

export function scaleGold(amount: number, goldMul: number): number {
  return Math.round(amount * goldMul);
}

export function scaleLives(lives: number, livesMul: number): number {
  return Math.max(1, Math.round(lives * livesMul));
}

/** Sum of kill bounties if every spawn in the wave dies. stage is 1–10, not a global map id. */
export function waveKillGold(stage: number, wave: number, worldIndex = 1): number {
  return buildWave(stage, wave, worldIndex).reduce((sum, g) => sum + ENEMIES[g.kind].reward * g.count, 0);
}

export function waveTotalIncome(stage: number, wave: number, worldIndex = 1): number {
  const w = Math.max(1, Math.min(WAVES_PER_LEVEL, wave));
  return waveKillGold(stage, w, worldIndex) + waveClearBonus(w);
}

/** Arrow DPS vs a grunt, used by tests as a sanity rail. */
export function arrowGruntTimeToKill(): number {
  const dps = TOWERS.arrow.damage * TOWERS.arrow.fireRate * (1 - ENEMIES.grunt.armor);
  return ENEMIES.grunt.hp / dps;
}
