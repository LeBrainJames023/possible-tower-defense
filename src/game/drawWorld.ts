import { PX, TILE } from './constants';
import { TEX, texReady } from './assets';
import type { MapTheme } from './themes';
import type { WorldId } from './worlds';

function hash(c: number, r: number, salt = 0): number {
  const n = Math.sin(c * 12.9898 + r * 78.233 + salt * 4.12) * 43758.5453;
  return n - Math.floor(n);
}

/** Ground marks on grass tiles. Forest keeps blades; other worlds get their own dirt. */
export function drawWorldGround(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  world: WorldId,
  x: number,
  y: number,
  c: number,
  r: number,
  time: number,
): void {
  if (world === 'forest') {
    ctx.strokeStyle = theme.blade;
    ctx.lineWidth = 1.15 * PX;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const hx = hash(c, r, i);
      const hy = hash(c, r, i + 9);
      const px = x + 5 * PX + hx * (TILE - 10 * PX);
      const py = y + 10 * PX + hy * (TILE - 16 * PX);
      ctx.moveTo(px, py);
      ctx.lineTo(px + 1.6 * PX, py - (6 + hy * 5) * PX);
    }
    ctx.stroke();
    return;
  }

  if (world === 'desert') {
    ctx.fillStyle = theme.pebble;
    for (let i = 0; i < 7; i++) {
      const hx = hash(c, r, i);
      ctx.globalAlpha = 0.18 + hx * 0.35;
      ctx.beginPath();
      ctx.arc(
        x + 6 * PX + hx * (TILE - 12 * PX),
        y + 6 * PX + hash(c, r, i + 11) * (TILE - 12 * PX),
        (0.8 + hash(c, r, i + 3) * 1.6) * PX,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (world === 'ice') {
    ctx.strokeStyle = 'rgba(230, 245, 255, 0.35)';
    ctx.lineWidth = 1.1 * PX;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const hx = hash(c, r, i);
      const hy = hash(c, r, i + 8);
      const px = x + 8 * PX + hx * (TILE - 16 * PX);
      const py = y + 8 * PX + hy * (TILE - 16 * PX);
      ctx.moveTo(px, py);
      ctx.lineTo(px + 8 * PX, py + 3 * PX);
    }
    ctx.stroke();
    const twinkle = 0.15 + Math.abs(Math.sin(time * 2 + c * 0.7 + r)) * 0.35;
    ctx.fillStyle = `rgba(220, 245, 255, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(x + 16 * PX + hash(c, r, 20) * 20 * PX, y + 14 * PX + hash(c, r, 21) * 20 * PX, 1.6 * PX, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (world === 'fire') {
    ctx.strokeStyle = 'rgba(20, 8, 4, 0.45)';
    ctx.lineWidth = 1.2 * PX;
    ctx.beginPath();
    ctx.moveTo(x + 8 * PX, y + 20 * PX);
    ctx.lineTo(x + 28 * PX, y + 36 * PX);
    ctx.moveTo(x + 20 * PX, y + 10 * PX);
    ctx.lineTo(x + 44 * PX, y + 22 * PX);
    ctx.stroke();
    const glow = 0.12 + Math.abs(Math.sin(time * 3 + r)) * 0.2;
    ctx.fillStyle = `rgba(255, 90, 30, ${glow})`;
    ctx.beginPath();
    ctx.arc(x + 12 * PX + hash(c, r, 5) * 36 * PX, y + 14 * PX + hash(c, r, 6) * 30 * PX, 2 * PX, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = theme.pebble;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.2 + hash(c, r, i) * 0.25;
    const px = x + 10 * PX + hash(c, r, i + 2) * (TILE - 20 * PX);
    const py = y + 10 * PX + hash(c, r, i + 4) * (TILE - 20 * PX);
    ctx.fillRect(px, py, 3 * PX, 5 * PX);
  }
  ctx.globalAlpha = 1;
}

/** Path extras after the shared dirt stamp. */
export function drawWorldPath(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  world: WorldId,
  x: number,
  y: number,
  time: number,
): void {
  if (world === 'fire') {
    const pulse = 0.1 + Math.abs(Math.sin(time * 2.2 + x * 0.01)) * 0.16;
    ctx.fillStyle = `rgba(255, 80, 20, ${pulse})`;
    ctx.fillRect(x + 6 * PX, y + 22 * PX, TILE - 12 * PX, 6 * PX);
    return;
  }
  if (world === 'hollow') {
    ctx.strokeStyle = theme.glow;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1.4 * PX;
    ctx.beginPath();
    ctx.moveTo(x + 8 * PX, y + 18 * PX);
    ctx.lineTo(x + 22 * PX, y + 28 * PX);
    ctx.lineTo(x + 40 * PX, y + 20 * PX);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** Blocked tiles: tree, cactus, crystal, lava rock, rune stone. */
export function drawWorldDecor(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  world: WorldId,
  cx: number,
  cy: number,
  c: number,
  r: number,
  time: number,
): void {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 16 * PX, 16 * PX, 5.5 * PX, 0, 0, Math.PI * 2);
  ctx.fill();

  if (world === 'forest') {
    drawForestTree(ctx, theme, cx, cy, c, r);
    return;
  }
  if (world === 'desert') {
    drawCactus(ctx, theme, cx, cy, c, r);
    return;
  }
  if (world === 'ice') {
    drawCrystal(ctx, theme, cx, cy, c, r, time);
    return;
  }
  if (world === 'fire') {
    drawLavaRock(ctx, theme, cx, cy, c, r, time);
    return;
  }
  drawRuneStone(ctx, theme, cx, cy, c, r, time);
}

function drawForestTree(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  cx: number,
  cy: number,
  c: number,
  r: number,
): void {
  const painted = TEX.trees.filter(texReady);
  if (painted.length) {
    const img = painted[Math.floor(hash(c, r, 7) * painted.length) % painted.length];
    const scale = 1.15 + hash(c, r, 8) * 0.28;
    const tw = TILE * 1.15 * scale;
    const th = TILE * 1.55 * scale;
    ctx.drawImage(img, cx - tw / 2, cy - th + 18 * PX, tw, th);
    return;
  }
  if (texReady(TEX.tree)) {
    const tw = TILE * 1.2;
    const th = TILE * 1.45;
    ctx.drawImage(TEX.tree, cx - tw / 2, cy - th + 18 * PX, tw, th);
    return;
  }
  const lean = (hash(c, r, 1) - 0.5) * 8 * PX;
  ctx.fillStyle = theme.trunk;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * PX + lean, cy + 16 * PX);
  ctx.lineTo(cx + 4 * PX + lean, cy + 16 * PX);
  ctx.lineTo(cx + 2.5 * PX, cy - 5 * PX);
  ctx.lineTo(cx - 2.5 * PX, cy - 5 * PX);
  ctx.closePath();
  ctx.fill();
  const canopy = ctx.createRadialGradient(cx - 4 * PX, cy - 14 * PX, 2 * PX, cx, cy - 5 * PX, 24 * PX);
  canopy.addColorStop(0, theme.canopy);
  canopy.addColorStop(1, theme.canopyDark);
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 26 * PX);
  ctx.lineTo(cx + 21 * PX, cy - 2 * PX);
  ctx.lineTo(cx + 10 * PX, cy + 3 * PX);
  ctx.lineTo(cx - 10 * PX, cy + 3 * PX);
  ctx.lineTo(cx - 21 * PX, cy - 2 * PX);
  ctx.closePath();
  ctx.fill();
}

function drawCactus(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  cx: number,
  cy: number,
  c: number,
  r: number,
): void {
  const h = (22 + hash(c, r, 2) * 8) * PX;
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath();
  ctx.roundRect(cx - 5 * PX, cy + 16 * PX - h, 10 * PX, h, 4 * PX);
  ctx.fill();
  ctx.fillStyle = '#2a5a2c';
  ctx.beginPath();
  ctx.roundRect(cx + 4 * PX, cy - 2 * PX, 12 * PX, 6 * PX, 3 * PX);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx - 14 * PX, cy + 4 * PX, 10 * PX, 6 * PX, 3 * PX);
  ctx.fill();
  ctx.fillStyle = theme.canopy;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(cx - 3 * PX, cy + 16 * PX - h + 4 * PX, 2 * PX, h - 10 * PX);
  ctx.globalAlpha = 1;
}

function drawCrystal(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  cx: number,
  cy: number,
  c: number,
  r: number,
  time: number,
): void {
  const h = (26 + hash(c, r, 3) * 8) * PX;
  const glow = ctx.createLinearGradient(cx, cy + 16 * PX - h, cx, cy + 16 * PX);
  glow.addColorStop(0, '#e8f6ff');
  glow.addColorStop(1, theme.canopyDark);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 16 * PX - h);
  ctx.lineTo(cx + 11 * PX, cy + 4 * PX);
  ctx.lineTo(cx + 5 * PX, cy + 16 * PX);
  ctx.lineTo(cx - 5 * PX, cy + 16 * PX);
  ctx.lineTo(cx - 11 * PX, cy + 4 * PX);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(220, 245, 255, ${0.45 + Math.sin(time * 2.4 + c) * 0.2})`;
  ctx.lineWidth = 1.6 * PX;
  ctx.stroke();
}

function drawLavaRock(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  cx: number,
  cy: number,
  _c: number,
  r: number,
  time: number,
): void {
  ctx.fillStyle = theme.trunk;
  ctx.beginPath();
  ctx.moveTo(cx - 16 * PX, cy + 12 * PX);
  ctx.lineTo(cx - 6 * PX, cy - 8 * PX);
  ctx.lineTo(cx + 8 * PX, cy - 4 * PX);
  ctx.lineTo(cx + 16 * PX, cy + 10 * PX);
  ctx.lineTo(cx + 4 * PX, cy + 16 * PX);
  ctx.lineTo(cx - 10 * PX, cy + 16 * PX);
  ctx.closePath();
  ctx.fill();
  const pulse = 0.35 + Math.abs(Math.sin(time * 3 + r)) * 0.4;
  ctx.fillStyle = `rgba(255, 90, 20, ${pulse})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4 * PX, 7 * PX, 4 * PX, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRuneStone(
  ctx: CanvasRenderingContext2D,
  theme: MapTheme,
  cx: number,
  cy: number,
  c: number,
  _r: number,
  time: number,
): void {
  ctx.fillStyle = theme.trunk;
  ctx.beginPath();
  ctx.roundRect(cx - 8 * PX, cy - 18 * PX, 16 * PX, 36 * PX, 4 * PX);
  ctx.fill();
  ctx.fillStyle = theme.canopyDark;
  ctx.fillRect(cx - 6 * PX, cy - 14 * PX, 12 * PX, 28 * PX);
  const pulse = 0.45 + Math.sin(time * 2.6 + c * 0.4) * 0.25;
  ctx.strokeStyle = `rgba(200, 120, 255, ${pulse})`;
  ctx.lineWidth = 2 * PX;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * PX, cy - 8 * PX);
  ctx.lineTo(cx + 3 * PX, cy - 2 * PX);
  ctx.lineTo(cx - 2 * PX, cy + 6 * PX);
  ctx.lineTo(cx + 4 * PX, cy + 10 * PX);
  ctx.stroke();
}
