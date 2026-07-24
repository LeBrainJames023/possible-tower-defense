import { describe, expect, it } from 'vitest';
import { canPlaceOnCell, expandPath, buildWave, buildGrid, LEVELS } from '../src/game/levels';
import { ENEMIES, WAVES_PER_LEVEL } from '../src/game/constants';

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

  it('includes a lich boss on wave 10', () => {
    const groups = buildWave(1, 10);
    expect(groups.some((g) => g.kind === 'lich')).toBe(true);
  });
});

describe('level themes', () => {
  it('every level has a biome theme', () => {
    for (const level of LEVELS) {
      expect(level.theme).toBeTruthy();
    }
  });

  it('mythical enemy roster is complete', () => {
    expect(Object.keys(ENEMIES)).toEqual(
      expect.arrayContaining([
        'gnome',
        'orc',
        'zombie',
        'ghoul',
        'skeletonSnake',
        'troll',
        'ghost',
        'necromancer',
        'wyrm',
        'lich',
      ]),
    );
  });

  it('later levels block more tiles than early ones', () => {
    const blockedCount = (id: number) => {
      const level = LEVELS.find((l) => l.id === id)!;
      return (level.blocked?.length ?? 0) + (level.water?.length ?? 0);
    };
    expect(blockedCount(10)).toBeGreaterThan(blockedCount(1));
    expect(blockedCount(9)).toBeGreaterThan(blockedCount(3));
  });
});
