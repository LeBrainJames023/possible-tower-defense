import { COLS, ROWS } from './constants';
import { TEX, texReady } from './assets';
import { themeFor } from './themes';
import type { LevelDef } from './levels';

function hash(c: number, r: number, salt = 0): number {
  const n = Math.sin(c * 12.9898 + r * 78.233 + salt * 4.12) * 43758.5453;
  return n - Math.floor(n);
}

/** Tiny path preview for level cards. Forest uses live grass/path tiles, not a checkerboard. */
export function drawLevelThumb(ctx: CanvasRenderingContext2D, level: LevelDef, w: number, h: number): void {
  const theme = themeFor(level);
  const tw = w / COLS;
  const th = h / ROWS;
  const grass = TEX.grassTiles.filter(texReady);
  const pathImgs = TEX.pathTiles.filter(texReady);
  const painted = level.world === 'forest' && grass.length > 0 && pathImgs.length > 0;
  const onPath = new Set(level.pathTiles.map((p) => `${p.c},${p.r}`));

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * tw;
      const y = r * th;
      if (onPath.has(`${c},${r}`)) {
        if (painted) {
          const img = pathImgs[Math.floor(hash(c, r, 5) * pathImgs.length) % pathImgs.length];
          ctx.drawImage(img, x, y, tw + 0.6, th + 0.6);
        } else {
          ctx.fillStyle = theme.pathMid;
          ctx.fillRect(x, y, tw + 0.6, th + 0.6);
        }
      } else if (painted) {
        const img = grass[Math.floor(hash(c, r, 2) * grass.length) % grass.length];
        ctx.drawImage(img, x, y, tw, th);
      } else {
        ctx.fillStyle = hash(c, r, 2) > 0.55 ? theme.grassA : theme.grassB;
        ctx.fillRect(x, y, tw, th);
      }
    }
  }
  const start = level.pathTiles[0];
  const end = level.pathTiles[level.pathTiles.length - 1];
  if (start) {
    ctx.fillStyle = '#9ad0f0';
    ctx.fillRect(start.c * tw, start.r * th, tw, th);
  }
  if (end) {
    ctx.fillStyle = '#ef476f';
    ctx.fillRect(end.c * tw, end.r * th, tw, th);
  }
}

/** Draw now, then again when Forest tiles finish loading so thumbs are not a blank first paint. */
export function paintLevelThumb(canvas: HTMLCanvasElement, level: LevelDef): void {
  const paint = () => {
    const ctx = canvas.getContext('2d');
    if (ctx) drawLevelThumb(ctx, level, canvas.width, canvas.height);
  };
  paint();
  for (const img of [...TEX.grassTiles, ...TEX.pathTiles]) {
    if (img && !img.complete) img.addEventListener('load', paint, { once: true });
  }
}
