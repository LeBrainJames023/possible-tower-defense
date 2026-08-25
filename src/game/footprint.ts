import { COLS, ROWS, TILE, isTroopHall, type TowerKind } from './constants';
import type { Tower } from './entities';
import { canPlaceOnCell } from './levels';

/** Muster / Chapter sit on two grass tiles — side by side or stacked. */
export const HALL_SPAN = 2;

export type HallAxis = 'h' | 'v';
export type HallDir = 'e' | 'w' | 's' | 'n';

const HALL_DELTA: Record<HallDir, { dc: number; dr: number }> = {
  e: { dc: 1, dr: 0 },
  w: { dc: -1, dr: 0 },
  s: { dc: 0, dr: 1 },
  n: { dc: 0, dr: -1 },
};

const HALL_CW: HallDir[] = ['e', 's', 'w', 'n'];

export function cellKey(c: number, r: number): string {
  return `${c},${r}`;
}

export function hallAxisOf(dir: HallDir): HallAxis {
  return dir === 'e' || dir === 'w' ? 'h' : 'v';
}

export function hallPartner(c: number, r: number, dir: HallDir): { c: number; r: number } {
  const d = HALL_DELTA[dir];
  return { c: c + d.dc, r: r + d.dr };
}

export function hallCellsFrom(c: number, r: number, dir: HallDir): Array<{ c: number; r: number }> {
  const p = hallPartner(c, r, dir);
  return [
    { c, r },
    { c: p.c, r: p.r },
  ];
}

export function hallOriginFrom(c: number, r: number, dir: HallDir): { col: number; row: number; axis: HallAxis } {
  const p = hallPartner(c, r, dir);
  return {
    col: Math.min(c, p.c),
    row: Math.min(r, p.r),
    axis: hallAxisOf(dir),
  };
}

export function hallFootprint(col: number, row: number, axis: HallAxis = 'h'): Array<{ c: number; r: number }> {
  if (axis === 'v') {
    return [
      { c: col, r: row },
      { c: col, r: row + 1 },
    ];
  }
  return [
    { c: col, r: row },
    { c: col + 1, r: row },
  ];
}

export function hallCenter(col: number, row: number, axis: HallAxis = 'h'): { x: number; y: number } {
  if (axis === 'v') return { x: col * TILE + TILE / 2, y: (row + 1) * TILE };
  return { x: (col + 1) * TILE, y: row * TILE + TILE / 2 };
}

export function hallDirLegal(
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
  dir: HallDir,
): boolean {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  if (!canUse(c, r)) return false;
  const p = hallPartner(c, r, dir);
  if (p.r < 0 || p.r >= ROWS || p.c < 0 || p.c >= COLS) return false;
  return canUse(p.c, p.r);
}

/** Prefer right, then left, then down, then up. */
export function firstHallDir(
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
): HallDir | null {
  for (const dir of ['e', 'w', 's', 'n'] as HallDir[]) {
    if (hallDirLegal(canUse, c, r, dir)) return dir;
  }
  return null;
}

/** Next legal facing in that turn direction. Skips blocked neighbors. */
export function rotateHallDir(
  from: HallDir,
  step: 1 | -1,
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
): HallDir | null {
  const i = HALL_CW.indexOf(from);
  for (let k = 1; k <= 4; k++) {
    const dir = HALL_CW[(i + step * k + 4) % 4];
    if (hallDirLegal(canUse, c, r, dir)) return dir;
  }
  return null;
}

export type HallPreview = {
  left: number;
  row: number;
  axis: HallAxis;
  dir: HallDir;
  cells: Array<{ c: number; r: number }>;
  ok: boolean;
};

export function hallPreviewFromClick(
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
  dir: HallDir | null = null,
): HallPreview {
  const facing = dir && hallDirLegal(canUse, c, r, dir) ? dir : firstHallDir(canUse, c, r);
  if (facing) {
    const o = hallOriginFrom(c, r, facing);
    return {
      left: o.col,
      row: o.row,
      axis: o.axis,
      dir: facing,
      cells: hallFootprint(o.col, o.row, o.axis),
      ok: true,
    };
  }
  const guess: HallDir = c + 1 < COLS ? 'e' : 'w';
  const o = hallOriginFrom(c, r, guess);
  return {
    left: o.col,
    row: o.row,
    axis: hallAxisOf(guess),
    dir: guess,
    cells: hallCellsFrom(c, r, guess).filter((cell) => cell.c >= 0 && cell.c < COLS && cell.r >= 0 && cell.r < ROWS),
    ok: false,
  };
}

/** Clicked grass plus a free neighbor. Prefer the tile to the right, then left, then down, then up. */
export function hallPairFromClick(
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
): { left: number; row: number; axis: HallAxis; dir: HallDir } | null {
  const dir = firstHallDir(canUse, c, r);
  if (!dir) return null;
  const o = hallOriginFrom(c, r, dir);
  return { left: o.col, row: o.row, axis: o.axis, dir };
}

export function canUseBuildCell(
  grid: Parameters<typeof canPlaceOnCell>[0],
  occupied: Set<string>,
  c: number,
  r: number,
): boolean {
  return canPlaceOnCell(grid, c, r) && !occupied.has(cellKey(c, r));
}

export function towerHallAxis(t: Tower): HallAxis {
  return isTroopHall(t.kind) ? (t.hallAxis ?? 'h') : 'h';
}

export function towerFootprint(t: Tower): Array<{ c: number; r: number }> {
  if (isTroopHall(t.kind)) return hallFootprint(t.col, t.row, towerHallAxis(t));
  return [{ c: t.col, r: t.row }];
}

export function towerOnCell(t: Tower, c: number, r: number): boolean {
  return towerFootprint(t).some((cell) => cell.c === c && cell.r === r);
}

export function occupyFootprint(
  occupied: Set<string>,
  kind: TowerKind,
  col: number,
  row: number,
  axis: HallAxis = 'h',
): void {
  const cells = isTroopHall(kind) ? hallFootprint(col, row, axis) : [{ c: col, r: row }];
  for (const cell of cells) occupied.add(cellKey(cell.c, cell.r));
}

export function freeFootprint(occupied: Set<string>, t: Tower): void {
  for (const cell of towerFootprint(t)) occupied.delete(cellKey(cell.c, cell.r));
}

/** Clickable grass that can host a two-tile hall. Prefers a seat beside the path. */
export function firstHallClick(
  grid: Parameters<typeof canPlaceOnCell>[0],
  occupied: Set<string> = new Set(),
  besidePath = false,
  pathTiles?: Array<{ c: number; r: number }>,
): { c: number; r: number } | null {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const tryClick = (c: number, r: number): { c: number; r: number } | null => {
    if (firstHallDir((cc, rr) => canUseBuildCell(grid, occupied, cc, rr), c, r)) {
      return { c, r };
    }
    return null;
  };
  if (besidePath && pathTiles?.length) {
    for (const p of pathTiles) {
      for (const [dc, dr] of dirs) {
        const hit = tryClick(p.c + dc, p.r + dr);
        if (hit) return hit;
      }
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (besidePath) {
        if (grid[r][c] !== 'path') continue;
        for (const [dc, dr] of dirs) {
          const hit = tryClick(c + dc, r + dr);
          if (hit) return hit;
        }
      } else {
        const hit = tryClick(c, r);
        if (hit) return hit;
      }
    }
  }
  return null;
}
