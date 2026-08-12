import { COLS, ROWS, TILE, type CellKind, type TowerKind, TOWERS } from './constants';
import type { Enemy, FloatingText, BeamFx, Projectile, Tower } from './entities';
import type { Vec2 } from '../shared/math';
import { drawBeams, drawEnemy, drawProjectile, drawTower } from './sprites';
import { drawFx, type FxWorld } from './fx';
import { themeFor, type MapTheme } from './themes';

function hash(c: number, r: number, salt = 0): number {
  const n = Math.sin(c * 12.9898 + r * 78.233 + salt * 4.12) * 43758.5453;
  return n - Math.floor(n);
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  time = 0;
  theme: MapTheme = themeFor(1);

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setLevel(id: number): void {
    this.theme = themeFor(id);
  }

  clear(): void {
    const { ctx, theme } = this;
    const g = ctx.createLinearGradient(0, 0, MAP_W(), MAP_H());
    g.addColorStop(0, theme.sky0);
    g.addColorStop(1, theme.sky1);
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
        if (kind === 'path') {
          this.drawDirt(x, y, c, r);
        } else {
          this.drawGrass(x, y, c, r);
          if (kind === 'decor') this.drawTree(x + TILE / 2, y + TILE / 2 + 2, c, r);
          else if (showBuildHints) {
            ctx.strokeStyle = 'rgba(244, 211, 94, 0.2)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
          }
        }
      }
    }

    if (hover && selectedKind) {
      const x = hover.c * TILE;
      const y = hover.r * TILE;
      ctx.fillStyle = canPlace ? 'rgba(87, 204, 153, 0.28)' : 'rgba(239, 71, 111, 0.3)';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = canPlace ? '#57cc99' : '#ef476f';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
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

  private drawGrass(x: number, y: number, c: number, r: number): void {
    const { ctx, theme } = this;
    ctx.fillStyle = (c + r) % 2 === 0 ? theme.grassA : theme.grassB;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = theme.blade;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const hx = hash(c, r, i);
      const hy = hash(c, r, i + 9);
      const px = x + 6 + hx * 36;
      const py = y + 10 + hy * 30;
      ctx.moveTo(px, py);
      ctx.lineTo(px + 1.5, py - 5 - hy * 4);
    }
    ctx.stroke();
  }

  private drawDirt(x: number, y: number, c: number, r: number): void {
    const { ctx, theme } = this;
    ctx.fillStyle = theme.pathEdge;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = theme.pathMid;
    ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.fillStyle = theme.pathLight;
    ctx.fillRect(x + 10, y + 11, TILE - 22, TILE - 24);
    ctx.fillStyle = theme.pebble;
    for (let i = 0; i < 4; i++) {
      const hx = hash(c, r, 20 + i);
      const hy = hash(c, r, 30 + i);
      ctx.globalAlpha = 0.35 + hx * 0.35;
      ctx.beginPath();
      ctx.arc(x + 8 + hx * 32, y + 8 + hy * 32, 1.2 + hy, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 20);
    ctx.lineTo(x + 22, y + 28);
    ctx.stroke();
  }

  private drawTree(cx: number, cy: number, c: number, r: number): void {
    const { ctx, theme } = this;
    const lean = (hash(c, r, 1) - 0.5) * 6;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.trunk;
    ctx.beginPath();
    ctx.moveTo(cx - 3 + lean, cy + 12);
    ctx.lineTo(cx + 3 + lean, cy + 12);
    ctx.lineTo(cx + 2, cy - 4);
    ctx.lineTo(cx - 2, cy - 4);
    ctx.closePath();
    ctx.fill();
    const canopy = ctx.createRadialGradient(cx - 3, cy - 10, 2, cx, cy - 4, 18);
    canopy.addColorStop(0, theme.canopy);
    canopy.addColorStop(1, theme.canopyDark);
    ctx.fillStyle = canopy;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx + 16, cy - 2);
    ctx.lineTo(cx + 8, cy + 2);
    ctx.lineTo(cx - 8, cy + 2);
    ctx.lineTo(cx - 16, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = theme.canopy;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 16);
    ctx.lineTo(cx + 7, cy - 6);
    ctx.lineTo(cx - 8, cy - 4);
    ctx.closePath();
    ctx.fill();
  }

  drawPathGlow(waypoints: Vec2[]): void {
    if (waypoints.length < 2) return;
    const { ctx, theme } = this;
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = 24;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
    ctx.stroke();
  }

  drawSpawnExit(waypoints: Vec2[]): void {
    if (waypoints.length < 2) return;
    const { ctx } = this;
    const pulse = 0.85 + Math.sin(this.time * 3) * 0.15;
    const s = waypoints[0];
    const e = waypoints[waypoints.length - 1];

    const sg = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, 28 * pulse);
    sg.addColorStop(0, 'rgba(110, 182, 234, 0.95)');
    sg.addColorStop(1, 'rgba(110, 182, 234, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 28 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dfefff';
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x - 8, s.y - 8, 16, 16);
    ctx.fillStyle = '#dfefff';
    ctx.font = 'bold 11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IN', s.x, s.y - 32);

    const eg = ctx.createRadialGradient(e.x, e.y, 2, e.x, e.y, 30 * pulse);
    eg.addColorStop(0, 'rgba(239, 71, 111, 0.95)');
    eg.addColorStop(1, 'rgba(239, 71, 111, 0)');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb070';
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - 11);
    ctx.lineTo(e.x + 10, e.y + 7);
    ctx.lineTo(e.x - 10, e.y + 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd6e0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd6e0';
    ctx.fillText('BASE', e.x, e.y - 34);
  }

  drawTower(t: Tower, selected: boolean): void {
    drawTower(this.ctx, t, selected, this.time);
  }

  drawEnemy(e: Enemy, selected: boolean): void {
    drawEnemy(this.ctx, e, selected, this.time);
  }

  drawProjectile(p: Projectile): void {
    drawProjectile(this.ctx, p);
  }

  drawBeams(beams: BeamFx[]): void {
    drawBeams(this.ctx, beams);
  }

  drawParticles(fx: FxWorld): void {
    drawFx(this.ctx, fx);
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
    ctx.fillStyle = 'rgba(7, 16, 24, 0.45)';
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
