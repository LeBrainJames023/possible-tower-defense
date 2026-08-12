import { describe, expect, it } from 'vitest';
import { TOWERS } from '../src/game/constants';
import { LEVELS } from '../src/game/levels';
import {
  DIFFICULTY,
  arrowGruntTimeToKill,
  scaleGold,
  scaleLives,
  waveClearBonus,
  waveKillGold,
  waveTotalIncome,
} from '../src/game/balance';

describe('economy rails', () => {
  it('wave 1 on level 1 pays about one extra arrow, not a whole second kit', () => {
    const income = waveTotalIncome(1, 1);
    expect(income).toBeGreaterThanOrEqual(TOWERS.arrow.cost);
    expect(income).toBeLessThan(TOWERS.arrow.cost + TOWERS.ice.cost);
    expect(waveKillGold(1, 1)).toBeGreaterThan(waveClearBonus(1));
  });

  it('starting gold buys a small opening mix, not the whole dock', () => {
    const gold = LEVELS[0].startingGold;
    expect(gold).toBeGreaterThanOrEqual(TOWERS.arrow.cost * 3);
    expect(gold).toBeLessThan(TOWERS.arrow.cost * 6);
    expect(gold).toBeLessThan(TOWERS.arrow.cost + TOWERS.cannon.cost + TOWERS.ice.cost + TOWERS.lightning.cost);
  });

  it('one arrow takes a few seconds to drop a grunt — not instant', () => {
    const ttk = arrowGruntTimeToKill();
    expect(ttk).toBeGreaterThan(3);
    expect(ttk).toBeLessThan(6);
  });

  it('later waves pay more than wave 1', () => {
    expect(waveTotalIncome(1, 10)).toBeGreaterThan(waveTotalIncome(1, 1));
  });
});

describe('difficulty levers', () => {
  it('easy is kinder on gold, lives, damage, and HP', () => {
    expect(DIFFICULTY.easy.gold).toBeGreaterThan(DIFFICULTY.normal.gold);
    expect(DIFFICULTY.easy.lives).toBeGreaterThan(DIFFICULTY.normal.lives);
    expect(DIFFICULTY.easy.damage).toBeGreaterThan(DIFFICULTY.normal.damage);
    expect(DIFFICULTY.easy.hp).toBeLessThan(DIFFICULTY.normal.hp);
  });

  it('hard is the opposite of easy', () => {
    expect(DIFFICULTY.hard.gold).toBeLessThan(DIFFICULTY.normal.gold);
    expect(DIFFICULTY.hard.lives).toBeLessThan(DIFFICULTY.normal.lives);
    expect(DIFFICULTY.hard.damage).toBeLessThan(DIFFICULTY.normal.damage);
    expect(DIFFICULTY.hard.hp).toBeGreaterThan(DIFFICULTY.normal.hp);
  });

  it('scales gold and lives without going to zero', () => {
    expect(scaleGold(250, DIFFICULTY.easy.gold)).toBe(313);
    expect(scaleGold(250, DIFFICULTY.hard.gold)).toBe(200);
    expect(scaleLives(18, DIFFICULTY.easy.lives)).toBe(23);
    expect(scaleLives(18, DIFFICULTY.hard.lives)).toBe(14);
  });
});
