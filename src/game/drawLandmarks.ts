import { PX } from './constants';
import type { MapTheme } from './themes';
import type { Vec2 } from '../shared/math';

/** Stone arch at path start, keep at path end. Sit on path tiles — not on grass. */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  waypoints: Vec2[],
  theme: MapTheme,
  time: number,
  spawnHeat: number,
  keepWound = 0,
): void {
  if (waypoints.length < 2) return;
  const spawn = waypoints[0];
  const exit = waypoints[waypoints.length - 1];
  const inAng = Math.atan2(waypoints[1].y - spawn.y, waypoints[1].x - spawn.x);
  const outAng = Math.atan2(exit.y - waypoints[waypoints.length - 2].y, exit.x - waypoints[waypoints.length - 2].x);

  drawSpawnArch(ctx, spawn.x, spawn.y, inAng, theme, time, spawnHeat);
  drawExitKeep(ctx, exit.x, exit.y, outAng, theme, time, keepWound);
}

function drawSpawnArch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  theme: MapTheme,
  time: number,
  heat: number,
): void {
  const pulse = 0.7 + Math.sin(time * 3.2) * 0.15 + heat * 0.55;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);

  const mist = ctx.createRadialGradient(0, 0, 4 * PX, 0, 0, 42 * PX * pulse);
  mist.addColorStop(0, `rgba(180, 220, 255, ${0.28 + heat * 0.45})`);
  mist.addColorStop(1, 'rgba(180, 220, 255, 0)');
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
  ctx.moveTo(2 * PX, -22 * PX);
  ctx.quadraticCurveTo(22 * PX, 0, 2 * PX, 22 * PX);
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
  time: number,
  wound = 0,
): void {
  const pulse = 0.8 + Math.sin(time * 2.4) * 0.12 + wound * 0.35;
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
  ctx.moveTo(-22 * PX, -8 * PX);
  ctx.lineTo(0, -28 * PX);
  ctx.lineTo(22 * PX, -8 * PX);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = theme.canopy;
  ctx.beginPath();
  ctx.moveTo(-16 * PX, -8 * PX);
  ctx.lineTo(0, -22 * PX);
  ctx.lineTo(16 * PX, -8 * PX);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f4d35e';
  ctx.globalAlpha = 0.55 + Math.sin(time * 4) * 0.2;
  ctx.beginPath();
  ctx.arc(0, -18 * PX, 3.2 * PX, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#1a1008';
  ctx.fillRect(-5 * PX, 4 * PX, 10 * PX, 14 * PX);

  ctx.restore();
}
