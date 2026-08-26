import { upgradeCostFor } from './balance';
import { VOID_VORTEX_ABYSS_EVERY, VOID_VORTEX_EVERY, type TowerKind } from './constants';

/** After Lv3 (halls: from inspect), every keep picks a path. Not a 4th number. */
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
  slowMul?: number;
  slowDurationMul?: number;
  burnDpsMul?: number;
  burnDurationMul?: number;
  poisonDpsMul?: number;
  poisonDurationMul?: number;
  chainMul?: number;
  troopHpMul?: number;
  troopDamageMul?: number;
  troopSpeedMul?: number;
  trainTimeMul?: number;
}

export const TOWER_FORKS: Partial<Record<TowerKind, { a: TowerFork; b: TowerFork }>> = {
  arrow: {
    a: {
      id: 'a',
      name: 'Repeater',
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
      name: 'Ballista',
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
      name: 'Gatling',
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
  longshot: {
    a: {
      id: 'a',
      name: 'Marksman',
      blurb: 'Quicker bolts. Still long, a bit thinner.',
      damageMul: 0.82,
      fireRateMul: 1.55,
      rangeMul: 0.98,
      splashMul: 1,
      speedMul: 1.22,
      arcMul: 0.85,
    },
    b: {
      id: 'b',
      name: 'Puncture',
      blurb: 'Fatter poke. Slower string. Pierces armor.',
      damageMul: 1.55,
      fireRateMul: 0.7,
      rangeMul: 1.08,
      splashMul: 1,
      speedMul: 0.86,
      arcMul: 1.15,
      pierceArmor: true,
    },
  },
  ice: {
    a: {
      id: 'a',
      name: 'Hail',
      blurb: 'Rapid shards. Small splash, brief chill.',
      damageMul: 0.85,
      fireRateMul: 1.65,
      rangeMul: 1,
      splashMul: 0.85,
      speedMul: 1.18,
      arcMul: 0.85,
      slowMul: 0.82,
      slowDurationMul: 0.8,
    },
    b: {
      id: 'b',
      name: 'Blizzard',
      blurb: 'Slow wide frost. The pack gets held.',
      damageMul: 1.12,
      fireRateMul: 0.72,
      rangeMul: 1.06,
      splashMul: 1.28,
      speedMul: 0.88,
      arcMul: 1.15,
      slowMul: 1.28,
      slowDurationMul: 1.4,
    },
  },
  lightning: {
    a: {
      id: 'a',
      name: 'Arc',
      blurb: 'Snappy bolts, fewer hops.',
      damageMul: 0.78,
      fireRateMul: 1.7,
      rangeMul: 1,
      splashMul: 1,
      speedMul: 1,
      arcMul: 1,
      chainMul: 0.75,
    },
    b: {
      id: 'b',
      name: 'Thunder',
      blurb: 'Slower fatter bolt, more hops, punches armor.',
      damageMul: 1.42,
      fireRateMul: 0.72,
      rangeMul: 1.04,
      splashMul: 1,
      speedMul: 1,
      arcMul: 1,
      chainMul: 1.25,
      pierceArmor: true,
    },
  },
  fire: {
    a: {
      id: 'a',
      name: 'Flamethrower',
      blurb: 'Rapid small napalm. Tight splash, short hot burn.',
      damageMul: 0.7,
      fireRateMul: 1.75,
      rangeMul: 0.98,
      splashMul: 0.75,
      speedMul: 1.22,
      arcMul: 0.7,
      burnDpsMul: 0.85,
      burnDurationMul: 0.75,
    },
    b: {
      id: 'b',
      name: 'Furnace',
      blurb: 'Slow fat boom. Wide splash, long cook.',
      damageMul: 1.28,
      fireRateMul: 0.7,
      rangeMul: 1.06,
      splashMul: 1.45,
      speedMul: 0.84,
      arcMul: 1.3,
      burnDpsMul: 1.2,
      burnDurationMul: 1.45,
    },
  },
  poison: {
    a: {
      id: 'a',
      name: 'Venom',
      blurb: 'Rapid darts, weak short melt, almost single-target.',
      damageMul: 0.85,
      fireRateMul: 1.65,
      rangeMul: 1,
      splashMul: 0.85,
      speedMul: 1.18,
      arcMul: 0.85,
      poisonDpsMul: 0.8,
      poisonDurationMul: 0.75,
    },
    b: {
      id: 'b',
      name: 'Miasma',
      blurb: 'Slow cloud-ish splash, long melt. Tiny slow so the cloud feels sticky.',
      damageMul: 1.1,
      fireRateMul: 0.7,
      rangeMul: 1.04,
      splashMul: 1.15,
      speedMul: 0.88,
      arcMul: 1.15,
      poisonDpsMul: 1.25,
      poisonDurationMul: 1.45,
    },
  },
  void: {
    a: {
      id: 'a',
      name: 'Flicker',
      blurb: 'Rapid small orbs, smaller splash. Pull every 4th orb.',
      damageMul: 0.72,
      fireRateMul: 1.7,
      rangeMul: 0.98,
      splashMul: 0.78,
      speedMul: 1.25,
      arcMul: 0.75,
    },
    b: {
      id: 'b',
      name: 'Abyss',
      blurb: 'Slow fatter orbs, bigger splash. Pull every 3rd orb.',
      damageMul: 1.38,
      fireRateMul: 0.7,
      rangeMul: 1.06,
      splashMul: 1.55,
      speedMul: 0.84,
      arcMul: 1.25,
    },
  },
  muster: {
    a: {
      id: 'a',
      name: 'Scout',
      blurb: 'Warriors train quicker. A bit thinner.',
      damageMul: 1,
      fireRateMul: 1,
      rangeMul: 1,
      splashMul: 1,
      speedMul: 1,
      arcMul: 1,
      troopHpMul: 0.88,
      troopDamageMul: 0.95,
      troopSpeedMul: 1.15,
      trainTimeMul: 0.58,
    },
    b: {
      id: 'b',
      name: 'Veteran',
      blurb: 'Tankier warriors. Slower train.',
      damageMul: 1,
      fireRateMul: 1,
      rangeMul: 1,
      splashMul: 1,
      speedMul: 1,
      arcMul: 1,
      troopHpMul: 1.5,
      troopDamageMul: 1.15,
      troopSpeedMul: 0.88,
      trainTimeMul: 1.28,
    },
  },
  chapter: {
    a: {
      id: 'a',
      name: 'Lance',
      blurb: 'Knights train quicker. A bit thinner.',
      damageMul: 1,
      fireRateMul: 1,
      rangeMul: 1,
      splashMul: 1,
      speedMul: 1,
      arcMul: 1,
      troopHpMul: 0.88,
      troopDamageMul: 1,
      troopSpeedMul: 1.18,
      trainTimeMul: 0.62,
    },
    b: {
      id: 'b',
      name: 'Paladin',
      blurb: 'Tankier knights. Slower train.',
      damageMul: 1,
      fireRateMul: 1,
      rangeMul: 1,
      splashMul: 1,
      speedMul: 1,
      arcMul: 1,
      troopHpMul: 1.45,
      troopDamageMul: 1.2,
      troopSpeedMul: 0.88,
      trainTimeMul: 1.25,
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

/** Abyss (Void heavier) opens the hole every 3rd orb. Flicker / unforked stay every 4th. */
export function voidPullEvery(fork: ForkId | null): number {
  return fork === 'b' ? VOID_VORTEX_ABYSS_EVERY : VOID_VORTEX_EVERY;
}
