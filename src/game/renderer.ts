import { COLS, ROWS, TILE, PX, type CellKind, type TowerKind, TOWERS } from './constants';
import type { Enemy, FloatingText, BeamFx, Projectile, Tower } from './entities';
import type { Vec2 } from '../shared/math';
import { drawBeams, drawEnemy, drawProjectile, drawTower } from './sprites';
import { drawFx, type FxWorld } from './fx';
import { themeFor, type MapTheme } from './themes';
import { TEX, texReady } from './assets';
import { drawLandmarks } from './drawLandmarks';
import { isWetLevel, type WorldId } from './worlds';
import type { LevelDef } from './levels';

function hash(c: number, r: number, salt = 0): number {
  const n = Math.sin(c * 12.9898 + r * 78.233 + salt * 4.12) * 43758.5453;
  return n - Math.floor(n);
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  time = 0;
  theme: MapTheme = themeFor('forest');
  levelId = 1;
  world: WorldId = 'forest';
  stage = 1;
  /** 1 just after Start wave — arch glows, then fades. */
  spawnHeat = 0;
  /** 1 when a creep leaks — keep flashes wounded. */
  keepWound = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setLevel(level: LevelDef): void {
    this.levelId = level.id;
    this.world = level.world;
    this.stage = level.stage;
    this.theme = themeFor(level);
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
          if (kind === 'decor') this.drawTree(x + TILE / 2, y + TILE / 2 + 2 * PX, c, r);
          else if (showBuildHints) {
            ctx.strokeStyle = 'rgba(244, 211, 94, 0.22)';
            ctx.lineWidth = 1.5 * PX;
            ctx.strokeRect(x + 6 * PX, y + 6 * PX, TILE - 12 * PX, TILE - 12 * PX);
          }
        }
      }
    }

    if (hover) {
      const x = hover.c * TILE;
      const y = hover.r * TILE;
      if (selectedKind) {
        ctx.fillStyle = canPlace ? 'rgba(87, 204, 153, 0.28)' : 'rgba(239, 71, 111, 0.3)';
        ctx.fillRect(x, y, TILE, TILE);
        if (canPlace) {
          const def = TOWERS[selectedKind];
          ctx.beginPath();
          ctx.arc(x + TILE / 2, y + TILE / 2, def.range, 0, Math.PI * 2);
          ctx.strokeStyle = `${def.color}66`;
          ctx.lineWidth = 2 * PX;
          ctx.stroke();
        }
      }
      ctx.strokeStyle = selectedKind ? (canPlace ? '#57cc99' : '#ef476f') : 'rgba(244, 211, 94, 0.85)';
      ctx.lineWidth = 2.5 * PX;
      ctx.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
    }
  }

  private wetLevel(): boolean {
    return isWetLevel({ world: this.world, stage: this.stage });
  }

  private stampTexture(
    img: HTMLImageElement,
    x: number,
    y: number,
    c: number,
    r: number,
    alpha: number,
    composite: GlobalCompositeOperation,
  ): void {
    const { ctx } = this;
    const sw = Math.min(TILE, img.naturalWidth);
    const sh = Math.min(TILE, img.naturalHeight);
    const ox = Math.floor(hash(c, r, 3) * Math.max(1, img.naturalWidth - sw));
    const oy = Math.floor(hash(c, r, 7) * Math.max(1, img.naturalHeight - sh));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = composite;
    ctx.drawImage(img, ox, oy, sw, sh, x, y, TILE, TILE);
    ctx.restore();
  }

  private stampWater(x: number, y: number): void {
    const img = TEX.water;
    if (!texReady(img)) return;
    const { ctx } = this;
    const shift = (this.time * 18) % img.naturalWidth;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, TILE, TILE);
    ctx.clip();
    ctx.globalAlpha = this.wetLevel() ? 0.32 : 0.12;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(img, x - shift, y, img.naturalWidth, TILE);
    ctx.drawImage(img, x - shift + img.naturalWidth, y, img.naturalWidth, TILE);
    ctx.restore();
  }

  private drawGrass(x: number, y: number, c: number, r: number): void {
    const { ctx, theme } = this;
    const mix = hash(c, r, 2);
    ctx.fillStyle = mix > 0.55 ? theme.grassA : theme.grassB;
    ctx.fillRect(x, y, TILE, TILE);
    if (texReady(TEX.grass)) this.stampTexture(TEX.grass, x, y, c, r, 0.42, 'multiply');
    ctx.strokeStyle = theme.blade;
    ctx.lineWidth = 1.15 * PX;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const hx = hash(c, r, i);
      const hy = hash(c, r, i + 9);
      const px = x + 5 * PX + hx * (TILE - 10 * PX);
      const py = y + 10 * PX + hy * (TILE - 16 * PX);
      ctx.moveTo(px, py);
      ctx.lineTo(px + 1.6 * PX, py - (6 + hy * 5) * PX);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 220, 0.07)';
    const speck = hash(c, r, 40);
    ctx.beginPath();
    ctx.arc(x + 10 * PX + speck * (TILE - 20 * PX), y + 12 * PX + hash(c, r, 41) * (TILE - 24 * PX), 1.4 * PX, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawDirt(x: number, y: number, c: number, r: number): void {
    const { ctx, theme } = this;
    ctx.fillStyle = theme.pathMid;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = theme.pathEdge;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x, y, TILE, 3 * PX);
    ctx.fillRect(x, y + TILE - 3 * PX, TILE, 3 * PX);
    ctx.globalAlpha = 1;
    if (texReady(TEX.dirt)) this.stampTexture(TEX.dirt, x, y, c, r, 0.5, 'multiply');
    this.stampWater(x, y);
    ctx.fillStyle = theme.pebble;
    for (let i = 0; i < 6; i++) {
      const hx = hash(c, r, 20 + i);
      const hy = hash(c, r, 30 + i);
      ctx.globalAlpha = 0.32 + hx * 0.4;
      ctx.beginPath();
      ctx.arc(x + 8 * PX + hx * (TILE - 16 * PX), y + 8 * PX + hy * (TILE - 16 * PX), (1.3 + hy * 1.4) * PX, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.1 * PX;
    ctx.beginPath();
    ctx.moveTo(x + 10 * PX, y + 24 * PX);
    ctx.lineTo(x + 28 * PX, y + 36 * PX);
    ctx.moveTo(x + 18 * PX, y + 14 * PX);
    ctx.lineTo(x + 40 * PX, y + 22 * PX);
    ctx.stroke();
  }

  private drawTree(cx: number, cy: number, c: number, r: number): void {
    const { ctx, theme } = this;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16 * PX, 16 * PX, 5.5 * PX, 0, 0, Math.PI * 2);
    ctx.fill();

    if (texReady(TEX.tree)) {
      const tw = TILE * 1.2;
      const th = TILE * 1.45;
      ctx.drawImage(TEX.tree, cx - tw / 2, cy - th + 18 * PX, tw, th);
      return;
    }

    const lean = (hash(c, r, 1) - 0.5) * 8 * PX;
    ctx.fillStyle = theme.trunk;
    ctx.beginPath();
    ctx.moveTo(cx - 4 * PX + lean, cy + 16 * PX);
    ctx.lineTo(cx + 4 * PX + lean, cy + 16 * PX);
    ctx.lineTo(cx + 2.5 * PX, cy - 5 * PX);
    ctx.lineTo(cx - 2.5 * PX, cy - 5 * PX);
    ctx.closePath();
    ctx.fill();
    const canopy = ctx.createRadialGradient(cx - 4 * PX, cy - 14 * PX, 2 * PX, cx, cy - 5 * PX, 24 * PX);
    canopy.addColorStop(0, theme.canopy);
    canopy.addColorStop(1, theme.canopyDark);
    ctx.fillStyle = canopy;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 26 * PX);
    ctx.lineTo(cx + 21 * PX, cy - 2 * PX);
    ctx.lineTo(cx + 10 * PX, cy + 3 * PX);
    ctx.lineTo(cx - 10 * PX, cy + 3 * PX);
    ctx.lineTo(cx - 21 * PX, cy - 2 * PX);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = theme.canopy;
    ctx.beginPath();
    ctx.moveTo(cx - 3 * PX, cy - 21 * PX);
    ctx.lineTo(cx + 9 * PX, cy - 8 * PX);
    ctx.lineTo(cx - 11 * PX, cy - 5 * PX);
    ctx.closePath();
    ctx.fill();
  }

  drawPathGlow(waypoints: Vec2[]): void {
    if (waypoints.length < 2) return;
    const { ctx, theme } = this;
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = 32 * PX;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
    ctx.stroke();
  }

  drawSpawnExit(waypoints: Vec2[]): void {
    drawLandmarks(this.ctx, waypoints, this.theme, this.time, this.spawnHeat, this.keepWound);
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
    ctx.font = `bold ${Math.round(16 * PX)}px DM Sans, sans-serif`;
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
    ctx.fillRect(0, 0, COLS * TILE, 44 * PX);
    ctx.fillStyle = '#f4d35e';
    ctx.font = `bold ${Math.round(18 * PX)}px Syne, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED — click enemies or towers to inspect', (COLS * TILE) / 2, 30 * PX);
  }
}

function MAP_W(): number {
  return COLS * TILE;
}
function MAP_H(): number {
  return ROWS * TILE;
}
