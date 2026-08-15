import { COLS, ROWS } from './constants';
import { themeFor } from './themes';
import type { LevelDef } from './levels';

/** Tiny path preview for level cards. Same grid as the real map. */
export function drawLevelThumb(ctx: CanvasRenderingContext2D, level: LevelDef, w: number, h: number): void {
  const theme = themeFor(level);
  const tw = w / COLS;
  const th = h / ROWS;
  ctx.fillStyle = theme.grassA;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = theme.grassB;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if ((c + r) % 2 === 0) ctx.fillRect(c * tw, r * th, tw, th);
    }
  }
  ctx.fillStyle = theme.pathMid;
  for (const p of level.pathTiles) {
    ctx.fillRect(p.c * tw, p.r * th, tw + 0.6, th + 0.6);
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
