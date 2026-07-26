import type {
  BarracksKind,
  BarracksSpecId,
  PlaceableKind,
  TargetingMode,
  TowerKind,
  TowerSpecId,
} from './constants';
import { LEVEL_COUNT } from './constants';

const SAVE_KEY = 'ptd-progress-v1';

export interface SavedTower {
  kind: TowerKind;
  col: number;
  row: number;
  level: number;
  spec: TowerSpecId | null;
  specGoldSpent: number;
  targeting: TargetingMode;
}

export interface SavedBarracks {
  kind: BarracksKind;
  col: number;
  row: number;
  level: number;
  spec: BarracksSpecId | null;
  specGoldSpent: number;
  rallyX: number;
  rallyY: number;
  rallyProgress: number;
}

/** Mid-run snapshot — restored into prepare (buildings + wave progress). */
export interface RunSnapshot {
  levelId: number;
  waveIndex: number;
  gold: number;
  lives: number;
  timeScale: number;
  towers: SavedTower[];
  barracks: SavedBarracks[];
  selectedKind: PlaceableKind | null;
}

export interface CampaignSave {
  version: 2;
  /** Highest level the player may open (1…LEVEL_COUNT+1 when fully cleared). */
  unlocked: number;
  /** Last map they were on (for Continue focus). */
  lastLevelId: number;
  /** In-progress run, if any. */
  run: RunSnapshot | null;
}

function clampUnlocked(n: number): number {
  return Math.max(1, Math.min(LEVEL_COUNT + 1, Math.floor(n) || 1));
}

function defaultSave(): CampaignSave {
  return { version: 2, unlocked: 1, lastLevelId: 1, run: null };
}

/** Migrate v1 `{ unlocked }` or bare number into v2. */
export function loadSave(): CampaignSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw) as number | { unlocked?: number; version?: number } & Partial<CampaignSave>;
    if (typeof data === 'number') {
      return { version: 2, unlocked: clampUnlocked(data), lastLevelId: clampUnlocked(data), run: null };
    }
    if (data && typeof data === 'object') {
      const unlocked = clampUnlocked(data.unlocked ?? 1);
      return {
        version: 2,
        unlocked,
        lastLevelId: clampUnlocked(data.lastLevelId ?? unlocked),
        run: data.run ?? null,
      };
    }
  } catch {
    /* fall through */
  }
  return defaultSave();
}

export function writeSave(save: CampaignSave): void {
  const next: CampaignSave = {
    version: 2,
    unlocked: clampUnlocked(save.unlocked),
    lastLevelId: clampUnlocked(save.lastLevelId),
    run: save.run,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(next));
}

export function loadProgress(): number {
  return loadSave().unlocked;
}

export function saveProgress(unlocked: number): void {
  const cur = loadSave();
  writeSave({ ...cur, unlocked: clampUnlocked(unlocked), lastLevelId: cur.lastLevelId });
}

export function clearRunSave(): void {
  const cur = loadSave();
  writeSave({ ...cur, run: null });
}

export function saveRunSnapshot(run: RunSnapshot): void {
  const cur = loadSave();
  writeSave({
    ...cur,
    lastLevelId: run.levelId,
    run,
  });
}

export function bumpUnlockAfterWin(levelId: number): number {
  const cur = loadSave();
  const nextUnlock = clampUnlocked(levelId + 1);
  const unlocked = Math.max(cur.unlocked, nextUnlock);
  writeSave({ ...cur, unlocked, lastLevelId: levelId, run: null });
  return unlocked;
}

export function resetCampaign(): void {
  writeSave(defaultSave());
}

export function hasContinueProgress(): boolean {
  const s = loadSave();
  return s.unlocked > 1 || !!s.run;
}
