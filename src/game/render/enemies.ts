import type { Enemy } from '../entities';
import { roundRect } from './shapes';

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.75, r * 1.05, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
}

function hpBar(ctx: CanvasRenderingContext2D, e: Enemy, x: number, y: number): void {
  const bw = Math.max(28, e.radius * 2.4);
  const bh = 5;
  const bx = x - bw / 2;
  const by = y - e.radius - 16;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  roundRect(ctx, bx, by, bw, bh, 2);
  ctx.fill();
  const pct = e.hp / e.maxHp;
  ctx.fillStyle = pct > 0.4 ? '#57cc99' : '#ef476f';
  roundRect(ctx, bx, by, bw * pct, bh, 2);
  ctx.fill();
}

function statusRings(ctx: CanvasRenderingContext2D, e: Enemy, x: number, y: number): void {
  if (e.slowMul < 1) {
    ctx.strokeStyle = 'rgba(126, 200, 227, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.burnTimer > 0) {
    ctx.strokeStyle = 'rgba(232, 93, 76, 0.95)';
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.poisonTimer > 0) {
    ctx.strokeStyle = 'rgba(107, 203, 119, 0.95)';
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.curseTimer > 0) {
    ctx.strokeStyle = 'rgba(155, 93, 229, 0.95)';
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.armorShred > 0) {
    ctx.strokeStyle = 'rgba(247, 231, 160, 0.9)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(x, y, e.radius + 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function bodyFill(ctx: CanvasRenderingContext2D, e: Enemy, x: number, y: number): void {
  const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, e.radius);
  g.addColorStop(0, e.color);
  g.addColorStop(1, e.colorDark);
  ctx.fillStyle = g;
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, selected: boolean): void {
  const drawY = e.flying ? e.pos.y - 14 : e.pos.y;
  const { x } = e.pos;
  const y = drawY;
  const r = e.radius;
  // Ground shadow (flyers cast a lower shadow)
  shadow(ctx, e.pos.x, e.pos.y, e.flying ? r * 0.7 : r);
  bodyFill(ctx, e, x, y);

  switch (e.kind) {
    case 'gnome': {
      // Round body + pointed red cap + belt
      ctx.beginPath();
      ctx.arc(x, y + 3, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.accent;
      ctx.beginPath();
      ctx.moveTo(x, y - r - 6);
      ctx.lineTo(x + r * 0.85, y + 2);
      ctx.lineTo(x - r * 0.85, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y - r - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a2010';
      ctx.fillRect(x - r * 0.7, y + 4, r * 1.4, 3);
      ctx.fillStyle = '#1a2018';
      ctx.beginPath();
      ctx.arc(x - 3, y + 1, 1.8, 0, Math.PI * 2);
      ctx.arc(x + 3, y + 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'orc': {
      // Broad green head, tusks, brow ridge
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.05, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.beginPath();
      ctx.ellipse(x, y - 4, r * 0.85, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0f4f8';
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 3);
      ctx.lineTo(x - 12, y + 10);
      ctx.lineTo(x - 4, y + 7);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 3);
      ctx.lineTo(x + 12, y + 10);
      ctx.lineTo(x + 4, y + 7);
      ctx.fill();
      ctx.fillStyle = '#1a2010';
      ctx.beginPath();
      ctx.arc(x - 5, y - 1, 2.4, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 1, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.accent;
      ctx.beginPath();
      ctx.arc(x - 5, y - 1, 1, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 1, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'zombie': {
      // Lopsided torso, torn shoulder, vacant eyes
      roundRect(ctx, x - r, y - r * 0.9, r * 2, r * 2, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(40, 60, 30, 0.55)';
      ctx.fillRect(x - 8, y - 6, 5, 10);
      ctx.fillRect(x + 3, y - 2, 7, 8);
      ctx.fillStyle = '#c8e0a0';
      ctx.beginPath();
      ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a2010';
      ctx.fillRect(x - 5, y - 5, 2, 2);
      ctx.fillRect(x + 4, y - 4, 2, 2);
      break;
    }
    case 'ghoul': {
      // Hunched violet pack creature, claws
      ctx.beginPath();
      ctx.ellipse(x, y + 2, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.beginPath();
      ctx.arc(x - r * 0.6, y + 6, 4, 0, Math.PI * 2);
      ctx.arc(x + r * 0.6, y + 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - 4, y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1020';
      ctx.beginPath();
      ctx.arc(x - 4, y - 2, 1.2, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'skeletonSnake': {
      // Segmented bone coil + skull head
      ctx.lineCap = 'round';
      ctx.strokeStyle = e.colorDark;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 6);
      ctx.quadraticCurveTo(x - 6, y - 12, x + 4, y + 4);
      ctx.quadraticCurveTo(x + 12, y + 12, x + 18, y - 2);
      ctx.stroke();
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 5;
      ctx.stroke();
      // Bone rings
      ctx.strokeStyle = 'rgba(40,30,20,0.5)';
      ctx.lineWidth = 1.5;
      for (const t of [0.25, 0.5, 0.75]) {
        const px = x - 16 + 34 * t;
        const py = y + Math.sin(t * Math.PI * 2) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#f0e8d8';
      ctx.beginPath();
      ctx.arc(x + 16, y - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1510';
      ctx.beginPath();
      ctx.arc(x + 14, y - 5, 1.8, 0, Math.PI * 2);
      ctx.arc(x + 18, y - 5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'troll': {
      // Huge slab, club arm, tiny angry eyes
      roundRect(ctx, x - r, y - r, r * 2, r * 2.15, 7);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.fillRect(x + r * 0.55, y - 4, 10, r * 1.2);
      ctx.beginPath();
      ctx.arc(x + r * 0.55 + 5, y + r * 0.9, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(x - 6, y - 4, 3, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1008';
      ctx.beginPath();
      ctx.arc(x - 6, y - 4, 1.4, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 4, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ghost': {
      // Wavy sheet, hollow eyes, translucent
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.quadraticCurveTo(x - r, y - r * 1.5, x, y - r * 1.3);
      ctx.quadraticCurveTo(x + r, y - r * 1.5, x + r, y);
      ctx.lineTo(x + r * 0.7, y + r);
      ctx.lineTo(x + r * 0.25, y + r * 0.45);
      ctx.lineTo(x - r * 0.15, y + r);
      ctx.lineTo(x - r * 0.55, y + r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x - 5, y - 5, 3, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a3040';
      ctx.beginPath();
      ctx.arc(x - 5, y - 5, 1.4, 0, Math.PI * 2);
      ctx.arc(x + 5, y - 5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'necromancer': {
      // Robed figure + staff + glowing skull
      ctx.beginPath();
      ctx.arc(x, y + 4, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1028';
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x, y - r - 12);
      ctx.lineTo(x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c77dff';
      ctx.fillRect(x + r * 0.5, y - 8, 3, 22);
      ctx.beginPath();
      ctx.arc(x + r * 0.5 + 1.5, y - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0e8ff';
      ctx.beginPath();
      ctx.arc(x, y - r - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef476f';
      ctx.beginPath();
      ctx.arc(x - 2, y - r - 5, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 2, y - r - 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'wyrm': {
      // Winged serpent body
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.35, r * 0.7, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 4);
      ctx.lineTo(x - 18, y - 14);
      ctx.lineTo(x - 2, y + 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 2);
      ctx.lineTo(x + 16, y - 12);
      ctx.lineTo(x + 6, y + 4);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(x + 8, y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff8c42';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + r + 8, y - 4);
      ctx.stroke();
      break;
    }
    case 'lich': {
      // Massive purple boss with crown and phylactery glow
      roundRect(ctx, x - r, y - r, r * 2, r * 2, 9);
      ctx.fill();
      ctx.fillStyle = '#1a0a28';
      ctx.beginPath();
      ctx.moveTo(x - r * 0.85, y - r * 0.15);
      ctx.lineTo(x, y - r - 14);
      ctx.lineTo(x + r * 0.85, y - r * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f4d35e';
      for (let i = -2; i <= 2; i++) {
        ctx.fillRect(x + i * 7 - 2, y - r - 14, 4, 6);
      }
      ctx.fillStyle = '#ef476f';
      ctx.beginPath();
      ctx.arc(x - 7, y - 4, 3.5, 0, Math.PI * 2);
      ctx.arc(x + 7, y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c77dff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#c77dff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y + 8, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case 'wisp': {
      ctx.shadowColor = '#e0f7ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(224, 247, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - r - 4, y);
      ctx.quadraticCurveTo(x, y - r - 6, x + r + 4, y);
      ctx.quadraticCurveTo(x, y + r + 4, x - r - 4, y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case 'gargoyle': {
      // Stone flyer
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 2);
      ctx.lineTo(x - 20, y - 12);
      ctx.lineTo(x - 6, y + 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 4, y - 2);
      ctx.lineTo(x + 20, y - 12);
      ctx.lineTo(x + 6, y + 6);
      ctx.fill();
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(x - 3, y - 2, 2, 0, Math.PI * 2);
      ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(x - 4, y - r);
      ctx.lineTo(x - 2, y - r - 6);
      ctx.lineTo(x, y - r);
      ctx.moveTo(x + 4, y - r);
      ctx.lineTo(x + 2, y - r - 6);
      ctx.lineTo(x, y - r);
      ctx.fill();
      break;
    }
  }

  if (selected) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  statusRings(ctx, e, x, y);
  hpBar(ctx, e, x, y);
}
