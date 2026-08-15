import { describe, expect, it } from 'vitest';
import { ENEMIES, leakLives } from '../src/game/enemies';
import { championAt, rosterFor, specialAt } from '../src/game/worldRoster';

describe('world roster', () => {
  it('keeps Forest stage 1 as the tutorial', () => {
    expect(specialAt(1, 1, 1)).toBeNull();
    expect(championAt(1, 1)).toBeNull();
    expect(rosterFor(1).boss).toBe('boss');
  });

  it('unlocks Forest locals and the Alpha Warg after stage 1', () => {
    expect(specialAt(1, 2, 1)).toBe('warg');
    expect(specialAt(1, 4, 2)).toBe('boar');
    expect(championAt(1, 2)).toBe('alphaWarg');
  });

  it('gives later worlds locals from stage 1 and a unique boss', () => {
    expect(specialAt(2, 1, 1)).toBe('scorpion');
    expect(rosterFor(2).boss).toBe('sandKhan');
    expect(rosterFor(5).boss).toBe('magician');
    expect(ENEMIES.sandKhan.role).toBe('boss');
    expect(leakLives('duneTyrant')).toBe(3);
    expect(leakLives('sandKhan')).toBe(5);
    expect(leakLives('grunt')).toBe(1);
  });
});
