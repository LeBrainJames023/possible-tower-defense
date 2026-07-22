import { describe, expect, it } from 'vitest';
import { dist, pathTotalLength, lengthAlongPath } from '../src/shared/math';

describe('math', () => {
  it('computes distance', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('measures path length and samples points', () => {
    const wp = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
    ];
    expect(pathTotalLength(wp)).toBe(150);
    const mid = lengthAlongPath(wp, 0.5);
    expect(mid.x).toBeCloseTo(75);
    expect(mid.y).toBeCloseTo(0);
  });
});
