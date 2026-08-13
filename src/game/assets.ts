/** Optional baked images. Missing files just mean we keep procedural art. */

import type { EnemyKind } from './constants';

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

export const TEX = {
  grass: loadImage('/textures/grass.jpg'),
  dirt: loadImage('/textures/dirt.jpg'),
  water: loadImage('/textures/water.jpg'),
  tree: loadImage('/sprites/tree.png'),
  enemies: {
    scout: loadImage('/sprites/enemies/goblin.png'),
    grunt: loadImage('/sprites/enemies/raider.png'),
    swarm: loadImage('/sprites/enemies/imp.png'),
    brute: loadImage('/sprites/enemies/troll.png'),
    boss: loadImage('/sprites/enemies/warlord.png'),
  } satisfies Record<EnemyKind, HTMLImageElement | null>,
};
