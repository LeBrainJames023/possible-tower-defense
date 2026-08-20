import { afterEach, describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { makeFakeCanvas } from './helpers/combatSandbox';

describe('tryPlace', () => {
  afterEach(() => {
    game?.stopLoop();
  });

  let game: Game | undefined;

  it('remembers the brush and does not auto-inspect', () => {
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
    expect(game.placeKind).toBe('arrow');
  });
});
