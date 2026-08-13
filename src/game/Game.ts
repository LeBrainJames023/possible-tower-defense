import {
  TILE,
  TOWERS,
  WAVES_PER_LEVEL,
  CHAIN_RANGE,
  PROJECTILE_FEEL,
  MAP_W,
  MAP_H,
  u,
  type TowerKind,
} from './constants';
import {
  buildGrid,
  buildWave,
  canPlaceOnCell,
  LEVELS,
  pathWaypoints,
  type LevelDef,
  type WaveSpawn,
} from './levels';
import { Enemy, Tower, Projectile, type BeamFx, type FloatingText } from './entities';
import { Renderer } from './renderer';
import { FxWorld } from './fx';
import { AudioBus } from './audio';
import {
  DIFFICULTY,
  scaleGold,
  scaleLives,
  waveClearBonus,
  type DifficultyId,
} from './balance';
import { dist, lerpAngle } from '../shared/math';
import { clientToMap, identityMapView, type MapView } from '../shared/pointer';
import type { Vec2 } from '../shared/math';

export type GamePhase = 'prepare' | 'wave' | 'paused' | 'won' | 'lost';

const SAVE_KEY = 'ptd-progress-v1';

export function loadProgress(): number {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return 1;
    const n = JSON.parse(raw).unlocked as number;
    return Math.max(1, Math.min(LEVELS.length, n || 1));
  } catch {
    return 1;
  }
}

export function saveProgress(unlocked: number): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ unlocked }));
}

function jaggedBolt(x1: number, y1: number, x2: number, y2: number): Vec2[] {
  const pts: Vec2[] = [{ x: x1, y: y1 }];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const segs = 5;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const off = (Math.random() - 0.5) * u(22);
    pts.push({ x: x1 + dx * t + px * off, y: y1 + dy * t + py * off });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  renderer: Renderer;
  fx = new FxWorld();
  audio = new AudioBus();
  difficulty: DifficultyId = 'normal';

  level!: LevelDef;
  grid = buildGrid(LEVELS[0]);
  waypoints = pathWaypoints(LEVELS[0]);

  gold = 0;
  lives = 0;
  waveIndex = 0; // completed waves
  phase: GamePhase = 'prepare';
  selectedKind: TowerKind | null = null;
  selectedTowerId: number | null = null;
  selectedEnemyId: number | null = null;
  /** Grass cell waiting for the on-map Build menu. */
  buildCell: { c: number; r: number } | null = null;

  towers: Tower[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  beams: BeamFx[] = [];
  floats: FloatingText[] = [];

  hover: { c: number; r: number } | null = null;
  pointer: { x: number; y: number } | null = null;
  occupied = new Set<string>();
  /** How the map sits inside the canvas — drawing and clicks share this. */
  mapView: MapView = identityMapView(MAP_W, MAP_H);

  private spawnQueue: Array<{ kind: WaveSpawn['kind']; at: number }> = [];
  private waveTime = 0;
  private waveActive = false;
  private anim = 0;
  private lastTs = 0;
  private running = false;
  private clock = 0;

  onHud?: () => void;
  onResult?: (won: boolean) => void;
  onToast?: (message: string) => void;

  /** Playback speed (1 or 2). */
  timeScale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.renderer = new Renderer(ctx);
  }

  get mods() {
    return DIFFICULTY[this.difficulty];
  }

  shotDamage(t: Tower): number {
    return t.damage * this.mods.damage;
  }

  startLevel(levelId: number): void {
    const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];
    this.level = level;
    this.grid = buildGrid(level);
    this.waypoints = pathWaypoints(level);
    this.renderer.setLevel(level.id);
    this.gold = scaleGold(level.startingGold, this.mods.gold);
    this.lives = scaleLives(level.lives, this.mods.lives);
    this.waveIndex = 0;
    this.phase = 'prepare';
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.floats = [];
    this.occupied.clear();
    this.spawnQueue = [];
    this.waveActive = false;
    this.selectedKind = null;
    this.selectedTowerId = null;
    this.selectedEnemyId = null;
    this.buildCell = null;
    this.clock = 0;
    this.fx.clear();
    this.fx.seedAmbient(MAP_W, MAP_H);
    this.audio.setAmbience(level.id === 2 || level.id === 8);
    this.onHud?.();
    this.ensureLoop();
  }

  ensureLoop(): void {
    if (this.running) return;
    this.running = true;
    this.lastTs = performance.now();
    const tick = (ts: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, ((ts - this.lastTs) / 1000) * this.timeScale);
      this.lastTs = ts;
      this.update(dt);
      this.draw();
      this.anim = requestAnimationFrame(tick);
    };
    this.anim = requestAnimationFrame(tick);
  }

  stopLoop(): void {
    this.running = false;
    cancelAnimationFrame(this.anim);
  }

  togglePause(): void {
    if (this.phase === 'paused') {
      this.phase = this.waveActive ? 'wave' : 'prepare';
    } else if (this.phase === 'wave' || this.phase === 'prepare') {
      this.phase = 'paused';
    }
    this.onHud?.();
  }

  /** Manual tick for audits/tests when RAF may be throttled. */
  step(dt: number): void {
    this.update(dt);
    this.draw();
  }

  /** Read-only audit snapshot */
  snapshot() {
    return {
      phase: this.phase,
      waveIndex: this.waveIndex,
      lives: this.lives,
      gold: this.gold,
      towers: this.towers.length,
      enemies: this.enemies.length,
      projectiles: this.projectiles.length,
      beams: this.beams.length,
      queue: this.spawnQueue.length,
      waveActive: this.waveActive,
      timeScale: this.timeScale,
      difficulty: this.difficulty,
    };
  }

  canStartWave(): boolean {
    return this.phase === 'prepare' && this.waveIndex < WAVES_PER_LEVEL;
  }

  startWave(): void {
    if (!this.canStartWave()) return;
    const next = this.waveIndex + 1;
    const groups = buildWave(this.level.id, next);
    this.spawnQueue = [];
    this.waveTime = 0;
    for (const g of groups) {
      const base = g.delay ?? 0;
      for (let i = 0; i < g.count; i++) {
        this.spawnQueue.push({ kind: g.kind, at: base + i * g.interval });
      }
    }
    this.spawnQueue.sort((a, b) => a.at - b.at);
    this.waveActive = true;
    this.phase = 'wave';
    this.waveIndex = next;
    this.onHud?.();
  }

  canBuildAt(c: number, r: number): boolean {
    return canPlaceOnCell(this.grid, c, r) && !this.occupied.has(`${c},${r}`);
  }

  tryPlace(c: number, r: number): boolean {
    if (this.phase !== 'prepare' && this.phase !== 'wave') return false;
    if (!this.selectedKind) return false;
    const x = c * TILE + TILE / 2;
    const y = r * TILE + TILE / 2;
    if (!canPlaceOnCell(this.grid, c, r)) {
      this.floats.push({ x, y, text: 'Blocked', color: '#ef476f', life: 0.7 });
      this.onToast?.('Towers cannot be placed on the path or trees.');
      return false;
    }
    const key = `${c},${r}`;
    if (this.occupied.has(key)) {
      this.floats.push({ x, y, text: 'Taken', color: '#ef476f', life: 0.7 });
      return false;
    }
    const def = TOWERS[this.selectedKind];
    if (this.gold < def.cost) {
      this.floats.push({ x, y, text: 'Need gold', color: '#f4d35e', life: 0.7 });
      this.onToast?.(`Need ${def.cost}g for ${def.name}.`);
      return false;
    }

    this.gold -= def.cost;
    const tower = new Tower(this.selectedKind, c, r, x, y);
    this.towers.push(tower);
    this.occupied.add(key);
    this.selectedTowerId = tower.id;
    this.selectedEnemyId = null;
    this.fx.burst(x, y, def.color, 10, 'spark');
    this.audio.place();
    this.floats.push({ x, y: y - 20, text: `-${def.cost}g`, color: '#f4d35e', life: 0.8 });
    this.onHud?.();
    return true;
  }

  selectTowerAt(c: number, r: number): boolean {
    const t = this.towers.find((x) => x.col === c && x.row === r);
    if (!t) return false;
    this.selectedTowerId = t.id;
    this.selectedEnemyId = null;
    this.onHud?.();
    return true;
  }

  selectEnemyAt(): boolean {
    const pt = this.pointer;
    if (!pt) return false;
    const { x, y } = pt;
    let best: Enemy | null = null;
    let bestD = u(36);
    for (const e of this.enemies) {
      const d = dist({ x, y }, e.pos);
      const reach = Math.max(u(28), e.radius + u(10));
      if (d < reach && d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (!best) return false;
    this.selectedEnemyId = best.id;
    this.selectedTowerId = null;
    this.onHud?.();
    return true;
  }

  getSelectedEnemy(): Enemy | null {
    return this.enemies.find((e) => e.id === this.selectedEnemyId) ?? null;
  }

  getSelectedTower(): Tower | null {
    return this.towers.find((t) => t.id === this.selectedTowerId) ?? null;
  }

  upgradeSelected(): boolean {
    const t = this.getSelectedTower();
    if (!t || t.level >= 3) return false;
    const cost = t.upgradeCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    t.level += 1;
    this.fx.burst(t.x, t.y, t.def.color, 14, 'spark');
    this.fx.ring(t.x, t.y, t.def.color, 28, 2);
    this.floats.push({
      x: t.x,
      y: t.y - 24,
      text: `Lv${t.level}`,
      color: '#57cc99',
      life: 0.9,
    });
    this.onHud?.();
    return true;
  }

  sellSelected(): boolean {
    const t = this.getSelectedTower();
    if (!t) return false;
    this.gold += t.sellValue();
    this.occupied.delete(`${t.col},${t.row}`);
    this.towers = this.towers.filter((x) => x.id !== t.id);
    this.selectedTowerId = null;
    this.onHud?.();
    return true;
  }

  setPointerFromEvent(e: { clientX: number; clientY: number }): void {
    this.setPointer(e.clientX, e.clientY);
  }

  setPointer(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const pt = clientToMap(clientX, clientY, rect, MAP_W, MAP_H);
    this.pointer = pt;
    this.hover = pt ? { c: Math.floor(pt.x / TILE), r: Math.floor(pt.y / TILE) } : null;
  }

  clearPointer(): void {
    this.pointer = null;
    this.hover = null;
  }

  canvasToCell(clientX: number, clientY: number): { c: number; r: number } | null {
    this.setPointer(clientX, clientY);
    return this.hover;
  }

  private update(dt: number): void {
    if (this.phase === 'paused' || this.phase === 'won' || this.phase === 'lost') {
      this.floats = this.floats
        .map((f) => ({ ...f, life: f.life - dt, y: f.y - 20 * dt }))
        .filter((f) => f.life > 0);
      return;
    }

    this.clock += dt;
    this.fx.update(dt, MAP_W, MAP_H);

    if (this.waveActive) {
      this.waveTime += dt;
      while (this.spawnQueue.length && this.spawnQueue[0].at <= this.waveTime) {
        const s = this.spawnQueue.shift()!;
        this.enemies.push(new Enemy(s.kind, this.level.hpScale * this.mods.hp, this.waypoints));
      }
    }

    for (const e of this.enemies) {
      e.update(dt, this.waypoints);
      this.fx.statusTicks(e, dt);
      if (e.reachedEnd) {
        this.lives -= e.kind === 'boss' ? 5 : 1;
        this.audio.leak();
        this.fx.burst(e.pos.x, e.pos.y, '#ef476f', 10, 'spark');
        this.floats.push({
          x: e.pos.x,
          y: e.pos.y,
          text: '-life',
          color: '#ef476f',
          life: 0.9,
        });
      }
    }
    this.collectBounties();

    for (const t of this.towers) {
      t.cooldown = Math.max(0, t.cooldown - dt);
      t.recoil = Math.max(0, t.recoil - dt * 6);
      t.muzzle = Math.max(0, t.muzzle - dt * 8);
      const tracked = t.targetId != null ? this.enemies.find((e) => e.id === t.targetId) : null;
      const aimAt = tracked && dist({ x: t.x, y: t.y }, tracked.pos) <= t.range ? tracked : this.pickTarget(t);
      if (aimAt) {
        const desired = Math.atan2(aimAt.pos.y - t.y, aimAt.pos.x - t.x);
        t.aim = lerpAngle(t.aim, desired, 1 - Math.pow(0.0008, dt));
      }
      if (t.cooldown > 0) continue;
      const target = this.pickTarget(t);
      if (!target) continue;
      t.cooldown = 1 / t.fireRate;
      t.targetId = target.id;
      this.fire(t, target);
    }

    for (const p of this.projectiles) {
      if (p.targetId != null && p.homing > 0) {
        const tgt = this.enemies.find((e) => e.id === p.targetId);
        if (tgt) {
          const k = 1 - Math.pow(1 - p.homing, dt * 8);
          p.tx += (tgt.pos.x - p.tx) * k;
          p.ty += (tgt.pos.y - p.ty) * k;
        }
      }
      const hit = p.update(dt);
      if (hit) this.applyHit(p);
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);

    this.beams = this.beams
      .map((b) => ({ ...b, life: b.life - dt }))
      .filter((b) => b.life > 0);
    this.floats = this.floats
      .map((f) => ({ ...f, life: f.life - dt, y: f.y - 24 * dt }))
      .filter((f) => f.life > 0);

    if (this.lives <= 0) {
      this.lives = 0;
      this.enemies = [];
      this.spawnQueue = [];
      this.waveActive = false;
      if (this.phase === 'wave' || this.phase === 'prepare') {
        this.phase = 'lost';
        this.onResult?.(false);
        this.onHud?.();
      }
      return;
    }

    if (
      this.waveActive &&
      this.spawnQueue.length === 0 &&
      this.enemies.length === 0 &&
      this.projectiles.length === 0
    ) {
      this.waveActive = false;
      const bonus = scaleGold(waveClearBonus(this.waveIndex), this.mods.gold);
      this.gold += bonus;
      if (this.waveIndex >= WAVES_PER_LEVEL) {
        this.phase = 'won';
        const unlocked = loadProgress();
        const nextUnlock = Math.min(LEVELS.length, this.level.id + 1);
        if (nextUnlock > unlocked) saveProgress(nextUnlock);
        this.onResult?.(true);
      } else {
        this.phase = 'prepare';
        this.onToast?.(`Wave ${this.waveIndex} cleared! +${bonus}g bonus`);
      }
      this.onHud?.();
    }
  }

  private collectBounties(): void {
    for (const e of this.enemies) {
      if (!e.alive && !e.reachedEnd) {
        const payout = scaleGold(e.reward, this.mods.gold);
        this.gold += payout;
        this.fx.death(e);
        this.audio.kill();
        this.floats.push({
          x: e.pos.x,
          y: e.pos.y - 10,
          text: `+${payout}`,
          color: '#f4d35e',
          life: 0.7,
        });
      }
    }
    this.enemies = this.enemies.filter((e) => e.alive);
    if (this.selectedEnemyId && !this.enemies.some((e) => e.id === this.selectedEnemyId)) {
      this.selectedEnemyId = null;
    }
  }

  private pickTarget(t: Tower): Enemy | null {
    const inRange = this.enemies.filter((e) => dist({ x: t.x, y: t.y }, e.pos) <= t.range);
    if (!inRange.length) return null;
    inRange.sort((a, b) => b.progress - a.progress);
    return inRange[0];
  }

  private fire(t: Tower, target: Enemy): void {
    const def = t.def;
    const status = t.statusScale();
    t.aim = Math.atan2(target.pos.y - t.y, target.pos.x - t.x);
    t.recoil = 1;
    t.muzzle = 1;
    this.fx.muzzle(t.x, t.y, t.aim, def.color);
    this.audio.fire(t.kind);

    if (def.chain > 0) {
      const hit = new Set<number>();
      let current: Enemy | null = target;
      let fromX = t.x;
      let fromY = t.y;
      let dmg = this.shotDamage(t);
      for (let i = 0; i < def.chain && current; i++) {
        hit.add(current.id);
        const points = jaggedBolt(fromX, fromY, current.pos.x, current.pos.y);
        this.beams.push({
          x1: fromX,
          y1: fromY,
          x2: current.pos.x,
          y2: current.pos.y,
          color: def.color,
          life: 0.22,
          maxLife: 0.22,
          width: 3.2 - i * 0.4,
          points,
        });
        current.takeDamage(dmg, def.pierceArmor);
        this.fx.burst(current.pos.x, current.pos.y, def.color, 6, 'spark');
        if (def.slow > 0) current.applySlow(def.slow, def.slowDuration);
        if (def.burnDps > 0) current.applyBurn(def.burnDps * status * this.mods.damage, def.burnDuration);
        if (def.poisonDps > 0) current.applyPoison(def.poisonDps * status * this.mods.damage, def.poisonDuration);
        fromX = current.pos.x;
        fromY = current.pos.y;
        dmg *= 0.72;
        const next = this.enemies
          .filter((e) => !hit.has(e.id) && dist(current!.pos, e.pos) < CHAIN_RANGE)
          .sort((a, b) => dist(current!.pos, a.pos) - dist(current!.pos, b.pos))[0];
        current = next ?? null;
      }
      this.fx.addShake(1.4);
      this.collectBounties();
      return;
    }

    const feel = PROJECTILE_FEEL[t.kind];
    this.projectiles.push(
      new Projectile({
        x: t.x,
        y: t.y,
        tx: target.pos.x,
        ty: target.pos.y,
        speed: feel.speed,
        damage: this.shotDamage(t),
        splash: def.splash,
        pierceArmor: def.pierceArmor,
        slow: def.slow,
        slowDuration: def.slowDuration,
        burnDps: def.burnDps * status * this.mods.damage,
        burnDuration: def.burnDuration,
        poisonDps: def.poisonDps * status * this.mods.damage,
        poisonDuration: def.poisonDuration,
        chain: 0,
        color: def.color,
        targetId: target.id,
        trail: t.kind === 'arrow',
        kind: t.kind,
        arc: feel.arc,
        homing: feel.homing,
      }),
    );
  }

  private applyHit(p: Projectile): void {
    const apply = (e: Enemy, mul = 1) => {
      e.takeDamage(p.damage * mul, p.pierceArmor);
      if (p.slow > 0) e.applySlow(p.slow, p.slowDuration);
      if (p.burnDps > 0) e.applyBurn(p.burnDps * mul, p.burnDuration);
      if (p.poisonDps > 0) e.applyPoison(p.poisonDps * mul, p.poisonDuration);
    };

    this.fx.impact(p.x, p.y, p.kind, p.color, p.splash);
    this.audio.impact(p.kind);

    if (p.splash > 0) {
      for (const e of this.enemies) {
        const d = dist({ x: p.x, y: p.y }, e.pos);
        if (d <= p.splash) apply(e, d < p.splash * 0.4 ? 1 : 0.65);
      }
    } else if (p.targetId != null) {
      const tgt = this.enemies.find((e) => e.id === p.targetId);
      if (tgt) apply(tgt);
      else {
        const near = this.enemies.find((e) => dist({ x: p.x, y: p.y }, e.pos) < u(20));
        if (near) apply(near);
      }
    }

    this.collectBounties();
  }

  private draw(): void {
    this.renderer.time = this.clock;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.fillStyle = '#071018';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.canvas.width / MAP_W, 0, 0, this.canvas.height / MAP_H, 0, 0);

    const sh = this.fx.shake;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, MAP_W, MAP_H);
    this.ctx.clip();
    if (sh > 0.2) {
      this.ctx.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
    }
    this.renderer.clear();
    this.renderer.drawPathGlow(this.waypoints);
    const focus = this.buildCell ?? this.hover;
    const canPlace =
      !!focus &&
      !!this.selectedKind &&
      canPlaceOnCell(this.grid, focus.c, focus.r) &&
      !this.occupied.has(`${focus.c},${focus.r}`) &&
      this.gold >= TOWERS[this.selectedKind].cost;

    this.renderer.drawGrid(
      this.grid,
      focus,
      canPlace,
      this.selectedKind,
      true,
    );
    this.renderer.drawSpawnExit(this.waypoints);
    for (const t of this.towers) {
      this.renderer.drawTower(t, t.id === this.selectedTowerId);
    }
    for (const e of this.enemies) {
      this.renderer.drawEnemy(e, e.id === this.selectedEnemyId);
    }
    for (const p of this.projectiles) this.renderer.drawProjectile(p);
    this.renderer.drawBeams(this.beams);
    this.renderer.drawParticles(this.fx);
    this.renderer.drawFloating(this.floats);
    if (this.phase === 'paused') this.renderer.drawPausedBanner();
    this.ctx.restore();
  }
}
