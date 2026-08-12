import type { Enemy, BeamFx, Projectile, Tower } from './entities';

export function roundRect(
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

function plinth(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x - 16 * scale, y + 10 * scale, 32 * scale, 6 * scale);
  ctx.fillStyle = '#1c222c';
  ctx.fillRect(x - 15 * scale, y + 2 * scale, 30 * scale, 12 * scale);
  ctx.fillStyle = '#3a4454';
  ctx.fillRect(x - 15 * scale, y + 2 * scale, 30 * scale, 3 * scale);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 15 * scale, y + 2 * scale, 30 * scale, 12 * scale);
}

export function drawTower(ctx: CanvasRenderingContext2D, t: Tower, selected: boolean, time: number): void {
  const def = t.def;
  const { x, y } = t;
  const scale = 1 + (t.level - 1) * 0.08;
  const recoil = t.recoil * 5;

  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = `${def.color}55`;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `${def.color}10`;
    ctx.fill();
  }

  plinth(ctx, x, y, scale);

  if (t.level >= 3) {
    const pulse = 0.35 + Math.sin(time * 4) * 0.12;
    const g = ctx.createRadialGradient(x, y, 4, x, y, 28 * scale);
    g.addColorStop(0, `${def.color}00`);
    g.addColorStop(0.4, `${def.color}${Math.round(pulse * 255).toString(16).padStart(2, '0')}`);
    g.addColorStop(1, `${def.color}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 28 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(x, y);
  drawTowerBody(ctx, t, time, scale, recoil);
  ctx.restore();

  if (t.muzzle > 0.05) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t.aim);
    ctx.globalAlpha = t.muzzle;
    ctx.fillStyle = '#fff6d0';
    ctx.beginPath();
    ctx.ellipse(18 * scale - recoil, 0, 8 + t.muzzle * 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (t.level > 1) {
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.level === 3 ? '★★' : '★', x, y + 28);
  }
}

function drawTowerBody(
  ctx: CanvasRenderingContext2D,
  t: Tower,
  time: number,
  scale: number,
  recoil: number,
): void {
  const def = t.def;
  switch (t.kind) {
    case 'arrow':
      drawArrowTower(ctx, def.color, def.colorDark, t.aim, scale, recoil);
      break;
    case 'cannon':
      drawCannonTower(ctx, def.color, def.colorDark, t.aim, scale, recoil);
      break;
    case 'ice':
      drawIceTower(ctx, def.color, def.colorDark, time, scale);
      break;
    case 'lightning':
      drawLightningTower(ctx, def.color, def.colorDark, t.aim, time, scale, recoil);
      break;
    case 'fire':
      drawFireTower(ctx, def.color, def.colorDark, time, scale);
      break;
    case 'poison':
      drawPoisonTower(ctx, def.color, def.colorDark, time, scale);
      break;
  }
}

function drawArrowTower(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  aim: number,
  scale: number,
  recoil: number,
): void {
  ctx.fillStyle = '#5c3d2e';
  roundRect(ctx, -5 * scale, -4 * scale, 10 * scale, 16 * scale, 2);
  ctx.fill();
  ctx.save();
  ctx.rotate(aim);
  ctx.translate(-recoil, 0);
  const g = ctx.createLinearGradient(-4, -10, 16, 6);
  g.addColorStop(0, color);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-8 * scale, -11 * scale);
  ctx.lineTo(4 * scale, -13 * scale);
  ctx.lineTo(4 * scale, 13 * scale);
  ctx.lineTo(-8 * scale, 11 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#e8f4ff';
  ctx.fillRect(2 * scale, -2.2 * scale, 16 * scale, 4.4 * scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(18 * scale, 0);
  ctx.lineTo(12 * scale, -4 * scale);
  ctx.lineTo(12 * scale, 4 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCannonTower(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  aim: number,
  scale: number,
  recoil: number,
): void {
  const body = ctx.createLinearGradient(-14, -16, 14, 12);
  body.addColorStop(0, color);
  body.addColorStop(1, dark);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, 13 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.save();
  ctx.rotate(aim);
  ctx.translate(-recoil * 1.3, 0);
  ctx.fillStyle = dark;
  roundRect(ctx, 4 * scale, -6 * scale, 20 * scale, 12 * scale, 3);
  ctx.fill();
  ctx.fillStyle = '#1a120c';
  ctx.fillRect(20 * scale, -4.5 * scale, 5 * scale, 9 * scale);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(8 * scale, -3 * scale, 10 * scale, 2 * scale);
  ctx.restore();
}

function drawIceTower(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
): void {
  const pulse = 1 + Math.sin(time * 3) * 0.06;
  ctx.save();
  ctx.scale(pulse, pulse);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(0, -20 * scale);
  ctx.lineTo(12 * scale, 8 * scale);
  ctx.lineTo(0, 4 * scale);
  ctx.lineTo(-12 * scale, 8 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -20 * scale);
  ctx.lineTo(7 * scale, 2 * scale);
  ctx.lineTo(0, -2 * scale);
  ctx.lineTo(-4 * scale, 2 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + time * 0.4;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 11 * scale, Math.sin(a) * 11 * scale);
  }
  ctx.stroke();
  ctx.restore();
}

function drawLightningTower(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  aim: number,
  time: number,
  scale: number,
  recoil: number,
): void {
  ctx.fillStyle = dark;
  roundRect(ctx, -8 * scale, -6 * scale, 16 * scale, 18 * scale, 4);
  ctx.fill();
  ctx.save();
  ctx.rotate(aim);
  ctx.translate(-recoil, 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-3 * scale, -16 * scale);
  ctx.lineTo(6 * scale, -2 * scale);
  ctx.lineTo(1 * scale, -2 * scale);
  ctx.lineTo(5 * scale, 14 * scale);
  ctx.lineTo(-6 * scale, 0);
  ctx.lineTo(-1 * scale, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = `rgba(255, 230, 120, ${0.35 + Math.sin(time * 12) * 0.25})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -2, 15 * scale, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFireTower(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
): void {
  ctx.fillStyle = '#3a241c';
  roundRect(ctx, -11 * scale, 0, 22 * scale, 12 * scale, 4);
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.fillRect(-13 * scale, -2 * scale, 4 * scale, 14 * scale);
  ctx.fillRect(9 * scale, -2 * scale, 4 * scale, 14 * scale);
  const flicker = 1 + Math.sin(time * 11) * 0.12 + Math.sin(time * 17) * 0.08;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 8 * scale);
  ctx.quadraticCurveTo(14 * scale * flicker, -2, 0, -16 * scale * flicker);
  ctx.quadraticCurveTo(-14 * scale * flicker, -2, 0, 8 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffe08a';
  ctx.beginPath();
  ctx.moveTo(0, 4 * scale);
  ctx.quadraticCurveTo(7 * scale, -2, 0, -10 * scale * flicker);
  ctx.quadraticCurveTo(-7 * scale, -2, 0, 4 * scale);
  ctx.fill();
}

function drawPoisonTower(
  ctx: CanvasRenderingContext2D,
  color: string,
  dark: string,
  time: number,
  scale: number,
): void {
  ctx.fillStyle = '#2a3a2e';
  ctx.beginPath();
  ctx.ellipse(0, 6 * scale, 13 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dark;
  roundRect(ctx, -11 * scale, -8 * scale, 22 * scale, 16 * scale, 8);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, -4 * scale, 9 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  const b1 = Math.sin(time * 3.2) * 2;
  const b2 = Math.sin(time * 4.1 + 1) * 2;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(-4 * scale, -10 * scale + b1, 3.2 * scale, 0, Math.PI * 2);
  ctx.arc(5 * scale, -14 * scale + b2, 2.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, selected: boolean, time: number): void {
  const bob = Math.sin(e.bob) * (e.kind === 'boss' ? 1.2 : 2.2);
  const x = e.pos.x;
  const y = e.pos.y + bob;
  const r = e.radius;

  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(e.pos.x, e.pos.y + r * 0.75, r * 0.95, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(e.facing);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
  g.addColorStop(0, e.hitFlash > 0.3 ? '#ffffff' : e.color);
  g.addColorStop(1, e.colorDark);
  ctx.fillStyle = g;

  switch (e.kind) {
    case 'scout':
      ctx.beginPath();
      ctx.moveTo(r * 1.25, 0);
      ctx.lineTo(-r * 0.7, r * 0.75);
      ctx.lineTo(-r * 0.35, 0);
      ctx.lineTo(-r * 0.7, -r * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(r * 0.15, -r * 0.15, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'grunt':
      roundRect(ctx, -r * 0.85, -r * 0.75, r * 1.7, r * 1.5, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = e.colorDark;
      roundRect(ctx, -r * 0.45, -r * 0.35, r * 0.9, r * 0.55, 2);
      ctx.fill();
      ctx.fillStyle = '#dfe8f0';
      ctx.fillRect(r * 0.35, -r * 0.15, r * 0.55, r * 0.28);
      break;
    case 'brute':
      roundRect(ctx, -r, -r, r * 2, r * 2, 5);
      ctx.fill();
      ctx.fillStyle = e.colorDark;
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 1.15);
      ctx.lineTo(r * 0.15, -r * 0.5);
      ctx.lineTo(-r * 0.5, -r * 0.5);
      ctx.closePath();
      ctx.moveTo(r * 0.55, -r * 1.05);
      ctx.lineTo(r * 0.9, -r * 0.35);
      ctx.lineTo(r * 0.2, -r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      roundRect(ctx, -r * 0.7, -r * 0.7, r * 1.4, r * 1.4, 4);
      ctx.stroke();
      break;
    case 'swarm':
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = e.colorDark;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, 0);
      ctx.lineTo(-r * 1.3, -r * 0.8);
      ctx.moveTo(-r * 0.2, 0);
      ctx.lineTo(-r * 1.3, r * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#14332e';
      ctx.beginPath();
      ctx.arc(r * 0.35, -r * 0.2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'boss':
      roundRect(ctx, -r, -r * 0.9, r * 2, r * 1.85, 8);
      ctx.fill();
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.7);
      ctx.lineTo(0, -r * 1.25);
      ctx.lineTo(r * 0.7, -r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(0, -r * 0.15, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(212, 160, 255, ${0.5 + Math.sin(time * 3) * 0.25})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  ctx.restore();

  if (selected) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (e.slowMul < 1) {
    ctx.strokeStyle = 'rgba(154, 228, 247, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 4, time * 2, time * 2 + Math.PI * 1.2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(180, 240, 255, 0.35)';
    for (let i = 0; i < 3; i++) {
      const a = time * 2.4 + i * 2.1;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (e.burnTimer > 0) {
    ctx.strokeStyle = 'rgba(255, 107, 74, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.poisonTimer > 0) {
    ctx.strokeStyle = 'rgba(123, 227, 138, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  const bw = Math.max(28, r * 2.35);
  const bh = 5;
  const bx = e.pos.x - bw / 2;
  const by = e.pos.y - r - 14;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, bx, by, bw, bh, 2);
  ctx.fill();
  const pct = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = pct > 0.45 ? '#57cc99' : pct > 0.2 ? '#f4d35e' : '#ef476f';
  roundRect(ctx, bx, by, bw * pct, bh, 2);
  ctx.fill();
}

export function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile): void {
  const x = p.x;
  const y = p.visualY();
  const ang = Math.atan2(p.vy, p.vx || 1);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);

  switch (p.kind) {
    case 'arrow':
      ctx.strokeStyle = `${p.color}99`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-4, 0);
      ctx.stroke();
      ctx.fillStyle = '#e8f4ff';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -3.5);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(4, -4);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      break;
    case 'cannon': {
      const shadow = ctx.createRadialGradient(0, 0, 1, 0, 0, 8);
      shadow.addColorStop(0, '#3a2418');
      shadow.addColorStop(1, p.color);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,220,160,0.55)';
      ctx.beginPath();
      ctx.arc(-2, -2, 2.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ice':
      ctx.fillStyle = '#e8fbff';
      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-8, 0);
      ctx.lineTo(0, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      break;
    case 'fire':
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.quadraticCurveTo(0, 8, -10, 0);
      ctx.quadraticCurveTo(0, -8, 10, 0);
      ctx.fill();
      ctx.fillStyle = '#ffe08a';
      ctx.beginPath();
      ctx.arc(2, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'poison': {
      const wob = Math.sin(p.age * 14) * 1.2;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6 + wob, 5 - wob * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
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

    ctx.globalAlpha = a * 0.35;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = (b.width || 3) * 3;
    strokePts(ctx, pts);

    ctx.globalAlpha = a;
    ctx.strokeStyle = '#fff6c2';
    ctx.lineWidth = b.width || 3;
    strokePts(ctx, pts);

    ctx.fillStyle = '#fff';
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(b.x2, b.y2, 4 + (1 - a) * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function strokePts(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}
