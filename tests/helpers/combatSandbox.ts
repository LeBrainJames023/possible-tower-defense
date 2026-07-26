/**
 * Headless combat helpers — used by tests to verify towers/projectiles without a browser.
 */
import { TILE, type TowerKind } from '../../src/game/constants';
import { buildWave, LEVELS, pathWaypoints } from '../../src/game/levels';
import { Enemy, Tower, Projectile } from '../../src/game/entities';
import { dist } from '../../src/shared/math';

export function makeFakeCanvas(): HTMLCanvasElement {
  const noop = () => {};
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    shadowColor: '',
    shadowBlur: 0,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
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
    quadraticCurveTo: noop,
    setLineDash: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  };
  return {
    width: 960,
    height: 576,
    getContext: () => ctx,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 960,
      height: 576,
      right: 960,
      bottom: 576,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  } as unknown as HTMLCanvasElement;
}

/** Minimal combat sandbox without the full Game class UI hooks. */
export class CombatSandbox {
  waypoints = pathWaypoints(LEVELS[0]);
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  projectiles: Projectile[] = [];
  kills = 0;
  damageDealt = 0;
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

    for (const t of this.towers) {
      t.cooldown = Math.max(0, t.cooldown - dt);
      if (t.cooldown > 0) continue;
      const target = this.enemies
        .filter((e) => {
          if (!e.alive || dist({ x: t.x, y: t.y }, e.pos) > t.range) return false;
          if (e.flying && !t.hitsAir) return false;
          if (!e.flying && !t.hitsGround) return false;
          return true;
        })
        .sort((a, b) => b.progress - a.progress)[0];
      if (!target) continue;
      t.cooldown = 1 / t.fireRate;
      const def = t.def;
      if (t.chain > 0) {
        const hit = new Set<number>();
        let current: Enemy | null = target;
        let dmg = t.damage;
        for (let i = 0; i < t.chain && current; i++) {
          hit.add(current.id);
          current.takeDamage(dmg, def.pierceArmor);
          this.damageDealt += dmg;
          if (t.slow > 0) current.applySlow(t.slow, t.slowDuration);
          if (t.burnDps > 0) current.applyBurn(t.burnDps, t.burnDuration);
          if (t.poisonDps > 0) current.applyPoison(t.poisonDps, t.poisonDuration);
          if (t.curseDps > 0) current.applyCurse(t.curseDps, t.curseDuration);
          if (t.armorShred > 0) current.applyArmorShred(t.armorShred, t.armorShredDuration);
          const from = current;
          dmg *= 0.7;
          current =
            this.enemies
              .filter((e) => {
                if (!e.alive || hit.has(e.id) || dist(from.pos, e.pos) >= 90) return false;
                if (e.flying && !t.hitsAir) return false;
                if (!e.flying && !t.hitsGround) return false;
                return true;
              })
              .sort((a, b) => dist(from.pos, a.pos) - dist(from.pos, b.pos))[0] ?? null;
        }
      } else {
        this.projectiles.push(
          new Projectile({
            x: t.x,
            y: t.y,
            tx: target.pos.x,
            ty: target.pos.y,
            speed: t.splash > 0 ? 280 : 420,
            damage: t.damage,
            splash: t.splash,
            pierceArmor: def.pierceArmor,
            slow: t.slow,
            slowDuration: t.slowDuration,
            burnDps: t.burnDps,
            burnDuration: t.burnDuration,
            poisonDps: t.poisonDps,
            poisonDuration: t.poisonDuration,
            curseDps: t.curseDps,
            curseDuration: t.curseDuration,
            armorShred: t.armorShred,
            armorShredDuration: t.armorShredDuration,
            goldOnHit: t.goldOnHit,
            chain: 0,
            color: def.color,
            towerKind: t.kind,
            spec: t.spec,
            targetId: target.id,
          }),
        );
      }
    }

    for (const p of this.projectiles) {
      if (p.targetId != null) {
        const tgt = this.enemies.find((e) => e.id === p.targetId);
        if (tgt) {
          p.tx = tgt.pos.x;
          p.ty = tgt.pos.y;
        }
      }
      const hit = p.update(dt);
      if (!hit) continue;
      if (p.splash > 0) {
        for (const e of this.enemies) {
          if (!e.alive) continue;
          if (dist({ x: p.x, y: p.y }, e.pos) <= p.splash) {
            e.takeDamage(p.damage, p.pierceArmor);
            this.damageDealt += p.damage;
            if (p.slow > 0) e.applySlow(p.slow, p.slowDuration);
            if (p.burnDps > 0) e.applyBurn(p.burnDps, p.burnDuration);
            if (p.poisonDps > 0) e.applyPoison(p.poisonDps, p.poisonDuration);
          }
        }
      } else {
        const tgt =
          this.enemies.find((e) => e.id === p.targetId) ??
          this.enemies.find((e) => dist({ x: p.x, y: p.y }, e.pos) < 24);
        if (tgt?.alive) {
          tgt.takeDamage(p.damage, p.pierceArmor);
          this.damageDealt += p.damage;
          if (p.slow > 0) tgt.applySlow(p.slow, p.slowDuration);
          if (p.burnDps > 0) tgt.applyBurn(p.burnDps, p.burnDuration);
          if (p.poisonDps > 0) tgt.applyPoison(p.poisonDps, p.poisonDuration);
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);
    const before = this.enemies.length;
    this.enemies = this.enemies.filter((e) => e.alive);
    this.kills += before - this.enemies.length;
  }

  run(seconds: number, dt = 1 / 30): void {
    const steps = Math.ceil(seconds / dt);
    for (let i = 0; i < steps; i++) this.step(dt);
  }
}

export function waveEnemyCount(levelId: number, wave: number): number {
  return buildWave(levelId, wave).reduce((s, g) => s + g.count, 0);
}
