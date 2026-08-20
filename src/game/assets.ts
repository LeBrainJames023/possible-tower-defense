/** Optional baked images. Missing files just mean we keep procedural art. */

import type { TowerKind } from './constants';
import type { CreatureSprite } from './enemies';

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

function walkSheet(name: CreatureSprite): Array<HTMLImageElement | null> {
  return [1, 2, 3, 4].map((i) => loadImage(`/sprites/enemies/walk/${name}-${i}.png`));
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
