import { u } from './constants';

export type EnemyRole = 'fodder' | 'special' | 'champion' | 'boss';
export type CreatureSprite =
  | 'goblin'
  | 'raider'
  | 'imp'
  | 'troll'
  | 'warlord'
  | 'warg'
  | 'ogre'
  | 'hellbat'
  | 'wyvern'
  | 'drake';

export type EnemyKind =
  | 'scout'
  | 'grunt'
  | 'brute'
  | 'swarm'
  | 'boss'
  | 'warg'
  | 'boar'
  | 'scorpion'
  | 'duneRunner'
  | 'frostWisp'
  | 'iceWolf'
  | 'magmaHound'
  | 'cinderBrute'
  | 'shade'
  | 'hexKnight'
  | 'alphaWarg'
  | 'duneTyrant'
  | 'packLord'
  | 'cinderKing'
  | 'hexWarden'
  | 'sandKhan'
  | 'frostJarl'
  | 'ashTitan'
  | 'magician';

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  blurb: string;
  role: EnemyRole;
  sprite: CreatureSprite;
  hp: number;
  speed: number;
  reward: number;
  armor: number;
  radius: number;
  color: string;
  colorDark: string;
}

export interface EnemyGait {
  stepHz: number;
  bobAmp: number;
  sway: number;
  squash: number;
  jitter: number;
  dust: boolean;
}

function E(
  kind: EnemyKind,
  name: string,
  blurb: string,
  role: EnemyRole,
  sprite: CreatureSprite,
  hp: number,
  speed: number,
  reward: number,
  armor: number,
  radius: number,
  color: string,
  colorDark: string,
): EnemyDef {
  return { kind, name, blurb, role, sprite, hp, speed, reward, armor, radius, color, colorDark };
}

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  scout: E('scout', 'Goblin', 'Fast and fragile — Ice helps a lot.', 'fodder', 'goblin', 42, u(82), 9, 0, u(11), '#4ee0a5', '#157a4a'),
  grunt: E('grunt', 'Raider', 'Balanced fodder. Arrow towers chew them up.', 'fodder', 'raider', 100, u(48), 12, 0.06, u(14), '#a8b8c9', '#334556'),
  brute: E('brute', 'Troll', 'Armored. Cannon pierces; Poison wears them down.', 'fodder', 'troll', 210, u(32), 26, 0.4, u(19), '#ff5d7a', '#7a102c'),
  swarm: E('swarm', 'Imp', 'Tiny packs. Splash and Lightning shine here.', 'fodder', 'imp', 22, u(86), 5, 0, u(9), '#9ff5e4', '#1f6f62'),
  boss: E('boss', 'Warlord', 'Forest wave boss. Focus fire and keep slows up.', 'boss', 'warlord', 980, u(24), 110, 0.3, u(28), '#d4a0ff', '#4a1480'),

  warg: E('warg', 'Warg', 'Faster than a Raider, meaner than a Goblin.', 'special', 'warg', 70, u(78), 14, 0.04, u(13), '#8ab87a', '#2a4a20'),
  boar: E('boar', 'Boar', 'Chunky forest hog. A little armor.', 'special', 'troll', 160, u(40), 18, 0.18, u(16), '#a87848', '#4a3018'),
  scorpion: E('scorpion', 'Scorpion', 'Desert armor. Cannon and Poison help.', 'special', 'hellbat', 140, u(38), 16, 0.28, u(15), '#c4a060', '#5a3a10'),
  duneRunner: E('duneRunner', 'Dune Runner', 'Very fast, very thin. Ice is your friend.', 'special', 'goblin', 48, u(96), 11, 0, u(11), '#e0b050', '#6a4810'),
  frostWisp: E('frostWisp', 'Frost Wisp', 'Squishy ice spark. Splash deletes them.', 'special', 'imp', 28, u(80), 7, 0, u(10), '#b8e8ff', '#3a6a88'),
  iceWolf: E('iceWolf', 'Ice Wolf', 'Pack hunter. Fast and a bit tougher.', 'special', 'warg', 88, u(74), 15, 0.08, u(13), '#c8dce8', '#3a5060'),
  magmaHound: E('magmaHound', 'Magma Hound', 'Hot dog. Sturdier than a Goblin.', 'special', 'warg', 95, u(70), 16, 0.1, u(14), '#ff7040', '#6a1808'),
  cinderBrute: E('cinderBrute', 'Cinder Brute', 'Fat ash walker. Bring pierce.', 'special', 'ogre', 240, u(30), 28, 0.36, u(20), '#e05020', '#4a1008'),
  shade: E('shade', 'Shade', 'Hard to pin. Low HP, a little armor.', 'special', 'imp', 55, u(72), 13, 0.16, u(12), '#a070d0', '#301050'),
  hexKnight: E('hexKnight', 'Hex Knight', 'Slow cursed plate. Poison and Cannon.', 'special', 'raider', 200, u(34), 24, 0.38, u(17), '#7a40b0', '#2a1040'),

  alphaWarg: E('alphaWarg', 'Alpha Warg', 'Forest champion. Wave 7 trouble.', 'champion', 'warg', 420, u(52), 48, 0.18, u(22), '#6a9a50', '#1a3010'),
  duneTyrant: E('duneTyrant', 'Dune Tyrant', 'Desert champion. A sand-crowned brute.', 'champion', 'wyvern', 460, u(44), 52, 0.22, u(22), '#e0a040', '#5a3010'),
  packLord: E('packLord', 'Pack Lord', 'Ice champion. The wolves answer to this.', 'champion', 'ogre', 500, u(40), 55, 0.2, u(23), '#d0e8f4', '#2a4050'),
  cinderKing: E('cinderKing', 'Cinder King', 'Fire champion. Heavy and glowing.', 'champion', 'ogre', 540, u(36), 58, 0.26, u(23), '#ff6020', '#4a1000'),
  hexWarden: E('hexWarden', 'Hex Warden', 'Hollow champion. A walking seal.', 'champion', 'wyvern', 560, u(38), 60, 0.24, u(23), '#c77dff', '#2a0840'),

  sandKhan: E('sandKhan', 'Sand Khan', 'Desert boss. The caravan’s last word.', 'boss', 'warlord', 1100, u(24), 120, 0.32, u(28), '#e0b050', '#6a3a08'),
  frostJarl: E('frostJarl', 'Frost Jarl', 'Ice boss. The shelf belongs to him.', 'boss', 'ogre', 1250, u(22), 130, 0.34, u(29), '#c8e8ff', '#1a3040'),
  ashTitan: E('ashTitan', 'Ash Titan', 'Fire boss. The crust walks.', 'boss', 'drake', 1400, u(20), 140, 0.36, u(30), '#ff6b4a', '#4a0800'),
  magician: E('magician', 'The Magician', 'Hollow boss. The last door.', 'boss', 'drake', 1550, u(22), 150, 0.34, u(30), '#d4a0ff', '#2a0848'),
};

const GAIT: Record<EnemyRole, EnemyGait> = {
  fodder: { stepHz: 1.7, bobAmp: 2.1, sway: 0.8, squash: 0.06, jitter: 0, dust: true },
  special: { stepHz: 2.2, bobAmp: 2.4, sway: 1.2, squash: 0.05, jitter: 0.4, dust: true },
  champion: { stepHz: 0.9, bobAmp: 1.4, sway: 0.35, squash: 0.12, jitter: 0, dust: true },
  boss: { stepHz: 0.7, bobAmp: 1.1, sway: 0.2, squash: 0.1, jitter: 0, dust: true },
};

export const ENEMY_GAIT: Record<EnemyKind, EnemyGait> = {
  scout: { stepHz: 3.6, bobAmp: 3.4, sway: 2.4, squash: 0.04, jitter: 0, dust: false },
  grunt: GAIT.fodder,
  brute: { stepHz: 0.85, bobAmp: 1.5, sway: 0.4, squash: 0.14, jitter: 0, dust: true },
  swarm: { stepHz: 4.4, bobAmp: 2.6, sway: 1.2, squash: 0.03, jitter: 2.8, dust: false },
  boss: GAIT.boss,
  warg: { stepHz: 3.2, bobAmp: 2.8, sway: 1.8, squash: 0.05, jitter: 0, dust: true },
  boar: { stepHz: 1.4, bobAmp: 2.0, sway: 0.6, squash: 0.1, jitter: 0, dust: true },
  scorpion: { stepHz: 1.5, bobAmp: 1.6, sway: 0.5, squash: 0.08, jitter: 0, dust: true },
  duneRunner: { stepHz: 4.0, bobAmp: 3.0, sway: 2.2, squash: 0.03, jitter: 0.6, dust: false },
  frostWisp: { stepHz: 4.2, bobAmp: 2.8, sway: 1.6, squash: 0.02, jitter: 2.2, dust: false },
  iceWolf: { stepHz: 3.0, bobAmp: 2.6, sway: 1.6, squash: 0.05, jitter: 0, dust: true },
  magmaHound: { stepHz: 2.8, bobAmp: 2.4, sway: 1.4, squash: 0.06, jitter: 0, dust: true },
  cinderBrute: { stepHz: 0.8, bobAmp: 1.4, sway: 0.35, squash: 0.14, jitter: 0, dust: true },
  shade: { stepHz: 3.8, bobAmp: 2.2, sway: 1.8, squash: 0.03, jitter: 1.6, dust: false },
  hexKnight: { stepHz: 1.1, bobAmp: 1.6, sway: 0.4, squash: 0.1, jitter: 0, dust: true },
  alphaWarg: GAIT.champion,
  duneTyrant: GAIT.champion,
  packLord: GAIT.champion,
  cinderKing: GAIT.champion,
  hexWarden: GAIT.champion,
  sandKhan: GAIT.boss,
  frostJarl: GAIT.boss,
  ashTitan: GAIT.boss,
  magician: GAIT.boss,
};

export function leakLives(kind: EnemyKind): number {
  const role = ENEMIES[kind].role;
  if (role === 'boss') return 5;
  if (role === 'champion') return 3;
  return 1;
}

export function creatureFor(kind: EnemyKind): CreatureSprite {
  return ENEMIES[kind].sprite;
}
