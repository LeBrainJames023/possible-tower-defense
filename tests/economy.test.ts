import { describe, expect, it } from 'vitest';
import { TILE, TOWERS } from '../src/game/constants';
import { Tower } from '../src/game/entities';
import { LEVELS } from '../src/game/levels';
import {
  DIFFICULTY,
  SELL_REFUND,
  UPGRADE_PRICE_MUL,
  arrowGruntTimeToKill,
  killPayout,
  scaleGold,
  scaleLives,
  sellValueFor,
  upgradeCostFor,
  waveClearBonus,
  waveHpMul,
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

  it('most of a wave’s gold comes from kills, not the end bonus', () => {
    const kills = waveKillGold(1, 1);
    const bonus = waveClearBonus(1);
    expect(kills).toBeGreaterThan(bonus * 3);
    expect(kills / waveTotalIncome(1, 1)).toBeGreaterThan(0.7);
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

describe('upgrades and sell', () => {
  it('first upgrade is build price plus 25%', () => {
    expect(upgradeCostFor(TOWERS.arrow.cost, 1)).toBe(Math.round(TOWERS.arrow.cost * UPGRADE_PRICE_MUL));
    expect(upgradeCostFor(TOWERS.ice.cost, 1)).toBe(Math.round(TOWERS.ice.cost * UPGRADE_PRICE_MUL));
    expect(upgradeCostFor(TOWERS.ice.cost, 1)).toBeGreaterThan(TOWERS.ice.cost * 0.9);
  });

  it('sells for 65% of gold actually spent', () => {
    expect(sellValueFor(TOWERS.arrow.cost, 1)).toBe(Math.round(TOWERS.arrow.cost * SELL_REFUND));
    const t = new Tower('arrow', 2, 2, 100, 100);
    expect(t.sellValue()).toBe(sellValueFor(60, 1));
    t.level = 2;
    expect(t.upgradeCost()).toBe(upgradeCostFor(60, 2));
    expect(t.sellValue()).toBe(sellValueFor(60, 2));
  });

  it('shows a bigger range at the next level', () => {
    const t = new Tower('arrow', 2, 2, 100, 100);
    expect(t.rangeAt(2)).toBeGreaterThan(t.rangeAt(1));
    expect((t.rangeAt(2) - t.rangeAt(1)) / TILE).toBeGreaterThan(0.2);
  });
});

describe('level-3 forks', () => {
  it('gives Arrow faster vs heavier after Lv3, not a fourth number', () => {
    const t = new Tower('arrow', 2, 2, 100, 100);
    t.level = 3;
    expect(t.canNumberUpgrade()).toBe(false);
    expect(t.canFork()).toBe(true);
    expect(t.fireRateAt(3, 'a')).toBeGreaterThan(t.fireRateAt(3, null));
    expect(t.damageAt(3, 'b')).toBeGreaterThan(t.damageAt(3, null));
    t.fork = 'b';
    expect(t.pierceArmor).toBe(true);
    expect(t.isMaxed()).toBe(true);
    expect(t.sellValue()).toBe(sellValueFor(TOWERS.arrow.cost, 3, true));
    expect(t.sellValue()).toBeGreaterThan(sellValueFor(TOWERS.arrow.cost, 3, false));
  });

  it('gives Cannon rapid-fire vs mortar and leaves Ice as a number-up', () => {
    const cannon = new Tower('cannon', 2, 2, 100, 100);
    cannon.level = 3;
    expect(cannon.splashAt('a')).toBeLessThan(cannon.splashAt(null));
    expect(cannon.splashAt('b')).toBeGreaterThan(cannon.splashAt(null));
    expect(cannon.fireRateAt(3, 'a')).toBeGreaterThan(cannon.fireRateAt(3, 'b'));
    const ice = new Tower('ice', 2, 2, 100, 100);
    ice.level = 3;
    expect(ice.canFork()).toBe(false);
    expect(ice.isMaxed()).toBe(true);
  });
});

describe('wave HP curve', () => {
  it('compounds 5% per wave without doubling by wave 10', () => {
    expect(waveHpMul(1)).toBe(1);
    expect(waveHpMul(10)).toBeCloseTo(1.05 ** 9, 5);
    expect(waveHpMul(10)).toBeGreaterThan(1.4);
    expect(waveHpMul(10)).toBeLessThan(1.7);
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

  it('hard keeps a four-arrow opening and squeezes income instead', () => {
    expect(scaleGold(LEVELS[0].startingGold, DIFFICULTY.hard.startGold)).toBeGreaterThanOrEqual(
      TOWERS.arrow.cost * 4,
    );
    expect(DIFFICULTY.hard.startGold).toBe(DIFFICULTY.normal.startGold);
    expect(scaleGold(15, DIFFICULTY.hard.gold)).toBe(12);
    expect(scaleLives(18, DIFFICULTY.easy.lives)).toBe(23);
    expect(scaleLives(18, DIFFICULTY.hard.lives)).toBe(14);
  });

  it('later worlds pay more per kill as HP climbs', () => {
    expect(killPayout(15, 1)).toBe(15);
    expect(killPayout(15, 5)).toBeGreaterThan(killPayout(15, 1));
    expect(waveKillGold(1, 1, 5)).toBeGreaterThan(waveKillGold(1, 1, 1));
  });

  it('later world openings scale with HP so a gate is not a Forest-10 start', () => {
    const forest1 = LEVELS.find((l) => l.world === 'forest' && l.stage === 1)!;
    const fire1 = LEVELS.find((l) => l.world === 'fire' && l.stage === 1)!;
    const hollow1 = LEVELS.find((l) => l.world === 'hollow' && l.stage === 1)!;
    expect(forest1.startingGold).toBe(250);
    expect(fire1.startingGold).toBeGreaterThan(forest1.startingGold);
    expect(hollow1.startingGold).toBeGreaterThan(fire1.startingGold);
    expect(Math.floor(fire1.startingGold / TOWERS.arrow.cost)).toBeGreaterThanOrEqual(6);
    expect(Math.floor(hollow1.startingGold / TOWERS.arrow.cost)).toBeGreaterThanOrEqual(7);
  });

  it('gives late Desert a wider opening and leaves Forest 10 gold alone', () => {
    const d1 = LEVELS.find((l) => l.world === 'desert' && l.stage === 1)!;
    const d10 = LEVELS.find((l) => l.world === 'desert' && l.stage === 10)!;
    const f10 = LEVELS.find((l) => l.world === 'forest' && l.stage === 10)!;
    expect(d1.startingGold).toBe(Math.round(250 * 1.18));
    expect(Math.floor(d10.startingGold / TOWERS.arrow.cost)).toBeGreaterThanOrEqual(8);
    expect(f10.startingGold).toBe(320);
  });

  it('gives late Ice the same opening bump and still leaves Forest 10 alone', () => {
    const i1 = LEVELS.find((l) => l.world === 'ice' && l.stage === 1)!;
    const i10 = LEVELS.find((l) => l.world === 'ice' && l.stage === 10)!;
    const f10 = LEVELS.find((l) => l.world === 'forest' && l.stage === 10)!;
    expect(i1.startingGold).toBe(Math.round(250 * 1.34));
    expect(Math.floor(i10.startingGold / TOWERS.arrow.cost)).toBeGreaterThanOrEqual(8);
    expect(f10.startingGold).toBe(320);
  });
});
