import { PX } from './constants';
import type { MapTheme } from './themes';
import type { Vec2 } from '../shared/math';
import type { WorldId } from './worlds';
import { TEX, texReady } from './assets';

/** Gate at path start, keep at path end. Sit on path tiles — not on grass. */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  waypoints: Vec2[],
  theme: MapTheme,
  world: WorldId,
  time: number,
  spawnHeat: number,
  keepWound = 0,
): void {
  if (waypoints.length < 2) return;
  const spawn = waypoints[0];
  const exit = waypoints[waypoints.length - 1];
  const inAng = Math.atan2(waypoints[1].y - spawn.y, waypoints[1].x - spawn.x);
  const outAng = Math.atan2(exit.y - waypoints[waypoints.length - 2].y, exit.x - waypoints[waypoints.length - 2].x);

  drawSpawnArch(ctx, spawn.x, spawn.y, inAng, theme, world, time, spawnHeat);
  drawExitKeep(ctx, exit.x, exit.y, outAng, theme, world, time, keepWound);
}

function drawPortalBillboard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  img: HTMLImageElement,
  heat: number,
  tint: string,
  time: number,
  kind: 'in' | 'out',
): void {
  const idle = 0.72 + Math.sin(time * 2.05) * 0.08;
  const pulse = 1 + heat * 0.22 + idle * 0.06;
  const h = 92 * PX * pulse;
  const w = h * (img.naturalWidth / Math.max(1, img.naturalHeight));
  const cx = x;
  const cy = y - h * 0.38;
  const glowR = (58 + heat * 20) * PX * pulse;
  const glow = ctx.createRadialGradient(cx, cy, 6 * PX, cx, cy, glowR);
  glow.addColorStop(0, tint);
  glow.addColorStop(0.45, kind === 'in' ? 'rgba(120, 200, 255, 0.16)' : 'rgba(239, 71, 111, 0.16)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  const ringColor =
    kind === 'in' ? `rgba(140, 220, 255, ${0.55 + heat * 0.35})` : `rgba(255, 120, 140, ${0.55 + heat * 0.35})`;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.7);
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3.2 * PX;
  ctx.setLineDash([10 * PX, 8 * PX]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 30 * PX * pulse, 18 * PX * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.rotate(-time * 1.55);
  ctx.strokeStyle = kind === 'in' ? `rgba(220, 250, 255, ${0.4 + idle * 0.25})` : `rgba(255, 200, 190, ${0.4 + idle * 0.25})`;
  ctx.lineWidth = 2.2 * PX;
  ctx.setLineDash([6 * PX, 10 * PX]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 22 * PX * pulse, 13 * PX * pulse, 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.drawImage(img, x - w / 2, y - h + 18 * PX, w, h);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-time * 1.15);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.28 + heat * 0.22 + idle * 0.12;
  const swirl = ctx.createRadialGradient(0, 0, 2 * PX, 0, 0, 16 * PX * pulse);
  swirl.addColorStop(0, kind === 'in' ? 'rgba(180, 240, 255, 0.9)' : 'rgba(255, 170, 150, 0.9)');
  swirl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = swirl;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 * PX * pulse, 10 * PX * pulse, time * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpawnArch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  theme: MapTheme,
  world: WorldId,
  time: number,
  heat: number,
): void {
  const pulse = 0.7 + Math.sin(time * 3.2) * 0.15 + heat * 0.55;
  if (texReady(TEX.portalIn)) {
    drawPortalBillboard(ctx, x, y, TEX.portalIn, Math.max(heat, 0.2), `rgba(120, 200, 255, ${0.42 + heat * 0.35})`, time, 'in');
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);

  const mistA = 0.28 + heat * 0.45;
  const mistTint: Record<WorldId, string> = {
    forest: `rgba(180, 220, 255, ${mistA})`,
    desert: `rgba(232, 180, 60, ${mistA})`,
    ice: `rgba(180, 230, 255, ${mistA})`,
    fire: `rgba(255, 100, 40, ${mistA})`,
    hollow: `rgba(200, 100, 255, ${mistA})`,
  };
  const mist = ctx.createRadialGradient(0, 0, 4 * PX, 0, 0, 42 * PX * pulse);
  mist.addColorStop(0, mistTint[world]);
  mist.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = mist;
  ctx.beginPath();
  ctx.arc(0, 0, 42 * PX * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.pathEdge;
  ctx.fillRect(-8 * PX, -26 * PX, 18 * PX, 9 * PX);
  ctx.fillRect(-8 * PX, 17 * PX, 18 * PX, 9 * PX);
  ctx.fillStyle = theme.pathMid;
  ctx.fillRect(-5 * PX, -23 * PX, 12 * PX, 5 * PX);
  ctx.fillRect(-5 * PX, 20 * PX, 12 * PX, 5 * PX);

  ctx.strokeStyle = theme.pebble;
  ctx.lineWidth = 5 * PX;
  ctx.beginPath();
  if (world === 'hollow') {
    ctx.moveTo(4 * PX, -20 * PX);
    ctx.lineTo(18 * PX, -8 * PX);
    ctx.lineTo(18 * PX, 8 * PX);
    ctx.lineTo(4 * PX, 20 * PX);
  } else if (world === 'fire') {
    ctx.moveTo(2 * PX, -22 * PX);
    ctx.lineTo(16 * PX, -10 * PX);
    ctx.lineTo(10 * PX, 0);
    ctx.lineTo(18 * PX, 12 * PX);
    ctx.lineTo(2 * PX, 22 * PX);
  } else if (world === 'ice') {
    ctx.moveTo(2 * PX, -24 * PX);
    ctx.lineTo(20 * PX, 0);
    ctx.lineTo(2 * PX, 24 * PX);
  } else if (world === 'desert') {
    ctx.moveTo(2 * PX, -18 * PX);
    ctx.lineTo(20 * PX, -6 * PX);
    ctx.lineTo(20 * PX, 6 * PX);
    ctx.lineTo(2 * PX, 18 * PX);
  } else {
    ctx.moveTo(2 * PX, -22 * PX);
    ctx.quadraticCurveTo(22 * PX, 0, 2 * PX, 22 * PX);
  }
  ctx.stroke();
  ctx.strokeStyle = theme.glow;
  ctx.lineWidth = 2.4 * PX;
  ctx.stroke();

  ctx.restore();
}

function drawExitKeep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  theme: MapTheme,
  world: WorldId,
  time: number,
  wound = 0,
): void {
  const pulse = 0.8 + Math.sin(time * 2.4) * 0.12 + wound * 0.35;
  if (texReady(TEX.portalOut)) {
    drawPortalBillboard(
      ctx,
      x,
      y,
      TEX.portalOut,
      Math.max(wound, 0.22),
      `rgba(239, 71, 111, ${0.48 + wound * 0.4})`,
      time,
      'out',
    );
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);

  const warn = ctx.createRadialGradient(0, 0, 4 * PX, 0, 0, 40 * PX * pulse);
  warn.addColorStop(0, `rgba(239, 71, 111, ${0.35 + wound * 0.45})`);
  warn.addColorStop(1, 'rgba(239, 71, 111, 0)');
  ctx.fillStyle = warn;
  ctx.beginPath();
  ctx.arc(0, 0, 40 * PX * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 18 * PX, 22 * PX, 6 * PX, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = theme.pathEdge;
  ctx.fillRect(-18 * PX, -8 * PX, 36 * PX, 26 * PX);
  ctx.fillStyle = theme.pathMid;
  ctx.fillRect(-14 * PX, -4 * PX, 28 * PX, 18 * PX);

  ctx.fillStyle = theme.canopyDark;
  ctx.beginPath();
  if (world === 'desert') {
    ctx.rect(-22 * PX, -18 * PX, 44 * PX, 10 * PX);
  } else if (world === 'ice') {
    ctx.moveTo(-14 * PX, -8 * PX);
    ctx.lineTo(0, -34 * PX);
    ctx.lineTo(14 * PX, -8 * PX);
  } else if (world === 'fire') {
    ctx.moveTo(-22 * PX, -8 * PX);
    ctx.lineTo(-8 * PX, -20 * PX);
    ctx.lineTo(4 * PX, -12 * PX);
    ctx.lineTo(22 * PX, -22 * PX);
    ctx.lineTo(22 * PX, -8 * PX);
  } else if (world === 'hollow') {
    ctx.rect(-10 * PX, -32 * PX, 20 * PX, 24 * PX);
  } else {
    ctx.moveTo(-22 * PX, -8 * PX);
    ctx.lineTo(0, -28 * PX);
    ctx.lineTo(22 * PX, -8 * PX);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = theme.canopy;
  ctx.beginPath();
  if (world === 'desert') {
    ctx.rect(-16 * PX, -16 * PX, 32 * PX, 8 * PX);
  } else if (world === 'hollow') {
    ctx.rect(-7 * PX, -28 * PX, 14 * PX, 16 * PX);
  } else {
    ctx.moveTo(-16 * PX, -8 * PX);
    ctx.lineTo(0, -22 * PX);
    ctx.lineTo(16 * PX, -8 * PX);
  }
  ctx.closePath();
  ctx.fill();

  const jewelY: Record<WorldId, number> = {
    forest: -18,
    desert: -14,
    ice: -28,
    fire: -16,
    hollow: -26,
  };
  ctx.fillStyle = '#f4d35e';
  ctx.globalAlpha = 0.55 + Math.sin(time * 4) * 0.2;
  ctx.beginPath();
  ctx.arc(0, jewelY[world] * PX, 3.2 * PX, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#1a1008';
  ctx.fillRect(-5 * PX, 4 * PX, 10 * PX, 14 * PX);

  ctx.restore();
}
