import { describe, expect, it } from 'vitest';
import { isPlaceableUnlocked, newUnlocksAt, unlockedTowers, unlockedBarracks } from '../src/game/unlocks';

describe('placeable unlocks', () => {
  it('keeps starter kit small on levels 1–3', () => {
    expect(unlockedTowers(1)).toEqual(['arrow', 'cannon', 'fire', 'ice']);
    expect(unlockedBarracks(1)).toEqual(['warriorBarracks']);
    expect(isPlaceableUnlocked('lightning', 3)).toBe(false);
    expect(isPlaceableUnlocked('paladinBarracks', 3)).toBe(false);
  });

  it('unlocks mid kit at level 4', () => {
    expect(newUnlocksAt(4).sort()).toEqual(['knightBarracks', 'lightning', 'poison'].sort());
    expect(isPlaceableUnlocked('lightning', 4)).toBe(true);
    expect(isPlaceableUnlocked('light', 4)).toBe(false);
  });

  it('unlocks late kit at level 6', () => {
    expect(newUnlocksAt(6).sort()).toEqual(['dark', 'light', 'paladinBarracks'].sort());
    expect(unlockedTowers(6)).toContain('light');
    expect(unlockedTowers(6)).toContain('dark');
    expect(unlockedBarracks(6)).toEqual(['warriorBarracks', 'knightBarracks', 'paladinBarracks']);
  });
});
