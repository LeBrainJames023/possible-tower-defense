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

/** First upgrade is build price + 25%; each next upgrade compounds that. */
export const UPGRADE_PRICE_MUL = 1.25;
/** Refund of gold actually spent (build + upgrades). */
export const SELL_REFUND = 0.65;
/** Per-wave HP growth inside a level. Wave 10 ≈ 1.55× wave 1. */
export const WAVE_HP_GROWTH = 1.05;

/**
 * Normal is the tuned baseline.
 *
 * Easy/Hard move gold + lives by 25% (the feel you asked for).
 * Damage and enemy HP move less (~12%) so the three levers don't stack
 * into "twice as easy" — that would happen if every lever also got 25%.
 * Kill gold uses this gold mul on every bounty (Hard is proportional), not a lump.
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

/** Small clear-wave stipend. Wave 1 = 8g, wave 10 = 26g — most gold is from kills. */
export function waveClearBonus(waveIndex: number): number {
  return 6 + waveIndex * 2;
}

/** HP multiplier for a wave inside a level (compounding). Wave 1 = 1. */
export function waveHpMul(wave: number): number {
  const w = Math.max(1, Math.min(WAVES_PER_LEVEL, wave));
  return Math.pow(WAVE_HP_GROWTH, w - 1);
}

/** Gold to go from `fromLevel` to the next (1 → 2, or 2 → 3). */
export function upgradeCostFor(buildCost: number, fromLevel: number): number {
  return Math.round(buildCost * Math.pow(UPGRADE_PRICE_MUL, fromLevel));
}

export function investedGold(buildCost: number, level: number): number {
  let paid = buildCost;
  for (let lv = 1; lv < level; lv++) paid += upgradeCostFor(buildCost, lv);
  return paid;
}

export function sellValueFor(buildCost: number, level: number): number {
  return Math.round(investedGold(buildCost, level) * SELL_REFUND);
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
