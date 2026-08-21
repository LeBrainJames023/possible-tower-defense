/** Optional baked images. Missing files just mean we keep procedural art. */

import type { TowerKind } from './constants';
import type { Cardinal, CreatureSprite } from './enemies';

export function loadImage(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img;
}

export function texReady(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

const CREATURES: CreatureSprite[] = [
  'goblin',
  'raider',
  'imp',
  'troll',
  'warlord',
  'warg',
  'ogre',
  'hellbat',
  'wyvern',
  'drake',
  'scorpion',
  'dunerunner',
  'dunetyrant',
  'sandkhan',
  'frostwisp',
  'icewolf',
  'packlord',
  'frostjarl',
  'magmahound',
  'cinderbrute',
  'cinderking',
  'ashtitan',
  'shade',
  'hexknight',
  'hexwarden',
  'magician',
];

function walkSheet(name: CreatureSprite): Array<HTMLImageElement | null> {
  return [1, 2, 3, 4].map((i) => loadImage(`/sprites/enemies/walk/${name}-${i}.png`));
}

function dirWalkSheet(name: CreatureSprite): Record<Cardinal, Array<HTMLImageElement | null>> {
  const frames = (dir: Cardinal) =>
    [1, 2, 3, 4].map((i) => loadImage(`/sprites/enemies/walk/${name}-${dir}-${i}.png`));
  return { n: frames('n'), e: frames('e'), s: frames('s'), w: frames('w') };
}

function faceSheet(name: CreatureSprite): Record<Cardinal, HTMLImageElement | null> {
  return {
    n: loadImage(`/sprites/enemies/face/${name}-n.png`),
    e: loadImage(`/sprites/enemies/face/${name}-e.png`),
    s: loadImage(`/sprites/enemies/face/${name}-s.png`),
    w: loadImage(`/sprites/enemies/face/${name}-w.png`),
  };
}

export const TEX = {
  grass: loadImage('/textures/grass.jpg'),
  dirt: loadImage('/textures/dirt.jpg'),
  water: loadImage('/textures/water.jpg'),
  tree: loadImage('/sprites/tree.png'),
  trees: [
    loadImage('/sprites/trees/oak.png'),
    loadImage('/sprites/trees/pine.png'),
    loadImage('/sprites/trees/apple.png'),
    loadImage('/sprites/trees/willow.png'),
    loadImage('/sprites/trees/dogwood.png'),
  ],
  desertProps: [
    loadImage('/sprites/desert/cactus.png'),
    loadImage('/sprites/desert/dead-tree.png'),
    loadImage('/sprites/desert/boulder.png'),
    loadImage('/sprites/desert/agave.png'),
  ],
  iceProps: [
    loadImage('/sprites/ice/crystal.png'),
    loadImage('/sprites/ice/pine.png'),
    loadImage('/sprites/ice/boulder.png'),
    loadImage('/sprites/ice/shrub.png'),
  ],
  fireProps: [
    loadImage('/sprites/fire/lava-rock.png'),
    loadImage('/sprites/fire/ember-stump.png'),
    loadImage('/sprites/fire/fumarole.png'),
    loadImage('/sprites/fire/slag.png'),
  ],
  hollowProps: [
    loadImage('/sprites/hollow/menhir.png'),
    loadImage('/sprites/hollow/tablet.png'),
    loadImage('/sprites/hollow/obelisk.png'),
    loadImage('/sprites/hollow/ward-post.png'),
  ],
  grassTiles: [
    loadImage('/sprites/terrain/grass-1.png'),
    loadImage('/sprites/terrain/grass-2.png'),
    loadImage('/sprites/terrain/grass-3.png'),
    loadImage('/sprites/terrain/grass-4.png'),
  ],
  pathTiles: [
    loadImage('/sprites/terrain/path-1.png'),
    loadImage('/sprites/terrain/path-2.png'),
    loadImage('/sprites/terrain/path-3.png'),
    loadImage('/sprites/terrain/path-4.png'),
  ],
  sandTiles: [
    loadImage('/sprites/terrain/sand-1.png'),
    loadImage('/sprites/terrain/sand-2.png'),
    loadImage('/sprites/terrain/sand-3.png'),
    loadImage('/sprites/terrain/sand-4.png'),
  ],
  sandPathTiles: [
    loadImage('/sprites/terrain/sand-path-1.png'),
    loadImage('/sprites/terrain/sand-path-2.png'),
    loadImage('/sprites/terrain/sand-path-3.png'),
    loadImage('/sprites/terrain/sand-path-4.png'),
  ],
  iceTiles: [
    loadImage('/sprites/terrain/ice-1.png'),
    loadImage('/sprites/terrain/ice-2.png'),
    loadImage('/sprites/terrain/ice-3.png'),
    loadImage('/sprites/terrain/ice-4.png'),
  ],
  icePathTiles: [
    loadImage('/sprites/terrain/ice-path-1.png'),
    loadImage('/sprites/terrain/ice-path-2.png'),
    loadImage('/sprites/terrain/ice-path-3.png'),
    loadImage('/sprites/terrain/ice-path-4.png'),
  ],
  fireTiles: [
    loadImage('/sprites/terrain/fire-1.png'),
    loadImage('/sprites/terrain/fire-2.png'),
    loadImage('/sprites/terrain/fire-3.png'),
    loadImage('/sprites/terrain/fire-4.png'),
  ],
  firePathTiles: [
    loadImage('/sprites/terrain/fire-path-1.png'),
    loadImage('/sprites/terrain/fire-path-2.png'),
    loadImage('/sprites/terrain/fire-path-3.png'),
    loadImage('/sprites/terrain/fire-path-4.png'),
  ],
  hollowTiles: [
    loadImage('/sprites/terrain/hollow-1.png'),
    loadImage('/sprites/terrain/hollow-2.png'),
    loadImage('/sprites/terrain/hollow-3.png'),
    loadImage('/sprites/terrain/hollow-4.png'),
  ],
  hollowPathTiles: [
    loadImage('/sprites/terrain/hollow-path-1.png'),
    loadImage('/sprites/terrain/hollow-path-2.png'),
    loadImage('/sprites/terrain/hollow-path-3.png'),
    loadImage('/sprites/terrain/hollow-path-4.png'),
  ],
  portalIn: loadImage('/sprites/landmarks/portal-in.png'),
  portalOut: loadImage('/sprites/landmarks/portal-out.png'),
  portalDesertIn: loadImage('/sprites/landmarks/portal-desert-in.png'),
  portalDesertOut: loadImage('/sprites/landmarks/portal-desert-out.png'),
  portalIceIn: loadImage('/sprites/landmarks/portal-ice-in.png'),
  portalIceOut: loadImage('/sprites/landmarks/portal-ice-out.png'),
  portalFireIn: loadImage('/sprites/landmarks/portal-fire-in.png'),
  portalFireOut: loadImage('/sprites/landmarks/portal-fire-out.png'),
  portalHollowIn: loadImage('/sprites/landmarks/portal-hollow-in.png'),
  portalHollowOut: loadImage('/sprites/landmarks/portal-hollow-out.png'),
  creatures: Object.fromEntries(CREATURES.map((name) => [name, loadImage(`/sprites/enemies/${name}.png`)])) as Record<
    CreatureSprite,
    HTMLImageElement | null
  >,
  creatureWalks: Object.fromEntries(CREATURES.map((name) => [name, walkSheet(name)])) as Record<
    CreatureSprite,
    Array<HTMLImageElement | null>
  >,
  creatureDirWalks: Object.fromEntries(CREATURES.map((name) => [name, dirWalkSheet(name)])) as Record<
    CreatureSprite,
    Record<Cardinal, Array<HTMLImageElement | null>>
  >,
  creatureFaces: Object.fromEntries(CREATURES.map((name) => [name, faceSheet(name)])) as Record<
    CreatureSprite,
    Record<Cardinal, HTMLImageElement | null>
  >,
  towers: {
    arrow: loadImage('/sprites/towers/arrow.png'),
    cannon: loadImage('/sprites/towers/cannon.png'),
    ice: loadImage('/sprites/towers/ice.png'),
    lightning: loadImage('/sprites/towers/lightning.png'),
    fire: loadImage('/sprites/towers/fire.png'),
    poison: loadImage('/sprites/towers/poison.png'),
  } satisfies Record<TowerKind, HTMLImageElement | null>,
  towerParts: {
    arrowBase: loadImage('/sprites/towers/arrow-base.png'),
    arrowTurret: loadImage('/sprites/towers/arrow-turret.png'),
    cannonGun: loadImage('/sprites/towers/cannon-gun.png'),
    cannonBase: loadImage('/sprites/towers/cannon-base.png'),
  },
  projectiles: {
    arrow: loadImage('/sprites/projectiles/arrow.png'),
    cannon: loadImage('/sprites/projectiles/cannon.png'),
    ice: loadImage('/sprites/projectiles/ice.png'),
    lightning: loadImage('/sprites/projectiles/lightning.png'),
    fire: loadImage('/sprites/projectiles/fire.png'),
    poison: loadImage('/sprites/projectiles/poison.png'),
  } satisfies Record<TowerKind, HTMLImageElement | null>,
};
