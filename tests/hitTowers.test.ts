import { describe, expect, it } from 'vitest';
import { TILE } from '../src/game/constants';
import { Tower } from '../src/game/entities';
import { hallCenter, hallFootprint } from '../src/game/footprint';
import { towerAtCell } from '../src/game/hitTowers';

describe('towerAtCell', () => {
  it('inspects either tile of a 1×2 hall', () => {
    const left = 4;
    const row = 5;
    const pos = hallCenter(left, row);
    const hall = new Tower('muster', left, row, pos.x, pos.y);
    const cells = hallFootprint(left, row);
    expect(towerAtCell([hall], cells[0])?.id).toBe(hall.id);
    expect(towerAtCell([hall], cells[1])?.id).toBe(hall.id);
  });

  it('leaves the empty grass above a keep for a new build', () => {
    const col = 6;
    const row = 6;
    const keep = new Tower('cannon', col, row, col * TILE + TILE / 2, row * TILE + TILE / 2);
    const above = { c: col, r: row - 1 };
    expect(towerAtCell([keep], above)).toBeNull();
    expect(towerAtCell([keep], { c: col, r: row })?.id).toBe(keep.id);
  });

  it('leaves empty grass that is not under a keep', () => {
    const keep = new Tower('arrow', 2, 2, 2 * TILE + TILE / 2, 2 * TILE + TILE / 2);
    expect(towerAtCell([keep], { c: 10, r: 10 })).toBeNull();
  });
});
