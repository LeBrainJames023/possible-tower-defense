import type { BiomeTheme, CellKind, PlaceableKind } from '../constants';
import type {
  Barracks,
  Enemy,
  FloatingText,
  BeamFx,
  FriendlyUnit,
  Particle,
  Projectile,
  Tower,
} from '../entities';
import type { Vec2 } from '../../shared/math';
import { clearBackdrop, drawGrid, drawPathGlow, drawSpawnExit } from './map';
import { drawTower } from './towers';
import { drawBarracks } from './barracks';
import { drawFriendly } from './friendlies';
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
    selectedKind: PlaceableKind | null,
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

  drawBarracks(b: Barracks, selected: boolean, rallyMode: boolean): void {
    drawBarracks(this.ctx, b, selected, rallyMode, this.time);
  }

  drawFriendly(u: FriendlyUnit): void {
    drawFriendly(this.ctx, u);
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
