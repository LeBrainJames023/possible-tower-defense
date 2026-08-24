import { afterEach, describe, expect, it } from 'vitest';
import { canUseBuildCell, firstHallClick, hallFootprint, hallPreviewFromClick, towerOnCell } from '../src/game/footprint';
import { Game } from '../src/game/Game';
import { makeFakeCanvas } from './helpers/combatSandbox';

describe('tryPlace', () => {
  afterEach(() => {
    game?.stopLoop();
  });

  let game: Game | undefined;

  it('places without auto-inspect', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};

    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    let grass: { c: number; r: number } | null = null;
    for (let r = 0; r < 12 && !grass; r++) {
      for (let c = 0; c < 20; c++) {
        if (game.canBuildAt(c, r)) {
          grass = { c, r };
          break;
        }
      }
    }
    expect(grass).not.toBeNull();
    if (!grass) return;

    game.selectedKind = 'arrow';
    expect(game.tryPlace(grass.c, grass.r)).toBe(true);
    expect(game.towers).toHaveLength(1);
    expect(game.selectedTowerId).toBeNull();
  });

  it('sits Muster on two grass tiles and inspects either one', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    const click = firstHallClick(game.grid, game.occupied, true, game.level.pathTiles);
    expect(click).not.toBeNull();
    if (!click) return;
    game.selectedKind = 'muster';
    expect(game.tryPlace(click.c, click.r)).toBe(true);
    const hall = game.towers[0];
    const cells = hallFootprint(hall.col, hall.row);
    expect(cells).toHaveLength(2);
    expect(game.occupied.has(`${cells[0].c},${cells[0].r}`)).toBe(true);
    expect(game.occupied.has(`${cells[1].c},${cells[1].r}`)).toBe(true);
    expect(towerOnCell(hall, cells[1].c, cells[1].r)).toBe(true);
    expect(game.selectTowerAt(cells[1].c, cells[1].r)).toBe(true);
    expect(game.getSelectedTower()?.id).toBe(hall.id);
    game.sellSelected();
    expect(game.occupied.has(`${cells[0].c},${cells[0].r}`)).toBe(false);
    expect(game.occupied.has(`${cells[1].c},${cells[1].r}`)).toBe(false);
  });

  it('lights two tiles as soon as a hall is picked', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    const click = firstHallClick(game.grid, game.occupied, true, game.level.pathTiles);
    expect(click).not.toBeNull();
    if (!click) return;
    game.buildCell = click;
    game.selectedKind = 'chapter';
    const preview = game.hallPreviewAt(click, 'chapter');
    expect(preview).not.toBeNull();
    expect(preview!.cells).toHaveLength(2);
    expect(preview!.ok).toBe(true);
    expect(preview!.cells.some((cell) => cell.c === click.c && cell.r === click.r)).toBe(true);
  });

  it('still previews two tiles when the neighbor is blocked', () => {
    const preview = hallPreviewFromClick((c, r) => c === 0 && r === 0, 0, 0);
    expect(preview.cells).toHaveLength(2);
    expect(preview.ok).toBe(false);
    expect(preview.cells[0]).toEqual({ c: 0, r: 0 });
    expect(preview.cells[1]).toEqual({ c: 1, r: 0 });
  });

  it('refuses a hall when the grass has no side-by-side neighbor', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    let isolated: { c: number; r: number } | null = null;
    for (let r = 0; r < game.grid.length && !isolated; r++) {
      for (let c = 0; c < game.grid[0].length; c++) {
        if (!canUseBuildCell(game.grid, game.occupied, c, r)) continue;
        const left = canUseBuildCell(game.grid, game.occupied, c - 1, r);
        const right = canUseBuildCell(game.grid, game.occupied, c + 1, r);
        if (!left && !right) {
          isolated = { c, r };
          break;
        }
      }
    }
    if (!isolated) return;
    game.selectedKind = 'muster';
    expect(game.tryPlace(isolated.c, isolated.r)).toBe(false);
    expect(game.towers).toHaveLength(0);
  });
});
