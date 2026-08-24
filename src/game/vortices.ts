/**
 * Void pile-up. Everyday shot stays an orb — this is the later pull-to-a-point.
 * Walkers stay on the painted road: we slide path progress, not world position.
 */
import { VOID_VORTEX_LIFE, VOID_VORTEX_PULL, VOID_VORTEX_RADIUS } from './constants';
import type { Enemy } from './entities';
import { untargetable } from './verbs';
import { dist, lengthAlongPath, pathTotalLength, progressAtPoint, type Vec2 } from '../shared/math';

export interface Vortex {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export function spawnVortex(origin: Vec2, splash = 0): Vortex {
  return {
    x: origin.x,
    y: origin.y,
    radius: Math.max(VOID_VORTEX_RADIUS, splash * 2.1),
    life: VOID_VORTEX_LIFE,
    maxLife: VOID_VORTEX_LIFE,
  };
}

export function stepVortices(
  vortices: Vortex[],
  enemies: Enemy[],
  waypoints: Vec2[],
  dt: number,
): Vortex[] {
  const total = pathTotalLength(waypoints);
  if (total <= 0) return vortices.map((v) => ({ ...v, life: v.life - dt })).filter((v) => v.life > 0);

  const pull = VOID_VORTEX_PULL / total;
  for (const v of vortices) {
    v.life -= dt;
    if (v.life <= 0) continue;
    const target = progressAtPoint(waypoints, v);
    for (const e of enemies) {
      if (!e.alive || e.meleeHold || untargetable(e)) continue;
      if (dist({ x: v.x, y: v.y }, e.pos) > v.radius) continue;
      const delta = target - e.progress;
      const step = pull * dt;
      if (Math.abs(delta) <= step) e.progress = target;
      else e.progress += Math.sign(delta) * step;
      e.progress = Math.max(0, Math.min(0.985, e.progress));
      e.pos = lengthAlongPath(waypoints, e.progress);
    }
  }
  return vortices.filter((v) => v.life > 0);
}

export function drawVortices(ctx: CanvasRenderingContext2D, vortices: Vortex[], time: number): void {
  for (const v of vortices) {
    const fade = Math.max(0, v.life / v.maxLife);
    const pulse = 0.84 + Math.sin(time * 9) * 0.08;
    ctx.save();
    ctx.globalAlpha = 0.62 * fade;
    const g = ctx.createRadialGradient(v.x, v.y, 2, v.x, v.y, v.radius * pulse);
    g.addColorStop(0, '#050208');
    g.addColorStop(0.42, '#1a0a28');
    g.addColorStop(1, 'rgba(20, 8, 40, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6cff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.38 * fade;
    for (let i = 0; i < 2; i++) {
      const r = v.radius * (0.26 + i * 0.26) * (0.72 + (1 - fade) * 0.28);
      ctx.beginPath();
      ctx.ellipse(v.x, v.y, r, r * 0.52, time * 2.1 + i, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
