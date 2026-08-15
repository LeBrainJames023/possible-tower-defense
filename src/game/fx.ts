import type { Enemy } from './entities';
import type { TowerKind } from './constants';
import { ENEMIES } from './enemies';

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

export interface ImpactFlash {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface ImpactRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

export class FxWorld {
  particles: Particle[] = [];
  rings: ImpactRing[] = [];
  flashes: ImpactFlash[] = [];
  shake = 0;
  private ambientSeeded = false;

  addShake(amount: number): void {
    this.shake = Math.min(10, this.shake + amount);
  }

  burst(
    x: number,
    y: number,
    color: string,
    count: number,
    kind: ParticleKind = 'spark',
    gravity?: number,
  ): void {
    const n = Math.min(count, MAX_PARTICLES - this.particles.length);
    const g = gravity ?? (kind === 'smoke' ? -30 : kind === 'ember' ? -40 : 90);
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
        gravity: g,
        spin: (Math.random() - 0.5) * 8,
      });
    }
  }

  ring(x: number, y: number, color: string, maxRadius: number, width = 3, life = 0.38): void {
    this.rings.push({
      x,
      y,
      radius: 4,
      maxRadius,
      life,
      maxLife: life,
      color,
      width,
    });
  }

  flash(x: number, y: number, color: string, radius: number, life = 0.16): void {
    this.flashes.push({ x, y, radius, life, maxLife: life, color });
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
      this.flash(x, y, '#ffe08a', splash * 0.7, 0.2);
      this.burst(x, y, '#2a1810', 24, 'smoke', -50);
      this.burst(x, y, color, 18, 'ember', 30);
      this.burst(x, y, '#f4d35e', 16, 'spark', 20);
      this.ring(x, y, '#ffb14a', splash * 0.4, 7, 0.24);
      this.ring(x, y, color, splash, 5, 0.55);
      this.addShake(4.4);
    } else if (kind === 'ice') {
      this.flash(x, y, '#e8fbff', splash * 0.55, 0.18);
      this.burst(x, y, '#e8fbff', 22, 'shard', 70);
      this.burst(x, y, color, 8, 'spark', 10);
      this.ring(x, y, '#c8f4ff', splash, 2.6, 0.46);
    } else if (kind === 'fire') {
      this.flash(x, y, '#ff9a4a', splash * 0.6, 0.22);
      this.burst(x, y, color, 22, 'ember', -70);
      this.burst(x, y, '#3a1a10', 10, 'smoke', -40);
      this.ring(x, y, '#ff6b4a', splash, 3.4, 0.46);
    } else if (kind === 'poison') {
      this.flash(x, y, color, Math.max(splash, 16), 0.16);
      this.burst(x, y, color, 14, 'goo', 110);
      this.ring(x, y, color, Math.max(splash, 12), 2, 0.34);
    } else if (kind === 'lightning') {
      this.flash(x, y, '#fff8d0', 28, 0.12);
      this.burst(x, y, '#fff6c2', 14, 'spark', -10);
      this.ring(x, y, color, 26, 2.2, 0.18);
    } else {
      this.burst(x, y, color, 10, 'spark', 40);
      this.burst(x, y, '#d8e8f8', 4, 'spark', 20);
    }
  }

  death(e: Enemy): void {
    const role = ENEMIES[e.kind].role;
    const count = role === 'boss' ? 36 : role === 'champion' || e.kind === 'brute' ? 20 : 12;
    this.burst(e.pos.x, e.pos.y, e.color, count, role === 'boss' ? 'spark' : 'smoke');
    this.ring(e.pos.x, e.pos.y, e.color, e.radius * 3.2, role === 'boss' ? 5 : role === 'champion' ? 3.5 : 2.5);
    if (role === 'boss') this.addShake(6.5);
    else if (role === 'champion' || e.kind === 'brute') this.addShake(1.6);
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
        vx: 18 + Math.random() * 16,
        vy: -8 - Math.random() * 10,
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
    this.flashes = [];
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
      if (p.kind === 'mote') {
        p.vx += 10 * dt;
        p.vx = Math.min(p.vx, 42);
        if (p.x > mapW + 12) p.life = 0;
      } else {
        p.vx *= 0.98;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    if (this.particles.length > MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES);
    }

    for (const r of this.rings) {
      r.life -= dt;
      const t = 1 - r.life / r.maxLife;
      r.radius = r.maxRadius * Math.min(1, t * 1.15);
    }
    this.rings = this.rings.filter((r) => r.life > 0);

    for (const f of this.flashes) f.life -= dt;
    this.flashes = this.flashes.filter((f) => f.life > 0);

    // Recycle a few ambient motes so the map never goes dead-still.
    const motes = this.particles.filter((p) => p.kind === 'mote').length;
    if (motes < 22 && this.particles.length < MAX_PARTICLES) {
      this.particles.push({
        x: -4,
        y: Math.random() * mapH,
        vx: 22 + Math.random() * 14,
        vy: -6 - Math.random() * 10,
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
  for (const f of fx.flashes) {
    const a = Math.max(0, f.life / f.maxLife);
    const g = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.radius);
    g.addColorStop(0, `${f.color}cc`);
    g.addColorStop(0.45, `${f.color}55`);
    g.addColorStop(1, `${f.color}00`);
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const r of fx.rings) {
    const a = Math.max(0, r.life / r.maxLife);
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
    ctx.fillStyle = p.color;
    if (p.kind === 'shard') {
      ctx.globalAlpha = a;
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
    } else if (p.kind === 'ember') {
      ctx.globalAlpha = a;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 2.4);
      ctx.quadraticCurveTo(p.size, 0, 0, p.size);
      ctx.quadraticCurveTo(-p.size, 0, 0, -p.size * 2.4);
      ctx.fill();
      ctx.fillStyle = '#ffe08a';
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'goo') {
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 1.3, p.size * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'spark') {
      ctx.globalAlpha = a;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx || 1));
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 2.2, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.globalAlpha = p.kind === 'mote' ? Math.min(0.45, a) : a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
