import type { Enemy, Tower } from './entities';
import { PX } from './constants';
import { drawTowerBody } from './drawTowers';
import { TEX, texReady } from './assets';

export { drawBeams, drawProjectile } from './drawProjectiles';

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

export function drawTower(ctx: CanvasRenderingContext2D, t: Tower, selected: boolean, time: number): void {
  const def = t.def;
  const { x, y } = t;
  const scale = PX * 1.1 * (1 + (t.level - 1) * 0.08);
  const recoil = t.recoil * 5 * PX;

  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = `${def.color}55`;
    ctx.lineWidth = 2 * PX;
    ctx.setLineDash([7 * PX, 6 * PX]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `${def.color}10`;
    ctx.fill();
  }

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

  if (t.muzzle > 0.05 && (t.kind === 'arrow' || t.kind === 'cannon')) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t.aim);
    ctx.globalAlpha = t.muzzle;
    ctx.fillStyle = '#fff6d0';
    ctx.beginPath();
    ctx.ellipse(18 * scale - recoil, 0, (8 + t.muzzle * 6) * PX, 4 * PX, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (t.level > 1) {
    ctx.fillStyle = '#f4d35e';
    ctx.font = `bold ${Math.round(12 * PX)}px DM Sans, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(t.level === 3 ? '★★' : '★', x, y + 28 * PX);
  }
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

  const img = TEX.enemies[e.kind];
  if (texReady(img)) {
    const h = r * 3.35;
    const w = h * (img.naturalWidth / img.naturalHeight);
    const flip = Math.cos(e.facing) < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.drawImage(img, -w / 2, -h + r * 0.55, w, h);
    if (e.hitFlash > 0.25) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.7, e.hitFlash);
      ctx.drawImage(img, -w / 2, -h + r * 0.55, w, h);
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = e.hitFlash > 0.3 ? '#ffffff' : e.color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

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
  const by = e.pos.y - (texReady(TEX.enemies[e.kind]) ? r * 2.7 : r) - 14;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, bx, by, bw, bh, 2);
  ctx.fill();
  const pct = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = pct > 0.45 ? '#57cc99' : pct > 0.2 ? '#f4d35e' : '#ef476f';
  roundRect(ctx, bx, by, bw * pct, bh, 2);
  ctx.fill();
}
