import { afterEach, describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { WAVES_PER_LEVEL } from '../src/game/constants';
import { makeFakeCanvas } from './helpers/combatSandbox';

describe('endless after Hollow', () => {
  afterEach(() => {
    game?.stopLoop();
  });

  let game: Game | undefined;

  it('lets extra waves start on the same map', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};

    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.startLevel(50);
    game.stopLoop();
    game.waveIndex = WAVES_PER_LEVEL;
    game.phase = 'won';
    expect(game.canStartWave()).toBe(false);

    game.enterEndless();
    expect(game.snapshot().endless).toBe(true);
    expect(game.phase).toBe('prepare');
    expect(game.canStartWave()).toBe(true);
  });
});
