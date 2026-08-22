/**
 * Headless combat helpers — same hit rules as the live game, no canvas/audio.
 */
import { MAP_H, MAP_W, TILE, type TowerKind } from '../../src/game/constants';
import { buildGrid, buildWave, LEVELS, pathWaypoints } from '../../src/game/levels';
import { Enemy, Tower, Projectile, type BeamFx } from '../../src/game/entities';
import { stepCombat, type CombatWorld } from '../../src/game/combat';
import { stepHalls, type Troop, type TroopWorld } from '../../src/game/troops';

export function makeFakeCanvas(): HTMLCanvasElement {
  const noop = () => {};
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
    fillRect: noop,
    strokeRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: noop,
    arcTo: noop,
    ellipse: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    fillText: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    setTransform: noop,
    clip: noop,
    rect: noop,
    quadraticCurveTo: noop,
    setLineDash: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  };
  return {
    width: MAP_W,
    height: MAP_H,
    getContext: () => ctx,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: MAP_W,
      height: MAP_H,
      right: MAP_W,
      bottom: MAP_H,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  } as unknown as HTMLCanvasElement;
}

/** Minimal combat sandbox without the full Game class UI hooks. */
export class CombatSandbox implements CombatWorld, TroopWorld {
  waypoints = pathWaypoints(LEVELS[0]);
  grid = buildGrid(LEVELS[0]);
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  troops: Troop[] = [];
  projectiles: Projectile[] = [];
  beams: BeamFx[] = [];
  kills = 0;
  damageDealt = 0;
  /** When true, enemies stay put (for isolated tower DPS checks). */
  freezeEnemies = false;

  spawn(kind: Enemy['kind'], hpScale = 1): Enemy {
    const e = new Enemy(kind, hpScale, this.waypoints);
    this.enemies.push(e);
    return e;
  }

  place(kind: TowerKind, c: number, r: number): Tower {
    const t = new Tower(kind, c, r, c * TILE + TILE / 2, r * TILE + TILE / 2);
    this.towers.push(t);
    return t;
  }

  step(dt: number): void {
    if (!this.freezeEnemies) {
      for (const e of this.enemies) e.update(dt, this.waypoints);
    }

    stepHalls(this, dt);
    stepCombat(this, dt, {
      onDamage: (_e, amount) => {
        this.damageDealt += amount;
      },
      afterHits: () => this.sweepDead(),
      onChainDone: () => this.sweepDead(),
    });
  }

  private sweepDead(): void {
    const before = this.enemies.length;
    this.enemies = this.enemies.filter((e) => e.alive);
    this.kills += before - this.enemies.length;
  }

  run(seconds: number, dt = 1 / 30): void {
    const steps = Math.ceil(seconds / dt);
    for (let i = 0; i < steps; i++) this.step(dt);
  }
}

export function waveEnemyCount(stage: number, wave: number, worldIndex = 1): number {
  return buildWave(stage, wave, worldIndex).reduce((s, g) => s + g.count, 0);
}
