import { describe, expect, it } from 'vitest';
import { canPlaceOnCell, expandPath, buildWave, buildGrid, LEVELS } from '../src/game/levels';
import { WAVES_PER_LEVEL } from '../src/game/constants';

describe('expandPath', () => {
  it('fills orthogonal steps between corners', () => {
    const path = expandPath([
      { c: 0, r: 0 },
      { c: 2, r: 0 },
      { c: 2, r: 2 },
    ]);
    expect(path).toEqual([
      { c: 0, r: 0 },
      { c: 1, r: 0 },
      { c: 2, r: 0 },
      { c: 2, r: 1 },
      { c: 2, r: 2 },
    ]);
  });
});

describe('canPlaceOnCell', () => {
  it('blocks path tiles and allows grass', () => {
    const grid = buildGrid(LEVELS[0]);
    const pathTile = LEVELS[0].pathTiles[0];
    expect(canPlaceOnCell(grid, pathTile.c, pathTile.r)).toBe(false);
    // find a grass cell
    let found = false;
    for (let r = 0; r < grid.length && !found; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === 'grass') {
          expect(canPlaceOnCell(grid, c, r)).toBe(true);
          found = true;
          break;
        }
      }
    }
    expect(found).toBe(true);
  });
});

describe('buildWave', () => {
  it('returns spawns for every wave 1-10', () => {
    for (let level = 1; level <= 10; level++) {
      for (let wave = 1; wave <= WAVES_PER_LEVEL; wave++) {
        const groups = buildWave(level, wave);
        expect(groups.length).toBeGreaterThan(0);
        const total = groups.reduce((s, g) => s + g.count, 0);
        expect(total).toBeGreaterThan(0);
      }
    }
  });

  it('includes a boss on wave 10', () => {
    const groups = buildWave(1, 10);
    expect(groups.some((g) => g.kind === 'boss')).toBe(true);
  });
});
