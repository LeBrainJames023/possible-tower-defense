import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bumpUnlockAfterWin,
  hasContinueProgress,
  loadProgress,
  loadSave,
  resetCampaign,
  saveRunSnapshot,
} from '../src/game/save';

describe('campaign save', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
  });

  it('migrates bare number saves', () => {
    localStorage.setItem('ptd-progress-v1', '5');
    expect(loadProgress()).toBe(5);
    expect(hasContinueProgress()).toBe(true);
  });

  it('bumps unlock past level 10 for full clear', () => {
    resetCampaign();
    expect(bumpUnlockAfterWin(10)).toBe(11);
    expect(loadSave().unlocked).toBe(11);
    expect(loadSave().run).toBeNull();
  });

  it('stores mid-run snapshots for Continue', () => {
    resetCampaign();
    saveRunSnapshot({
      levelId: 3,
      waveIndex: 4,
      gold: 200,
      lives: 18,
      timeScale: 2,
      selectedKind: 'arrow',
      towers: [],
      barracks: [],
    });
    expect(hasContinueProgress()).toBe(true);
    expect(loadSave().run?.waveIndex).toBe(4);
  });
});
