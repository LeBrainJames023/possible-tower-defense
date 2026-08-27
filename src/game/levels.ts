import type { CellKind } from './constants';
import { COLS, ROWS, STAGES_PER_WORLD, TILE, WAVES_PER_LEVEL } from './constants';
import { ENEMIES, type EnemyKind } from './enemies';
import { championAt, rosterFor, specialAt } from './worldRoster';
import type { Vec2 } from '../shared/math';
import { PATH_OVERRIDES, scatterWorldDecor } from './worldPaths';
import { WORLDS, type WorldId } from './worlds';

export interface LevelDef {
  id: number;
  world: WorldId;
  worldIndex: number;
  stage: number;
  name: string;
  blurb: string;
  /** Grid cells: path waypoints in tile coords */
  pathTiles: Array<{ c: number; r: number }>;
  blocked?: Array<{ c: number; r: number }>;
  /** Multiplier applied to enemy HP for this level */
  hpScale: number;
  startingGold: number;
  lives: number;
}

export interface WaveSpawn {
  kind: EnemyKind;
  count: number;
}

type Cell = { c: number; r: number };

interface PathTemplate {
  names: Record<WorldId, string>;
  blurb: string;
  corners: Cell[];
  blocked?: Cell[];
  hpScale: number;
  gold: number;
  lives: number;
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

function mapCell(p: Cell, kind: (typeof WORLDS)[number]['transform']): Cell {
  switch (kind) {
    case 'id':
      return { c: p.c, r: p.r };
    case 'flipX':
    case 'revX':
      return { c: COLS - 1 - p.c, r: p.r };
    case 'flipY':
      return { c: p.c, r: ROWS - 1 - p.r };
    case 'flipXY':
      return { c: COLS - 1 - p.c, r: ROWS - 1 - p.r };
  }
}

function transformCells(cells: Cell[], kind: (typeof WORLDS)[number]['transform']): Cell[] {
  const mapped = cells.map((p) => mapCell(p, kind));
  return kind === 'revX' ? mapped.slice().reverse() : mapped;
}

/** The ten Forest layouts. Other worlds reuse these shapes, flipped or reversed. */
const TEMPLATES: PathTemplate[] = [
  {
    names: {
      forest: 'Meadow Gate',
      desert: 'Dune Gate',
      ice: 'Frost Gate',
      fire: 'Ember Gate',
      hollow: 'Rune Gate',
    },
    blurb: 'A gentle S-curve. Learn the loop.',
    corners: [
      { c: 0, r: 5 },
      { c: 6, r: 5 },
      { c: 6, r: 2 },
      { c: 13, r: 2 },
      { c: 13, r: 8 },
      { c: 19, r: 8 },
    ],
    blocked: [
      { c: 3, r: 3 },
      { c: 4, r: 3 },
      { c: 10, r: 5 },
      { c: 16, r: 4 },
    ],
    hpScale: 1,
    gold: 250,
    lives: 18,
  },
  {
    names: {
      forest: 'River Bend',
      desert: 'Oasis Bend',
      ice: 'Glacier Bend',
      fire: 'Magma Bend',
      hollow: 'Shadow Bend',
    },
    blurb: 'Longer travel, tighter corners.',
    corners: [
      { c: 0, r: 2 },
      { c: 4, r: 2 },
      { c: 4, r: 9 },
      { c: 10, r: 9 },
      { c: 10, r: 3 },
      { c: 16, r: 3 },
      { c: 16, r: 7 },
      { c: 19, r: 7 },
    ],
    blocked: [
      { c: 7, r: 5 },
      { c: 8, r: 5 },
      { c: 13, r: 6 },
    ],
    hpScale: 1.15,
    gold: 255,
    lives: 18,
  },
  {
    names: {
      forest: 'Twin Forks',
      desert: 'Twin Dunes',
      ice: 'Twin Floes',
      fire: 'Twin Caldera',
      hollow: 'Twin Hex',
    },
    blurb: 'Path hugs the middle — cover both sides.',
    corners: [
      { c: 0, r: 6 },
      { c: 5, r: 6 },
      { c: 5, r: 1 },
      { c: 11, r: 1 },
      { c: 11, r: 10 },
      { c: 17, r: 10 },
      { c: 17, r: 4 },
      { c: 19, r: 4 },
    ],
    blocked: [
      { c: 8, r: 4 },
      { c: 14, r: 6 },
      { c: 2, r: 9 },
    ],
    hpScale: 1.3,
    gold: 260,
    lives: 16,
  },
  {
    names: {
      forest: 'Stone Spiral',
      desert: 'Sand Spiral',
      ice: 'Ice Spiral',
      fire: 'Fire Spiral',
      hollow: 'Void Spiral',
    },
    blurb: 'Spiral inward pressure.',
    corners: [
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
    hpScale: 1.45,
    gold: 265,
    lives: 16,
  },
  {
    names: {
      forest: 'Crossroads',
      desert: 'Crosswinds',
      ice: 'Crossfrost',
      fire: 'Crossflame',
      hollow: 'Crosscurse',
    },
    blurb: 'Dense mid-map — splash shines.',
    corners: [
      { c: 0, r: 4 },
      { c: 8, r: 4 },
      { c: 8, r: 9 },
      { c: 3, r: 9 },
      { c: 3, r: 1 },
      { c: 14, r: 1 },
      { c: 14, r: 7 },
      { c: 19, r: 7 },
    ],
    blocked: [
      { c: 6, r: 6 },
      { c: 11, r: 4 },
      { c: 16, r: 3 },
    ],
    hpScale: 1.6,
    gold: 270,
    lives: 15,
  },
  {
    names: {
      forest: 'Ridge Run',
      desert: 'Ridge Dunes',
      ice: 'Ridge Ice',
      fire: 'Ridge Ash',
      hollow: 'Ridge Bone',
    },
    blurb: 'Fast lane along the ridge.',
    corners: [
      { c: 0, r: 10 },
      { c: 3, r: 10 },
      { c: 3, r: 2 },
      { c: 9, r: 2 },
      { c: 9, r: 8 },
      { c: 15, r: 8 },
      { c: 15, r: 2 },
      { c: 19, r: 2 },
    ],
    hpScale: 1.8,
    gold: 280,
    lives: 15,
  },
  {
    names: {
      forest: 'Broken Wall',
      desert: 'Broken Mesa',
      ice: 'Broken Shelf',
      fire: 'Broken Crust',
      hollow: 'Broken Ward',
    },
    blurb: 'Gaps force awkward placements.',
    corners: [
      { c: 0, r: 3 },
      { c: 6, r: 3 },
      { c: 6, r: 7 },
      { c: 2, r: 7 },
      { c: 2, r: 11 },
      { c: 12, r: 11 },
      { c: 12, r: 0 },
      { c: 19, r: 0 },
    ],
    blocked: [
      { c: 4, r: 5 },
      { c: 8, r: 5 },
      { c: 8, r: 9 },
      { c: 9, r: 9 },
      { c: 10, r: 5 },
      { c: 14, r: 3 },
      { c: 14, r: 4 },
      { c: 15, r: 8 },
    ],
    hpScale: 2.0,
    gold: 290,
    lives: 14,
  },
  {
    names: {
      forest: 'Night Canal',
      desert: 'Dry Canal',
      ice: 'Night Fjord',
      fire: 'Lava Canal',
      hollow: 'Night Vein',
    },
    blurb: 'Long canal — range management.',
    corners: [
      { c: 0, r: 6 },
      { c: 19, r: 6 },
      { c: 19, r: 2 },
      { c: 4, r: 2 },
      { c: 4, r: 10 },
      { c: 16, r: 10 },
      { c: 16, r: 8 },
      { c: 19, r: 8 },
    ],
    blocked: [
      { c: 8, r: 4 },
      { c: 9, r: 4 },
      { c: 10, r: 8 },
      { c: 11, r: 8 },
    ],
    hpScale: 2.2,
    gold: 300,
    lives: 14,
  },
  {
    names: {
      forest: 'Siege March',
      desert: 'Siege Caravan',
      ice: 'Siege Drift',
      fire: 'Siege Cinder',
      hollow: 'Siege Cult',
    },
    blurb: 'Thick armor arrives early.',
    corners: [
      { c: 0, r: 0 },
      { c: 0, r: 8 },
      { c: 7, r: 8 },
      { c: 7, r: 2 },
      { c: 13, r: 2 },
      { c: 13, r: 9 },
      { c: 19, r: 9 },
    ],
    hpScale: 2.45,
    gold: 310,
    lives: 13,
  },
  {
    names: {
      forest: 'Last Bastion',
      desert: 'Last Oasis',
      ice: 'Last Glacier',
      fire: 'Last Crucible',
      hollow: 'Last Spire',
    },
    blurb: 'Final stand — every niche matters.',
    corners: [
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
    blocked: [
      { c: 8, r: 5 },
      { c: 12, r: 6 },
      { c: 17, r: 4 },
    ],
    hpScale: 2.75,
    gold: 320,
    lives: 12,
  },
];

/** Desert, Ice, and Fire extra bodies showed up in play before the opening kit did. Late maps only. Forest start gold stays put. */
function startGoldFor(world: (typeof WORLDS)[number], stage: number, templateGold: number): number {
  let mul = world.hpMul;
  if (world.id === 'desert' || world.id === 'ice' || world.id === 'fire') {
    if (stage >= 8) mul *= 1.38;
    else if (stage >= 7) mul *= 1.15;
  }
  return Math.round(templateGold * mul);
}

function buildLevels(): LevelDef[] {
  const out: LevelDef[] = [];
  for (const world of WORLDS) {
    TEMPLATES.forEach((t, i) => {
      const stage = i + 1;
      const over = PATH_OVERRIDES[world.id]?.[stage];
      const corners = over ? over.corners : transformCells(t.corners, world.transform);
      const authored = over ? (over.blocked ?? []) : transformCells(t.blocked ?? [], world.transform);
      const pathTiles = expandPath(corners);
      out.push({
        id: (world.index - 1) * STAGES_PER_WORLD + stage,
        world: world.id,
        worldIndex: world.index,
        stage,
        name: over?.name ?? t.names[world.id],
        blurb: over?.blurb ?? t.blurb,
        pathTiles,
        blocked: scatterWorldDecor(world.id, pathTiles, authored),
        hpScale: Math.round(t.hpScale * world.hpMul * 100) / 100,
        startingGold: startGoldFor(world, stage, t.gold),
        lives: t.lives,
      });
    });
  }
  return out;
}

export const LEVELS: LevelDef[] = buildLevels();

export function findLevel(worldIndex: number, stage: number): LevelDef {
  return LEVELS.find((l) => l.worldIndex === worldIndex && l.stage === stage) ?? LEVELS[0];
}

export function levelsInWorld(worldIndex: number): LevelDef[] {
  return LEVELS.filter((l) => l.worldIndex === worldIndex);
}

/** Campaign waves 1–10. Extra waves reuse late packs (7–10) so endless does not invent a new script. */
export function authoredWave(wave: number): number {
  const n = Math.max(1, Math.floor(wave));
  if (n <= WAVES_PER_LEVEL) return n;
  return 7 + ((n - 11) % 4);
}

/** Composition only (kind + count). Timing lives in spawnSchedule.ts. */
export function buildWave(stage: number, wave: number, worldIndex = 1): WaveSpawn[] {
  const n = Math.max(1, Math.floor(wave));
  const w = authoredWave(n);
  const st = Math.max(1, Math.min(STAGES_PER_WORLD, stage));
  const wi = Math.max(1, worldIndex);
  const extra = Math.max(0, n - WAVES_PER_LEVEL);
  const pressure = 1 + (st - 1) * 0.12 + (w - 1) * 0.08 + (wi - 1) * 0.18 + extra * 0.08;

  const groups: WaveSpawn[] = [];
  const local1 = specialAt(wi, st, 1);
  const local2 = specialAt(wi, st, 2);
  const champ = championAt(wi, st);
  const boss = rosterFor(wi).boss;

  if (w <= 2) {
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure) });
  } else if (w === 3) {
    groups.push({ kind: 'grunt', count: Math.round(5 * pressure) });
    groups.push({ kind: 'scout', count: Math.round(4 * pressure) });
    if (local1) groups.push({ kind: local1, count: Math.round(2 * pressure) });
  } else if (w === 4) {
    groups.push({ kind: 'swarm', count: Math.round(10 * pressure) });
    groups.push({ kind: 'grunt', count: Math.round(4 * pressure) });
  } else if (w === 5) {
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure) });
    groups.push({ kind: 'brute', count: Math.round(2 + st * 0.3) });
    if (local1) groups.push({ kind: local1, count: Math.round(2 * pressure) });
  } else if (w === 6) {
    groups.push({ kind: 'scout', count: Math.round(8 * pressure) });
    groups.push({ kind: 'swarm', count: Math.round(8 * pressure) });
    if (local2) groups.push({ kind: local2, count: Math.round(3 * pressure) });
  } else if (w === 7) {
    groups.push({ kind: 'brute', count: Math.round(3 + st * 0.4) });
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure) });
    if (champ) groups.push({ kind: champ, count: 1 });
  } else if (w === 8) {
    groups.push({ kind: 'swarm', count: Math.round(14 * pressure) });
    groups.push({ kind: 'scout', count: Math.round(6 * pressure) });
    groups.push({ kind: 'brute', count: Math.round(2 + st * 0.35) });
    if (local1) groups.push({ kind: local1, count: Math.round(3 * pressure) });
  } else if (w === 9) {
    groups.push({ kind: 'grunt', count: Math.round(8 * pressure) });
    groups.push({ kind: 'brute', count: Math.round(4 + st * 0.4) });
    groups.push({ kind: 'scout', count: Math.round(8 * pressure) });
    if (local2) groups.push({ kind: local2, count: Math.round(3 * pressure) });
  } else {
    groups.push({ kind: 'grunt', count: Math.round(6 * pressure) });
    groups.push({ kind: 'brute', count: Math.round(3 + st * 0.5) });
    groups.push({ kind: boss, count: 1 + (st >= 8 ? 1 : 0) });
    groups.push({ kind: 'swarm', count: Math.round(10 * pressure) });
  }

  return groups;
}

export function waveRoster(stage: number, wave: number, worldIndex = 1): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const g of buildWave(stage, wave, worldIndex)) {
    const name = ENEMIES[g.kind].name;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function canPlaceOnCell(grid: CellKind[][], c: number, r: number): boolean {
  if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return false;
  return grid[r][c] === 'grass';
}
