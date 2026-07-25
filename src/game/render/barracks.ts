import type { Barracks } from '../entities';
import { roundRect } from './shapes';

function drawFlag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  wave = 0,
): void {
  ctx.strokeStyle = '#2a2418';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x, y - 28);
  ctx.stroke();

  const flutter = Math.sin(wave * 4) * 3;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 28);
  ctx.lineTo(x + 18 + flutter, y - 22);
  ctx.lineTo(x, y - 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawBarracks(
  ctx: CanvasRenderingContext2D,
  b: Barracks,
  selected: boolean,
  rallyMode: boolean,
  time = 0,
): void {
  const { x, y } = b;
  const knight = b.kind === 'knightBarracks';

  if (selected || rallyMode) {
    ctx.beginPath();
    ctx.arc(x, y, b.rallyRadius, 0, Math.PI * 2);
    ctx.strokeStyle = rallyMode ? 'rgba(244, 211, 94, 0.55)' : 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash(rallyMode ? [4, 6] : [6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const wallLight = knight ? '#b8c4d8' : '#d4b896';
  const wallDark = knight ? '#3a4558' : '#5a3d22';
  const g = ctx.createLinearGradient(x - 20, y - 20, x + 20, y + 14);
  g.addColorStop(0, wallLight);
  g.addColorStop(1, wallDark);
  ctx.fillStyle = g;
  roundRect(ctx, x - 20, y - 14, 40, 28, 4);
  ctx.fill();

  ctx.fillStyle = knight ? '#2a3040' : '#3a2818';
  ctx.beginPath();
  ctx.moveTo(x - 24, y - 12);
  ctx.lineTo(x, y - 32 - b.level * 2);
  ctx.lineTo(x + 24, y - 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = knight ? '#4a5a78' : '#6a4428';
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 12);
  ctx.lineTo(x, y - 26 - b.level);
  ctx.lineTo(x + 20, y - 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1a1410';
  roundRect(ctx, x - 7, y - 2, 14, 16, 2);
  ctx.fill();
  ctx.fillStyle = '#f4d35e';
  ctx.beginPath();
  ctx.arc(x + 3, y + 6, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = knight ? '#6b8cae' : '#c45c4a';
  ctx.fillRect(x + 10, y - 22, 8, 12);
  ctx.strokeStyle = '#f4d35e';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 10, y - 22, 8, 12);

  ctx.fillStyle = 'rgba(244, 211, 94, 0.45)';
  ctx.fillRect(x - 14, y - 8, 5, 5);
  ctx.fillRect(x + 9, y - 8, 5, 5);

  if (b.level > 1) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, x - 12, y + 20, 24, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`L${b.level}`, x, y + 31);
  }

  drawFlag(ctx, b.rallyX, b.rallyY, knight ? '#6b8cae' : '#e85d4c', time);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(b.rallyX, b.rallyY + 10, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}
