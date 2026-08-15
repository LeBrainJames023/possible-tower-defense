import type { Enemy, Tower } from './entities';
import { PX } from './constants';
import { ENEMY_GAIT, creatureFor } from './enemies';
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
  const gait = ENEMY_GAIT[e.kind];
  const bob = Math.sin(e.bob) * gait.bobAmp;
  const sway = Math.sin(e.bob * 0.5) * gait.sway;
  const jitter = gait.jitter ? Math.sin(e.bob * 3.4) * gait.jitter + Math.sin(time * 31 + e.id) * gait.jitter * 0.35 : 0;
  const squash = Math.sin(e.bob) * gait.squash;
  const x = e.pos.x + sway + jitter;
  const y = e.pos.y + bob;
  const r = e.radius;

  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(e.pos.x, e.pos.y + r * 0.75, r * 0.95, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = TEX.creatures[creatureFor(e.kind)];
  if (texReady(img)) {
    const h = r * 3.35;
    const w = h * (img.naturalWidth / img.naturalHeight);
    const flip = Math.cos(e.facing) < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip * (1 + squash), 1 - squash);
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

  const hurt = e.hp < e.maxHp - 0.4;
  const by = e.pos.y - (texReady(TEX.creatures[creatureFor(e.kind)]) ? r * 2.7 : r) - 14;
  if (hurt || selected) {
    const bw = Math.max(28, r * 2.35);
    const bh = 5;
    const bx = e.pos.x - bw / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, bx, by, bw, bh, 2);
    ctx.fill();
    const pct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = pct > 0.45 ? '#57cc99' : pct > 0.2 ? '#f4d35e' : '#ef476f';
    roundRect(ctx, bx, by, bw * pct, bh, 2);
    ctx.fill();
  }

  const icons: string[] = [];
  if (e.slowMul < 1) icons.push('#9ae4f7');
  if (e.burnTimer > 0) icons.push('#ff6b4a');
  if (e.poisonTimer > 0) icons.push('#7be38a');
  icons.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(e.pos.x - (icons.length - 1) * 5 + i * 10, by - 8, 3.2 + Math.sin(time * 6 + i) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}
