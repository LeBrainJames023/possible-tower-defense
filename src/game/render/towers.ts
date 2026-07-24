import type { Tower } from '../entities';
import { roundRect } from './shapes';

function stoneBase(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 15, r + 3, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(x - 4, y + 4, 2, x, y + 8, r);
  g.addColorStop(0, '#3a4555');
  g.addColorStop(1, '#1a222c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y + 8, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawArrowTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  aim: number,
): void {
  const h = 26 + level * 5;
  stoneBase(ctx, x, y, 16);
  const g = ctx.createLinearGradient(x - 14, y - h, x + 14, y + 10);
  g.addColorStop(0, '#7eb6e0');
  g.addColorStop(0.5, '#3d7eb0');
  g.addColorStop(1, '#1a4060');
  ctx.fillStyle = g;
  roundRect(ctx, x - 12, y - h + 10, 24, h, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - 12, y - h + 10, 24, h, 4);
  ctx.stroke();
  // Window slits
  ctx.fillStyle = 'rgba(10, 20, 30, 0.55)';
  ctx.fillRect(x - 6, y - h + 22, 4, 7);
  ctx.fillRect(x + 2, y - h + 22, 4, 7);
  // Battlements
  ctx.fillStyle = '#2a4a62';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i * 5.5 - 2.5, y - h + 4, 5, 8);
  }
  // Crossbow turret (rotates)
  const cx = x;
  const cy = y - h + 8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(aim);
  ctx.fillStyle = '#4a3220';
  roundRect(ctx, -3, -4, 18, 8, 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a66b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(4, 0, 11, -Math.PI * 0.75, Math.PI * 0.75);
  ctx.stroke();
  ctx.fillStyle = '#e8f0ff';
  ctx.fillRect(2, -1.5, 16, 3);
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(14, -4);
  ctx.lineTo(14, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b9fd4';
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-7, -4);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-7, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCannonTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  aim: number,
): void {
  stoneBase(ctx, x, y, 18);
  const g = ctx.createLinearGradient(x - 18, y - 16, x + 18, y + 14);
  g.addColorStop(0, '#e89a5a');
  g.addColorStop(1, '#6a2a08');
  ctx.fillStyle = g;
  roundRect(ctx, x - 16, y - 8, 32, 24, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,160,0.3)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - 16, y - 8, 32, 24, 7);
  ctx.stroke();
  // Swivel mount
  ctx.fillStyle = '#3a3028';
  ctx.beginPath();
  ctx.arc(x, y - 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x, y - 8);
  ctx.rotate(aim);
  const barrelLen = 22 + level * 3;
  ctx.fillStyle = '#2a2220';
  roundRect(ctx, 0, -5, barrelLen, 10, 3);
  ctx.fill();
  ctx.fillStyle = '#1a1514';
  ctx.beginPath();
  ctx.arc(barrelLen, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a4038';
  ctx.beginPath();
  ctx.arc(barrelLen, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#f0c94d';
  ctx.beginPath();
  ctx.arc(x - 11, y + 2, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 11, y + 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawIceTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 15);
  const tip = y - 32 - level * 5;
  const g = ctx.createLinearGradient(x, tip, x, y + 8);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#a8e4f8');
  g.addColorStop(1, '#1f5f78');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x + 14 + level, y + 8);
  ctx.lineTo(x - 14 - level, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x, y + 6);
  ctx.stroke();
  ctx.fillStyle = 'rgba(200, 240, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 2);
  ctx.lineTo(x - 9, y - 20);
  ctx.lineTo(x - 4, y);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 16, y - 2);
  ctx.lineTo(x + 9, y - 20);
  ctx.lineTo(x + 4, y);
  ctx.fill();
  if (level > 1) {
    ctx.strokeStyle = 'rgba(180, 230, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y - 8, 10 + level * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawLightningTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
): void {
  stoneBase(ctx, x, y, 15);
  ctx.fillStyle = '#3a3420';
  roundRect(ctx, x - 11, y - 6, 22, 18, 4);
  ctx.fill();
  for (let i = 0; i < 3 + level; i++) {
    const yy = y - 12 - i * 8;
    const coil = ctx.createLinearGradient(x - 12, yy, x + 12, yy);
    coil.addColorStop(0, '#8a6b00');
    coil.addColorStop(0.5, '#f0c94d');
    coil.addColorStop(1, '#8a6b00');
    ctx.fillStyle = coil;
    ctx.beginPath();
    ctx.ellipse(x, yy, 12 - i * 0.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const tipY = y - 12 - (2 + level) * 8 - 2;
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(x - 2.5, tipY, 5, 12);
  ctx.shadowColor = '#f0c94d';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, tipY - 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 250, 180, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9, tipY + 6);
  ctx.lineTo(x, tipY - 8);
  ctx.lineTo(x + 9, tipY + 6);
  ctx.stroke();
}

function drawFireTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 16);
  const g = ctx.createLinearGradient(x - 14, y - 18, x + 14, y + 12);
  g.addColorStop(0, '#ff7a5c');
  g.addColorStop(1, '#5a1008');
  ctx.fillStyle = g;
  roundRect(ctx, x - 13, y - 4, 26, 18, 5);
  ctx.fill();
  ctx.fillStyle = '#3a2018';
  roundRect(ctx, x - 8, y - 24 - level * 3, 16, 22 + level * 3, 3);
  ctx.fill();
  ctx.fillStyle = '#2a1810';
  ctx.beginPath();
  ctx.ellipse(x, y - 24 - level * 3, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  const fy = y - 30 - level * 3;
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.moveTo(x, fy - 16);
  ctx.quadraticCurveTo(x + 12, fy - 2, x + 3, fy + 8);
  ctx.quadraticCurveTo(x, fy + 2, x - 3, fy + 8);
  ctx.quadraticCurveTo(x - 12, fy - 2, x, fy - 16);
  ctx.fill();
  ctx.fillStyle = '#fff3a0';
  ctx.beginPath();
  ctx.moveTo(x, fy - 10);
  ctx.quadraticCurveTo(x + 5, fy, x, fy + 5);
  ctx.quadraticCurveTo(x - 5, fy, x, fy - 10);
  ctx.fill();
}

function drawPoisonTower(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  stoneBase(ctx, x, y, 15);
  const g = ctx.createLinearGradient(x - 12, y - 14, x + 12, y + 12);
  g.addColorStop(0, '#8adf90');
  g.addColorStop(1, '#1a5a30');
  ctx.fillStyle = g;
  roundRect(ctx, x - 12, y - 6, 24, 20, 5);
  ctx.fill();
  ctx.strokeStyle = '#2a3a30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 6);
  ctx.lineTo(x - 15, y + 8);
  ctx.moveTo(x + 11, y - 6);
  ctx.lineTo(x + 15, y + 8);
  ctx.stroke();
  ctx.fillStyle = '#1a2a20';
  ctx.beginPath();
  ctx.ellipse(x, y - 14 - level * 2, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const brew = ctx.createRadialGradient(x - 2, y - 16 - level * 2, 1, x, y - 14 - level * 2, 10);
  brew.addColorStop(0, '#b8ff90');
  brew.addColorStop(1, '#2dff7a');
  ctx.fillStyle = brew;
  ctx.beginPath();
  ctx.ellipse(x, y - 16 - level * 2, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200, 255, 210, 0.95)';
  ctx.beginPath();
  ctx.arc(x - 5, y - 24 - level * 2, 3.5, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 28 - level * 2, 2.8, 0, Math.PI * 2);
  ctx.arc(x + 1, y - 33 - level * 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
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
      drawArrowTower(ctx, x, y, t.level, t.aimAngle);
      break;
    case 'cannon':
      drawCannonTower(ctx, x, y, t.level, t.aimAngle);
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
    ctx.fillText(`L${t.level}`, x, y + 30);
  }
}
