/** Optional baked images. Missing files just mean we keep procedural art. */

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
};
