import type { Enemy, Tower } from './entities';
import type { Troop } from './troops';
import { PX, TILE, TOWER_FEET, towerPaintHeight, type TowerKind } from './constants';
import { ENEMY_GAIT, creatureFor, walkFrameIndex, ENEMIES } from './enemies';
import { drawTowerBody } from './drawTowers';
import { TEX, texReady } from './assets';

const STATIC_TOWERS: TowerKind[] = ['ice', 'lightning', 'fire', 'poison', 'longshot', 'void'];

function billboardHeight(t: Tower): number {
  return towerPaintHeight(t.level);
}

function drawFeetBillboard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  h: number,
  feetY: number,
  fillTile = false,
): void {
  let w = h * (img.naturalWidth / Math.max(1, img.naturalHeight));
  if (fillTile && w < TILE * 0.9) {
    const s = (TILE * 0.9) / w;
    w *= s;
    h *= s;
  }
  if (w > TILE) {
    const s = TILE / w;
    w = TILE;
    h *= s;
  }
  ctx.drawImage(img, -w / 2, -h + feetY, w, h);
}

function drawCenteredBillboard(ctx: CanvasRenderingContext2D, img: HTMLImageElement, h: number): void {
  const w = h * (img.naturalWidth / Math.max(1, img.naturalHeight));
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
}

/** Painted stills. Ice/fire/lightning/poison never rotate. Arrow ballista and cannon barrel follow aim. */
function drawPaintedTower(ctx: CanvasRenderingContext2D, t: Tower, recoil: number): boolean {
  const h = billboardHeight(t);
  const feet = TOWER_FEET;
  const { arrowBase, arrowTurret, cannonGun, cannonBase } = TEX.towerParts;

  if (t.kind === 'arrow' && texReady(arrowBase) && texReady(arrowTurret)) {
    drawFeetBillboard(ctx, arrowBase, h, feet, true);
    ctx.save();
    ctx.translate(0, -h * 0.5 + feet);
    ctx.rotate(t.aim + Math.PI);
    ctx.translate(recoil * 1.1, 0);
    drawCenteredBillboard(ctx, arrowTurret, h * 0.7);
    ctx.restore();
    return true;
  }

  if (t.kind === 'cannon' && texReady(cannonGun)) {
    if (texReady(cannonBase)) {
      drawFeetBillboard(ctx, cannonBase, h * 0.92, feet, true);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 11 * PX, 17 * PX, 5 * PX, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(0, texReady(cannonBase) ? -h * 0.22 + feet : 2 * PX);
    ctx.rotate(t.aim + Math.PI);
    ctx.translate(recoil * 1.25, 0);
    drawCenteredBillboard(ctx, cannonGun, texReady(cannonBase) ? h * 0.58 : h * 0.82);
    ctx.restore();
    return true;
  }

  const body = TEX.towers[t.kind];
  if (STATIC_TOWERS.includes(t.kind) && texReady(body)) {
    drawFeetBillboard(ctx, body, h, feet);
    return true;
  }

  return false;
}

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

function drawRangeRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  fill: boolean,
  dash: number[],
  lineWidth: number,
  strokeAlpha: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `${color}${strokeAlpha}`;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);
  if (fill) {
    ctx.fillStyle = `${color}10`;
    ctx.fill();
  }
}

/** Tint on an offscreen canvas so source-atop cannot wash the map under the sprite. */
let tintScratch: HTMLCanvasElement | null = null;
let tintCtx: CanvasRenderingContext2D | null = null;

function drawTintedSprite(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  color: string,
  alpha: number,
): void {
  const w = Math.max(1, Math.ceil(dw));
  const h = Math.max(1, Math.ceil(dh));
  if (!tintScratch || !tintCtx) {
    tintScratch = document.createElement('canvas');
    tintCtx = tintScratch.getContext('2d');
  }
  const off = tintCtx;
  if (!off || !tintScratch) {
    ctx.drawImage(img, dx, dy, dw, dh);
    return;
  }
  if (tintScratch.width !== w || tintScratch.height !== h) {
    tintScratch.width = w;
    tintScratch.height = h;
  } else {
    off.clearRect(0, 0, w, h);
  }
  off.globalCompositeOperation = 'source-over';
  off.globalAlpha = 1;
  off.drawImage(img, 0, 0, w, h);
  off.globalCompositeOperation = 'source-atop';
  off.globalAlpha = alpha;
  off.fillStyle = color;
  off.fillRect(0, 0, w, h);
  off.globalAlpha = 1;
  off.globalCompositeOperation = 'source-over';
  ctx.drawImage(tintScratch, dx, dy, dw, dh);
}

function drawRankStar(ctx: CanvasRenderingContext2D, x: number, y: number, outer: number, fill: string, stroke: string): void {
  const inner = outer * 0.42;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const b = a + Math.PI / 5;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
    else ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
    ctx.lineTo(x + Math.cos(b) * inner, y + Math.sin(b) * inner);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.2 * PX;
  ctx.stroke();
}

export function drawTower(
  ctx: CanvasRenderingContext2D,
  t: Tower,
  selected: boolean,
  time: number,
  upgradePreview = false,
  rallyPreview = false,
): void {
  const def = t.def;
  const { x, y } = t;
  const scale = PX * 1.32 * (1 + (t.level - 1) * 0.08);
  const recoil = t.recoil * 5 * PX;

  if (selected) {
    if (t.kind === 'hall' && rallyPreview) {
      drawRangeRing(ctx, x, y, t.range, '#f4d35e', true, [], 3 * PX, 'cc');
    } else if (upgradePreview && t.kind !== 'hall') {
      const fork = t.previewFork ?? t.fork;
      const lv = t.canNumberUpgrade() ? t.level + 1 : t.level;
      drawRangeRing(ctx, x, y, t.rangeAt(lv, fork), '#f4d35e', true, [], 3 * PX, 'cc');
    }
    drawRangeRing(ctx, x, y, t.range, def.color, true, [7 * PX, 6 * PX], 2.2 * PX, '99');
  }

  if (t.kind === 'hall') {
    const fx = t.rallyCol * TILE + TILE / 2;
    const fy = t.rallyRow * TILE + TILE / 2;
    ctx.strokeStyle = 'rgba(40, 24, 12, 0.85)';
    ctx.lineWidth = 2 * PX;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 6 * PX);
    ctx.lineTo(fx, fy - 18 * PX);
    ctx.stroke();
    ctx.fillStyle = '#c42818';
    ctx.beginPath();
    ctx.moveTo(fx, fy - 18 * PX);
    ctx.lineTo(fx + 12 * PX, fy - 12 * PX);
    ctx.lineTo(fx, fy - 6 * PX);
    ctx.closePath();
    ctx.fill();
  }

  if (t.choked) {
    ctx.fillStyle = 'rgba(210, 160, 70, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * PX, 22 * PX, 10 * PX, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (t.frozen) {
    ctx.fillStyle = 'rgba(154, 228, 247, 0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * PX, 24 * PX, 11 * PX, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 245, 255, 0.55)';
    ctx.lineWidth = 2 * PX;
    ctx.stroke();
  }
  if (t.hazed) {
    ctx.fillStyle = 'rgba(255, 90, 30, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * PX, 24 * PX, 11 * PX, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 160, 60, ${0.35 + Math.sin(time * 5) * 0.12})`;
    ctx.lineWidth = 2 * PX;
    ctx.stroke();
  }
  if (t.muffled) {
    ctx.fillStyle = 'rgba(160, 80, 220, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * PX, 22 * PX, 10 * PX, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (t.sealed) {
    ctx.fillStyle = 'rgba(160, 60, 220, 0.34)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8 * PX, 24 * PX, 11 * PX, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(220, 140, 255, ${0.4 + Math.sin(time * 5) * 0.14})`;
    ctx.lineWidth = 2 * PX;
    ctx.stroke();
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
  if (!drawPaintedTower(ctx, t, recoil)) {
    drawTowerBody(ctx, t, time, scale, recoil);
  }
  ctx.restore();

  if (t.muzzle > 0.05) {
    const m = t.muzzlePoint();
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(t.aim);
    ctx.globalAlpha = t.muzzle;
    const kick = 6 * scale;
    if (t.kind === 'arrow' || t.kind === 'cannon' || t.kind === 'longshot') {
      ctx.fillStyle = '#fff6d0';
      ctx.beginPath();
      ctx.ellipse(kick + 4 * scale, 0, (8 + t.muzzle * 6) * PX, 4 * PX, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.kind === 'ice') {
      ctx.fillStyle = '#e8fbff';
      ctx.beginPath();
      ctx.arc(kick, 0, (5 + t.muzzle * 5) * PX, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.kind === 'lightning') {
      ctx.strokeStyle = '#fff8d0';
      ctx.lineWidth = 2.2 * PX;
      ctx.beginPath();
      ctx.moveTo(kick - 6 * PX, -5 * PX);
      ctx.lineTo(kick + 2 * PX, 3 * PX);
      ctx.lineTo(kick + 10 * PX, -2 * PX);
      ctx.stroke();
    } else if (t.kind === 'fire') {
      ctx.fillStyle = '#ffb14a';
      ctx.beginPath();
      ctx.ellipse(kick, 0, (9 + t.muzzle * 7) * PX, 5 * PX, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.kind === 'poison') {
      ctx.fillStyle = t.def.color;
      ctx.beginPath();
      ctx.ellipse(kick, 2 * PX, 4 * PX, 6 * PX, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (t.kind === 'void') {
      ctx.fillStyle = '#c8b0ff';
      ctx.beginPath();
      ctx.arc(kick, 0, (5 + t.muzzle * 4) * PX, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const rank =
    t.fork
      ? { fill: '#ffe08a', stroke: '#8a6200' }
      : t.level >= 3
        ? { fill: '#f4d35e', stroke: '#8a6200' }
        : t.level >= 2
          ? { fill: '#d0d6e0', stroke: '#5a6574' }
          : { fill: '#c47a3a', stroke: '#6a3a12' };
  drawRankStar(ctx, x, y + 26 * PX, 7.5 * PX, rank.fill, rank.stroke);
}

export function drawTroop(ctx: CanvasRenderingContext2D, tr: Troop): void {
  const { x, y } = tr.pos;
  const r = tr.radius;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.45, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tr.hitFlash > 0.3 ? '#ffffff' : tr.color;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.15, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a2810';
  ctx.lineWidth = 1.4 * PX;
  ctx.stroke();
  ctx.restore();

  if (tr.hp < tr.maxHp - 0.2 || tr.hitFlash > 0.12) {
    const bw = Math.max(22, r * 2.2);
    const bh = 5;
    const bx = x - bw / 2;
    const by = y - r - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, bx, by, bw, bh, 2);
    ctx.fill();
    const pct = Math.max(0, tr.hp / tr.maxHp);
    ctx.fillStyle = pct > 0.45 ? '#57cc99' : pct > 0.2 ? '#f4d35e' : '#ef476f';
    roundRect(ctx, bx, by, Math.max(2, bw * pct), bh, 2);
    ctx.fill();
  }
}

function enemyBillboard(e: Enemy): { img: HTMLImageElement; flip: number; puppet: boolean } | null {
  const slot = creatureFor(e.kind);
  const dirWalk = TEX.creatureDirWalks[slot][e.cardinal].filter(texReady);
  if (dirWalk.length) {
    return { img: dirWalk[walkFrameIndex(e.bob, dirWalk.length)], flip: 1, puppet: false };
  }
  const faces = TEX.creatureFaces[slot];
  if (e.cardinal === 'n' || e.cardinal === 's') {
    const face = faces[e.cardinal];
    if (texReady(face)) return { img: face, flip: 1, puppet: true };
  }
  const walk = TEX.creatureWalks[slot].filter(texReady);
  if (walk.length) {
    return { img: walk[walkFrameIndex(e.bob, walk.length)], flip: e.flip, puppet: false };
  }
  const sideFace = e.cardinal === 'e' || e.cardinal === 'w' ? faces[e.cardinal] : null;
  if (texReady(sideFace)) return { img: sideFace, flip: 1, puppet: true };
  const still = TEX.creatures[slot];
  if (texReady(still)) return { img: still, flip: e.flip, puppet: true };
  return null;
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, selected: boolean, time: number): void {
  const gait = ENEMY_GAIT[e.kind];
  const billboard = enemyBillboard(e);
  const puppet = billboard?.puppet ?? true;
  const bob = puppet ? Math.sin(e.bob) * gait.bobAmp : 0;
  const sway = puppet ? Math.sin(e.bob * 0.5) * gait.sway : 0;
  const jitter = puppet && gait.jitter
    ? Math.sin(e.bob * 3.4) * gait.jitter + Math.sin(time * 31 + e.id) * gait.jitter * 0.35
    : 0;
  const squash = puppet ? Math.sin(e.bob) * gait.squash : 0;
  const r = e.radius;
  const air = e.flying ? r * 1.25 : 0;
  const sink = e.burrowed ? 0.55 : 1;
  const x = e.pos.x + sway + jitter;
  const y = e.pos.y + bob - air + (e.burrowed ? r * 0.45 : 0);

  ctx.fillStyle = e.flying ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(e.pos.x, e.pos.y + r * 0.75, r * (e.flying ? 0.7 : 0.95), r * (e.flying ? 0.22 : 0.32), 0, 0, Math.PI * 2);
  ctx.fill();
  if (e.flying) {
    ctx.strokeStyle = `${e.color}55`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.72, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const role = ENEMIES[e.kind].role;
  if (role === 'champion' || role === 'boss') {
    ctx.strokeStyle = `${e.color}88`;
    ctx.lineWidth = role === 'boss' ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.78, r * 1.15, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'duneTyrant') {
    ctx.strokeStyle = `rgba(224, 176, 64, ${0.35 + Math.sin(time * 3) * 0.12})`;
    ctx.lineWidth = 2.2 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.2, r * 2.4, r * 1.1, time * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'packLord') {
    ctx.strokeStyle = `rgba(154, 228, 247, ${0.32 + Math.sin(time * 3) * 0.12})`;
    ctx.lineWidth = 2.2 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.2, r * 2.5, r * 1.15, time * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'frostJarl' && e.freezing) {
    ctx.strokeStyle = `rgba(180, 240, 255, ${0.45 + Math.sin(time * 6) * 0.15})`;
    ctx.lineWidth = 2.6 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.15, r * 2.8, r * 1.25, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'cinderKing') {
    ctx.strokeStyle = `rgba(255, 90, 30, ${0.35 + Math.sin(time * 3.2) * 0.14})`;
    ctx.lineWidth = 2.2 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.2, r * 2.5, r * 1.15, time * 0.45, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'hexWarden') {
    ctx.strokeStyle = `rgba(180, 80, 230, ${0.36 + Math.sin(time * 3) * 0.14})`;
    ctx.lineWidth = 2.2 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.2, r * 2.15, r * 1.0, time * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'magician') {
    ctx.strokeStyle = `rgba(200, 120, 255, ${0.34 + Math.sin(time * 2.6) * 0.14})`;
    ctx.lineWidth = 2.4 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.15, r * 2.4, r * 1.1, time * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'hexKnight' && e.armor > 0.4) {
    ctx.strokeStyle = `rgba(170, 90, 230, ${0.4 + Math.sin(time * 2.4) * 0.12})`;
    ctx.lineWidth = 2.4 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y, r * 1.35, r * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.kind === 'magmaHound' && e.burnTimer <= 0) {
    ctx.fillStyle = `rgba(255, 110, 40, ${0.28 + Math.sin(time * 4) * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.15, r * 1.15, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.kind === 'cinderBrute' && e.armor > 0.4) {
    ctx.strokeStyle = `rgba(255, 140, 50, ${0.4 + Math.sin(time * 2.4) * 0.12})`;
    ctx.lineWidth = 2.4 * PX;
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y, r * 1.35, r * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.burrowed) {
    ctx.fillStyle = 'rgba(196, 160, 96, 0.45)';
    ctx.beginPath();
    ctx.ellipse(e.pos.x, e.pos.y + r * 0.7, r * 1.15, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (billboard) {
    const { img, flip } = billboard;
    const h = r * 3.35;
    const w = h * (img.naturalWidth / img.naturalHeight);
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = e.phased ? 0.38 : 1;
    ctx.scale(flip * (1 + squash), (1 - squash) * sink);
    ctx.shadowColor = 'rgba(0,0,0,0.72)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    drawTintedSprite(ctx, img, -w / 2, -h + r * 0.55, w, h, e.color, 0.28);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
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

  const hurt = e.hp < e.maxHp - 0.2;
  const showBar = selected || hurt || e.hitFlash > 0.12;
  const by = y - (billboard ? r * 2.7 : r) - 16;
  if (showBar) {
    const bw = Math.max(32, r * 2.5);
    const bh = 7;
    const bx = e.pos.x - bw / 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineWidth = 2;
    roundRect(ctx, bx - 1, by - 1, bw + 2, bh + 2, 3);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, bx, by, bw, bh, 2);
    ctx.fill();
    const pct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = pct > 0.45 ? '#57cc99' : pct > 0.2 ? '#f4d35e' : '#ef476f';
    roundRect(ctx, bx, by, Math.max(2, bw * pct), bh, 2);
    ctx.fill();
  }

  const icons: string[] = [];
  if (e.slowMul < 1) icons.push('#9ae4f7');
  if (e.burnTimer > 0) icons.push('#ff6b4a');
  if (e.poisonTimer > 0) icons.push('#7be38a');
  if (e.burrowed) icons.push('#c4a060');
  if (e.phased) icons.push('#b8e8ff');
  if (e.kind === 'duneRunner' && e.verbSpeedMul > 1.4) icons.push('#e0b050');
  if (e.kind === 'iceWolf' && e.verbSpeedMul > 1.5) icons.push('#9ae4f7');
  if (e.kind === 'iceWolf' && e.verbSpeedMul > 1.15 && e.verbSpeedMul <= 1.5) icons.push('#d0e8f4');
  if (e.freezing) icons.push('#9ae4f7');
  if (e.kind === 'magmaHound' && e.burnTimer <= 0) icons.push('#ff7040');
  if (e.kind === 'cinderBrute' && e.armor > 0.4) icons.push('#e05020');
  if (e.kind === 'cinderKing') icons.push('#ff6020');
  if (e.kind === 'shade') icons.push('#a070d0');
  if (e.kind === 'hexKnight' && e.armor > 0.4) icons.push('#7a40b0');
  if (e.kind === 'hexWarden') icons.push('#c77dff');
  if (e.kind === 'magician' && !e.warped) icons.push('#d4a0ff');
  icons.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(e.pos.x - (icons.length - 1) * 5 + i * 10, by - 8, 3.2 + Math.sin(time * 6 + i) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}
