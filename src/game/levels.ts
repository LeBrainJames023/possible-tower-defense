import type { BiomeTheme, CellKind, EnemyKind } from './constants';
import { COLS, ROWS, TILE, WAVES_PER_LEVEL } from './constants';
import type { Vec2 } from '../shared/math';
import { biasWaveForTheme } from './biomeEnemies';

export interface LevelDef {
  id: number;
  name: string;
  blurb: string;
  theme: BiomeTheme;
  /** Grid cells: path waypoints in tile coords */
  pathTiles: Array<{ c: number; r: number }>;
  /** Trees / rocks — not buildable */
  blocked?: Array<{ c: number; r: number }>;
  /** Rivers / lakes — scenery only, not buildable */
  water?: Array<{ c: number; r: number }>;
  /** Multiplier applied to enemy HP for this level */
  hpScale: number;
  startingGold: number;
  lives: number;
}

export interface WaveSpawn {
  kind: EnemyKind;
  count: number;
  interval: number;
  delay?: number;
}

export function buildGrid(level: LevelDef): CellKind[][] {
  const grid: CellKind[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => 'grass' as CellKind),
  );

  for (const p of level.pathTiles) {
    if (p.r >= 0 && p.r < ROWS && p.c >= 0 && p.c < COLS) {
      grid[p.r][p.c] = 'path';
    }
  }
  for (const w of level.water ?? []) {
    if (w.r >= 0 && w.r < ROWS && w.c >= 0 && w.c < COLS && grid[w.r][w.c] !== 'path') {
      grid[w.r][w.c] = 'water';
    }
  }
  for (const b of level.blocked ?? []) {
    if (b.r >= 0 && b.r < ROWS && b.c >= 0 && b.c < COLS && grid[b.r][b.c] === 'grass') {
      grid[b.r][b.c] = 'decor';
    }
  }
  return grid;
}

export function pathWaypoints(level: LevelDef): Vec2[] {
  return level.pathTiles.map((p) => ({
    x: p.c * TILE + TILE / 2,
    y: p.r * TILE + TILE / 2,
  }));
}

/** Expand orthogonal path through intermediate tiles so path is continuous. */
export function expandPath(points: Array<{ c: number; r: number }>): Array<{ c: number; r: number }> {
  if (points.length === 0) return [];
  const out: Array<{ c: number; r: number }> = [{ ...points[0] }];
  for (let i = 1; i < points.length; i++) {
    let { c, r } = out[out.length - 1];
    const target = points[i];
    while (c !== target.c || r !== target.r) {
      if (c < target.c) c++;
      else if (c > target.c) c--;
      else if (r < target.r) r++;
      else if (r > target.r) r--;
      out.push({ c, r });
    }
  }
  return out;
}

function L(
  id: number,
  name: string,
  blurb: string,
  theme: BiomeTheme,
  corners: Array<{ c: number; r: number }>,
  hpScale: number,
  startingGold: number,
  lives: number,
  blocked: Array<{ c: number; r: number }> = [],
  water: Array<{ c: number; r: number }> = [],
): LevelDef {
  return {
    id,
    name,
    blurb,
    theme,
    pathTiles: expandPath(corners),
    blocked,
    water,
    hpScale,
    startingGold,
    lives,
  };
}

export const LEVELS: LevelDef[] = [
  L(
    1,
    'Meadow Gate',
    'Gentle S-curve through soft hills. Learn the loop.',
    'meadow',
    [
      { c: 0, r: 5 },
      { c: 6, r: 5 },
      { c: 6, r: 2 },
      { c: 13, r: 2 },
      { c: 13, r: 8 },
      { c: 19, r: 8 },
    ],
    1,
    380,
    20,
    [
      { c: 2, r: 2 },
      { c: 3, r: 3 },
      { c: 8, r: 4 },
      { c: 9, r: 5 },
      { c: 10, r: 6 },
      { c: 15, r: 3 },
      { c: 16, r: 4 },
      { c: 17, r: 5 },
      { c: 1, r: 8 },
      { c: 18, r: 2 },
    ],
  ),
  L(
    2,
    'River Bend',
    'Longer travel beside the water.',
    'river',
    [
      { c: 0, r: 2 },
      { c: 4, r: 2 },
      { c: 4, r: 9 },
      { c: 10, r: 9 },
      { c: 10, r: 3 },
      { c: 16, r: 3 },
      { c: 16, r: 7 },
      { c: 19, r: 7 },
    ],
    1.12,
    365,
    20,
    [
      { c: 7, r: 5 },
      { c: 8, r: 6 },
      { c: 13, r: 6 },
      { c: 1, r: 8 },
      { c: 5, r: 5 },
      { c: 11, r: 5 },
      { c: 15, r: 5 },
      { c: 17, r: 4 },
    ],
    [
      { c: 6, r: 4 },
      { c: 7, r: 4 },
      { c: 8, r: 4 },
      { c: 12, r: 5 },
      { c: 13, r: 5 },
      { c: 14, r: 5 },
      { c: 2, r: 10 },
      { c: 3, r: 10 },
      { c: 9, r: 7 },
    ],
  ),
  L(
    3,
    'Twin Forks',
    'Deep forest — path hugs the middle. Trees steal prime pads.',
    'forest',
    [
      { c: 0, r: 6 },
      { c: 5, r: 6 },
      { c: 5, r: 1 },
      { c: 11, r: 1 },
      { c: 11, r: 10 },
      { c: 17, r: 10 },
      { c: 17, r: 4 },
      { c: 19, r: 4 },
    ],
    1.28,
    350,
    18,
    [
      { c: 2, r: 3 },
      { c: 3, r: 4 },
      { c: 4, r: 4 },
      { c: 8, r: 4 },
      { c: 8, r: 5 },
      { c: 9, r: 5 },
      { c: 9, r: 8 },
      { c: 10, r: 7 },
      { c: 14, r: 6 },
      { c: 14, r: 7 },
      { c: 15, r: 5 },
      { c: 2, r: 9 },
      { c: 15, r: 2 },
      { c: 6, r: 8 },
      { c: 12, r: 3 },
    ],
  ),
  L(
    4,
    'Mist Spiral',
    'Foggy spiral — rocks crowd the best angles.',
    'mist',
    [
      { c: 0, r: 1 },
      { c: 18, r: 1 },
      { c: 18, r: 10 },
      { c: 2, r: 10 },
      { c: 2, r: 3 },
      { c: 15, r: 3 },
      { c: 15, r: 8 },
      { c: 5, r: 8 },
      { c: 5, r: 5 },
      { c: 19, r: 5 },
    ],
    1.42,
    340,
    18,
    [
      { c: 4, r: 4 },
      { c: 4, r: 5 },
      { c: 7, r: 6 },
      { c: 8, r: 6 },
      { c: 10, r: 5 },
      { c: 11, r: 4 },
      { c: 12, r: 7 },
      { c: 13, r: 6 },
      { c: 16, r: 6 },
      { c: 16, r: 7 },
      { c: 6, r: 2 },
      { c: 9, r: 9 },
      { c: 14, r: 9 },
    ],
  ),
  L(
    5,
    'Bog Crossroads',
    'Murky swamp — water and dead wood steal pads.',
    'swamp',
    [
      { c: 0, r: 4 },
      { c: 8, r: 4 },
      { c: 8, r: 9 },
      { c: 3, r: 9 },
      { c: 3, r: 1 },
      { c: 14, r: 1 },
      { c: 14, r: 7 },
      { c: 19, r: 7 },
    ],
    1.58,
    330,
    17,
    [
      { c: 6, r: 6 },
      { c: 7, r: 5 },
      { c: 11, r: 4 },
      { c: 12, r: 5 },
      { c: 16, r: 3 },
      { c: 1, r: 7 },
      { c: 4, r: 5 },
      { c: 9, r: 2 },
      { c: 15, r: 5 },
      { c: 17, r: 5 },
    ],
    [
      { c: 5, r: 7 },
      { c: 6, r: 7 },
      { c: 10, r: 8 },
      { c: 11, r: 8 },
      { c: 12, r: 8 },
      { c: 16, r: 9 },
      { c: 17, r: 9 },
      { c: 2, r: 2 },
      { c: 7, r: 2 },
    ],
  ),
  L(
    6,
    'Haunted Ridge',
    'Dead trees choke the ridge — fewer safe nests.',
    'haunted',
    [
      { c: 0, r: 10 },
      { c: 3, r: 10 },
      { c: 3, r: 2 },
      { c: 9, r: 2 },
      { c: 9, r: 8 },
      { c: 15, r: 8 },
      { c: 15, r: 2 },
      { c: 19, r: 2 },
    ],
    1.75,
    320,
    16,
    [
      { c: 5, r: 5 },
      { c: 6, r: 4 },
      { c: 6, r: 5 },
      { c: 7, r: 5 },
      { c: 11, r: 4 },
      { c: 12, r: 5 },
      { c: 12, r: 4 },
      { c: 13, r: 4 },
      { c: 17, r: 5 },
      { c: 1, r: 6 },
      { c: 4, r: 6 },
      { c: 8, r: 6 },
      { c: 10, r: 6 },
      { c: 14, r: 5 },
      { c: 16, r: 4 },
      { c: 18, r: 5 },
    ],
  ),
  L(
    7,
    'Frozen Wall',
    'Ice shelves force awkward placements.',
    'ice',
    [
      { c: 0, r: 3 },
      { c: 6, r: 3 },
      { c: 6, r: 7 },
      { c: 2, r: 7 },
      { c: 2, r: 11 },
      { c: 12, r: 11 },
      { c: 12, r: 0 },
      { c: 19, r: 0 },
    ],
    1.95,
    310,
    16,
    [
      { c: 4, r: 5 },
      { c: 5, r: 5 },
      { c: 8, r: 5 },
      { c: 8, r: 9 },
      { c: 9, r: 9 },
      { c: 10, r: 5 },
      { c: 11, r: 5 },
      { c: 14, r: 3 },
      { c: 14, r: 4 },
      { c: 15, r: 8 },
      { c: 16, r: 7 },
      { c: 3, r: 9 },
      { c: 7, r: 1 },
      { c: 13, r: 6 },
      { c: 17, r: 2 },
    ],
  ),
  L(
    8,
    'Alpine Canal',
    'Long mountain canal — cliffs steal riverside pads.',
    'alpine',
    [
      { c: 0, r: 6 },
      { c: 19, r: 6 },
      { c: 19, r: 2 },
      { c: 4, r: 2 },
      { c: 4, r: 10 },
      { c: 16, r: 10 },
      { c: 16, r: 8 },
      { c: 19, r: 8 },
    ],
    2.15,
    300,
    15,
    [
      { c: 8, r: 4 },
      { c: 9, r: 4 },
      { c: 10, r: 8 },
      { c: 11, r: 8 },
      { c: 2, r: 4 },
      { c: 3, r: 4 },
      { c: 14, r: 4 },
      { c: 15, r: 4 },
      { c: 6, r: 5 },
      { c: 7, r: 5 },
      { c: 12, r: 5 },
      { c: 13, r: 5 },
      { c: 5, r: 8 },
      { c: 17, r: 5 },
    ],
    [
      { c: 7, r: 8 },
      { c: 8, r: 8 },
      { c: 9, r: 9 },
      { c: 12, r: 3 },
      { c: 13, r: 3 },
      { c: 1, r: 8 },
      { c: 18, r: 4 },
    ],
  ),
  L(
    9,
    'Siege Crater',
    'Volcanic march — lava and slag steal the good spots.',
    'volcanic',
    [
      { c: 0, r: 0 },
      { c: 0, r: 8 },
      { c: 7, r: 8 },
      { c: 7, r: 2 },
      { c: 13, r: 2 },
      { c: 13, r: 9 },
      { c: 19, r: 9 },
    ],
    2.15,
    340,
    15,
    [
      { c: 3, r: 3 },
      { c: 4, r: 4 },
      { c: 5, r: 3 },
      { c: 9, r: 5 },
      { c: 10, r: 6 },
      { c: 11, r: 5 },
      { c: 15, r: 5 },
      { c: 16, r: 6 },
      { c: 5, r: 10 },
      { c: 2, r: 5 },
      { c: 8, r: 4 },
      { c: 14, r: 7 },
      { c: 17, r: 4 },
      { c: 18, r: 6 },
    ],
    [
      { c: 4, r: 6 },
      { c: 5, r: 6 },
      { c: 10, r: 4 },
      { c: 11, r: 4 },
      { c: 16, r: 7 },
      { c: 6, r: 5 },
      { c: 12, r: 6 },
    ],
  ),
  L(
    10,
    'Last Bastion',
    'Final stand — ruins and slag leave almost no free grass.',
    'bastion',
    [
      { c: 0, r: 5 },
      { c: 4, r: 5 },
      { c: 4, r: 1 },
      { c: 10, r: 1 },
      { c: 10, r: 10 },
      { c: 6, r: 10 },
      { c: 6, r: 3 },
      { c: 15, r: 3 },
      { c: 15, r: 8 },
      { c: 19, r: 8 },
    ],
    2.95,
    300,
    12,
    [
      { c: 2, r: 2 },
      { c: 3, r: 3 },
      { c: 8, r: 5 },
      { c: 8, r: 6 },
      { c: 9, r: 5 },
      { c: 12, r: 6 },
      { c: 12, r: 7 },
      { c: 13, r: 6 },
      { c: 17, r: 4 },
      { c: 17, r: 5 },
      { c: 3, r: 8 },
      { c: 5, r: 6 },
      { c: 7, r: 4 },
      { c: 11, r: 4 },
      { c: 14, r: 5 },
      { c: 16, r: 6 },
      { c: 18, r: 5 },
      { c: 1, r: 7 },
    ],
    [
      { c: 1, r: 9 },
      { c: 2, r: 9 },
      { c: 13, r: 5 },
      { c: 7, r: 8 },
      { c: 9, r: 8 },
    ],
  ),
];

/** Build wave composition for a level/wave (1-indexed wave). */
export function buildWave(levelId: number, wave: number): WaveSpawn[] {
  const w = Math.max(1, Math.min(WAVES_PER_LEVEL, wave));
  const Lvl = levelId;
  const pressure = 1 + (Lvl - 1) * 0.12 + (w - 1) * 0.08;
  const groups: WaveSpawn[] = [];

  if (w <= 2) {
    groups.push({ kind: 'orc', count: Math.round(6 * pressure), interval: 0.7 });
  } else if (w === 3) {
    groups.push({ kind: 'orc', count: Math.round(5 * pressure), interval: 0.65 });
    groups.push({ kind: 'gnome', count: Math.round(4 * pressure), interval: 0.45, delay: 1.5 });
    if (Lvl >= 3) {
      groups.push({ kind: 'wisp', count: Math.round(3 * pressure), interval: 0.5, delay: 2.2 });
    }
  } else if (w === 4) {
    groups.push({ kind: 'ghoul', count: Math.round(10 * pressure), interval: 0.28 });
    groups.push({ kind: 'orc', count: Math.round(4 * pressure), interval: 0.6, delay: 2 });
    if (Lvl >= 3) {
      groups.push({ kind: 'wisp', count: Math.round(4 * pressure), interval: 0.42, delay: 1.2 });
    }
  } else if (w === 5) {
    groups.push({ kind: 'orc', count: Math.round(5 * pressure), interval: 0.55 });
    groups.push({ kind: 'zombie', count: Math.round(2 + Lvl * 0.25), interval: 1.1, delay: 1.5 });
    groups.push({ kind: 'troll', count: Math.round(1 + Lvl * 0.25), interval: 1.3, delay: 3 });
    if (Lvl >= 3) {
      groups.push({ kind: 'wisp', count: Math.round(5 * pressure), interval: 0.4, delay: 2 });
    }
  } else if (w === 6) {
    groups.push({ kind: 'gnome', count: Math.round(6 * pressure), interval: 0.35 });
    groups.push({ kind: 'ghoul', count: Math.round(8 * pressure), interval: 0.25, delay: 1 });
    groups.push({
      kind: 'skeletonSnake',
      count: Math.round(4 * pressure),
      interval: 0.5,
      delay: 2.5,
    });
    if (Lvl >= 6) {
      groups.push({ kind: 'gargoyle', count: Math.round(1 + Lvl * 0.15), interval: 1.2, delay: 3 });
    } else if (Lvl >= 3) {
      groups.push({ kind: 'wisp', count: Math.round(5 * pressure), interval: 0.38, delay: 2 });
    }
  } else if (w === 7) {
    groups.push({ kind: 'troll', count: Math.round(2 + Lvl * 0.35), interval: 1.0 });
    groups.push({ kind: 'zombie', count: Math.round(3 * pressure), interval: 0.8, delay: 1 });
    groups.push({ kind: 'ghost', count: Math.round(4 * pressure), interval: 0.4, delay: 2.5 });
    if (Lvl >= 6) {
      groups.push({ kind: 'gargoyle', count: Math.round(2 * pressure), interval: 1.0, delay: 2 });
    }
  } else if (w === 8) {
    groups.push({ kind: 'ghoul', count: Math.round(12 * pressure), interval: 0.22 });
    groups.push({ kind: 'ghost', count: Math.round(5 * pressure), interval: 0.38, delay: 1 });
    groups.push({ kind: 'necromancer', count: Math.round(1 + Lvl * 0.2), interval: 1.4, delay: 3 });
    if (Lvl >= 5) {
      groups.push({ kind: 'wyrm', count: 1, interval: 2, delay: 5 });
    }
    if (Lvl >= 3) {
      groups.push({ kind: 'wisp', count: Math.round(6 * pressure), interval: 0.35, delay: 1.5 });
    }
    if (Lvl >= 6) {
      groups.push({ kind: 'gargoyle', count: 2, interval: 1.1, delay: 4 });
    }
  } else if (w === 9) {
    groups.push({ kind: 'orc', count: Math.round(6 * pressure), interval: 0.45 });
    groups.push({ kind: 'troll', count: Math.round(3 + Lvl * 0.35), interval: 0.9, delay: 1 });
    groups.push({ kind: 'necromancer', count: Math.round(1 + Lvl * 0.15), interval: 1.2, delay: 2.5 });
    groups.push({ kind: 'wyrm', count: Math.round(1 + (Lvl >= 6 ? 1 : 0)), interval: 1.5, delay: 4 });
    if (Lvl >= 6) {
      groups.push({ kind: 'gargoyle', count: Math.round(2 + Lvl * 0.15), interval: 1.0, delay: 3 });
    }
  } else {
    groups.push({ kind: 'orc', count: Math.round(5 * pressure), interval: 0.5 });
    groups.push({ kind: 'troll', count: Math.round(2 + Lvl * 0.4), interval: 0.85, delay: 1.2 });
    groups.push({ kind: 'necromancer', count: Math.round(1 + Lvl * 0.2), interval: 1.2, delay: 2.5 });
    groups.push({ kind: 'lich', count: 1 + (Lvl >= 8 ? 1 : 0), interval: 2.5, delay: 4 });
    groups.push({ kind: 'ghoul', count: Math.round(10 * pressure), interval: 0.25, delay: 5 });
    if (Lvl >= 6) {
      groups.push({ kind: 'wyrm', count: 1, interval: 2, delay: 6 });
      groups.push({ kind: 'gargoyle', count: 3, interval: 0.9, delay: 3.5 });
    }
    if (Lvl >= 3) {
      groups.push({ kind: 'wisp', count: Math.round(8 * pressure), interval: 0.3, delay: 2 });
    }
    // Final map climax — denser flyers + second lich beat
    if (Lvl >= 10) {
      groups.push({ kind: 'gargoyle', count: 4, interval: 0.75, delay: 2.5 });
      groups.push({ kind: 'wyrm', count: 1, interval: 2, delay: 7 });
    }
  }

  const level = LEVELS.find((l) => l.id === Lvl);
  return biasWaveForTheme(groups, level?.theme ?? 'meadow');
}

export function canPlaceOnCell(grid: CellKind[][], c: number, r: number): boolean {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;
  return grid[r][c] === 'grass';
}
