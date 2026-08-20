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
  portalIn: loadImage('/sprites/landmarks/portal-in.png'),
  portalOut: loadImage('/sprites/landmarks/portal-out.png'),
  creatures: {
    goblin: loadImage('/sprites/enemies/goblin.png'),
    raider: loadImage('/sprites/enemies/raider.png'),
    imp: loadImage('/sprites/enemies/imp.png'),
    troll: loadImage('/sprites/enemies/troll.png'),
    warlord: loadImage('/sprites/enemies/warlord.png'),
    warg: loadImage('/sprites/enemies/warg.png'),
    ogre: loadImage('/sprites/enemies/ogre.png'),
    hellbat: loadImage('/sprites/enemies/hellbat.png'),
    wyvern: loadImage('/sprites/enemies/wyvern.png'),
    drake: loadImage('/sprites/enemies/drake.png'),
  } satisfies Record<CreatureSprite, HTMLImageElement | null>,
  creatureWalks: {
    goblin: walkSheet('goblin'),
    raider: walkSheet('raider'),
    imp: walkSheet('imp'),
    troll: walkSheet('troll'),
    warlord: walkSheet('warlord'),
    warg: walkSheet('warg'),
    ogre: walkSheet('ogre'),
    hellbat: walkSheet('hellbat'),
    wyvern: walkSheet('wyvern'),
    drake: walkSheet('drake'),
  } satisfies Record<CreatureSprite, Array<HTMLImageElement | null>>,
  creatureDirWalks: Object.fromEntries(CREATURES.map((name) => [name, dirWalkSheet(name)])) as Record<
    CreatureSprite,
    Record<Cardinal, Array<HTMLImageElement | null>>
  >,
  creatureFaces: {
    goblin: faceSheet('goblin'),
    raider: faceSheet('raider'),
    imp: faceSheet('imp'),
    troll: faceSheet('troll'),
    warlord: faceSheet('warlord'),
    warg: faceSheet('warg'),
    ogre: faceSheet('ogre'),
    hellbat: faceSheet('hellbat'),
    wyvern: faceSheet('wyvern'),
    drake: faceSheet('drake'),
  } satisfies Record<CreatureSprite, Record<Cardinal, HTMLImageElement | null>>,
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
