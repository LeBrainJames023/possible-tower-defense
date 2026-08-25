import type { Tower } from './entities';
import { towerOnCell } from './footprint';

function frontMost(towers: Tower[]): Tower {
  return towers.reduce((best, t) => (t.y >= best.y ? t : best));
}

/**
 * The highlighted TILE wins. Occupied seats (both hall tiles) inspect.
 * Painted art that grows into empty grass does not steal that square.
 */
export function towerAtCell(towers: Tower[], cell: { c: number; r: number }): Tower | null {
  const onCell = towers.filter((t) => towerOnCell(t, cell.c, cell.r));
  if (!onCell.length) return null;
  return frontMost(onCell);
}
