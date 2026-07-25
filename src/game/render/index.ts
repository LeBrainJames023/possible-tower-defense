import type { BiomeTheme, CellKind, TowerKind } from '../constants';
import type { Enemy, FloatingText, BeamFx, Particle, Projectile, Tower } from '../entities';
import type { Vec2 } from '../../shared/math';
import { clearBackdrop, drawGrid, drawPathGlow, drawSpawnExit } from './map';
import { drawTower } from './towers';
import { drawEnemy } from './enemies';
import {
  drawBeams,
  drawFloating,
  drawParticles,
  drawPausedBanner,
  drawProjectile,
  updateParticles,
} from './fx';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  theme: BiomeTheme = 'meadow';
  time = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    clearBackdrop(this.ctx, this.theme, this.time);
  }

  drawGrid(
    grid: CellKind[][],
    hover: { c: number; r: number } | null,
    canPlace: boolean,
    selectedKind: TowerKind | null,
    showBuildHints: boolean,
  ): void {
    drawGrid(
      this.ctx,
      grid,
      this.theme,
      hover,
      canPlace,
      selectedKind,
      showBuildHints,
      this.time,
    );
  }

  drawPathGlow(waypoints: Vec2[]): void {
    drawPathGlow(this.ctx, waypoints, this.theme);
  }

  drawSpawnExit(waypoints: Vec2[]): void {
    drawSpawnExit(this.ctx, waypoints);
  }

  drawTower(t: Tower, selected: boolean): void {
    drawTower(this.ctx, t, selected, this.time);
  }

  drawEnemy(e: Enemy, selected: boolean): void {
    drawEnemy(this.ctx, e, selected);
  }

  drawProjectile(p: Projectile): void {
    drawProjectile(this.ctx, p);
  }

  drawBeams(beams: BeamFx[]): void {
    drawBeams(this.ctx, beams);
  }

  drawParticles(particles: Particle[]): void {
    drawParticles(this.ctx, particles);
  }

  drawFloating(texts: FloatingText[]): void {
    drawFloating(this.ctx, texts);
  }

  drawPausedBanner(): void {
    drawPausedBanner(this.ctx);
  }

  tickParticles(particles: Particle[], dt: number): Particle[] {
    return updateParticles(particles, dt);
  }
}

export { updateParticles };
