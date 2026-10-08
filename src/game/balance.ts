import { TOWERS, WAVES_PER_LEVEL } from './constants';
import { ENEMIES } from './enemies';
import { buildWave } from './levels';
import { worldByIndex } from './worlds';

export type DifficultyId = 'easy' | 'normal' | 'hard';

export interface DifficultyMods {
  label: string;
  blurb: string;
  /** Kill gold and wave-clear bonus. */
  gold: number;
  /** Starting gold. Hard keeps a full opening kit; income is where it squeezes. */
  startGold: number;
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
/** Extra waves after Hollow 10. Gentle climb on top of wave-10 HP. */
export const ENDLESS_HP_GROWTH = 1.08;

/** Per-wave HP growth inside a level. Wave 10 ≈ 1.55× wave 1. */
export const WAVE_HP_GROWTH = 1.05;

/**
 * Normal is the tuned baseline.
 *
 * Easy/Hard move gold + lives by 25% (the feel you asked for).
 * Damage and enemy HP move less (~12%) so the three levers don't stack
 * into "twice as easy" — that would happen if every lever also got 25%.
 * Kill gold uses this gold mul on every bounty (Hard is proportional), not a lump.
 * Starting gold is a separate lever so Hard still opens with four Arrows.
 */
export const DIFFICULTY: Record<DifficultyId, DifficultyMods> = {
  easy: {
    label: 'Easy',
    blurb: 'More gold and lives. Room to learn.',
    gold: 1.25,
    startGold: 1.25,
    damage: 1.12,
    hp: 0.88,
    lives: 1.25,
  },
  normal: {
    label: 'Medium',
    blurb: 'The intended campaign.',
    gold: 1,
    startGold: 1,
    damage: 1,
    hp: 1,
    lives: 1,
  },
  hard: {
    label: 'Hard',
    blurb: 'Tighter gold. Foes press the line.',
    gold: 0.8,
    startGold: 1,
    damage: 0.88,
    hp: 1.12,
    lives: 0.8,
  },
};

/** Small clear-wave stipend. Wave 1 = 8g, wave 10 = 26g — most gold is from kills. */
export function waveClearBonus(waveIndex: number): number {
  return 6 + waveIndex * 2;
}

/** HP multiplier for a wave inside a level (compounding). Wave 1 = 1. Extra waves keep climbing. */
export function waveHpMul(wave: number): number {
  const n = Math.max(1, wave);
  const authored = Math.min(n, WAVES_PER_LEVEL);
  let mul = Math.pow(WAVE_HP_GROWTH, authored - 1);
  if (n > WAVES_PER_LEVEL) mul *= Math.pow(ENDLESS_HP_GROWTH, n - WAVES_PER_LEVEL);
  return mul;
}

/** Gold to go from `fromLevel` to the next (1 → 2, or 2 → 3). */
export function upgradeCostFor(buildCost: number, fromLevel: number): number {
  return Math.round(buildCost * Math.pow(UPGRADE_PRICE_MUL, fromLevel));
}

export function investedGold(
  buildCost: number,
  level: number,
  forked = false,
  pathLevel = 0
): number {
  let paid = buildCost;
  for (let lv = 1; lv < level; lv++) paid += upgradeCostFor(buildCost, lv);
  if (forked) paid += upgradeCostFor(buildCost, 3);
  for (let lv = 1; lv < pathLevel; lv++) paid += upgradeCostFor(buildCost, lv);
  return paid;
}

export function sellValueFor(
  buildCost: number,
  level: number,
  forked = false,
  pathLevel = 0
): number {
  return Math.round(investedGold(buildCost, level, forked, pathLevel) * SELL_REFUND);
}

export function scaleGold(amount: number, goldMul: number): number {
  return Math.round(amount * goldMul);
}

export function scaleLives(lives: number, livesMul: number): number {
  return Math.max(1, Math.round(lives * livesMul));
}

/** Later worlds pay a bit more per kill so HP climb is not unpaid. Forest stays 1. */
export function killBountyMul(worldIndex: number): number {
  return worldByIndex(worldIndex).hpMul;
}

export function killPayout(reward: number, worldIndex: number, goldMul = 1): number {
  return scaleGold(reward * killBountyMul(worldIndex), goldMul);
}

/** Sum of kill bounties if every spawn in the wave dies. stage is 1–10, not a global map id. */
export function waveKillGold(stage: number, wave: number, worldIndex = 1): number {
  return buildWave(stage, wave, worldIndex).reduce(
    (sum, g) => sum + killPayout(ENEMIES[g.kind].reward, worldIndex) * g.count,
    0
  );
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
