import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { winResultCopy } from '../src/game/resultCard';

const forest1 = LEVELS[0];
const forest10 = LEVELS[9];
const hollow10 = LEVELS[49];

describe('win result card', () => {
  it('offers Next map after a mid-world win', () => {
    const copy = winResultCopy(forest1, false);
    expect(copy.primary).toBe('next-map');
    expect(copy.primaryLabel).toBe('Next map');
    expect(copy.secondaryLabel).toBe('Worlds');
  });

  it('offers Next world and Main menu after Forest 10', () => {
    const copy = winResultCopy(forest10, false);
    expect(copy.title).toBe('Forest cleared');
    expect(copy.primary).toBe('next-world');
    expect(copy.primaryLabel).toBe('Next world');
    expect(copy.secondary).toBe('title');
    expect(copy.secondaryLabel).toBe('Main menu');
  });

  it('offers Keep playing and Main menu after Hollow 10', () => {
    const copy = winResultCopy(hollow10, false);
    expect(copy.primary).toBe('keep-playing');
    expect(copy.primaryLabel).toBe('Keep playing');
    expect(copy.secondaryLabel).toBe('Main menu');
  });
});
