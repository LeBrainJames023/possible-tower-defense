export const TILE = 48;
export const COLS = 20;
export const ROWS = 12;
export const MAP_W = COLS * TILE; // 960
export const MAP_H = ROWS * TILE; // 576

export const WAVES_PER_LEVEL = 10;
export const LEVEL_COUNT = 10;

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

/** Classic TD niches — always shown in the bottom dock. */
export const TOWERS: Record<TowerKind, TowerDef> = {
  arrow: {
    kind: 'arrow',
    name: 'Arrow',
    cost: 60,
    description: 'Fast single-target shots',
    role: 'DPS',
    color: '#5b9fd4',
    colorDark: '#1e4d73',
    range: 145,
    damage: 12,
    fireRate: 1.85,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 55,
    upgradeMul: 1.4,
  },
  cannon: {
    kind: 'cannon',
    name: 'Cannon',
    cost: 110,
    description: 'Heavy splash, shreds armor',
    role: 'AoE',
    color: '#d9773a',
    colorDark: '#7a3410',
    range: 155,
    damage: 26,
    fireRate: 0.55,
    splash: 58,
    slow: 0,
    slowDuration: 0,
    pierceArmor: true,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 85,
    upgradeMul: 1.38,
  },
  ice: {
    kind: 'ice',
    name: 'Ice',
    cost: 90,
    description: 'Chills packs — big slow',
    role: 'Control',
    color: '#7ec8e3',
    colorDark: '#1f5f78',
    range: 125,
    damage: 5,
    fireRate: 1.15,
    splash: 42,
    slow: 0.45,
    slowDuration: 1.6,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 70,
    upgradeMul: 1.32,
  },
  lightning: {
    kind: 'lightning',
    name: 'Lightning',
    cost: 140,
    description: 'Chains across nearby foes',
    role: 'Chain',
    color: '#f0c94d',
    colorDark: '#8a6b00',
    range: 135,
    damage: 16,
    fireRate: 0.95,
    splash: 0,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 3,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 110,
    upgradeMul: 1.38,
  },
  fire: {
    kind: 'fire',
    name: 'Fire',
    cost: 100,
    description: 'Splash + burning damage',
    role: 'Burn',
    color: '#e85d4c',
    colorDark: '#8b1e14',
    range: 130,
    damage: 10,
    fireRate: 0.85,
    splash: 48,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 8,
    burnDuration: 2.4,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 80,
    upgradeMul: 1.35,
  },
  poison: {
    kind: 'poison',
    name: 'Poison',
    cost: 95,
    description: 'Venom DoT + light slow',
    role: 'DoT',
    color: '#6bcb77',
    colorDark: '#1f6b3a',
    range: 128,
    damage: 4,
    fireRate: 1.2,
    splash: 36,
    slow: 0.2,
    slowDuration: 1.2,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 10,
    poisonDuration: 3,
    upgradeCost: 75,
    upgradeMul: 1.33,
  },
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  scout: {
    kind: 'scout',
    name: 'Scout',
    blurb: 'Fast and fragile — Ice helps a lot.',
    hp: 36,
    speed: 72,
    reward: 8,
    armor: 0,
    radius: 12,
    color: '#57cc99',
    colorDark: '#1b7a4d',
  },
  grunt: {
    kind: 'grunt',
    name: 'Grunt',
    blurb: 'Balanced fodder. Arrow towers chew them up.',
    hp: 70,
    speed: 48,
    reward: 12,
    armor: 0.05,
    radius: 14,
    color: '#9aabbc',
    colorDark: '#3d4f63',
  },
  brute: {
    kind: 'brute',
    name: 'Brute',
    blurb: 'Armored. Cannon pierces; Fire/Poison wear them down.',
    hp: 160,
    speed: 34,
    reward: 22,
    armor: 0.35,
    radius: 18,
    color: '#ef476f',
    colorDark: '#8a1032',
  },
  swarm: {
    kind: 'swarm',
    name: 'Swarm',
    blurb: 'Tiny packs. Splash and Lightning shine here.',
    hp: 22,
    speed: 80,
    reward: 4,
    armor: 0,
    radius: 10,
    color: '#b8f2e6',
    colorDark: '#2a6f63',
  },
  boss: {
    kind: 'boss',
    name: 'Colossus',
    blurb: 'Wave boss. Focus fire and keep slows up.',
    hp: 900,
    speed: 26,
    reward: 80,
    armor: 0.25,
    radius: 26,
    color: '#c77dff',
    colorDark: '#5a189a',
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
