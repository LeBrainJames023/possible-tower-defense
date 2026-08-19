import { COLS, ROWS, TILE, PX, type CellKind, type TowerKind, TOWERS } from './constants';
import type { Enemy, FloatingText, BeamFx, Projectile, Tower } from './entities';
import type { Vec2 } from '../shared/math';
import { drawBeams, drawEnemy, drawProjectile, drawTower } from './sprites';
import { drawFx, type FxWorld } from './fx';
import { themeFor, type MapTheme } from './themes';
import { TEX, texReady } from './assets';
import { drawLandmarks } from './drawLandmarks';
import { drawWorldDecor, drawWorldGround, drawWorldPath } from './drawWorld';
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
          if (kind === 'decor') {
            drawWorldDecor(
              ctx,
              this.theme,
              this.world,
              x + TILE / 2,
              y + TILE / 2 + 2 * PX,
              c,
              r,
              this.time,
            );
          }
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
    const tiles = TEX.grassTiles.filter(texReady);
    if (this.world === 'forest' && tiles.length) {
      const img = tiles[Math.floor(hash(c, r, 2) * tiles.length) % tiles.length];
      ctx.drawImage(img, x, y, TILE, TILE);
      return;
    }
    const mix = hash(c, r, 2);
    ctx.fillStyle = mix > 0.55 ? theme.grassA : theme.grassB;
    ctx.fillRect(x, y, TILE, TILE);
    if (this.world === 'forest' && texReady(TEX.grass)) {
      this.stampTexture(TEX.grass, x, y, c, r, 0.42, 'multiply');
    }
    drawWorldGround(ctx, theme, this.world, x, y, c, r, this.time);
    ctx.fillStyle = 'rgba(255, 255, 220, 0.07)';
    const speck = hash(c, r, 40);
    ctx.beginPath();
    ctx.arc(x + 10 * PX + speck * (TILE - 20 * PX), y + 12 * PX + hash(c, r, 41) * (TILE - 24 * PX), 1.4 * PX, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawDirt(x: number, y: number, c: number, r: number): void {
    const { ctx, theme } = this;
    const tiles = TEX.pathTiles.filter(texReady);
    if (this.world === 'forest' && tiles.length) {
      const img = tiles[Math.floor(hash(c, r, 5) * tiles.length) % tiles.length];
      const bleed = 5 * PX;
      ctx.drawImage(img, x - bleed, y - bleed, TILE + bleed * 2, TILE + bleed * 2);
      this.stampWater(x, y);
      drawWorldPath(ctx, theme, this.world, x, y, this.time);
      return;
    }
    ctx.fillStyle = theme.pathMid;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = theme.pathEdge;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x, y, TILE, 3 * PX);
    ctx.fillRect(x, y + TILE - 3 * PX, TILE, 3 * PX);
    ctx.globalAlpha = 1;
    if ((this.world === 'forest' || this.world === 'desert') && texReady(TEX.dirt)) {
      this.stampTexture(TEX.dirt, x, y, c, r, 0.5, 'multiply');
    }
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
    drawWorldPath(ctx, theme, this.world, x, y, this.time);
  }

  drawPathGlow(waypoints: Vec2[]): void {
    if (waypoints.length < 2) return;
    const { ctx, theme } = this;
    const painted = this.world === 'forest' && TEX.pathTiles.some(texReady);
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = (painted ? 18 : 32) * PX;
    ctx.globalAlpha = painted ? 0.35 : 1;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  drawSpawnExit(waypoints: Vec2[]): void {
    drawLandmarks(this.ctx, waypoints, this.theme, this.world, this.time, this.spawnHeat, this.keepWound);
  }

  drawTower(t: Tower, selected: boolean, upgradePreview = false): void {
    drawTower(this.ctx, t, selected, this.time, upgradePreview);
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
    ctx.font = `bold ${Math.round(18 * PX)}px DM Sans, sans-serif`;
    for (const t of texts) {
      ctx.globalAlpha = Math.min(1, t.life);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    }
  }

  drawAtmosphere(): void {
    const { ctx, theme } = this;
    const w = COLS * TILE;
    const h = ROWS * TILE;
    const veil = ctx.createRadialGradient(w * 0.5, h * 0.46, h * 0.28, w * 0.5, h * 0.5, h * 0.82);
    veil.addColorStop(0, 'rgba(0,0,0,0)');
    veil.addColorStop(1, 'rgba(4, 10, 12, 0.42)');
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `${theme.glow}`;
    ctx.globalAlpha = 0.18;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    if (this.keepWound > 0.06) {
      const a = Math.min(0.72, this.keepWound * 0.55);
      ctx.strokeStyle = `rgba(239, 71, 111, ${a})`;
      ctx.lineWidth = 16 * PX;
      ctx.strokeRect(8 * PX, 8 * PX, w - 16 * PX, h - 16 * PX);
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
