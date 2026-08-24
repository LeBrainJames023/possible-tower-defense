import type { Tower } from './entities';
import { PX, TILE } from './constants';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function goldBand(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#ffe9a0');
  g.addColorStop(0.45, '#e0b24a');
  g.addColorStop(1, '#8a5a18');
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 1);
  ctx.fill();
}

function steel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#d8e0ea');
  g.addColorStop(0.4, '#6a7888');
  g.addColorStop(1, '#243040');
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function wood(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#d4a06a');
  g.addColorStop(0.45, '#8a4a28');
  g.addColorStop(1, '#4a2414');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function crystal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c1: string,
  c2: string,
): void {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h * 0.45);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x - w, y + h * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.2, y + h * 0.12);
  ctx.lineTo(x + w * 0.15, y + h * 0.4);
  ctx.lineTo(x - w * 0.05, y + h * 0.38);
  ctx.fill();
}

function aura(ctx: CanvasRenderingContext2D, color: string, r: number, time: number): void {
  const g = ctx.createRadialGradient(0, 2, 2, 0, 2, r);
  g.addColorStop(0, `${color}40`);
  g.addColorStop(0.6, `${color}14`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 2, r + Math.sin(time * 3) * 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function spokeWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = '#3a2a1c';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.18);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffe9a0';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function pad(ctx: CanvasRenderingContext2D, scale: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 12 * scale, 16 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(-3 * scale, 8 * scale, 2, 0, 10 * scale, 16 * scale);
  g.addColorStop(0, '#8a6a40');
  g.addColorStop(1, '#3a2a18');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 10 * scale, 15 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  goldBand(ctx, -10 * scale, 7 * scale, 20 * scale, 2 * scale);
}

/** Locked looks: Ballista, Field gun, Crystal spire, Rune pylons, Brazier, Alchemy vat. */
export function drawTowerBody(
  ctx: CanvasRenderingContext2D,
  t: Tower,
  time: number,
  scale: number,
  recoil: number,
): void {
  const def = t.def;
  pad(ctx, scale);
  switch (t.kind) {
    case 'arrow':
      drawBallista(ctx, def.color, t.aim, scale, recoil);
      break;
    case 'cannon':
      drawFieldGun(ctx, def.color, def.colorDark, t.aim, scale, recoil, time);
      break;
    case 'longshot':
      drawLongKeep(ctx, def.color, def.colorDark, t.aim, scale, recoil);
      break;
    case 'muster':
      drawMusterYard(ctx, def.color, def.colorDark, time, scale);
      break;
    case 'chapter':
      drawChapterHouse(ctx, def.color, def.colorDark, time, scale);
      break;
    case 'ice':
      drawCrystalSpire(ctx, def.color, def.colorDark, time, scale, t.aim);
      break;
    case 'lightning':
      drawRunePylons(ctx, def.color, time, scale, t.aim);
      break;
    case 'fire':
      drawBrazier(ctx, def.color, time, scale, t.aim);
      break;
    case 'poison':
      drawAlchemyVat(ctx, def.color, def.colorDark, time, scale, t.aim);
      break;
    case 'void':
      drawVoidShrine(ctx, def.color, def.colorDark, time, scale);
      break;
  }
}

function drawBallista(
  ctx: CanvasRenderingContext2D,
  color: string,
  aim: number,
  scale: number,
  recoil: number,
): void {
  aura(ctx, color, 20 * scale, 0);
  wood(ctx, -16 * scale, 4 * scale, 32 * scale, 8 * scale);
  wood(ctx, -4 * scale, -8 * scale, 8 * scale, 16 * scale);
  wood(ctx, -18 * scale, -12 * scale, 7 * scale, 16 * scale);
  wood(ctx, 11 * scale, -12 * scale, 7 * scale, 16 * scale);
  goldBand(ctx, -15 * scale, -8 * scale, 30 * scale, 2.4 * scale);
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 1.6 * PX;
  ctx.beginPath();
  ctx.arc(-15 * scale, 2 * scale, 3.2 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.rotate(aim);
  ctx.translate(-recoil, 0);
  ctx.strokeStyle = '#ffe9a0';
  ctx.shadowColor = color;
  ctx.shadowBlur = 6 * PX;
  ctx.lineWidth = 2.4 * PX;
  ctx.beginPath();
  ctx.moveTo(-14 * scale, -7 * scale);
  ctx.quadraticCurveTo(0, -16 * scale, 14 * scale, -7 * scale);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(-4 * scale, -9 * scale, 18 * scale, 3.2 * scale);
  ctx.fillStyle = '#e8f4ff';
  ctx.fillRect(-2 * scale, -8.6 * scale, 16 * scale, 2.2 * scale);
  ctx.fillStyle = '#8a2018';
  ctx.beginPath();
  ctx.moveTo(14 * scale, -10 * scale);
  ctx.lineTo(22 * scale, -7 * scale);
  ctx.lineTo(14 * scale, -4 * scale);
  ctx.closePath();
  ctx.fill();
  crystal(ctx, 16 * scale, -12 * scale, 3 * scale, 9 * scale, '#fff4c8', color);
  ctx.restore();
}

function drawFieldGun(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  aim: number,
  scale: number,
  recoil: number,
  time: number,
): void {
  aura(ctx, color, 18 * scale, time);
  spokeWheel(ctx, -11 * scale, 9 * scale, 6.5 * scale, '#ffe9a0');
  spokeWheel(ctx, 11 * scale, 9 * scale, 6.5 * scale, '#ffe9a0');
  wood(ctx, -13 * scale, 0, 26 * scale, 7 * scale);
  ctx.save();
  ctx.rotate(aim);
  ctx.translate(-recoil * 1.2, 0);
  const tube = ctx.createLinearGradient(0, -8 * scale, 0, 6 * scale);
  tube.addColorStop(0, '#f0d090');
  tube.addColorStop(0.45, color);
  tube.addColorStop(1, dark);
  ctx.fillStyle = tube;
  roundRect(ctx, -6 * scale, -7 * scale, 26 * scale, 9 * scale, 3);
  ctx.fill();
  goldBand(ctx, 2 * scale, -6.5 * scale, 2.2 * scale, 8 * scale);
  goldBand(ctx, 10 * scale, -6.5 * scale, 2.2 * scale, 8 * scale);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(18 * scale, -8 * scale);
  ctx.lineTo(28 * scale, -2 * scale);
  ctx.lineTo(18 * scale, 4 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255,180,60,${0.35 + Math.sin(time * 8) * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(26 * scale, -2 * scale, 4 * scale, 2.4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLongKeep(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  aim: number,
  scale: number,
  recoil: number,
): void {
  aura(ctx, color, 18 * scale, 0);
  steel(ctx, -11 * scale, -18 * scale, 22 * scale, 28 * scale, 3);
  goldBand(ctx, -12 * scale, 6 * scale, 24 * scale, 2.2 * scale);
  goldBand(ctx, -10 * scale, -16 * scale, 20 * scale, 2 * scale);
  ctx.save();
  ctx.rotate(aim);
  ctx.translate(-recoil * 0.8, 0);
  wood(ctx, -3 * scale, -4 * scale, 28 * scale, 4 * scale);
  ctx.fillStyle = '#8a2018';
  ctx.beginPath();
  ctx.moveTo(24 * scale, -6 * scale);
  ctx.lineTo(34 * scale, 0);
  ctx.lineTo(24 * scale, 6 * scale);
  ctx.closePath();
  ctx.fill();
  crystal(ctx, 28 * scale, -8 * scale, 2.4 * scale, 8 * scale, '#fff4c8', color);
  ctx.restore();
  ctx.fillStyle = dark;
  ctx.fillRect(-6 * scale, 8 * scale, 12 * scale, 3 * scale);
}

function drawCrystalSpire(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
  aim: number,
): void {
  aura(ctx, color, 22 * scale, time);
  crystal(ctx, 0, -22 * scale, 6 * scale, 28 * scale, '#e8f8ff', dark);
  crystal(ctx, -8 * scale, -12 * scale, 4 * scale, 18 * scale, color, dark);
  crystal(ctx, 8 * scale, -10 * scale, 4 * scale, 16 * scale, '#ffffff', color);
  goldBand(ctx, -7 * scale, 4 * scale, 14 * scale, 2.2 * scale);
  for (let i = 0; i < 3; i++) {
    const a = time * 1.8 + i * 2.1;
    ctx.fillStyle = `rgba(200,244,255,${0.45 + Math.sin(a) * 0.25})`;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 11 * scale, -6 * scale + Math.sin(a * 1.4) * 4 * scale, 1.6 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.rotate(aim);
  ctx.fillStyle = '#e8fbff';
  ctx.beginPath();
  ctx.moveTo(18 * scale, 0);
  ctx.lineTo(6 * scale, 4.2 * scale);
  ctx.lineTo(8 * scale, 0);
  ctx.lineTo(6 * scale, -4.2 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * PX;
  ctx.stroke();
  ctx.restore();
}

function drawRunePylons(
  ctx: CanvasRenderingContext2D,
  color: string,
  time: number,
  scale: number,
  aim: number,
): void {
  aura(ctx, color, 20 * scale, time);
  steel(ctx, -16 * scale, -10 * scale, 6 * scale, 22 * scale, 2);
  steel(ctx, 10 * scale, -10 * scale, 6 * scale, 22 * scale, 2);
  goldBand(ctx, -17 * scale, 0, 8 * scale, 2 * scale);
  goldBand(ctx, 9 * scale, 0, 8 * scale, 2 * scale);
  crystal(ctx, -13 * scale, -22 * scale, 3.2 * scale, 12 * scale, '#fff8d0', color);
  crystal(ctx, 13 * scale, -22 * scale, 3.2 * scale, 12 * scale, '#fff8d0', color);
  ctx.fillStyle = `rgba(255,248,208,${0.35 + Math.sin(time * 8) * 0.25})`;
  ctx.beginPath();
  ctx.arc(0, -8 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -8 * scale, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55 + Math.sin(time * 10) * 0.35;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8 * PX;
  ctx.lineWidth = 2 * PX;
  ctx.beginPath();
  ctx.moveTo(-13 * scale, -16 * scale);
  ctx.lineTo(-2 * scale, -8 * scale);
  ctx.lineTo(4 * scale, -18 * scale);
  ctx.lineTo(13 * scale, -16 * scale);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.rotate(aim);
  ctx.strokeStyle = '#fff8d0';
  ctx.lineWidth = 1.6 * PX;
  ctx.beginPath();
  ctx.moveTo(4 * scale, -2 * scale);
  ctx.lineTo(10 * scale, 1 * scale);
  ctx.lineTo(16 * scale, -1 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawBrazier(
  ctx: CanvasRenderingContext2D,
  color: string,
  time: number,
  scale: number,
  aim: number,
): void {
  aura(ctx, color, 22 * scale, time);
  steel(ctx, -13 * scale, 0, 26 * scale, 11 * scale, 4);
  goldBand(ctx, -11 * scale, 5 * scale, 22 * scale, 2.2 * scale);
  ctx.fillStyle = '#5a3418';
  ctx.fillRect(-7 * scale, 1 * scale, 4 * scale, 8 * scale);
  ctx.fillRect(-1 * scale, 0, 3.5 * scale, 9 * scale);
  ctx.fillRect(4 * scale, 1.5 * scale, 4 * scale, 7 * scale);
  ctx.fillStyle = '#e8c878';
  ctx.beginPath();
  ctx.moveTo(-12 * scale, 0);
  ctx.lineTo(-16 * scale, -8 * scale);
  ctx.lineTo(-8 * scale, 0);
  ctx.moveTo(12 * scale, 0);
  ctx.lineTo(16 * scale, -8 * scale);
  ctx.lineTo(8 * scale, 0);
  ctx.fill();
  const f = 1 + Math.sin(time * 11) * 0.1 + Math.sin(time * 17) * 0.06;
  ctx.save();
  ctx.rotate(aim * 0.18);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-6 * scale, 6 * scale);
  ctx.quadraticCurveTo(14 * scale * f, -2 * scale, 0, -16 * scale * f);
  ctx.quadraticCurveTo(-14 * scale * f, -2 * scale, 6 * scale, 6 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffe08a';
  ctx.beginPath();
  ctx.moveTo(-2 * scale, 4 * scale);
  ctx.quadraticCurveTo(7 * scale, 0, 0, -10 * scale * f);
  ctx.quadraticCurveTo(-7 * scale, 0, 2 * scale, 4 * scale);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#3a241c';
  ctx.beginPath();
  ctx.ellipse(0, 4 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawAlchemyVat(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
  aim: number,
): void {
  aura(ctx, color, 20 * scale, time);
  wood(ctx, -12 * scale, 6 * scale, 24 * scale, 6 * scale);
  const glass = ctx.createLinearGradient(-10 * scale, -12 * scale, 10 * scale, 10 * scale);
  glass.addColorStop(0, '#d8ff90');
  glass.addColorStop(0.4, color);
  glass.addColorStop(1, dark);
  ctx.fillStyle = glass;
  roundRect(ctx, -10 * scale, -12 * scale, 20 * scale, 20 * scale, 8 * scale);
  ctx.fill();
  goldBand(ctx, -11 * scale, -2 * scale, 22 * scale, 2.4 * scale);
  goldBand(ctx, -10 * scale, 6 * scale, 20 * scale, 2.4 * scale);
  ctx.fillStyle = 'rgba(220,255,160,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, -6 * scale, 7 * scale, 4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const b = (time * 2.4 + i * 1.7) % 1;
    ctx.fillStyle = `rgba(200,255,170,${0.55 - b * 0.4})`;
    ctx.beginPath();
    ctx.arc((-4 + i * 4) * scale, (4 - b * 14) * scale, (1.4 - b * 0.4) * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.rotate(aim);
  ctx.fillStyle = '#c8c0b4';
  ctx.fillRect(8 * scale, -3 * scale, 10 * scale, 2.4 * scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(18 * scale, 5 * scale + Math.sin(time * 5) * 1.6 * scale, 2 * scale, 3.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVoidShrine(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
): void {
  aura(ctx, color, 20 * scale, time);
  steel(ctx, -12 * scale, -6 * scale, 24 * scale, 16 * scale, 4);
  goldBand(ctx, -11 * scale, 6 * scale, 22 * scale, 2.2 * scale);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(-8 * scale, -6 * scale);
  ctx.lineTo(-12 * scale, -18 * scale);
  ctx.lineTo(-3 * scale, -8 * scale);
  ctx.moveTo(8 * scale, -6 * scale);
  ctx.lineTo(12 * scale, -18 * scale);
  ctx.lineTo(3 * scale, -8 * scale);
  ctx.fill();
  const pulse = 0.85 + Math.sin(time * 5) * 0.12;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -12 * scale, 5.4 * scale * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12081c';
  ctx.beginPath();
  ctx.arc(0, -12 * scale, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();
}

/** Lean wooden training crate if Muster PNG is missing. */
function drawMusterYard(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
): void {
  aura(ctx, color, 16 * scale, time);
  const half = TILE * 0.88;
  wood(ctx, -half, -8 * scale, half * 2, 20 * scale);
  goldBand(ctx, -half, -10 * scale, half * 2, 2.2 * scale);
  ctx.fillStyle = dark;
  ctx.fillRect(-half - 2 * scale, -12 * scale, half * 2 + 4 * scale, 3.4 * scale);
  ctx.fillStyle = '#7a2018';
  ctx.beginPath();
  ctx.moveTo(7 * scale, -12 * scale);
  ctx.lineTo(16 * scale, -6 * scale + Math.sin(time * 3) * scale);
  ctx.lineTo(7 * scale, -2 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(5.6 * scale, -12 * scale, 2 * scale, 22 * scale);
  ctx.fillStyle = color;
  roundRect(ctx, -6 * scale, 0, 6 * scale, 10 * scale, 1.4 * scale);
  ctx.fill();
}

/** Heavier stone chapter house if Chapter PNG is missing. */
function drawChapterHouse(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
): void {
  aura(ctx, color, 18 * scale, time);
  const half = TILE * 0.88;
  steel(ctx, -half, -10 * scale, half * 2, 22 * scale, 2.4 * scale);
  ctx.fillStyle = dark;
  ctx.fillRect(-half - 2 * scale, -14 * scale, half * 2 + 4 * scale, 5 * scale);
  ctx.fillStyle = '#3a4a5c';
  ctx.beginPath();
  ctx.moveTo(-half - 2 * scale, -14 * scale);
  ctx.lineTo(0, -22 * scale);
  ctx.lineTo(half + 2 * scale, -14 * scale);
  ctx.closePath();
  ctx.fill();
  goldBand(ctx, -6 * scale, -13 * scale, 12 * scale, 2 * scale);
  ctx.fillStyle = '#1a2430';
  roundRect(ctx, -5 * scale, -2 * scale, 10 * scale, 14 * scale, 1.6 * scale);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -18 * scale, 2.2 * scale + Math.sin(time * 2) * 0.3 * scale, 0, Math.PI * 2);
  ctx.fill();
}
