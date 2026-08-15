import type { EnemyKind } from './enemies';

export interface WorldRoster {
  specials: [EnemyKind, EnemyKind];
  champion: EnemyKind;
  boss: EnemyKind;
}

export const WORLD_ROSTER: Record<number, WorldRoster> = {
  1: { specials: ['warg', 'boar'], champion: 'alphaWarg', boss: 'boss' },
  2: { specials: ['scorpion', 'duneRunner'], champion: 'duneTyrant', boss: 'sandKhan' },
  3: { specials: ['frostWisp', 'iceWolf'], champion: 'packLord', boss: 'frostJarl' },
  4: { specials: ['magmaHound', 'cinderBrute'], champion: 'cinderKing', boss: 'ashTitan' },
  5: { specials: ['shade', 'hexKnight'], champion: 'hexWarden', boss: 'magician' },
};

export function rosterFor(worldIndex: number): WorldRoster {
  return WORLD_ROSTER[worldIndex] ?? WORLD_ROSTER[1];
}

/** Forest stage 1 stays the tutorial — no locals, no champion. */
export function specialAt(worldIndex: number, stage: number, slot: 1 | 2): EnemyKind | null {
  const [a, b] = rosterFor(worldIndex).specials;
  if (worldIndex === 1) {
    if (slot === 1 && stage >= 2) return a;
    if (slot === 2 && stage >= 4) return b;
    return null;
  }
  if (slot === 1 && stage >= 1) return a;
  if (slot === 2 && stage >= 3) return b;
  return null;
}

export function championAt(worldIndex: number, stage: number): EnemyKind | null {
  if (worldIndex === 1 && stage < 2) return null;
  return rosterFor(worldIndex).champion;
}
