import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { afterWin, canPlay, isCampaignClear, isCleared, isWorldOpen } from '../src/game/progress';

const forest1 = LEVELS[0];
const forest10 = LEVELS[9];
const desert1 = LEVELS[10];
const hollow10 = LEVELS[49];

describe('campaign progress', () => {
  it('opens the next Forest stage after a win', () => {
    expect(afterWin(forest1)).toEqual({ world: 1, stage: 2 });
  });

  it('opens Desert after Forest 10', () => {
    expect(afterWin(forest10)).toEqual({ world: 2, stage: 1 });
  });

  it('marks the campaign clear after Hollow 10', () => {
    const p = afterWin(hollow10);
    expect(p).toEqual({ world: 5, stage: 11 });
    expect(isCampaignClear(p)).toBe(true);
  });

  it('locks later worlds until the previous world is beaten', () => {
    const start = { world: 1, stage: 1 };
    expect(canPlay(start, forest1)).toBe(true);
    expect(canPlay(start, desert1)).toBe(false);
    expect(isWorldOpen(start, 2)).toBe(false);
    expect(isCleared(start, forest1)).toBe(false);
  });
});
