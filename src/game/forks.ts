import { upgradeCostFor } from './balance';
import type { TowerKind } from './constants';

/** After Lv3, Arrow and Cannon pick a path. Not a 4th number. */
export type ForkId = 'a' | 'b';

export interface TowerFork {
  id: ForkId;
  name: string;
  blurb: string;
  damageMul: number;
  fireRateMul: number;
  rangeMul: number;
  splashMul: number;
  speedMul: number;
  arcMul: number;
  pierceArmor?: boolean;
}

export const TOWER_FORKS: Partial<Record<TowerKind, { a: TowerFork; b: TowerFork }>> = {
  arrow: {
    a: {
      id: 'a',
      name: 'Faster',
      blurb: 'Snappier string. Weaker hits.',
      damageMul: 0.88,
      fireRateMul: 1.55,
      rangeMul: 1.02,
      splashMul: 1,
      speedMul: 1.12,
      arcMul: 1,
    },
    b: {
      id: 'b',
      name: 'Heavier',
      blurb: 'Harder hits, slower string. Pierces armor.',
      damageMul: 1.55,
      fireRateMul: 0.78,
      rangeMul: 1.08,
      splashMul: 1,
      speedMul: 0.92,
      arcMul: 1,
      pierceArmor: true,
    },
  },
  cannon: {
    a: {
      id: 'a',
      name: 'Rapid-fire',
      blurb: 'Faster shots, smaller boom.',
      damageMul: 0.62,
      fireRateMul: 1.9,
      rangeMul: 0.96,
      splashMul: 0.72,
      speedMul: 1.35,
      arcMul: 0.45,
    },
    b: {
      id: 'b',
      name: 'Mortar',
      blurb: 'Slower, fatter splash.',
      damageMul: 1.38,
      fireRateMul: 0.7,
      rangeMul: 1.14,
      splashMul: 1.6,
      speedMul: 0.82,
      arcMul: 1.35,
    },
  },
};

export function forksFor(kind: TowerKind): { a: TowerFork; b: TowerFork } | null {
  return TOWER_FORKS[kind] ?? null;
}

export function forkDef(kind: TowerKind, id: ForkId): TowerFork | null {
  return TOWER_FORKS[kind]?.[id] ?? null;
}

/** Same gold as a 1→2→3 step would have charged for “level 4”. */
export function forkCostFor(buildCost: number): number {
  return upgradeCostFor(buildCost, 3);
}
