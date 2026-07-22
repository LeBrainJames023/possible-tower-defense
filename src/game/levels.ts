import type { CellKind, EnemyKind } from './constants';
import { COLS, ROWS, TILE, WAVES_PER_LEVEL } from './constants';
import type { Vec2 } from '../shared/math';

export interface LevelDef {
  id: number;
  name: string;
  blurb: string;
  /** Grid cells: path waypoints in tile coords */
  pathTiles: Array<{ c: number; r: number }>;
  blocked?: Array<{ c: number; r: number }>;
  /** Multiplier applied to enemy HP for this level */
  hpScale: number;
  /** Extra gold at start */
  startingGold: number;
  lives: number;
}

export interface WaveSpawn {
  kind: EnemyKind;
  count: number;
  interval: number; // seconds between spawns
  delay?: number; // delay before this group starts
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
  for (const b of level.blocked ?? []) {
    if (b.r >= 0 && b.r < ROWS && b.c >= 0 && b.c < COLS && grid[b.r][b.c] !== 'path') {
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
  corners: Array<{ c: number; r: number }>,
  hpScale: number,
  startingGold: number,
  lives: number,
  blocked: Array<{ c: number; r: number }> = [],
): LevelDef {
  return {
    id,
    name,
    blurb,
    pathTiles: expandPath(corners),
    blocked,
    hpScale,
    startingGold,
    lives,
  };
}

export const LEVELS: LevelDef[] = [
  L(1, 'Meadow Gate', 'A gentle S-curve. Learn the loop.', [
    { c: 0, r: 5 },
    { c: 6, r: 5 },
    { c: 6, r: 2 },
    { c: 13, r: 2 },
    { c: 13, r: 8 },
    { c: 19, r: 8 },
  ], 1, 380, 20, [
    { c: 3, r: 3 },
    { c: 4, r: 3 },
    { c: 10, r: 5 },
    { c: 16, r: 4 },
  ]),
  L(2, 'River Bend', 'Longer travel, tighter corners.', [
    { c: 0, r: 2 },
    { c: 4, r: 2 },
    { c: 4, r: 9 },
    { c: 10, r: 9 },
    { c: 10, r: 3 },
    { c: 16, r: 3 },
    { c: 16, r: 7 },
    { c: 19, r: 7 },
  ], 1.15, 360, 20, [
    { c: 7, r: 5 },
    { c: 8, r: 5 },
    { c: 13, r: 6 },
  ]),
  L(3, 'Twin Forks', 'Path hugs the middle — cover both sides.', [
    { c: 0, r: 6 },
    { c: 5, r: 6 },
    { c: 5, r: 1 },
    { c: 11, r: 1 },
    { c: 11, r: 10 },
    { c: 17, r: 10 },
    { c: 17, r: 4 },
    { c: 19, r: 4 },
  ], 1.3, 350, 18, [
    { c: 8, r: 4 },
    { c: 14, r: 6 },
    { c: 2, r: 9 },
  ]),
  L(4, 'Stone Spiral', 'Spiral inward pressure.', [
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
  ], 1.45, 340, 18),
  L(5, 'Crossroads', 'Dense mid-map — splash shines.', [
    { c: 0, r: 4 },
    { c: 8, r: 4 },
    { c: 8, r: 9 },
    { c: 3, r: 9 },
    { c: 3, r: 1 },
    { c: 14, r: 1 },
    { c: 14, r: 7 },
    { c: 19, r: 7 },
  ], 1.6, 330, 17, [
    { c: 6, r: 6 },
    { c: 11, r: 4 },
    { c: 16, r: 3 },
  ]),
  L(6, 'Ridge Run', 'Fast lane along the ridge.', [
    { c: 0, r: 10 },
    { c: 3, r: 10 },
    { c: 3, r: 2 },
    { c: 9, r: 2 },
    { c: 9, r: 8 },
    { c: 15, r: 8 },
    { c: 15, r: 2 },
    { c: 19, r: 2 },
  ], 1.8, 320, 16),
  L(7, 'Broken Wall', 'Gaps force awkward placements.', [
    { c: 0, r: 3 },
    { c: 6, r: 3 },
    { c: 6, r: 7 },
    { c: 2, r: 7 },
    { c: 2, r: 11 },
    { c: 12, r: 11 },
    { c: 12, r: 0 },
    { c: 19, r: 0 },
  ], 2.0, 310, 16, [
    { c: 4, r: 5 },
    { c: 8, r: 5 },
    { c: 8, r: 9 },
    { c: 9, r: 9 },
    { c: 10, r: 5 },
    { c: 14, r: 3 },
    { c: 14, r: 4 },
    { c: 15, r: 8 },
  ]),
  L(8, 'Night Canal', 'Long canal — range management.', [
    { c: 0, r: 6 },
    { c: 19, r: 6 },
    { c: 19, r: 2 },
    { c: 4, r: 2 },
    { c: 4, r: 10 },
    { c: 16, r: 10 },
    { c: 16, r: 8 },
    { c: 19, r: 8 },
  ], 2.2, 300, 15, [
    { c: 8, r: 4 },
    { c: 9, r: 4 },
    { c: 10, r: 8 },
    { c: 11, r: 8 },
  ]),
  L(9, 'Siege March', 'Thick armor arrives early.', [
    { c: 0, r: 0 },
    { c: 0, r: 8 },
    { c: 7, r: 8 },
    { c: 7, r: 2 },
    { c: 13, r: 2 },
    { c: 13, r: 9 },
    { c: 19, r: 9 },
  ], 2.45, 290, 14),
  L(10, 'Last Bastion', 'Final stand — every niche matters.', [
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
  ], 2.75, 280, 12, [
    { c: 8, r: 5 },
    { c: 12, r: 6 },
    { c: 17, r: 4 },
  ]),
];

/** Build wave composition for a level/wave (1-indexed wave). */
export function buildWave(levelId: number, wave: number): WaveSpawn[] {
  const w = Math.max(1, Math.min(WAVES_PER_LEVEL, wave));
  const Lvl = levelId;
  const pressure = 1 + (Lvl - 1) * 0.12 + (w - 1) * 0.08;

  const groups: WaveSpawn[] = [];

  // Introduce types gradually
  if (w <= 2) {
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure), interval: 0.7 });
  } else if (w === 3) {
    groups.push({ kind: 'grunt', count: Math.round(5 * pressure), interval: 0.65 });
    groups.push({ kind: 'scout', count: Math.round(4 * pressure), interval: 0.45, delay: 1.5 });
  } else if (w === 4) {
    groups.push({ kind: 'swarm', count: Math.round(10 * pressure), interval: 0.28 });
    groups.push({ kind: 'grunt', count: Math.round(4 * pressure), interval: 0.6, delay: 2 });
  } else if (w === 5) {
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure), interval: 0.55 });
    groups.push({ kind: 'brute', count: Math.round(2 + Lvl * 0.3), interval: 1.2, delay: 2 });
  } else if (w === 6) {
    groups.push({ kind: 'scout', count: Math.round(8 * pressure), interval: 0.35 });
    groups.push({ kind: 'swarm', count: Math.round(8 * pressure), interval: 0.25, delay: 1 });
  } else if (w === 7) {
    groups.push({ kind: 'brute', count: Math.round(3 + Lvl * 0.4), interval: 1.0 });
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure), interval: 0.5, delay: 1.5 });
  } else if (w === 8) {
    groups.push({ kind: 'swarm', count: Math.round(14 * pressure), interval: 0.22 });
    groups.push({ kind: 'scout', count: Math.round(6 * pressure), interval: 0.4, delay: 1 });
    groups.push({ kind: 'brute', count: Math.round(2 + Lvl * 0.35), interval: 1.1, delay: 3 });
  } else if (w === 9) {
    groups.push({ kind: 'grunt', count: Math.round(8 * pressure), interval: 0.45 });
    groups.push({ kind: 'brute', count: Math.round(4 + Lvl * 0.4), interval: 0.9, delay: 1 });
    groups.push({ kind: 'scout', count: Math.round(8 * pressure), interval: 0.35, delay: 3 });
  } else {
    // Wave 10 boss + escort
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure), interval: 0.5 });
    groups.push({ kind: 'brute', count: Math.round(3 + Lvl * 0.5), interval: 0.85, delay: 1.5 });
    groups.push({ kind: 'boss', count: 1 + (Lvl >= 8 ? 1 : 0), interval: 2.5, delay: 4 });
    groups.push({ kind: 'swarm', count: Math.round(10 * pressure), interval: 0.25, delay: 5 });
  }

  return groups;
}

export function canPlaceOnCell(grid: CellKind[][], c: number, r: number): boolean {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;
  return grid[r][c] === 'grass';
}
