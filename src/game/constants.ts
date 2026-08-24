export const TILE = 64;
export const COLS = 20;
export const ROWS = 12;
export const MAP_W = COLS * TILE; // 1280
export const MAP_H = ROWS * TILE; // 768

/** Authored at 48px tiles — scales ranges, speeds, and sprite sizes with TILE. */
export const PX = TILE / 48;
export function u(n: number): number {
  return n * PX;
}

/** Painted tower billboard height (feet at the tile). Width is capped to one tile when drawing. */
export const TOWER_BILLBOARD = 96;
export const TOWER_FEET = 12 * PX;
export function towerPaintHeight(level: number): number {
  return TOWER_BILLBOARD * PX * (1 + (level - 1) * 0.08);
}

export const WAVES_PER_LEVEL = 10;
export const STAGES_PER_WORLD = 10;
export const WORLD_COUNT = 5;
export const LEVEL_COUNT = STAGES_PER_WORLD;

/** Max lightning jump distance between chained foes. */
export const CHAIN_RANGE = u(108);

/** Every Nth Void orb opens a pull. Everyday shot stays an orb. */
export const VOID_VORTEX_EVERY = 4;
export const VOID_VORTEX_LIFE = 2.4;
export const VOID_VORTEX_RADIUS = u(96);
export const VOID_VORTEX_PULL = u(70);

export type CellKind = 'grass' | 'path' | 'decor';

export type TowerKind =
  | 'arrow'
  | 'cannon'
  | 'longshot'
  | 'muster'
  | 'chapter'
  | 'ice'
  | 'lightning'
  | 'fire'
  | 'poison'
  | 'void';

/** Muster and Chapter spawn troops. Rally, combat skip, and spawn all key off this. */
export function isTroopHall(kind: TowerKind): boolean {
  return kind === 'muster' || kind === 'chapter';
}

export interface TowerDef {
  kind: TowerKind;
  name: string;
  cost: number;
  description: string;
  role: string;
  color: string;
  colorDark: string;
  range: number;
  damage: number;
  fireRate: number;
  splash: number;
  slow: number;
  slowDuration: number;
  pierceArmor: boolean;
  chain: number;
  burnDps: number;
  burnDuration: number;
  poisonDps: number;
  poisonDuration: number;
  upgradeMul: number;
}

export interface ProjectileFeel {
  speed: number;
  /** Visual hang at mid-flight (cannon mortar, fire glob). */
  arc: number;
  /** 0 = fire-and-forget, 1 = full homing. */
  homing: number;
}

/**
 * Classic TD niches — always shown in the bottom dock.
 * Splash is combat radius (not visual size). Hit falloff: full damage inside 40% of
 * splash, 65% out to the edge. Arrow = single. Lightning = chain (CHAIN_RANGE), no splash.
 * Cannon ~1.5 tiles, ice/fire mid splash, poison tiny (DoT, almost single).
 * Leave these numbers until enemy speeds/attributes land — FX should match, not retune.
 */
export const TOWERS: Record<TowerKind, TowerDef> = {
  arrow: {
    kind: 'arrow',
    name: 'Arrow',
    cost: 60,
    description: 'Snappy single-target shots',
    role: 'DPS',
    color: '#6eb6ea',
    colorDark: '#1a4e7a',
    range: u(152),
    damage: 12,
    fireRate: 2.0,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.42,
  },
  cannon: {
    kind: 'cannon',
    name: 'Cannon',
    cost: 125,
    description: 'Mortar splash, shreds armor. Cannot hit flyers.',
    role: 'AoE',
    color: '#e8893a',
    colorDark: '#6b2a08',
    range: u(162),
    damage: 34,
    fireRate: 0.48,
    splash: u(72),
    slow: 0,
    slowDuration: 0,
    pierceArmor: true,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.36,
  },
  ice: {
    kind: 'ice',
    name: 'Ice',
    cost: 90,
    description: 'Freezes packs in place',
    role: 'Control',
    color: '#9ae4f7',
    colorDark: '#1a5f7c',
    range: u(128),
    damage: 4,
    fireRate: 1.15,
    splash: u(52),
    slow: 0.5,
    slowDuration: 2.05,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.28,
  },
  lightning: {
    kind: 'lightning',
    name: 'Lightning',
    cost: 135,
    description: 'Instant chain across foes',
    role: 'Chain',
    color: '#ffe566',
    colorDark: '#8a6200',
    range: u(142),
    damage: 18,
    fireRate: 1.08,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 4,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.36,
  },
  fire: {
    kind: 'fire',
    name: 'Fire',
    cost: 100,
    description: 'Napalm splash + short burn',
    role: 'Burn',
    color: '#ff6b4a',
    colorDark: '#8a180c',
    range: u(126),
    damage: 12,
    fireRate: 0.92,
    splash: u(56),
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 12,
    burnDuration: 2.5,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.34,
  },
  poison: {
    kind: 'poison',
    name: 'Poison',
    cost: 95,
    description: 'Long venom — melts tanks',
    role: 'DoT',
    color: '#7be38a',
    colorDark: '#1a5c32',
    range: u(138),
    damage: 5,
    fireRate: 1.05,
    splash: u(18),
    slow: 0.12,
    slowDuration: 1.0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 14,
    poisonDuration: 4.4,
    upgradeMul: 1.32,
  },
  longshot: {
    kind: 'longshot',
    name: 'Longshot',
    cost: 120,
    description: 'Long, slow, fat single hit. Hits flyers.',
    role: 'Snipe',
    color: '#d4a06a',
    colorDark: '#5a3418',
    range: u(228),
    damage: 42,
    fireRate: 0.5,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.34,
  },
  void: {
    kind: 'void',
    name: 'Void',
    cost: 110,
    description: 'Small splash dark orbs. Every 4th orb pulls foes together. Hits flyers.',
    role: 'Burst',
    color: '#8a6cff',
    colorDark: '#2a1458',
    range: u(136),
    damage: 16,
    fireRate: 0.88,
    splash: u(38),
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1.32,
  },
  muster: {
    kind: 'muster',
    name: 'Muster',
    cost: 70,
    description: 'Sends 3 warriors to a rally flag. Faster, thinner stall.',
    role: 'Stall',
    color: '#c4a06a',
    colorDark: '#4a2810',
    range: u(140),
    damage: 0,
    fireRate: 0,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1,
  },
  chapter: {
    kind: 'chapter',
    name: 'Chapter',
    cost: 95,
    description: 'Sends 3 knights to a rally flag. Slower, tankier stall.',
    role: 'Stall',
    color: '#8a9bb0',
    colorDark: '#2a3444',
    range: u(140),
    damage: 0,
    fireRate: 0,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeMul: 1,
  },
};

export const PROJECTILE_FEEL: Record<TowerKind, ProjectileFeel> = {
  arrow: { speed: u(560), arc: 0, homing: 1 },
  cannon: { speed: u(255), arc: u(46), homing: 0.22 },
  longshot: { speed: u(420), arc: u(8), homing: 0.7 },
  muster: { speed: 0, arc: 0, homing: 0 },
  chapter: { speed: 0, arc: 0, homing: 0 },
  ice: { speed: u(370), arc: u(12), homing: 0.55 },
  lightning: { speed: u(900), arc: 0, homing: 0 },
  fire: { speed: u(305), arc: u(20), homing: 0.38 },
  poison: { speed: u(290), arc: u(10), homing: 0.5 },
  void: { speed: u(280), arc: u(14), homing: 0.42 },
};

export const TOWER_ORDER: TowerKind[] = [
  'arrow',
  'cannon',
  'longshot',
  'muster',
  'chapter',
  'ice',
  'lightning',
  'fire',
  'poison',
  'void',
];

export type TrayTab = 'keeps' | 'elements';

/** Always 6 slots (2×3). Null stays an empty cell — do not shrink buttons to fill. */
export const TRAY_SLOTS: Record<TrayTab, Array<TowerKind | null>> = {
  keeps: ['arrow', 'cannon', 'longshot', 'muster', 'chapter', null],
  elements: ['ice', 'lightning', 'fire', 'poison', 'void', null],
};

export function slotsForTab(tab: TrayTab): Array<TowerKind | null> {
  return TRAY_SLOTS[tab];
}
