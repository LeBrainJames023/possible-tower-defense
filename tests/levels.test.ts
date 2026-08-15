import { describe, expect, it } from 'vitest';
import { canPlaceOnCell, expandPath, buildWave, buildGrid, LEVELS, waveRoster } from '../src/game/levels';
import { COLS, ROWS, STAGES_PER_WORLD, WAVES_PER_LEVEL, WORLD_COUNT } from '../src/game/constants';
import { WORLDS } from '../src/game/worlds';

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

describe('campaign maps', () => {
  it('has five worlds of ten stages', () => {
    expect(LEVELS.length).toBe(WORLD_COUNT * STAGES_PER_WORLD);
    expect(WORLDS.length).toBe(WORLD_COUNT);
    expect(LEVELS[0].name).toBe('Meadow Gate');
    expect(LEVELS[0].world).toBe('forest');
    expect(LEVELS[10].world).toBe('desert');
    expect(LEVELS[10].stage).toBe(1);
    expect(LEVELS[49].world).toBe('hollow');
    expect(LEVELS[49].stage).toBe(10);
  });

  it('keeps every path on-grid and orthogonal', () => {
    for (const level of LEVELS) {
      expect(level.pathTiles.length).toBeGreaterThan(4);
      for (const p of level.pathTiles) {
        expect(p.c).toBeGreaterThanOrEqual(0);
        expect(p.c).toBeLessThan(COLS);
        expect(p.r).toBeGreaterThanOrEqual(0);
        expect(p.r).toBeLessThan(ROWS);
      }
      for (let i = 1; i < level.pathTiles.length; i++) {
        const dc = Math.abs(level.pathTiles[i].c - level.pathTiles[i - 1].c);
        const dr = Math.abs(level.pathTiles[i].r - level.pathTiles[i - 1].r);
        expect(dc + dr).toBe(1);
      }
    }
  });

  it('mirrors Forest stage 1 into Desert (flip X)', () => {
    const forest = LEVELS[0].pathTiles[0];
    const desert = LEVELS[10].pathTiles[0];
    expect(desert.c).toBe(COLS - 1 - forest.c);
    expect(desert.r).toBe(forest.r);
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

  it('names the wave roster in spawn order', () => {
    expect(waveRoster(1, 1)).toEqual(['Raider']);
    expect(waveRoster(1, 3)).toEqual(['Raider', 'Goblin']);
    expect(waveRoster(1, 10).includes('Warlord')).toBe(true);
  });
});
