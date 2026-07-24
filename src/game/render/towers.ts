import type { Tower } from '../entities';
import { roundRect } from './shapes';

function stoneBase(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y + 14, r + 2, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a3340';
  ctx.beginPath();
  ctx.arc(x, y + 8, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawArrowTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  const h = 22 + level * 4;
  stoneBase(ctx, x, y, 15);
  // Keep body
  const g = ctx.createLinearGradient(x - 12, y - h, x + 12, y + 10);
  g.addColorStop(0, '#6aa8d8');
  g.addColorStop(1, '#1e4d73');
  ctx.fillStyle = g;
  roundRect(ctx, x - 11, y - h + 8, 22, h, 3);
  ctx.fill();
  // Battlements
  ctx.fillStyle = '#2a4a62';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i * 5 - 2, y - h + 2, 4, 6);
  }
  // Crossbow
  ctx.fillStyle = '#3d2918';
  ctx.fillRect(x - 2, y - h - 2, 4, 10);
  ctx.strokeStyle = '#c9a66b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y - h + 2, 10, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();
  ctx.strokeStyle = '#e8d5a8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 9, y - h + 2);
  ctx.lineTo(x + 9, y - h + 2);
  ctx.stroke();
  // Loaded bolt
  ctx.fillStyle = '#dfefff';
  ctx.fillRect(x - 1, y - h - 8, 2, 12);
  ctx.beginPath();
  ctx.moveTo(x, y - h - 10);
  ctx.lineTo(x + 4, y - h - 6);
  ctx.lineTo(x - 4, y - h - 6);
  ctx.closePath();
  ctx.fill();
}

function drawCannonTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 17);
  const g = ctx.createLinearGradient(x - 16, y - 18, x + 16, y + 12);
  g.addColorStop(0, '#e0894a');
  g.addColorStop(1, '#7a3410');
  ctx.fillStyle = g;
  roundRect(ctx, x - 15, y - 10, 30, 22, 6);
  ctx.fill();
  // Barrel
  ctx.fillStyle = '#2a2220';
  roundRect(ctx, x - 4, y - 28 - level * 2, 8, 22 + level * 2, 3);
  ctx.fill();
  ctx.fillStyle = '#1a1514';
  ctx.beginPath();
  ctx.arc(x, y - 28 - level * 2, 5, 0, Math.PI * 2);
  ctx.fill();
  // Rivets
  ctx.fillStyle = '#f0c94d';
  ctx.beginPath();
  ctx.arc(x - 10, y, 2, 0, Math.PI * 2);
  ctx.arc(x + 10, y, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 14);
  const tip = y - 28 - level * 5;
  const g = ctx.createLinearGradient(x, tip, x, y + 8);
  g.addColorStop(0, '#e8f7ff');
  g.addColorStop(0.4, '#7ec8e3');
  g.addColorStop(1, '#1f5f78');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x + 12 + level, y + 6);
  ctx.lineTo(x - 12 - level, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x, y + 4);
  ctx.stroke();
  // Side crystals
  ctx.fillStyle = 'rgba(180, 230, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 4);
  ctx.lineTo(x - 8, y - 16);
  ctx.lineTo(x - 4, y - 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 14, y - 4);
  ctx.lineTo(x + 8, y - 16);
  ctx.lineTo(x + 4, y - 2);
  ctx.fill();
}

function drawLightningTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 14);
  ctx.fillStyle = '#3a3420';
  roundRect(ctx, x - 10, y - 8, 20, 18, 4);
  ctx.fill();
  // Coil stack
  for (let i = 0; i < 3 + level; i++) {
    const yy = y - 14 - i * 7;
    ctx.fillStyle = i % 2 === 0 ? '#c9a227' : '#8a6b00';
    ctx.beginPath();
    ctx.ellipse(x, yy, 11 - i, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rod tip
  const tipY = y - 14 - (2 + level) * 7 - 4;
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(x - 2, tipY, 4, 10);
  ctx.beginPath();
  ctx.arc(x, tipY - 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 240, 150, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, tipY + 4);
  ctx.lineTo(x, tipY - 6);
  ctx.lineTo(x + 8, tipY + 4);
  ctx.stroke();
}

function drawFireTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 15);
  const g = ctx.createLinearGradient(x - 12, y - 20, x + 12, y + 10);
  g.addColorStop(0, '#e85d4c');
  g.addColorStop(1, '#5a120c');
  ctx.fillStyle = g;
  roundRect(ctx, x - 12, y - 6, 24, 18, 5);
  ctx.fill();
  // Chimney
  ctx.fillStyle = '#3a2018';
  roundRect(ctx, x - 7, y - 22 - level * 3, 14, 18 + level * 3, 3);
  ctx.fill();
  // Brazier bowl
  ctx.fillStyle = '#2a1810';
  ctx.beginPath();
  ctx.ellipse(x, y - 22 - level * 3, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Flames
  const fy = y - 28 - level * 3;
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.moveTo(x, fy - 14);
  ctx.quadraticCurveTo(x + 10, fy - 2, x + 2, fy + 6);
  ctx.quadraticCurveTo(x, fy, x - 2, fy + 6);
  ctx.quadraticCurveTo(x - 10, fy - 2, x, fy - 14);
  ctx.fill();
  ctx.fillStyle = '#fff3a0';
  ctx.beginPath();
  ctx.moveTo(x, fy - 8);
  ctx.quadraticCurveTo(x + 5, fy, x, fy + 4);
  ctx.quadraticCurveTo(x - 5, fy, x, fy - 8);
  ctx.fill();
}

function drawPoisonTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 14);
  const g = ctx.createLinearGradient(x - 12, y - 16, x + 12, y + 10);
  g.addColorStop(0, '#6bcb77');
  g.addColorStop(1, '#1f6b3a');
  ctx.fillStyle = g;
  roundRect(ctx, x - 11, y - 8, 22, 20, 5);
  ctx.fill();
  // Cauldron
  ctx.fillStyle = '#1a2a20';
  ctx.beginPath();
  ctx.ellipse(x, y - 14 - level * 2, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3dff8a';
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.ellipse(x, y - 16 - level * 2, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Bubbles
  ctx.fillStyle = 'rgba(180, 255, 200, 0.9)';
  ctx.beginPath();
  ctx.arc(x - 4, y - 22 - level * 2, 3, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 26 - level * 2, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 1, y - 30 - level * 2, 2, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.strokeStyle = '#2a3a30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 8);
  ctx.lineTo(x - 14, y + 6);
  ctx.moveTo(x + 10, y - 8);
  ctx.lineTo(x + 14, y + 6);
  ctx.stroke();
}

export function drawTower(ctx: CanvasRenderingContext2D, t: Tower, selected: boolean): void {
  const { x, y } = t;
  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  switch (t.kind) {
    case 'arrow':
      drawArrowTower(ctx, x, y, t.level);
      break;
    case 'cannon':
      drawCannonTower(ctx, x, y, t.level);
      break;
    case 'ice':
      drawIceTower(ctx, x, y, t.level);
      break;
    case 'lightning':
      drawLightningTower(ctx, x, y, t.level);
      break;
    case 'fire':
      drawFireTower(ctx, x, y, t.level);
      break;
    case 'poison':
      drawPoisonTower(ctx, x, y, t.level);
      break;
  }

  if (t.level > 1) {
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`L${t.level}`, x, y + 28);
  }
}
