/** Painted Muster / Chapter troops. Missing PNGs fall back to cream/steel dots. */
import { PX } from './constants';
import { walkFrameIndex } from './enemies';
import { TEX, texReady } from './assets';
import type { Troop } from './troops';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function troopBillboard(tr: Troop): HTMLImageElement | null {
  const sheets = tr.moving ? TEX.troopWalk[tr.kind] : TEX.troopIdle[tr.kind];
  const ready = sheets.filter(texReady);
  if (!ready.length) {
    const fallback = TEX.troopIdle[tr.kind].filter(texReady);
    if (!fallback.length) return null;
    return fallback[walkFrameIndex(tr.bob, fallback.length)];
  }
  return ready[walkFrameIndex(tr.bob, ready.length)];
}

function drawDotTroop(ctx: CanvasRenderingContext2D, tr: Troop): void {
  const { x, y } = tr.pos;
  const r = tr.radius;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.45, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tr.hitFlash > 0.3 ? '#ffffff' : tr.color;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.15, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a2810';
  ctx.lineWidth = 1.4 * PX;
  ctx.stroke();
  ctx.restore();
}

export function drawTroop(ctx: CanvasRenderingContext2D, tr: Troop): void {
  const { x, y } = tr.pos;
  const r = tr.radius;
  const img = troopBillboard(tr);

  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.55, r * 0.95, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  if (img) {
    const h = r * 3.45;
    const w = h * (img.naturalWidth / Math.max(1, img.naturalHeight));
    const flip = Math.cos(tr.facing) < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.drawImage(img, -w / 2, -h + r * 0.5, w, h);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (tr.hitFlash > 0.25) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.65, tr.hitFlash);
      ctx.drawImage(img, -w / 2, -h + r * 0.5, w, h);
    }
    ctx.restore();
  } else {
    drawDotTroop(ctx, tr);
  }

  if (tr.hp < tr.maxHp - 0.2 || tr.hitFlash > 0.12) {
    const bw = Math.max(22, r * 2.2);
    const bh = 5;
    const bx = x - bw / 2;
    const by = y - (img ? r * 2.6 : r) - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, bx, by, bw, bh, 2);
    ctx.fill();
    const pct = Math.max(0, tr.hp / tr.maxHp);
    ctx.fillStyle = pct > 0.45 ? '#57cc99' : pct > 0.2 ? '#f4d35e' : '#ef476f';
    roundRect(ctx, bx, by, Math.max(2, bw * pct), bh, 2);
    ctx.fill();
  }
}
