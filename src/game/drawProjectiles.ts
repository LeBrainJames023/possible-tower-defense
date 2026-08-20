import type { BeamFx, Projectile } from './entities';
import { PX } from './constants';
import { TEX, texReady } from './assets';

/** In-flight shots. Splash rings live in fx.ts and use each tower's splash radius. */
const SHOT_SIZE: Record<Projectile['kind'], number> = {
  arrow: 22,
  cannon: 48,
  ice: 38,
  lightning: 40,
  fire: 42,
  poison: 40,
};

export function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile): void {
  const x = p.x;
  const y = p.visualY();
  const ang = Math.atan2(p.vy, p.vx || 1);
  const flick = 0.65 + Math.sin(p.age * 22) * 0.35;
  const shot = TEX.projectiles[p.kind];
  if (texReady(shot)) {
    const h = SHOT_SIZE[p.kind] * PX;
    const w = h * (shot.naturalWidth / Math.max(1, shot.naturalHeight));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + Math.PI);
    ctx.drawImage(shot, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(PX, PX);

  if (p.kind !== 'lightning') drawStreak(ctx, p.kind, p.color, p.age);

  switch (p.kind) {
    case 'arrow':
      drawArrow(ctx, p.color);
      break;
    case 'cannon':
      drawCannonball(ctx, p.color, p.age);
      break;
    case 'ice':
      ctx.rotate(p.age * 8);
      drawIceShard(ctx, p.color, p.age);
      break;
    case 'fire':
      drawFireball(ctx, p.color, flick);
      break;
    case 'poison':
      drawVenom(ctx, p.color, p.age);
      break;
    case 'lightning':
      drawSpark(ctx, p.color, p.age);
      break;
    default:
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function drawStreak(ctx: CanvasRenderingContext2D, kind: Projectile['kind'], color: string, age: number): void {
  const a = 0.22 + Math.sin(age * 18) * 0.08;
  ctx.strokeStyle = color;
  ctx.globalAlpha = a;
  ctx.lineCap = 'round';
  if (kind === 'arrow') {
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-8, 0);
    ctx.stroke();
  } else if (kind === 'cannon') {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-6, 0);
    ctx.stroke();
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = '#6a5340';
    ctx.beginPath();
    ctx.arc(-14, 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'ice') {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-4, 0);
    ctx.stroke();
  } else if (kind === 'fire') {
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-2, 0);
    ctx.stroke();
  } else if (kind === 'poison') {
    ctx.lineWidth = 3;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.lineTo(-3, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
}

function drawSpark(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  ctx.strokeStyle = '#fff8d0';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-8, Math.sin(age * 40) * 3);
  ctx.lineTo(-2, -4);
  ctx.lineTo(2, 3);
  ctx.lineTo(9, 0);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawArrow(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.strokeStyle = 'rgba(40, 28, 16, 0.55)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(6, 0);
  ctx.stroke();
  ctx.strokeStyle = '#c4a06a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(6, 0);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-20, -3.4);
  ctx.lineTo(-17, 0);
  ctx.lineTo(-20, 3.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8ec8f0';
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-19, -2.2);
  ctx.lineTo(-19, 2.2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e8f4ff';
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(5, -4.2);
  ctx.lineTo(7, 0);
  ctx.lineTo(5, 4.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe9a0';
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(8, -2.2);
  ctx.lineTo(8, 2.2);
  ctx.closePath();
  ctx.fill();
}

function drawCannonball(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 11, 8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const iron = ctx.createRadialGradient(-2.5, -2.5, 1, 0, 0, 9);
  iron.addColorStop(0, '#6a5a4a');
  iron.addColorStop(0.45, color);
  iron.addColorStop(1, '#1a1008');
  ctx.fillStyle = iron;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 12, 8, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 220, 160, 0.45)';
  ctx.beginPath();
  ctx.arc(-2.4, -2.6, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a2010';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(5.4, -4.6);
  ctx.lineTo(9.2, -8.4);
  ctx.stroke();
  const spark = 0.4 + Math.sin(age * 28) * 0.4;
  ctx.fillStyle = `rgba(255, 180, 60, ${spark})`;
  ctx.beginPath();
  ctx.arc(9.4, -8.6, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceShard(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  ctx.fillStyle = 'rgba(180, 240, 255, 0.28)';
  ctx.beginPath();
  ctx.ellipse(-2, 0, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e8fbff';
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(1, 5.5);
  ctx.lineTo(-10, 1.5);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-10, -1.5);
  ctx.lineTo(1, -5.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.moveTo(6, -0.6);
  ctx.lineTo(-2, 1.4);
  ctx.lineTo(-1, -1.8);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.45 + Math.sin(age * 16) * 0.2;
  ctx.fillStyle = '#c8f4ff';
  ctx.beginPath();
  ctx.moveTo(-8, 4);
  ctx.lineTo(-12, 6);
  ctx.lineTo(-9, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFireball(ctx: CanvasRenderingContext2D, color: string, flick: number): void {
  const glow = ctx.createRadialGradient(2, 0, 1, 0, 0, 14);
  glow.addColorStop(0, `rgba(255, 230, 120, ${0.35 * flick})`);
  glow.addColorStop(0.5, `${color}55`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(11, 0);
  ctx.quadraticCurveTo(2, 8 * flick, -12, 2);
  ctx.quadraticCurveTo(-6, 0, -12, -2);
  ctx.quadraticCurveTo(2, -8 * flick, 11, 0);
  ctx.fill();

  ctx.fillStyle = '#ffb14a';
  ctx.beginPath();
  ctx.ellipse(2, 0, 5.5, 3.6 * flick, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3c0';
  ctx.beginPath();
  ctx.arc(3.2, -0.4, 2.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawVenom(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const wob = Math.sin(age * 14) * 1.3;
  ctx.fillStyle = `${color}66`;
  ctx.beginPath();
  ctx.ellipse(0, 1, 8 + wob, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 6.4 + wob * 0.4, 5.1 - wob * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b6f5c0';
  ctx.beginPath();
  ctx.ellipse(1.2, 2.4, 3.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(-1.8, -1.6, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-5.5, 5 + Math.sin(age * 10), 1.4, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-8.5, 2 + Math.sin(age * 13 + 1), 1.1, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBeams(ctx: CanvasRenderingContext2D, beams: BeamFx[]): void {
  for (const b of beams) {
    const a = Math.min(1, b.life / (b.maxLife || 0.18));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pts = b.points.length >= 2 ? b.points : [
      { x: b.x1, y: b.y1 },
      { x: b.x2, y: b.y2 },
    ];

    ctx.globalAlpha = a * 0.22;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = (b.width || 3) * 5.2 * PX;
    strokePts(ctx, pts);

    ctx.globalAlpha = a * 0.55;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = (b.width || 3) * 2.4 * PX;
    strokePts(ctx, pts);

    ctx.globalAlpha = a;
    ctx.strokeStyle = '#fff8d0';
    ctx.lineWidth = (b.width || 3) * 0.9 * PX;
    strokePts(ctx, pts);

    ctx.fillStyle = '#fff';
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(b.x2, b.y2, (5 + (1 - a) * 8) * PX, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = b.color;
    ctx.globalAlpha = a * 0.7;
    ctx.beginPath();
    ctx.arc(b.x1, b.y1, 3.2 * PX, 0, Math.PI * 2);
    ctx.fill();

    const bolt = TEX.projectiles.lightning;
    if (texReady(bolt)) {
      const mx = (b.x1 + b.x2) / 2;
      const my = (b.y1 + b.y2) / 2;
      const ang = Math.atan2(b.y2 - b.y1, b.x2 - b.x1);
      const h = 26 * PX;
      const w = h * (bolt.naturalWidth / Math.max(1, bolt.naturalHeight));
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(ang + Math.PI);
      ctx.globalAlpha = a;
      ctx.drawImage(bolt, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

function strokePts(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}
