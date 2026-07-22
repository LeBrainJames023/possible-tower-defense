import { COLS, ROWS, TILE, type CellKind, type TowerKind, TOWERS } from './constants';
import type { Enemy, FloatingText, BeamFx, Projectile, Tower } from './entities';
import type { Vec2 } from '../shared/math';

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

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    const { ctx } = this;
    const g = ctx.createLinearGradient(0, 0, MAP_W(), MAP_H());
    g.addColorStop(0, '#0c1a14');
    g.addColorStop(0.45, '#0a1620');
    g.addColorStop(1, '#081018');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, COLS * TILE, ROWS * TILE);
  }

  drawGrid(
    grid: CellKind[][],
    hover: { c: number; r: number } | null,
    canPlace: boolean,
    selectedKind: TowerKind | null,
    showBuildHints: boolean,
  ): void {
    const { ctx } = this;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE;
        const y = r * TILE;
        const kind = grid[r][c];
        if (kind === 'grass') {
          ctx.fillStyle = (c + r) % 2 === 0 ? '#1a3a2c' : '#163328';
          ctx.fillRect(x, y, TILE, TILE);
          // soft turf texture
          ctx.fillStyle = 'rgba(120, 200, 150, 0.07)';
          ctx.beginPath();
          ctx.arc(x + 14, y + 18, 3, 0, Math.PI * 2);
          ctx.arc(x + 32, y + 30, 2.5, 0, Math.PI * 2);
          ctx.fill();
          if (showBuildHints) {
            ctx.strokeStyle = 'rgba(244, 211, 94, 0.18)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 6, y + 6, TILE - 12, TILE - 12);
          }
        } else if (kind === 'path') {
          ctx.fillStyle = '#3a2f24';
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = '#4a3c2e';
          ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
          ctx.fillStyle = 'rgba(255, 220, 140, 0.08)';
          ctx.fillRect(x + 10, y + 10, TILE - 20, TILE - 20);
        } else {
          // decor: trees / bushes — NOT build pads
          ctx.fillStyle = (c + r) % 2 === 0 ? '#1a3a2c' : '#163328';
          ctx.fillRect(x, y, TILE, TILE);
          this.drawTree(x + TILE / 2, y + TILE / 2 + 2);
        }
      }
    }

    if (hover && selectedKind) {
      const x = hover.c * TILE;
      const y = hover.r * TILE;
      ctx.fillStyle = canPlace ? 'rgba(87, 204, 153, 0.32)' : 'rgba(239, 71, 111, 0.32)';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = canPlace ? '#57cc99' : '#ef476f';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
      if (canPlace) {
        const def = TOWERS[selectedKind];
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, def.range, 0, Math.PI * 2);
        ctx.strokeStyle = `${def.color}66`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  private drawTree(cx: number, cy: number): void {
    const { ctx } = this;
    ctx.fillStyle = '#5c3d2e';
    ctx.fillRect(cx - 3, cy + 2, 6, 10);
    const canopy = ctx.createRadialGradient(cx - 2, cy - 6, 2, cx, cy - 2, 16);
    canopy.addColorStop(0, '#3f8f5a');
    canopy.addColorStop(1, '#1f4d30');
    ctx.fillStyle = canopy;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 8, cy + 2, 9, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy + 2, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPathGlow(waypoints: Vec2[]): void {
    if (waypoints.length < 2) return;
    const { ctx } = this;
    ctx.strokeStyle = 'rgba(244, 196, 100, 0.22)';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
    ctx.stroke();
  }

  drawSpawnExit(waypoints: Vec2[]): void {
    if (waypoints.length < 2) return;
    const { ctx } = this;
    const s = waypoints[0];
    const e = waypoints[waypoints.length - 1];
    const sg = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, 26);
    sg.addColorStop(0, 'rgba(91, 159, 212, 1)');
    sg.addColorStop(1, 'rgba(91, 159, 212, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dfefff';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IN', s.x, s.y - 28);

    const eg = ctx.createRadialGradient(e.x, e.y, 2, e.x, e.y, 28);
    eg.addColorStop(0, 'rgba(239, 71, 111, 1)');
    eg.addColorStop(1, 'rgba(239, 71, 111, 0)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd6e0';
    ctx.fillText('BASE', e.x, e.y - 30);
  }

  drawTower(t: Tower, selected: boolean): void {
    const { ctx } = this;
    const def = t.def;
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

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // stone base ring
    ctx.fillStyle = '#2a3340';
    ctx.beginPath();
    ctx.arc(x, y + 6, 16, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createLinearGradient(x - 14, y - 18, x + 14, y + 14);
    g.addColorStop(0, def.color);
    g.addColorStop(1, def.colorDark);
    ctx.fillStyle = g;
    roundRect(ctx, x - 13, y - 18, 26, 28, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - 13, y - 18, 26, 28, 8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    switch (t.kind) {
      case 'arrow':
        ctx.moveTo(x - 1, y - 12);
        ctx.lineTo(x + 8, y - 1);
        ctx.lineTo(x + 2, y - 1);
        ctx.lineTo(x + 6, y + 10);
        ctx.lineTo(x - 5, y + 0);
        ctx.lineTo(x, y + 0);
        ctx.closePath();
        ctx.fill();
        break;
      case 'cannon':
        ctx.arc(x, y - 1, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = def.colorDark;
        ctx.fillRect(x - 3, y - 14, 6, 11);
        break;
      case 'ice':
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
        }
        ctx.stroke();
        break;
      case 'lightning':
        ctx.moveTo(x - 2, y - 11);
        ctx.lineTo(x + 5, y - 1);
        ctx.lineTo(x, y - 1);
        ctx.lineTo(x + 4, y + 11);
        ctx.lineTo(x - 6, y + 1);
        ctx.lineTo(x - 1, y + 1);
        ctx.closePath();
        ctx.fill();
        break;
      case 'fire':
        ctx.moveTo(x, y + 8);
        ctx.quadraticCurveTo(x + 12, y - 2, x, y - 12);
        ctx.quadraticCurveTo(x - 12, y - 2, x, y + 8);
        ctx.fill();
        break;
      case 'poison':
        ctx.arc(x, y - 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 7, y + 6, 4, 0, Math.PI * 2);
        ctx.arc(x + 7, y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    if (t.level > 1) {
      ctx.fillStyle = '#f4d35e';
      ctx.font = 'bold 11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`L${t.level}`, x, y + 28);
    }
  }

  drawEnemy(e: Enemy, selected: boolean): void {
    const { ctx } = this;
    const { x, y } = e.pos;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + e.radius * 0.7, e.radius * 0.9, e.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, e.radius);
    g.addColorStop(0, e.color);
    g.addColorStop(1, e.colorDark);
    ctx.fillStyle = g;
    ctx.beginPath();
    if (e.kind === 'brute' || e.kind === 'boss') {
      roundRect(ctx, x - e.radius, y - e.radius, e.radius * 2, e.radius * 2, 6);
      ctx.fill();
    } else {
      ctx.arc(x, y, e.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (selected) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, e.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.slowMul < 1) {
      ctx.strokeStyle = 'rgba(126, 200, 227, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, e.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.burnTimer > 0) {
      ctx.strokeStyle = 'rgba(232, 93, 76, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, e.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.poisonTimer > 0) {
      ctx.strokeStyle = 'rgba(107, 203, 119, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, e.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    const bw = Math.max(26, e.radius * 2.3);
    const bh = 5;
    const bx = x - bw / 2;
    const by = y - e.radius - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, bx, by, bw, bh, 2);
    ctx.fill();
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = pct > 0.4 ? '#57cc99' : '#ef476f';
    roundRect(ctx, bx, by, bw * pct, bh, 2);
    ctx.fill();
  }

  drawProjectile(p: Projectile): void {
    const { ctx } = this;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.splash > 0 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (p.trail) {
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 8, p.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  drawBeams(beams: BeamFx[]): void {
    const { ctx } = this;
    for (const b of beams) {
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = Math.min(1, b.life * 3);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  drawFloating(texts: FloatingText[]): void {
    const { ctx } = this;
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px DM Sans, sans-serif';
    for (const t of texts) {
      ctx.globalAlpha = Math.min(1, t.life);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    }
  }

  drawPausedBanner(): void {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(7, 16, 24, 0.35)';
    ctx.fillRect(0, 0, COLS * TILE, 36);
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 16px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED — click enemies or towers to inspect', (COLS * TILE) / 2, 24);
  }
}

function MAP_W(): number {
  return COLS * TILE;
}
function MAP_H(): number {
  return ROWS * TILE;
}
