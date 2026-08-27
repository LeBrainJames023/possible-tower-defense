import type { Projectile } from './entities';

/**
 * Named-path in-flight look. +x is already rotated to the shot's travel.
 * One Projectile still = one hit. Extra tongues / shards here are paint only.
 */
export function drawForkShot(ctx: CanvasRenderingContext2D, p: Projectile): void {
  const flick = 0.65 + Math.sin(p.age * 22) * 0.35;
  switch (p.kind) {
    case 'fire':
      if (p.fork === 'a') drawFlameStream(ctx, p.color, p.age);
      else drawFurnaceGlob(ctx, p.color, flick);
      break;
    case 'ice':
      if (p.fork === 'a') {
        ctx.rotate(p.age * 16);
        drawHailShard(ctx, p.color, p.age);
      } else {
        ctx.rotate(p.age * 4);
        drawBlizzardBurst(ctx, p.color, p.age);
      }
      break;
    case 'poison':
      if (p.fork === 'a') drawVenomDart(ctx, p.color, p.age);
      else drawMiasmaCloud(ctx, p.color, p.age);
      break;
    case 'void':
      if (p.fork === 'a') drawFlickerOrb(ctx, p.color, p.age);
      else drawAbyssOrb(ctx, p.color, p.age);
      break;
    default:
      break;
  }
}

function drawFlameStream(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const flick = 0.72 + Math.sin(age * 38) * 0.28;
  const wisp = Math.sin(age * 26) * 1.8;

  const glow = ctx.createRadialGradient(6, 0, 1, 0, 0, 22);
  glow.addColorStop(0, `rgba(255, 230, 120, ${0.4 * flick})`);
  glow.addColorStop(0.45, `${color}66`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 8 * flick, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.quadraticCurveTo(2, 7.5 * flick, -22, 3.2 + wisp);
  ctx.quadraticCurveTo(-10, 0, -22, -3.2 - wisp);
  ctx.quadraticCurveTo(2, -7.5 * flick, 14, 0);
  ctx.fill();

  ctx.fillStyle = '#ffb14a';
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.quadraticCurveTo(2, 4.2 * flick, -14, 1.4);
  ctx.quadraticCurveTo(-6, 0, -14, -1.4);
  ctx.quadraticCurveTo(2, -4.2 * flick, 12, 0);
  ctx.fill();

  ctx.fillStyle = '#fff3c0';
  ctx.beginPath();
  ctx.ellipse(7, -0.3, 5.5, 2.1 * flick, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.7;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, 3.4 + wisp);
  ctx.quadraticCurveTo(-12, 6.5, -20, 5.5 + wisp);
  ctx.quadraticCurveTo(-10, 4, -4, 3.4 + wisp);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2, -3.6 - wisp);
  ctx.quadraticCurveTo(-11, -6.8, -18, -5.2 - wisp);
  ctx.quadraticCurveTo(-8, -3.4, -2, -3.6 - wisp);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFurnaceGlob(ctx: CanvasRenderingContext2D, color: string, flick: number): void {
  ctx.fillStyle = 'rgba(40, 16, 8, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-2, 3, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const glow = ctx.createRadialGradient(2, -1, 2, 0, 0, 18);
  glow.addColorStop(0, `rgba(255, 210, 90, ${0.55 * flick})`);
  glow.addColorStop(0.4, `${color}99`);
  glow.addColorStop(1, `${color}00`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9a4a';
  ctx.beginPath();
  ctx.arc(0.6, -0.4, 8.2 * flick, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3c0';
  ctx.beginPath();
  ctx.arc(2.4, -1.6, 3.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawHailShard(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  ctx.fillStyle = 'rgba(180, 240, 255, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f4feff';
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(1.2, 2.6);
  ctx.lineTo(-9, 0.6);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-9, -0.6);
  ctx.lineTo(1.2, -2.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.15;
  ctx.stroke();

  ctx.globalAlpha = 0.55 + Math.sin(age * 22) * 0.2;
  ctx.fillStyle = '#c8f4ff';
  ctx.beginPath();
  ctx.moveTo(-5, 2.4);
  ctx.lineTo(-8.5, 3.6);
  ctx.lineTo(-6, 1.2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBlizzardBurst(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const pulse = 1 + Math.sin(age * 8) * 0.08;
  ctx.fillStyle = 'rgba(200, 244, 255, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 * pulse, 11 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `${color}aa`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13.5 * pulse, 9.2 * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#e8fbff';
  ctx.beginPath();
  ctx.moveTo(11, 0);
  ctx.lineTo(3, 7);
  ctx.lineTo(-9, 4.2);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-9, -4.2);
  ctx.lineTo(3, -7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(5, -0.8);
  ctx.lineTo(-2, 2);
  ctx.lineTo(-1, -2.4);
  ctx.closePath();
  ctx.fill();
}

function drawVenomDart(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const wob = Math.sin(age * 18) * 0.35;
  ctx.fillStyle = `${color}55`;
  ctx.beginPath();
  ctx.ellipse(-2, wob, 9, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(-6, 2.1 + wob);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-6, -2.1 - wob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b6f5c0';
  ctx.beginPath();
  ctx.moveTo(11, 0);
  ctx.lineTo(-2, 1.1);
  ctx.lineTo(-2, -1.1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(3, -0.4, 2.2, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMiasmaCloud(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const wob = Math.sin(age * 9) * 1.4;
  ctx.fillStyle = `${color}55`;
  ctx.beginPath();
  ctx.ellipse(-3, 1 + wob * 0.3, 11, 7.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, -1.2 - wob * 0.2, 8.2, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 3.4, 7.5, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(-1, 0.4, 7.2, 5.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b6f5c0';
  ctx.beginPath();
  ctx.ellipse(1.6, 1.8, 3.6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(-2.4, -1.8, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlickerOrb(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const pulse = 1 + Math.sin(age * 18) * 0.12;
  const core = ctx.createRadialGradient(-0.8, -0.9, 0.4, 0, 0, 5);
  core.addColorStop(0, '#d8c8ff');
  core.addColorStop(0.4, color);
  core.addColorStop(1, '#12081c');
  ctx.fillStyle = `${color}44`;
  ctx.beginPath();
  ctx.arc(0, 0, 5.4 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, 3.8 * pulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawAbyssOrb(ctx: CanvasRenderingContext2D, color: string, age: number): void {
  const pulse = 1 + Math.sin(age * 8) * 0.07;
  const core = ctx.createRadialGradient(-1.6, -1.8, 0.8, 0, 0, 10);
  core.addColorStop(0, '#d8c8ff');
  core.addColorStop(0.32, color);
  core.addColorStop(1, '#080410');
  ctx.fillStyle = `${color}66`;
  ctx.beginPath();
  ctx.arc(0, 0, 12.2 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, 9.1 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(12, 4, 20, 0.78)';
  ctx.beginPath();
  ctx.arc(0.8, 1.1, 3.6, 0, Math.PI * 2);
  ctx.fill();
}
