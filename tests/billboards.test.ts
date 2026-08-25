import { describe, expect, it } from 'vitest';
import { TILE, TOWER_BILLBOARD, u } from '../src/game/constants';
import {
  ENEMY_PAINT_MUL,
  HALL_HEIGHT_MUL,
  HALL_TILE_FILL,
  hallBillboardSize,
  TROOP_PAINT_H,
} from '../src/game/billboards';
import { SPRITE_RIM } from '../src/game/drawSprite';

describe('tile-fit billboards', () => {
  it('fits hall content to two tiles wide and lets height grow up', () => {
    const hall = hallBillboardSize(320, 160);
    expect(hall.w).toBeCloseTo(TILE * 2 * HALL_TILE_FILL);
    expect(hall.w).toBeGreaterThan(TILE);
    expect(hall.w).toBeLessThanOrEqual(TILE * 2);
    expect(hall.h).toBeLessThan(TILE * 1.6);
    expect(HALL_HEIGHT_MUL).toBeGreaterThan(1);
  });

  it('keeps the same paint size when the hall stands up', () => {
    const flat = hallBillboardSize(320, 160, 'h');
    const tall = hallBillboardSize(320, 160, 'v');
    expect(tall.w).toBeCloseTo(flat.w);
    expect(tall.h).toBeCloseTo(flat.h);
  });

  it('keeps troop paint on one path tile without using combat radius', () => {
    expect(TROOP_PAINT_H.warrior).toBeGreaterThan(u(48));
    expect(TROOP_PAINT_H.knight).toBeGreaterThan(TROOP_PAINT_H.warrior);
    expect(TROOP_PAINT_H.warrior).toBeLessThanOrEqual(TILE * 1.25);
    expect(TROOP_PAINT_H.knight).toBeLessThanOrEqual(TILE * 1.4);
  });

  it('grows keep and enemy paint without changing combat numbers', () => {
    expect(TOWER_BILLBOARD).toBeGreaterThanOrEqual(108);
    expect(TOWER_BILLBOARD).toBeLessThanOrEqual(120);
    expect(ENEMY_PAINT_MUL).toBeGreaterThan(3.35);
    expect(ENEMY_PAINT_MUL).toBeLessThan(4.2);
    expect(SPRITE_RIM).toBeGreaterThan(1);
  });
});
