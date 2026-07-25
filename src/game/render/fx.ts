import { COLS, TILE } from '../constants';
import type { BeamFx, FloatingText, Particle, Projectile } from '../entities';

export function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile): void {
  const angle = Math.atan2(p.y - p.py, p.x - p.px) || 0;

  switch (p.towerKind) {
    case 'arrow': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(-12, -2, 18, 4);
      ctx.fillStyle = '#c9a66b';
      ctx.fillRect(-11, -1.2, 16, 2.4);
      ctx.fillStyle = '#eef4ff';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(2, -5);
      ctx.lineTo(2, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5b9fd4';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-17, -4);
      ctx.lineTo(-14, 0);
      ctx.lineTo(-17, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'cannon': {
      ctx.fillStyle = 'rgba(80, 70, 60, 0.4)';
      ctx.beginPath();
      ctx.arc(p.px, p.py, 5, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createRadialGradient(p.x - 1, p.y - 1, 1, p.x, p.y, 7);
      g.addColorStop(0, '#5a5048');
      g.addColorStop(1, '#12100e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,220,160,0.25)';
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ice': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle + Math.PI / 4);
      ctx.fillStyle = '#e8f7ff';
      ctx.strokeStyle = '#7ec8e3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = 'rgba(126, 200, 227, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      break;
    }
    case 'fire': {
      const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 10);
      g.addColorStop(0, '#fff3a0');
      g.addColorStop(0.35, '#ff8c42');
      g.addColorStop(1, 'rgba(232, 93, 76, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e85d4c';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'poison': {
      ctx.fillStyle = 'rgba(61, 255, 138, 0.35)';
      ctx.beginPath();
      ctx.arc(p.px, p.py, 4, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createRadialGradient(p.x - 1, p.y - 1, 1, p.x, p.y, 6);
      g.addColorStop(0, '#b8ff90');
      g.addColorStop(1, '#1f8a40');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(220, 255, 230, 0.8)';
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawBeams(ctx: CanvasRenderingContext2D, beams: BeamFx[]): void {
  for (const b of beams) {
    const alpha = Math.min(1, b.life * 4);
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    // jagged bolt
    const mx = (b.x1 + b.x2) / 2 + (Math.random() - 0.5) * 12;
    const my = (b.y1 + b.y2) / 2 + (Math.random() - 0.5) * 12;
    ctx.lineTo(mx, my);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fffbe6';
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(mx, my);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    ctx.globalAlpha = Math.max(0, t);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawFloating(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px DM Sans, sans-serif';
  for (const t of texts) {
    ctx.globalAlpha = Math.min(1, t.life);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
  }
}

export function drawPausedBanner(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(7, 16, 24, 0.35)';
  ctx.fillRect(0, 0, COLS * TILE, 36);
  ctx.fillStyle = '#f4d35e';
  ctx.font = 'bold 16px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED — click enemies or towers to inspect', (COLS * TILE) / 2, 24);
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 60 * dt;
  }
  return particles.filter((p) => p.life > 0);
}
