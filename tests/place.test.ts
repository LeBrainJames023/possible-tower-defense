import { afterEach, describe, expect, it } from 'vitest';
import { canUseBuildCell, firstHallClick, firstHallDir, hallFootprint, hallPreviewFromClick, rotateHallDir, towerOnCell } from '../src/game/footprint';
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

  it('refuses a hall when the grass has no neighbor in any direction', () => {
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
        const east = canUseBuildCell(game.grid, game.occupied, c + 1, r);
        const west = canUseBuildCell(game.grid, game.occupied, c - 1, r);
        const south = canUseBuildCell(game.grid, game.occupied, c, r + 1);
        const north = canUseBuildCell(game.grid, game.occupied, c, r - 1);
        if (!east && !west && !south && !north) {
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

  it('does not treat a hall seat as empty grass for a new keep', () => {
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
    game.buildCell = { c: click.c, r: click.r };
    for (const cell of cells) {
      expect(game.canBuildAt(cell.c, cell.r)).toBe(false);
      expect(game.hitTowerAt(cell.c, cell.r)?.id).toBe(hall.id);
    }
  });

  it('stands a hall on two tiles up when the sides are blocked', () => {
    const canUse = (c: number, r: number) => c === 5 && (r === 5 || r === 6);
    expect(firstHallDir(canUse, 5, 5)).toBe('s');
    const preview = hallPreviewFromClick(canUse, 5, 5, 's');
    expect(preview.ok).toBe(true);
    expect(preview.axis).toBe('v');
    expect(preview.cells).toEqual([
      { c: 5, r: 5 },
      { c: 5, r: 6 },
    ]);
  });

  it('turns from the right-hand seat onto the tile below', () => {
    const canUse = (c: number, r: number) =>
      (c === 5 && r === 5) || (c === 6 && r === 5) || (c === 5 && r === 6);
    expect(firstHallDir(canUse, 5, 5)).toBe('e');
    expect(rotateHallDir('e', 1, canUse, 5, 5)).toBe('s');
  });

  it('places Muster stacked when the player turns it', () => {
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
    if (!canUseBuildCell(game.grid, game.occupied, click.c, click.r + 1)) return;
    game.buildCell = click;
    game.selectedKind = 'muster';
    game.hallDir = 's';
    expect(game.tryPlace(click.c, click.r)).toBe(true);
    const hall = game.towers[0];
    expect(hall.hallAxis).toBe('v');
    expect(game.occupied.has(`${click.c},${click.r}`)).toBe(true);
    expect(game.occupied.has(`${click.c},${click.r + 1}`)).toBe(true);
  });
});
