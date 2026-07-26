import type { BarracksKind, PlaceableKind, TowerKind } from './constants';
import { BARRACKS_ORDER, TOWER_ORDER, placeableName } from './constants';

/** Level at which each placeable first appears in the shop. */
export const UNLOCK_AT: Record<PlaceableKind, number> = {
  arrow: 1,
  cannon: 1,
  fire: 1,
  ice: 1,
  warriorBarracks: 1,
  lightning: 4,
  poison: 4,
  knightBarracks: 4,
  light: 6,
  dark: 6,
  paladinBarracks: 6,
};

export function unlockLevelFor(kind: PlaceableKind): number {
  return UNLOCK_AT[kind];
}

export function isPlaceableUnlocked(kind: PlaceableKind, levelId: number): boolean {
  return levelId >= UNLOCK_AT[kind];
}

export function unlockedTowers(levelId: number): TowerKind[] {
  return TOWER_ORDER.filter((k) => isPlaceableUnlocked(k, levelId));
}

export function unlockedBarracks(levelId: number): BarracksKind[] {
  return BARRACKS_ORDER.filter((k) => isPlaceableUnlocked(k, levelId));
}

/** Placeables that newly unlock when entering this level (vs previous). */
export function newUnlocksAt(levelId: number): PlaceableKind[] {
  if (levelId <= 1) return [];
  const kinds = [...TOWER_ORDER, ...BARRACKS_ORDER] as PlaceableKind[];
  return kinds.filter((k) => UNLOCK_AT[k] === levelId);
}

export function unlockToastText(levelId: number): string | null {
  const newly = newUnlocksAt(levelId);
  if (!newly.length) return null;
  const names = newly.map((k) => placeableName(k));
  return `Unlocked: ${names.join(', ')}`;
}
