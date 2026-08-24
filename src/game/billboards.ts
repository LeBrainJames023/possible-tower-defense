/**
 * Visual size only. Combat radius, HP, and Rally stay in troops.ts / constants.ts.
 * Halls crop sprite-forge padding so the yard/house fills a two-tile pad.
 */
import { TILE, u } from './constants';
import { HALL_SPAN } from './footprint';
import type { TroopKind } from './troops';

/** Visible hall footprint — two grass tiles wide. Height may grow up. */
export const HALL_TILE_FILL = 0.94;

/** Canvas height for painted troops. Idle/walk share this so the cycle does not pop. */
export const TROOP_PAINT_H: Record<TroopKind, number> = {
  warrior: u(48),
  knight: u(56),
};

type ContentBox = { sx: number; sy: number; sw: number; sh: number };

const contentCache = new WeakMap<HTMLImageElement, ContentBox>();

export function hallBillboardSize(contentW: number, contentH: number): { w: number; h: number } {
  const w = TILE * HALL_SPAN * HALL_TILE_FILL;
  const h = w * (contentH / Math.max(1, contentW));
  return { w, h };
}

/** Opaque pixel box. Cached per image so the walk/idle loop does not scan every frame. */
export function spriteContentBox(img: HTMLImageElement): ContentBox {
  const hit = contentCache.get(img);
  if (hit) return hit;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const fallback: ContentBox = { sx: 0, sy: 0, sw: w, sh: h };
  if (typeof document === 'undefined' || w < 1 || h < 1) {
    contentCache.set(img, fallback);
    return fallback;
  }
  try {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      contentCache.set(img, fallback);
      return fallback;
    }
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    let x0 = w;
    let y0 = h;
    let x1 = 0;
    let y1 = 0;
    const thresh = 12;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > thresh) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }
    const pad = 2;
    const box: ContentBox =
      x1 >= x0
        ? {
            sx: Math.max(0, x0 - pad),
            sy: Math.max(0, y0 - pad),
            sw: Math.min(w, x1 - x0 + 1 + pad * 2),
            sh: Math.min(h, y1 - y0 + 1 + pad * 2),
          }
        : fallback;
    contentCache.set(img, box);
    return box;
  } catch {
    contentCache.set(img, fallback);
    return fallback;
  }
}

export function drawHallBillboard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  feetY: number
): void {
  const box = spriteContentBox(img);
  const { w, h } = hallBillboardSize(box.sw, box.sh);
  ctx.drawImage(img, box.sx, box.sy, box.sw, box.sh, -w / 2, -h + feetY, w, h);
}
