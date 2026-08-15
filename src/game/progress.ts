import type { LevelDef } from './levels';
import { WORLDS } from './worlds';

const SAVE_V1 = 'ptd-progress-v1';
const SAVE_V2 = 'ptd-progress-v2';

/** Next playable world (1–5) and stage (1–10). stage 11 = that world is done. */
export interface CampaignProgress {
  world: number;
  stage: number;
}

export function loadProgress(): CampaignProgress {
  try {
    const v2 = localStorage.getItem(SAVE_V2);
    if (v2) {
      const p = JSON.parse(v2) as CampaignProgress;
      return clampProgress(p);
    }
    const v1 = localStorage.getItem(SAVE_V1);
    if (v1) {
      const n = Math.max(1, Math.min(10, (JSON.parse(v1).unlocked as number) || 1));
      return { world: 1, stage: n };
    }
  } catch {
    /* start fresh */
  }
  return { world: 1, stage: 1 };
}

export function saveProgress(p: CampaignProgress): void {
  localStorage.setItem(SAVE_V2, JSON.stringify(clampProgress(p)));
}

function clampProgress(p: CampaignProgress): CampaignProgress {
  const world = Math.max(1, Math.min(WORLDS.length, p.world || 1));
  const stage = Math.max(1, Math.min(11, p.stage || 1));
  return { world, stage };
}

export function canPlay(p: CampaignProgress, level: LevelDef): boolean {
  if (level.worldIndex < p.world) return true;
  if (level.worldIndex > p.world) return false;
  return level.stage <= p.stage;
}

export function isCleared(p: CampaignProgress, level: LevelDef): boolean {
  if (level.worldIndex < p.world) return true;
  if (level.worldIndex > p.world) return false;
  return level.stage < p.stage;
}

export function isWorldOpen(p: CampaignProgress, worldIndex: number): boolean {
  return worldIndex <= p.world;
}

export function isWorldCleared(p: CampaignProgress, worldIndex: number): boolean {
  return worldIndex < p.world || (worldIndex === p.world && p.stage > 10);
}

export function afterWin(level: LevelDef): CampaignProgress {
  if (level.stage < 10) return { world: level.worldIndex, stage: level.stage + 1 };
  if (level.worldIndex < WORLDS.length) return { world: level.worldIndex + 1, stage: 1 };
  return { world: WORLDS.length, stage: 11 };
}

export function isAhead(next: CampaignProgress, current: CampaignProgress): boolean {
  return next.world > current.world || (next.world === current.world && next.stage > current.stage);
}

export function isCampaignClear(p: CampaignProgress): boolean {
  return p.world >= WORLDS.length && p.stage > 10;
}
