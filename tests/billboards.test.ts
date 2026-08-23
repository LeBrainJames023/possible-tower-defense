import { describe, expect, it } from 'vitest';
import { TILE } from '../src/game/constants';
import { HALL_TILE_FILL, hallBillboardSize, TROOP_PAINT_H } from '../src/game/billboards';

describe('tile-fit billboards', () => {
  it('fits hall content to one tile wide and lets height grow up', () => {
    // Live Muster/Chapter stills: ~169×230 opaque box inside a 256 square.
    const hall = hallBillboardSize(169, 230);
    expect(hall.w).toBeCloseTo(TILE * HALL_TILE_FILL);
    expect(hall.w).toBeLessThanOrEqual(TILE);
    expect(hall.h).toBeGreaterThan(TILE);
    expect(hall.h).toBeLessThan(TILE * 1.6);
  });

  it('keeps troop paint on one path tile without using combat radius', () => {
    // Sprite-forge cells are square; the body is ~64% of that canvas.
    const warriorBody = TROOP_PAINT_H.warrior * 0.66;
    const knightBody = TROOP_PAINT_H.knight * 0.64;
    // Old draw used combat radius * 3.45 (~37 warrior / ~55 knight). Paint is now taller.
    expect(TROOP_PAINT_H.warrior).toBeGreaterThan(50);
    expect(TROOP_PAINT_H.knight).toBeGreaterThan(TROOP_PAINT_H.warrior);
    expect(warriorBody).toBeLessThanOrEqual(TILE);
    expect(knightBody).toBeLessThanOrEqual(TILE);
    expect(warriorBody).toBeGreaterThan(TILE * 0.35);
    expect(knightBody).toBeGreaterThan(warriorBody);
  });
});
