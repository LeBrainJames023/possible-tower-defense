import { describe, expect, it } from 'vitest';
import { canPlaceOnCell, expandPath, authoredWave, buildWave, buildGrid, LEVELS, waveRoster } from '../src/game/levels';
import { COLS, ROWS, STAGES_PER_WORLD, WAVES_PER_LEVEL, WORLD_COUNT } from '../src/game/constants';
import { PATH_OVERRIDES } from '../src/game/worldPaths';
import { WORLDS, buildSurfaceWord, themeFor } from '../src/game/worlds';

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

  it('authors all ten stages in Desert, Ice, Fire, and Hollow', () => {
    for (const world of ['desert', 'ice', 'fire', 'hollow'] as const) {
      for (let stage = 1; stage <= 10; stage++) {
        expect(PATH_OVERRIDES[world]?.[stage]).toBeTruthy();
      }
    }
    const forest2 = LEVELS[1].pathTiles[0];
    const desert2 = LEVELS[11].pathTiles[0];
    expect(desert2.c === COLS - 1 - forest2.c && desert2.r === forest2.r).toBe(false);
  });

  it('scatters extra props off the path in later worlds', () => {
    const desert = LEVELS[10];
    expect((desert.blocked ?? []).length).toBeGreaterThan(3);
    const path = new Set(desert.pathTiles.map((p) => `${p.c},${p.r}`));
    for (const b of desert.blocked ?? []) {
      expect(path.has(`${b.c},${b.r}`)).toBe(false);
    }
  });

  it('gives Desert, Ice, Fire, and Hollow their own stage-1 path', () => {
    expect(LEVELS[10].pathTiles[0]).toEqual({ c: 0, r: 9 });
    expect(LEVELS[20].pathTiles[0]).toEqual({ c: 0, r: 1 });
    expect(LEVELS[30].pathTiles[0]).toEqual({ c: 0, r: 11 });
    expect(LEVELS[40].pathTiles[0]).toEqual({ c: 9, r: 0 });
  });

  it('names the buildable tile per world', () => {
    expect(buildSurfaceWord('forest')).toBe('grass');
    expect(buildSurfaceWord('desert')).toBe('sand');
    expect(buildSurfaceWord('ice')).toBe('ice');
    expect(buildSurfaceWord('fire')).toBe('ash');
    expect(buildSurfaceWord('hollow')).toBe('rune');
  });

  it('gives light ground a darker range ink than the sand or snow', () => {
    const lum = (hex: string): number => {
      const n = hex.replace('#', '');
      const r = parseInt(n.slice(0, 2), 16);
      const g = parseInt(n.slice(2, 4), 16);
      const b = parseInt(n.slice(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    };
    for (const world of ['desert', 'ice'] as const) {
      const theme = themeFor(world);
      expect(lum(theme.rangeInk)).toBeLessThan(lum(theme.grassA) * 0.55);
    }
    for (const world of WORLDS) {
      expect(world.theme.rangeInk).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
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

  it('reuses late packs for extra waves after 10', () => {
    expect(authoredWave(11)).toBe(7);
    expect(authoredWave(14)).toBe(10);
    expect(buildWave(10, 11, 5).length).toBeGreaterThan(0);
    expect(buildWave(10, 14, 5).map((g) => g.kind)).toEqual(buildWave(10, 10, 5).map((g) => g.kind));
  });

  it('keeps Forest stage 1 free of locals and champions', () => {
    expect(waveRoster(1, 3, 1)).toEqual(['Raider', 'Goblin']);
    expect(waveRoster(1, 7, 1).includes('Alpha Warg')).toBe(false);
  });

  it('brings Desert locals, a wave-7 champion, and a world boss', () => {
    expect(waveRoster(1, 3, 2).includes('Scorpion')).toBe(true);
    expect(waveRoster(3, 6, 2).includes('Dune Runner')).toBe(true);
    expect(waveRoster(1, 7, 2).includes('Dune Tyrant')).toBe(true);
    expect(waveRoster(1, 10, 2).includes('Sand Khan')).toBe(true);
    expect(waveRoster(1, 10, 2).includes('Warlord')).toBe(false);
  });

  it('brings Fire locals, a wave-7 champion, and a world boss', () => {
    expect(waveRoster(1, 3, 4).includes('Magma Hound')).toBe(true);
    expect(waveRoster(3, 6, 4).includes('Cinder Brute')).toBe(true);
    expect(waveRoster(1, 3, 4).includes('Cinder Brute')).toBe(false);
    expect(waveRoster(1, 7, 4).includes('Cinder King')).toBe(true);
    expect(waveRoster(1, 10, 4).includes('Ash Titan')).toBe(true);
  });

  it('brings Hollow locals, a wave-7 champion, and a world boss', () => {
    expect(waveRoster(1, 3, 5).includes('Shade')).toBe(true);
    expect(waveRoster(3, 6, 5).includes('Hex Knight')).toBe(true);
    expect(waveRoster(1, 3, 5).includes('Hex Knight')).toBe(false);
    expect(waveRoster(1, 7, 5).includes('Hex Warden')).toBe(true);
    expect(waveRoster(1, 10, 5).includes('The Magician')).toBe(true);
  });

  it('gives every world its own wave-10 boss and Forest a late champion', () => {
    expect(waveRoster(2, 7, 1).includes('Alpha Warg')).toBe(true);
    expect(waveRoster(1, 10, 1).includes('Warlord')).toBe(true);
    expect(waveRoster(1, 10, 3).includes('Frost Jarl')).toBe(true);
    expect(waveRoster(1, 10, 4).includes('Ash Titan')).toBe(true);
    expect(waveRoster(1, 10, 5).includes('The Magician')).toBe(true);
  });

  it('names the wave roster in spawn order', () => {
    expect(waveRoster(1, 1)).toEqual(['Raider']);
    expect(waveRoster(1, 3)).toEqual(['Raider', 'Goblin']);
    expect(waveRoster(1, 10).includes('Warlord')).toBe(true);
  });
});
