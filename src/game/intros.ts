import { WAVES_PER_LEVEL } from './constants';
import { ENEMIES, type EnemyKind } from './enemies';
import { LEVELS, buildWave, type LevelDef } from './levels';

const SEEN_KEY = 'ptd-seen-kinds-v1';

export function kindsInLevel(stage: number, worldIndex = 1): EnemyKind[] {
  const seen = new Set<EnemyKind>();
  for (let w = 1; w <= WAVES_PER_LEVEL; w++) {
    for (const g of buildWave(stage, w, worldIndex)) seen.add(g.kind);
  }
  return [...seen];
}

/** Locals, champions, bosses, and flyers — fodder you already know is skipped. */
export function shouldIntro(kind: EnemyKind): boolean {
  const def = ENEMIES[kind];
  return def.flying || def.role !== 'fodder';
}

export function firstAppearanceKinds(level: LevelDef): EnemyKind[] {
  const prior = new Set<EnemyKind>();
  for (const earlier of LEVELS) {
    if (
      earlier.worldIndex < level.worldIndex ||
      (earlier.worldIndex === level.worldIndex && earlier.stage < level.stage)
    ) {
      for (const k of kindsInLevel(earlier.stage, earlier.worldIndex)) prior.add(k);
    }
  }
  return kindsInLevel(level.stage, level.worldIndex).filter((k) => !prior.has(k) && shouldIntro(k));
}

export function loadSeenKinds(): Set<EnemyKind> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as EnemyKind[]);
  } catch {
    return new Set();
  }
}

export function markKindsSeen(kinds: EnemyKind[]): void {
  const seen = loadSeenKinds();
  for (const k of kinds) seen.add(k);
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore quota / private mode */
  }
}

export function introKindsForLevel(level: LevelDef, seen = loadSeenKinds()): EnemyKind[] {
  return firstAppearanceKinds(level).filter((k) => !seen.has(k));
}

export function introRoleLabel(kind: EnemyKind): string {
  const def = ENEMIES[kind];
  if (def.flying) return 'Flying';
  if (def.role === 'champion') return 'Champion';
  if (def.role === 'boss') return 'Boss';
  if (def.role === 'special') return 'New local';
  return 'New foe';
}
