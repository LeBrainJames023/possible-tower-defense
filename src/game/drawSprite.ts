import { PX } from './constants';

/** Hard sticker outline. Blur shadows make painted stills mushy. */
export const SPRITE_RIM = 1.5 * PX;
const RIM_INK = 'rgba(12, 8, 6, 0.92)';
const RING: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0.7, 0.7],
  [-0.7, 0.7],
  [0.7, -0.7],
  [-0.7, -0.7],
];

export type SpriteSrc = { sx: number; sy: number; sw: number; sh: number };

function blit(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  src?: SpriteSrc,
): void {
  if (src) ctx.drawImage(img, src.sx, src.sy, src.sw, src.sh, dx, dy, dw, dh);
  else ctx.drawImage(img, dx, dy, dw, dh);
}

/** Dark silhouette ring from the PNG alpha — not a colored ghost. */
export function drawSpriteRim(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  src?: SpriteSrc,
): void {
  ctx.save();
  ctx.shadowColor = RIM_INK;
  ctx.shadowBlur = 0;
  for (const [ox, oy] of RING) {
    ctx.shadowOffsetX = ox * SPRITE_RIM;
    ctx.shadowOffsetY = oy * SPRITE_RIM;
    blit(ctx, img, dx, dy, dw, dh, src);
  }
  ctx.restore();
}

export function drawSticker(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  src?: SpriteSrc,
): void {
  drawSpriteRim(ctx, img, dx, dy, dw, dh, src);
  blit(ctx, img, dx, dy, dw, dh, src);
}
