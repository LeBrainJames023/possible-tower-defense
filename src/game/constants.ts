export const TILE = 48;
export const COLS = 20;
export const ROWS = 12;
export const MAP_W = COLS * TILE; // 960
export const MAP_H = ROWS * TILE; // 576

export const WAVES_PER_LEVEL = 10;
export const LEVEL_COUNT = 10;

/** grass = buildable; path = enemy lane; decor/water = blocked scenery */
export type CellKind = 'grass' | 'path' | 'decor' | 'water';

export type BiomeTheme =
  | 'meadow'
  | 'river'
  | 'forest'
  | 'mist'
  | 'swamp'
  | 'haunted'
  | 'ice'
  | 'alpine'
  | 'volcanic'
  | 'bastion';

export type TowerKind = 'arrow' | 'cannon' | 'ice' | 'lightning' | 'fire' | 'poison';

export type EnemyKind =
  | 'gnome'
  | 'orc'
  | 'zombie'
  | 'ghoul'
  | 'skeletonSnake'
  | 'troll'
  | 'ghost'
  | 'necromancer'
  | 'wyrm'
  | 'lich';

export interface TowerDef {
  kind: TowerKind;
  name: string;
  description: string;
  role: string;
  color: string;
  colorDark: string;
  cost: number;
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
    cost: 55,
    description: 'Tall keep with a crossbow — fast single shots',
    role: 'DPS',
    color: '#5b9fd4',
    colorDark: '#1e4d73',
    range: 150,
    damage: 13,
    fireRate: 1.9,
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
    upgradeMul: 1.4,
  },
  cannon: {
    kind: 'cannon',
    name: 'Cannon',
    cost: 115,
    description: 'Heavy bastion — splash that shreds armor',
    role: 'AoE',
    color: '#d9773a',
    colorDark: '#7a3410',
    range: 155,
    damage: 28,
    fireRate: 0.52,
    splash: 60,
    slow: 0,
    slowDuration: 0,
    pierceArmor: true,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 90,
    upgradeMul: 1.38,
  },
  ice: {
    kind: 'ice',
    name: 'Ice',
    cost: 90,
    description: 'Crystal spire — chills packs hard',
    role: 'Control',
    color: '#7ec8e3',
    colorDark: '#1f5f78',
    range: 128,
    damage: 5,
    fireRate: 1.15,
    splash: 44,
    slow: 0.48,
    slowDuration: 1.7,
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
    cost: 145,
    description: 'Coil tower — bolts chain across foes',
    role: 'Chain',
    color: '#f0c94d',
    colorDark: '#8a6b00',
    range: 138,
    damage: 17,
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
    upgradeCost: 115,
    upgradeMul: 1.38,
  },
  fire: {
    kind: 'fire',
    name: 'Fire',
    cost: 105,
    description: 'Brazier tower — fireballs and burn',
    role: 'Burn',
    color: '#e85d4c',
    colorDark: '#8b1e14',
    range: 132,
    damage: 11,
    fireRate: 0.85,
    splash: 50,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 9,
    burnDuration: 2.5,
    poisonDps: 0,
    poisonDuration: 0,
    upgradeCost: 82,
    upgradeMul: 1.35,
  },
  poison: {
    kind: 'poison',
    name: 'Poison',
    cost: 95,
    description: 'Cauldron tower — venom DoT + light slow',
    role: 'DoT',
    color: '#6bcb77',
    colorDark: '#1f6b3a',
    range: 130,
    damage: 4,
    fireRate: 1.2,
    splash: 38,
    slow: 0.22,
    slowDuration: 1.25,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 11,
    poisonDuration: 3.1,
    upgradeCost: 78,
    upgradeMul: 1.33,
  },
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  gnome: {
    kind: 'gnome',
    name: 'Gnome',
    blurb: 'Tiny and quick — Ice helps a lot.',
    hp: 34,
    speed: 78,
    reward: 8,
    armor: 0,
    radius: 11,
    color: '#7dcfb6',
    colorDark: '#2a6b55',
  },
  orc: {
    kind: 'orc',
    name: 'Orc',
    blurb: 'Balanced fodder. Arrow keeps chew them up.',
    hp: 72,
    speed: 46,
    reward: 12,
    armor: 0.06,
    radius: 14,
    color: '#6a9a5b',
    colorDark: '#2d4a28',
  },
  zombie: {
    kind: 'zombie',
    name: 'Zombie',
    blurb: 'Slow and armored. Cannon pierces; Fire/Poison wear them down.',
    hp: 110,
    speed: 30,
    reward: 16,
    armor: 0.28,
    radius: 15,
    color: '#8fa37a',
    colorDark: '#3d4a32',
  },
  ghoul: {
    kind: 'ghoul',
    name: 'Ghoul',
    blurb: 'Swarm packs. Splash and Lightning shine here.',
    hp: 24,
    speed: 82,
    reward: 4,
    armor: 0,
    radius: 10,
    color: '#c4b5fd',
    colorDark: '#5b21b6',
  },
  skeletonSnake: {
    kind: 'skeletonSnake',
    name: 'Bone Serpent',
    blurb: 'Long bony coil — medium speed, awkward hitbox.',
    hp: 48,
    speed: 58,
    reward: 10,
    armor: 0.08,
    radius: 13,
    color: '#e8e0d0',
    colorDark: '#6b6358',
  },
  troll: {
    kind: 'troll',
    name: 'Troll',
    blurb: 'Thick hide. Focus fire and keep slows up.',
    hp: 175,
    speed: 32,
    reward: 24,
    armor: 0.36,
    radius: 19,
    color: '#c45c4a',
    colorDark: '#6b2218',
  },
  ghost: {
    kind: 'ghost',
    name: 'Ghost',
    blurb: 'Ethereal runner — fast, fragile, hard to track.',
    hp: 40,
    speed: 88,
    reward: 14,
    armor: 0,
    radius: 13,
    color: '#a8d8ea',
    colorDark: '#3d6b80',
  },
  necromancer: {
    kind: 'necromancer',
    name: 'Necromancer',
    blurb: 'Elite caster — tanky mid-HP, fat reward.',
    hp: 220,
    speed: 36,
    reward: 35,
    armor: 0.18,
    radius: 16,
    color: '#9b5de5',
    colorDark: '#4a1c6b',
  },
  wyrm: {
    kind: 'wyrm',
    name: 'Wyrm',
    blurb: 'Late elite — tough and surprisingly quick.',
    hp: 280,
    speed: 52,
    reward: 40,
    armor: 0.22,
    radius: 17,
    color: '#e63946',
    colorDark: '#6a040f',
  },
  lich: {
    kind: 'lich',
    name: 'Lich',
    blurb: 'Wave boss. Focus fire — leaking costs 5 lives.',
    hp: 950,
    speed: 24,
    reward: 90,
    armor: 0.28,
    radius: 26,
    color: '#c77dff',
    colorDark: '#3c096c',
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
