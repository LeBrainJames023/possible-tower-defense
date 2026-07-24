import type { Enemy } from '../entities';
import { roundRect } from './shapes';

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.7, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

function hpBar(ctx: CanvasRenderingContext2D, e: Enemy, x: number, y: number): void {
  const bw = Math.max(26, e.radius * 2.3);
  const bh = 5;
  const bx = x - bw / 2;
  const by = y - e.radius - 14;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, bx, by, bw, bh, 2);
  ctx.fill();
  const pct = e.hp / e.maxHp;
  ctx.fillStyle = pct > 0.4 ? '#57cc99' : '#ef476f';
  roundRect(ctx, bx, by, bw * pct, bh, 2);
  ctx.fill();
}

function statusRings(ctx: CanvasRenderingContext2D, e: Enemy, x: number, y: number): void {
  if (e.slowMul < 1) {
    ctx.strokeStyle = 'rgba(126, 200, 227, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.burnTimer > 0) {
    ctx.strokeStyle = 'rgba(232, 93, 76, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.poisonTimer > 0) {
    ctx.strokeStyle = 'rgba(107, 203, 119, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function bodyFill(ctx: CanvasRenderingContext2D, e: Enemy, x: number, y: number): void {
  const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, e.radius);
  g.addColorStop(0, e.color);
  g.addColorStop(1, e.colorDark);
  ctx.fillStyle = g;
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, selected: boolean): void {
  const { x, y } = e.pos;
  shadow(ctx, x, y, e.radius);
  bodyFill(ctx, e, x, y);

  switch (e.kind) {
    case 'gnome': {
      ctx.beginPath();
      ctx.arc(x, y + 2, e.radius * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c45c4a';
      ctx.beginPath();
      ctx.moveTo(x, y - e.radius - 4);
      ctx.lineTo(x + e.radius * 0.7, y);
      ctx.lineTo(x - e.radius * 0.7, y);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'orc': {
      ctx.beginPath();
      ctx.arc(x, y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dfefff';
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 2);
      ctx.lineTo(x - 10, y + 8);
      ctx.lineTo(x - 4, y + 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 2);
      ctx.lineTo(x + 10, y + 8);
      ctx.lineTo(x + 4, y + 6);
      ctx.fill();
      ctx.fillStyle = '#1a2018';
      ctx.beginPath();
      ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'zombie': {
      roundRect(ctx, x - e.radius, y - e.radius, e.radius * 2, e.radius * 2, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(40, 60, 30, 0.5)';
      ctx.fillRect(x - 6, y - 4, 4, 8);
      ctx.fillRect(x + 2, y - 2, 5, 6);
      break;
    }
    case 'ghoul': {
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - 3, y - 2, 2, 0, Math.PI * 2);
      ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'skeletonSnake': {
      ctx.lineCap = 'round';
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 4);
      ctx.quadraticCurveTo(x - 4, y - 10, x + 4, y + 2);
      ctx.quadraticCurveTo(x + 10, y + 10, x + 16, y - 2);
      ctx.stroke();
      ctx.strokeStyle = e.colorDark;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#1a1510';
      ctx.beginPath();
      ctx.arc(x + 14, y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef476f';
      ctx.beginPath();
      ctx.arc(x + 15, y - 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'troll': {
      roundRect(ctx, x - e.radius, y - e.radius, e.radius * 2, e.radius * 2.1, 6);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.fillRect(x - 4, y - e.radius - 6, 8, 8);
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(x - 5, y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ghost': {
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(x - e.radius, y);
      ctx.quadraticCurveTo(x - e.radius, y - e.radius * 1.4, x, y - e.radius * 1.2);
      ctx.quadraticCurveTo(x + e.radius, y - e.radius * 1.4, x + e.radius, y);
      ctx.lineTo(x + e.radius * 0.6, y + e.radius);
      ctx.lineTo(x + e.radius * 0.2, y + e.radius * 0.5);
      ctx.lineTo(x - e.radius * 0.2, y + e.radius);
      ctx.lineTo(x - e.radius * 0.6, y + e.radius * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - 4, y - 4, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'necromancer': {
      ctx.beginPath();
      ctx.arc(x, y + 2, e.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1020';
      ctx.beginPath();
      ctx.moveTo(x - e.radius, y - 2);
      ctx.lineTo(x, y - e.radius - 10);
      ctx.lineTo(x + e.radius, y - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c77dff';
      ctx.fillRect(x - 2, y - 4, 4, 14);
      ctx.beginPath();
      ctx.arc(x, y - e.radius - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'wyrm': {
      ctx.beginPath();
      ctx.ellipse(x, y, e.radius * 1.3, e.radius * 0.75, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.beginPath();
      ctx.moveTo(x + e.radius, y - 4);
      ctx.lineTo(x + e.radius + 10, y - 10);
      ctx.lineTo(x + e.radius + 4, y);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'lich': {
      roundRect(ctx, x - e.radius, y - e.radius, e.radius * 2, e.radius * 2, 8);
      ctx.fill();
      ctx.fillStyle = '#1a0a28';
      ctx.beginPath();
      ctx.moveTo(x - e.radius * 0.8, y - e.radius * 0.2);
      ctx.lineTo(x, y - e.radius - 12);
      ctx.lineTo(x + e.radius * 0.8, y - e.radius * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ef476f';
      ctx.beginPath();
      ctx.arc(x - 6, y - 4, 3, 0, Math.PI * 2);
      ctx.arc(x + 6, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c77dff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + 6, 8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
  }

  if (selected) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  statusRings(ctx, e, x, y);
  hpBar(ctx, e, x, y);
}
