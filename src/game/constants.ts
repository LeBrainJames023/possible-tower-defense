export const TILE = 48;
export const COLS = 20;
export const ROWS = 12;
export const MAP_W = COLS * TILE; // 960
export const MAP_H = ROWS * TILE; // 576

export const WAVES_PER_LEVEL = 10;
export const LEVEL_COUNT = 10;

/** Max lightning jump distance between chained foes. */
export const CHAIN_RANGE = 108;

export type CellKind = 'grass' | 'path' | 'decor';

export type TowerKind = 'arrow' | 'cannon' | 'ice' | 'lightning' | 'fire' | 'poison';
export type EnemyKind = 'scout' | 'grunt' | 'brute' | 'swarm' | 'boss';

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
  upgradeCost: number;
  upgradeMul: number;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  blurb: string;
  hp: number;
  speed: number;
  reward: number;
  armor: number;
  radius: number;
  color: string;
  colorDark: string;
}

export interface ProjectileFeel {
  speed: number;
  /** Visual hang at mid-flight (cannon mortar, fire glob). */
  arc: number;
  /** 0 = fire-and-forget, 1 = full homing. */
  homing: number;
}

/** Classic TD niches — always shown in the bottom dock. */
export const TOWERS: Record<TowerKind, TowerDef> = {
  arrow: {
    kind: 'arrow',
    name: 'Arrow',
    cost: 60,
    description: 'Snappy single-target shots',
    role: 'DPS',
    color: '#6eb6ea',
    colorDark: '#1a4e7a',
    range: 152,
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
    upgradeCost: 50,
    upgradeMul: 1.42,
  },
  cannon: {
    kind: 'cannon',
    name: 'Cannon',
    cost: 125,
    description: 'Mortar splash, shreds armor',
    role: 'AoE',
    color: '#e8893a',
    colorDark: '#6b2a08',
    range: 162,
    damage: 34,
    fireRate: 0.48,
    splash: 72,
    slow: 0,
    slowDuration: 0,
    pierceArmor: true,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 90,
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
    range: 128,
    damage: 4,
    fireRate: 1.15,
    splash: 52,
    slow: 0.5,
    slowDuration: 2.05,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 70,
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
    range: 142,
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
    upgradeCost: 105,
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
    range: 126,
    damage: 12,
    fireRate: 0.92,
    splash: 56,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 12,
    burnDuration: 2.5,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 80,
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
    range: 138,
    damage: 5,
    fireRate: 1.05,
    splash: 18,
    slow: 0.12,
    slowDuration: 1.0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 14,
    poisonDuration: 4.4,
    upgradeCost: 75,
    upgradeMul: 1.32,
  },
};

export const PROJECTILE_FEEL: Record<TowerKind, ProjectileFeel> = {
  arrow: { speed: 560, arc: 0, homing: 1 },
  cannon: { speed: 255, arc: 46, homing: 0.22 },
  ice: { speed: 370, arc: 12, homing: 0.55 },
  lightning: { speed: 900, arc: 0, homing: 0 },
  fire: { speed: 305, arc: 20, homing: 0.38 },
  poison: { speed: 290, arc: 10, homing: 0.5 },
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  scout: {
    kind: 'scout',
    name: 'Scout',
    blurb: 'Fast and fragile — Ice helps a lot.',
    hp: 42,
    speed: 82,
    reward: 9,
    armor: 0,
    radius: 11,
    color: '#4ee0a5',
    colorDark: '#157a4a',
  },
  grunt: {
    kind: 'grunt',
    name: 'Grunt',
    blurb: 'Balanced fodder. Arrow towers chew them up.',
    hp: 100,
    speed: 48,
    reward: 12,
    armor: 0.06,
    radius: 14,
    color: '#a8b8c9',
    colorDark: '#334556',
  },
  brute: {
    kind: 'brute',
    name: 'Brute',
    blurb: 'Armored. Cannon pierces; Poison wears them down.',
    hp: 210,
    speed: 32,
    reward: 26,
    armor: 0.4,
    radius: 19,
    color: '#ff5d7a',
    colorDark: '#7a102c',
  },
  swarm: {
    kind: 'swarm',
    name: 'Swarm',
    blurb: 'Tiny packs. Splash and Lightning shine here.',
    hp: 22,
    speed: 86,
    reward: 5,
    armor: 0,
    radius: 9,
    color: '#9ff5e4',
    colorDark: '#1f6f62',
  },
  boss: {
    kind: 'boss',
    name: 'Colossus',
    blurb: 'Wave boss. Focus fire and keep slows up.',
    hp: 980,
    speed: 24,
    reward: 110,
    armor: 0.3,
    radius: 28,
    color: '#d4a0ff',
    colorDark: '#4a1480',
  },
};

export const TOWER_ORDER: TowerKind[] = [
  'arrow',
  'cannon',
  'ice',
  'lightning',
  'fire',
  'poison',
];
