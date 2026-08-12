import type { Enemy } from './entities';
import type { TowerKind } from './constants';

const MAX_PARTICLES = 420;

export type ParticleKind = 'spark' | 'smoke' | 'ember' | 'shard' | 'goo' | 'mote';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: ParticleKind;
  gravity: number;
  spin: number;
}

export interface ImpactRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  color: string;
  width: number;
}

export class FxWorld {
  particles: Particle[] = [];
  rings: ImpactRing[] = [];
  shake = 0;
  private ambientSeeded = false;

  addShake(amount: number): void {
    this.shake = Math.min(10, this.shake + amount);
  }

  burst(x: number, y: number, color: string, count: number, kind: ParticleKind = 'spark'): void {
    const n = Math.min(count, MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.28 + Math.random() * 0.45,
        maxLife: 0.7,
        size: 1.5 + Math.random() * 3.2,
        color,
        kind,
        gravity: kind === 'smoke' ? -30 : 90,
        spin: (Math.random() - 0.5) * 8,
      });
    }
  }

  ring(x: number, y: number, color: string, maxRadius: number, width = 3): void {
    this.rings.push({
      x,
      y,
      radius: 4,
      maxRadius,
      life: 0.38,
      color,
      width,
    });
  }

  muzzle(x: number, y: number, angle: number, color: string): void {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (let i = 0; i < 7; i++) {
      const spread = (Math.random() - 0.5) * 0.7;
      const sp = 80 + Math.random() * 120;
      this.particles.push({
        x: x + c * 14,
        y: y + s * 14,
        vx: Math.cos(angle + spread) * sp,
        vy: Math.sin(angle + spread) * sp,
        life: 0.12 + Math.random() * 0.12,
        maxLife: 0.24,
        size: 2 + Math.random() * 2.5,
        color,
        kind: 'spark',
        gravity: 20,
        spin: 0,
      });
    }
  }

  impact(x: number, y: number, kind: TowerKind, color: string, splash: number): void {
    if (kind === 'cannon') {
      this.burst(x, y, color, 18, 'smoke');
      this.burst(x, y, '#f4d35e', 10, 'spark');
      this.ring(x, y, color, splash * 0.95, 4);
      this.addShake(3.2);
    } else if (kind === 'ice') {
      this.burst(x, y, '#e8fbff', 14, 'shard');
      this.ring(x, y, color, splash * 0.8, 2);
    } else if (kind === 'fire') {
      this.burst(x, y, color, 16, 'ember');
      this.ring(x, y, '#ff9a4a', splash * 0.75, 3);
    } else if (kind === 'poison') {
      this.burst(x, y, color, 12, 'goo');
      this.ring(x, y, color, Math.max(22, splash), 2);
    } else {
      this.burst(x, y, color, 8, 'spark');
    }
  }

  death(e: Enemy): void {
    const count = e.kind === 'boss' ? 36 : e.kind === 'brute' ? 20 : 12;
    this.burst(e.pos.x, e.pos.y, e.color, count, e.kind === 'boss' ? 'spark' : 'smoke');
    this.ring(e.pos.x, e.pos.y, e.color, e.radius * 3.2, e.kind === 'boss' ? 5 : 2.5);
    if (e.kind === 'boss') this.addShake(6.5);
    else if (e.kind === 'brute') this.addShake(1.6);
  }

  statusTicks(e: Enemy, dt: number): void {
    if (this.particles.length > MAX_PARTICLES - 20) return;
    if (e.burnTimer > 0 && Math.random() < dt * 14) {
      this.particles.push({
        x: e.pos.x + (Math.random() - 0.5) * e.radius,
        y: e.pos.y,
        vx: (Math.random() - 0.5) * 20,
        vy: -40 - Math.random() * 40,
        life: 0.35,
        maxLife: 0.35,
        size: 2.2,
        color: '#ff7a45',
        kind: 'ember',
        gravity: -20,
        spin: 0,
      });
    }
    if (e.poisonTimer > 0 && Math.random() < dt * 10) {
      this.particles.push({
        x: e.pos.x + (Math.random() - 0.5) * e.radius,
        y: e.pos.y - e.radius * 0.3,
        vx: (Math.random() - 0.5) * 12,
        vy: 18,
        life: 0.4,
        maxLife: 0.4,
        size: 2.4,
        color: '#7be38a',
        kind: 'goo',
        gravity: 60,
        spin: 0,
      });
    }
  }

  seedAmbient(w: number, h: number): void {
    if (this.ambientSeeded) return;
    this.ambientSeeded = true;
    for (let i = 0; i < 28; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 8,
        vy: -6 - Math.random() * 10,
        life: 8 + Math.random() * 10,
        maxLife: 18,
        size: 1 + Math.random() * 1.6,
        color: 'rgba(180, 220, 255, 0.35)',
        kind: 'mote',
        gravity: -4,
        spin: 0,
      });
    }
  }

  clear(): void {
    this.particles = [];
    this.rings = [];
    this.shake = 0;
    this.ambientSeeded = false;
  }

  update(dt: number, mapW: number, mapH: number): void {
    this.shake *= Math.pow(0.04, dt);
    if (this.shake < 0.15) this.shake = 0;

    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= 0.98;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    if (this.particles.length > MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES);
    }

    for (const r of this.rings) {
      r.life -= dt;
      const t = 1 - r.life / 0.38;
      r.radius = r.maxRadius * Math.min(1, t * 1.15);
    }
    this.rings = this.rings.filter((r) => r.life > 0);

    // Recycle a few ambient motes so the map never goes dead-still.
    const motes = this.particles.filter((p) => p.kind === 'mote').length;
    if (motes < 22 && this.particles.length < MAX_PARTICLES) {
      this.particles.push({
        x: Math.random() * mapW,
        y: mapH + 4,
        vx: (Math.random() - 0.5) * 8,
        vy: -8 - Math.random() * 12,
        life: 10,
        maxLife: 10,
        size: 1.2,
        color: 'rgba(180, 220, 255, 0.28)',
        kind: 'mote',
        gravity: -3,
        spin: 0,
      });
    }
  }
}

export function drawFx(ctx: CanvasRenderingContext2D, fx: FxWorld): void {
  for (const r of fx.rings) {
    const a = Math.max(0, r.life / 0.38);
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = r.color;
    ctx.lineWidth = r.width * a;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (const p of fx.particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = p.kind === 'mote' ? Math.min(0.45, a) : a;
    ctx.fillStyle = p.color;
    if (p.kind === 'shard') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin * (1 - a));
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.8);
      ctx.lineTo(p.size, p.size);
      ctx.lineTo(-p.size, p.size);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'smoke') {
      ctx.globalAlpha = a * 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
