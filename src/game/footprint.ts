import { COLS, ROWS, TILE, isTroopHall, type TowerKind } from './constants';
import type { Tower } from './entities';
import { canPlaceOnCell } from './levels';

/** Muster / Chapter sit on two grass tiles in the same row. */
export const HALL_SPAN = 2;

export function cellKey(c: number, r: number): string {
  return `${c},${r}`;
}

export function hallFootprint(left: number, row: number): Array<{ c: number; r: number }> {
  return [
    { c: left, r: row },
    { c: left + 1, r: row },
  ];
}

export function hallCenter(left: number, row: number): { x: number; y: number } {
  return { x: (left + 1) * TILE, y: row * TILE + TILE / 2 };
}

/** Clicked grass plus a neighbor. Prefer the tile to the right even if that seat is blocked. */
export function hallPreviewFromClick(
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
): { left: number; row: number; cells: Array<{ c: number; r: number }>; ok: boolean } {
  const pair = hallPairFromClick(canUse, c, r);
  if (pair) return { left: pair.left, row: pair.row, cells: hallFootprint(pair.left, pair.row), ok: true };
  const left = c + 1 < COLS ? c : Math.max(0, c - 1);
  return {
    left,
    row: r,
    cells: hallFootprint(left, r).filter((cell) => cell.c >= 0 && cell.c < COLS && cell.r >= 0 && cell.r < ROWS),
    ok: false,
  };
}

/** Clicked grass plus a free neighbor. Prefer the tile to the right. */
export function hallPairFromClick(
  canUse: (c: number, r: number) => boolean,
  c: number,
  r: number,
): { left: number; row: number } | null {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
  if (!canUse(c, r)) return null;
  if (canUse(c + 1, r)) return { left: c, row: r };
  if (canUse(c - 1, r)) return { left: c - 1, row: r };
  return null;
}

export function canUseBuildCell(
  grid: Parameters<typeof canPlaceOnCell>[0],
  occupied: Set<string>,
  c: number,
  r: number,
): boolean {
  return canPlaceOnCell(grid, c, r) && !occupied.has(cellKey(c, r));
}

export function towerFootprint(t: Tower): Array<{ c: number; r: number }> {
  if (isTroopHall(t.kind)) return hallFootprint(t.col, t.row);
  return [{ c: t.col, r: t.row }];
}

export function towerOnCell(t: Tower, c: number, r: number): boolean {
  return towerFootprint(t).some((cell) => cell.c === c && cell.r === r);
}

export function occupyFootprint(occupied: Set<string>, kind: TowerKind, col: number, row: number): void {
  const cells = isTroopHall(kind) ? hallFootprint(col, row) : [{ c: col, r: row }];
  for (const cell of cells) occupied.add(cellKey(cell.c, cell.r));
}

export function freeFootprint(occupied: Set<string>, t: Tower): void {
  for (const cell of towerFootprint(t)) occupied.delete(cellKey(cell.c, cell.r));
}

/** Clickable grass that can host a 1×2 hall. Prefers a seat beside the path. */
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
    if (hallPairFromClick((cc, rr) => canUseBuildCell(grid, occupied, cc, rr), c, r)) {
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
