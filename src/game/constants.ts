export const TILE = 48;
export const COLS = 20;
export const ROWS = 12;
export const MAP_W = COLS * TILE; // 960
export const MAP_H = ROWS * TILE; // 576

export const WAVES_PER_LEVEL = 10;
export const LEVEL_COUNT = 10;

/** Flat + per-wave gold when a wave is fully cleared (keep tight — main income is kills). */
export function waveClearBonus(waveIndex: number): number {
  return 12 + waveIndex * 2;
}

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

export type TowerKind =
  | 'arrow'
  | 'cannon'
  | 'ice'
  | 'lightning'
  | 'fire'
  | 'poison'
  | 'light'
  | 'dark';

export type BarracksKind = 'warriorBarracks' | 'knightBarracks' | 'paladinBarracks';

/** Anything the shop can place on grass. */
export type PlaceableKind = TowerKind | BarracksKind;

export type TargetingMode = 'first' | 'strong' | 'close';

export type TowerSpecId =
  | 'rapidFire'
  | 'heavyBolt'
  | 'cluster'
  | 'siege'
  | 'deepFreeze'
  | 'frostNova'
  | 'stormChain'
  | 'thunderstrike'
  | 'inferno'
  | 'meteor'
  | 'contagion'
  | 'venomSpike'
  | 'solarLance'
  | 'dawnNova'
  | 'soulSiphon'
  | 'nightGrasp';

export type BarracksSpecId =
  | 'berserkers'
  | 'vanguard'
  | 'bulwark'
  | 'crusade'
  | 'zealots'
  | 'guardians';

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
  | 'lich'
  | 'wisp'
  | 'gargoyle';

export type FriendlyUnitKind = 'warrior' | 'knight' | 'paladin';

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
  armorShred: number;
  armorShredDuration: number;
  curseDps: number;
  curseDuration: number;
  goldOnHit: number;
  hitsAir: boolean;
  hitsGround: boolean;
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
  flying?: boolean;
  undead?: boolean;
}

/** Multipliers / additives applied after L3 base stats. */
export interface TowerSpecDef {
  id: TowerSpecId;
  kind: TowerKind;
  name: string;
  description: string;
  damageMul?: number;
  fireRateMul?: number;
  rangeMul?: number;
  splashMul?: number;
  splashAdd?: number;
  slowMul?: number;
  slowDurationMul?: number;
  chainAdd?: number;
  chainSet?: number;
  burnDpsMul?: number;
  burnDurationMul?: number;
  poisonDpsMul?: number;
  poisonDurationMul?: number;
  armorShredMul?: number;
  armorShredDurationMul?: number;
  curseDpsMul?: number;
  curseDurationMul?: number;
  goldOnHitAdd?: number;
}

export interface FriendlyUnitDef {
  name: string;
  hp: number;
  damage: number;
  attackRate: number;
  speed: number;
  engageRange: number;
  radius: number;
}

export interface BarracksDef {
  kind: BarracksKind;
  name: string;
  description: string;
  role: string;
  color: string;
  colorDark: string;
  cost: number;
  rallyRadius: number;
  unitCap: number;
  respawnTime: number;
  upgradeCost: number;
  unitKind: FriendlyUnitKind;
  unit: FriendlyUnitDef;
}

export interface BarracksSpecDef {
  id: BarracksSpecId;
  kind: BarracksKind;
  name: string;
  description: string;
  hpMul?: number;
  damageMul?: number;
  attackRateMul?: number;
  engageMul?: number;
  smiteMul?: number;
  slowOnHit?: number;
  slowOnHitDuration?: number;
  damageTakenMul?: number;
}

function baseTower(
  partial: Omit<
    TowerDef,
    | 'armorShred'
    | 'armorShredDuration'
    | 'curseDps'
    | 'curseDuration'
    | 'goldOnHit'
    | 'hitsAir'
    | 'hitsGround'
  > &
    Partial<
      Pick<
        TowerDef,
        | 'armorShred'
        | 'armorShredDuration'
        | 'curseDps'
        | 'curseDuration'
        | 'goldOnHit'
        | 'hitsAir'
        | 'hitsGround'
      >
    >,
): TowerDef {
  return {
    armorShred: 0,
    armorShredDuration: 0,
    curseDps: 0,
    curseDuration: 0,
    goldOnHit: 0,
    hitsAir: true,
    hitsGround: true,
    ...partial,
  };
}

/** Classic TD niches — always shown in the bottom dock. */
export const TOWERS: Record<TowerKind, TowerDef> = {
  arrow: baseTower({
    kind: 'arrow',
    name: 'Arrow',
    cost: 55,
    description: 'Tall keep with a crossbow — fast single shots that hit air and ground',
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
  }),
  cannon: baseTower({
    kind: 'cannon',
    name: 'Cannon',
    cost: 115,
    description: 'Heavy bastion — ground splash that shreds armor (cannot hit flyers)',
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
    hitsAir: false,
    hitsGround: true,
    upgradeCost: 90,
    upgradeMul: 1.38,
  }),
  ice: baseTower({
    kind: 'ice',
    name: 'Ice',
    cost: 90,
    description: 'Crystal spire — chills packs on the ground and in the air',
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
  }),
  lightning: baseTower({
    kind: 'lightning',
    name: 'Lightning',
    cost: 145,
    description: 'Coil tower — bolts chain across foes, including flyers',
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
  }),
  fire: baseTower({
    kind: 'fire',
    name: 'Fire',
    cost: 105,
    description: 'Brazier tower — fireballs and burn vs air and ground',
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
  }),
  poison: baseTower({
    kind: 'poison',
    name: 'Poison',
    cost: 95,
    description: 'Cauldron tower — venom DoT + light slow, hits flyers',
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
  }),
  light: baseTower({
    kind: 'light',
    name: 'Radiant',
    cost: 120,
    description: 'Pale spire with a sun-orb crown — holy lances shred armor',
    role: 'Holy',
    color: '#f7e7a0',
    colorDark: '#b8860b',
    range: 145,
    damage: 16,
    fireRate: 1.05,
    splash: 28,
    slow: 0,
    slowDuration: 0,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    armorShred: 0.22,
    armorShredDuration: 1.5,
    upgradeCost: 95,
    upgradeMul: 1.36,
  }),
  dark: baseTower({
    kind: 'dark',
    name: 'Void',
    cost: 125,
    description: 'Twisted obelisk — shadow orbs curse foes and sap their will',
    role: 'Curse',
    color: '#9b5de5',
    colorDark: '#2a0a40',
    range: 140,
    damage: 8,
    fireRate: 0.95,
    splash: 0,
    slow: 0.28,
    slowDuration: 1.4,
    pierceArmor: false,
    chain: 0,
    burnDps: 0,
    burnDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    curseDps: 10,
    curseDuration: 2.8,
    goldOnHit: 0,
    upgradeCost: 98,
    upgradeMul: 1.36,
  }),
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  gnome: {
    kind: 'gnome',
    name: 'Gnome',
    blurb: 'Tiny and quick — Ice helps a lot.',
    hp: 34,
    speed: 78,
    reward: 5,
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
    reward: 7,
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
    reward: 9,
    armor: 0.28,
    radius: 15,
    color: '#8fa37a',
    colorDark: '#3d4a32',
    undead: true,
  },
  ghoul: {
    kind: 'ghoul',
    name: 'Ghoul',
    blurb: 'Swarm packs. Splash and Lightning shine here.',
    hp: 24,
    speed: 82,
    reward: 3,
    armor: 0,
    radius: 10,
    color: '#c4b5fd',
    colorDark: '#5b21b6',
    undead: true,
  },
  skeletonSnake: {
    kind: 'skeletonSnake',
    name: 'Bone Serpent',
    blurb: 'Long bony coil — medium speed, awkward hitbox.',
    hp: 48,
    speed: 58,
    reward: 6,
    armor: 0.08,
    radius: 13,
    color: '#e8e0d0',
    colorDark: '#6b6358',
    undead: true,
  },
  troll: {
    kind: 'troll',
    name: 'Troll',
    blurb: 'Thick hide. Focus fire and keep slows up.',
    hp: 175,
    speed: 32,
    reward: 14,
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
    reward: 8,
    armor: 0,
    radius: 13,
    color: '#a8d8ea',
    colorDark: '#3d6b80',
    undead: true,
  },
  necromancer: {
    kind: 'necromancer',
    name: 'Necromancer',
    blurb: 'Elite caster — tanky mid-HP, fat reward.',
    hp: 220,
    speed: 36,
    reward: 20,
    armor: 0.18,
    radius: 16,
    color: '#9b5de5',
    colorDark: '#4a1c6b',
    undead: true,
  },
  wyrm: {
    kind: 'wyrm',
    name: 'Wyrm',
    blurb: 'Late elite — tough and surprisingly quick.',
    hp: 280,
    speed: 52,
    reward: 22,
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
    reward: 50,
    armor: 0.28,
    radius: 26,
    color: '#c77dff',
    colorDark: '#3c096c',
    undead: true,
  },
  wisp: {
    kind: 'wisp',
    name: 'Wisp',
    blurb: 'Flying spark — Cannon and barracks cannot touch it. Use Arrow or elementals.',
    hp: 28,
    speed: 92,
    reward: 6,
    armor: 0,
    radius: 10,
    color: '#e0f7ff',
    colorDark: '#5b9fd4',
    flying: true,
  },
  gargoyle: {
    kind: 'gargoyle',
    name: 'Gargoyle',
    blurb: 'Armored flyer — tanky air unit. Needs anti-air DPS.',
    hp: 130,
    speed: 48,
    reward: 12,
    armor: 0.2,
    radius: 15,
    color: '#6b7280',
    colorDark: '#1f2937',
    flying: true,
  },
};

/** L3 permanent dual paths — pick one after reaching level 3. */
export const TOWER_SPECS: Record<TowerKind, [TowerSpecDef, TowerSpecDef]> = {
  arrow: [
    {
      id: 'rapidFire',
      kind: 'arrow',
      name: 'Rapid Fire',
      description: 'Much faster bolts, slightly less punch',
      fireRateMul: 1.55,
      damageMul: 0.88,
    },
    {
      id: 'heavyBolt',
      kind: 'arrow',
      name: 'Heavy Bolt',
      description: 'Slower shots that hit like a truck',
      fireRateMul: 0.72,
      damageMul: 1.75,
    },
  ],
  cannon: [
    {
      id: 'cluster',
      kind: 'cannon',
      name: 'Cluster',
      description: 'Wider blast, snappier reload',
      splashMul: 1.35,
      fireRateMul: 1.18,
    },
    {
      id: 'siege',
      kind: 'cannon',
      name: 'Siege',
      description: 'Slow siege shells — massive pierce damage',
      fireRateMul: 0.7,
      damageMul: 1.85,
      splashMul: 1.1,
    },
  ],
  ice: [
    {
      id: 'deepFreeze',
      kind: 'ice',
      name: 'Deep Freeze',
      description: 'Harder, longer chill',
      slowMul: 1.25,
      slowDurationMul: 1.45,
      damageMul: 1.15,
    },
    {
      id: 'frostNova',
      kind: 'ice',
      name: 'Frost Nova',
      description: 'Bigger freeze splash',
      splashMul: 1.45,
      splashAdd: 10,
    },
  ],
  lightning: [
    {
      id: 'stormChain',
      kind: 'lightning',
      name: 'Storm Chain',
      description: 'Extra hops across the pack',
      chainAdd: 2,
      damageMul: 0.95,
    },
    {
      id: 'thunderstrike',
      kind: 'lightning',
      name: 'Thunderstrike',
      description: 'Fewer hops, crushing bolt',
      chainSet: 1,
      damageMul: 1.9,
    },
  ],
  fire: [
    {
      id: 'inferno',
      kind: 'fire',
      name: 'Inferno',
      description: 'Hotter, longer burn',
      burnDpsMul: 1.5,
      burnDurationMul: 1.35,
      damageMul: 1.1,
    },
    {
      id: 'meteor',
      kind: 'fire',
      name: 'Meteor',
      description: 'Bigger splash, punchier impact',
      splashMul: 1.4,
      splashAdd: 12,
      damageMul: 1.35,
    },
  ],
  poison: [
    {
      id: 'contagion',
      kind: 'poison',
      name: 'Contagion',
      description: 'Stronger venom with light splash',
      poisonDpsMul: 1.45,
      splashAdd: 22,
      splashMul: 1.15,
    },
    {
      id: 'venomSpike',
      kind: 'poison',
      name: 'Venom Spike',
      description: 'Faster shots, snappier poison',
      fireRateMul: 1.45,
      poisonDurationMul: 0.75,
      damageMul: 1.2,
    },
  ],
  light: [
    {
      id: 'solarLance',
      kind: 'light',
      name: 'Solar Lance',
      description: 'Crushing single-target holy lance, longer shred',
      damageMul: 1.7,
      splashMul: 0.35,
      armorShredDurationMul: 1.6,
      armorShredMul: 1.25,
    },
    {
      id: 'dawnNova',
      kind: 'light',
      name: 'Dawn Nova',
      description: 'Wider holy splash, softer shred',
      splashMul: 1.7,
      splashAdd: 16,
      damageMul: 0.9,
      armorShredMul: 0.75,
    },
  ],
  dark: [
    {
      id: 'soulSiphon',
      kind: 'dark',
      name: 'Soul Siphon',
      description: 'Faster curses that grant a trickle of gold',
      fireRateMul: 1.35,
      goldOnHitAdd: 1,
      curseDpsMul: 1.15,
    },
    {
      id: 'nightGrasp',
      kind: 'dark',
      name: 'Night Grasp',
      description: 'Heavier slow and longer curse',
      slowMul: 1.45,
      slowDurationMul: 1.35,
      curseDpsMul: 1.4,
      curseDurationMul: 1.4,
      fireRateMul: 0.85,
    },
  ],
};

export const BARRACKS: Record<BarracksKind, BarracksDef> = {
  warriorBarracks: {
    kind: 'warriorBarracks',
    name: 'Warriors',
    description: 'Deploys three warriors that block and duel on the path (ground only)',
    role: 'Block',
    color: '#c4a574',
    colorDark: '#5a3d22',
    cost: 90,
    rallyRadius: 150,
    unitCap: 3,
    respawnTime: 5,
    upgradeCost: 70,
    unitKind: 'warrior',
    unit: {
      name: 'Warrior',
      hp: 85,
      damage: 9,
      attackRate: 1.15,
      speed: 72,
      engageRange: 36,
      radius: 11,
    },
  },
  knightBarracks: {
    kind: 'knightBarracks',
    name: 'Knights',
    description: 'Deploys three armored knights — tankier, harder hits (ground only)',
    role: 'Tank',
    color: '#9aa8c0',
    colorDark: '#2a3548',
    cost: 130,
    rallyRadius: 145,
    unitCap: 3,
    respawnTime: 5.5,
    upgradeCost: 95,
    unitKind: 'knight',
    unit: {
      name: 'Knight',
      hp: 140,
      damage: 14,
      attackRate: 0.85,
      speed: 58,
      engageRange: 38,
      radius: 13,
    },
  },
  paladinBarracks: {
    kind: 'paladinBarracks',
    name: 'Paladins',
    description: 'Holy blockers that smite the undead — still ground-only vs flyers',
    role: 'Holy',
    color: '#f0e6c0',
    colorDark: '#8a6b20',
    cost: 150,
    rallyRadius: 148,
    unitCap: 3,
    respawnTime: 5.2,
    upgradeCost: 110,
    unitKind: 'paladin',
    unit: {
      name: 'Paladin',
      hp: 115,
      damage: 12,
      attackRate: 1.0,
      speed: 64,
      engageRange: 37,
      radius: 12,
    },
  },
};

export const BARRACKS_SPECS: Record<BarracksKind, [BarracksSpecDef, BarracksSpecDef]> = {
  warriorBarracks: [
    {
      id: 'berserkers',
      kind: 'warriorBarracks',
      name: 'Berserkers',
      description: 'Faster attacks, less HP',
      attackRateMul: 1.4,
      hpMul: 0.82,
    },
    {
      id: 'vanguard',
      kind: 'warriorBarracks',
      name: 'Vanguard',
      description: 'Tougher troops, slightly longer engage',
      hpMul: 1.35,
      engageMul: 1.15,
    },
  ],
  knightBarracks: [
    {
      id: 'bulwark',
      kind: 'knightBarracks',
      name: 'Bulwark',
      description: 'Extra HP and take less melee damage',
      hpMul: 1.45,
      damageTakenMul: 0.75,
    },
    {
      id: 'crusade',
      kind: 'knightBarracks',
      name: 'Crusade',
      description: 'Harder hits, slower swings',
      damageMul: 1.55,
      attackRateMul: 0.78,
    },
  ],
  paladinBarracks: [
    {
      id: 'zealots',
      kind: 'paladinBarracks',
      name: 'Zealots',
      description: 'Much stronger smite vs undead',
      smiteMul: 2.1,
      damageMul: 1.1,
    },
    {
      id: 'guardians',
      kind: 'paladinBarracks',
      name: 'Guardians',
      description: 'More HP; hits briefly slow foes',
      hpMul: 1.4,
      slowOnHit: 0.35,
      slowOnHitDuration: 0.9,
    },
  ],
};

/** Shop order matches unlock pacing: starters → mid → late. */
export const TOWER_ORDER: TowerKind[] = [
  'arrow',
  'cannon',
  'fire',
  'ice',
  'lightning',
  'poison',
  'light',
  'dark',
];

export const BARRACKS_ORDER: BarracksKind[] = [
  'warriorBarracks',
  'knightBarracks',
  'paladinBarracks',
];

export const SHOP_ORDER: PlaceableKind[] = [...TOWER_ORDER, ...BARRACKS_ORDER];

export function isTowerKind(kind: PlaceableKind): kind is TowerKind {
  return (TOWER_ORDER as string[]).includes(kind);
}

export function isBarracksKind(kind: PlaceableKind): kind is BarracksKind {
  return (BARRACKS_ORDER as string[]).includes(kind);
}

export function placeableCost(kind: PlaceableKind): number {
  return isTowerKind(kind) ? TOWERS[kind].cost : BARRACKS[kind].cost;
}

export function placeableName(kind: PlaceableKind): string {
  return isTowerKind(kind) ? TOWERS[kind].name : BARRACKS[kind].name;
}

export function placeableColor(kind: PlaceableKind): { color: string; colorDark: string } {
  if (isTowerKind(kind)) {
    return { color: TOWERS[kind].color, colorDark: TOWERS[kind].colorDark };
  }
  return { color: BARRACKS[kind].color, colorDark: BARRACKS[kind].colorDark };
}

export function specsFor(kind: TowerKind): [TowerSpecDef, TowerSpecDef] {
  return TOWER_SPECS[kind];
}

export function barracksSpecsFor(kind: BarracksKind): [BarracksSpecDef, BarracksSpecDef] {
  return BARRACKS_SPECS[kind];
}

export function isUndead(kind: EnemyKind): boolean {
  return !!ENEMIES[kind].undead;
}

export function isFlying(kind: EnemyKind): boolean {
  return !!ENEMIES[kind].flying;
}

/** Contact damage enemies deal while dueling friendlies (per hit). */
export function enemyMeleeDamage(kind: EnemyKind): number {
  const def = ENEMIES[kind];
  return Math.round(8 + def.hp * 0.035 + def.armor * 18);
}

export function airGroundLabel(def: Pick<TowerDef, 'hitsAir' | 'hitsGround'>): string {
  if (def.hitsAir && def.hitsGround) return 'Air + Ground';
  if (def.hitsAir) return 'Air only';
  return 'Ground only';
}
