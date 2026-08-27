import { afterWin, isCampaignClear } from './progress';
import type { LevelDef } from './levels';
import { worldById, worldByIndex } from './worlds';

export type ResultPrimary = 'next-map' | 'next-world' | 'keep-playing' | 'worlds' | 'retry';
export type ResultSecondary = 'title' | 'worlds';

export interface ResultCopy {
  title: string;
  body: string;
  primaryLabel: string;
  primary: ResultPrimary;
  secondaryLabel: string;
  secondary: ResultSecondary;
}

/** Two buttons on a win. World 1–4 stage 10 → Next world. Hollow 10 → Keep playing. Maps 1–9 stay Next map. */
export function winResultCopy(level: LevelDef, lookMode: boolean): ResultCopy {
  const next = afterWin(level);
  if (lookMode) {
    return {
      title: 'Look finished',
      body: 'Nice hold. This land unlocks when you beat the previous world.',
      primaryLabel: 'Back to worlds',
      primary: 'worlds',
      secondaryLabel: 'Main menu',
      secondary: 'title',
    };
  }
  if (isCampaignClear(next)) {
    return {
      title: 'Campaign clear!',
      body: 'You held The Hollow. Keep playing for extra waves on this map, or head home.',
      primaryLabel: 'Keep playing',
      primary: 'keep-playing',
      secondaryLabel: 'Main menu',
      secondary: 'title',
    };
  }
  if (next.world > level.worldIndex) {
    const opened = worldByIndex(next.world);
    return {
      title: `${worldById(level.world).name} cleared`,
      body: `${opened.name} is open.`,
      primaryLabel: 'Next world',
      primary: 'next-world',
      secondaryLabel: 'Main menu',
      secondary: 'title',
    };
  }
  return {
    title: 'Level cleared',
    body: `${level.name} survived. Next map unlocked.`,
    primaryLabel: 'Next map',
    primary: 'next-map',
    secondaryLabel: 'Worlds',
    secondary: 'worlds',
  };
}
