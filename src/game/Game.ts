import {
  TILE,
  TOWERS,
  WAVES_PER_LEVEL,
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
import {
  Enemy,
  Tower,
  Projectile,
  spawnKillBurst,
  type BeamFx,
  type FloatingText,
  type Particle,
} from './entities';
import { Renderer } from './render';
import { audio } from './audio';
import { dist } from '../shared/math';

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

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  renderer: Renderer;

  level!: LevelDef;
  grid = buildGrid(LEVELS[0]);
  waypoints = pathWaypoints(LEVELS[0]);

  gold = 0;
  lives = 0;
  waveIndex = 0;
  phase: GamePhase = 'prepare';
  selectedKind: TowerKind | null = 'arrow';
  selectedTowerId: number | null = null;
  selectedEnemyId: number | null = null;

  towers: Tower[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  beams: BeamFx[] = [];
  floats: FloatingText[] = [];
  particles: Particle[] = [];

  hover: { c: number; r: number } | null = null;
  occupied = new Set<string>();

  private spawnQueue: Array<{ kind: WaveSpawn['kind']; at: number }> = [];
  private waveTime = 0;
  private waveActive = false;
  private anim = 0;
  private lastTs = 0;
  private running = false;

  onHud?: () => void;
  onResult?: (won: boolean) => void;
  onToast?: (message: string) => void;

  timeScale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');
    this.ctx = ctx;
    this.renderer = new Renderer(ctx);
  }

  startLevel(levelId: number): void {
    const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0];
    this.level = level;
    this.grid = buildGrid(level);
    this.waypoints = pathWaypoints(level);
    this.renderer.theme = level.theme;
    this.gold = level.startingGold;
    this.lives = level.lives;
    this.waveIndex = 0;
    this.phase = 'prepare';
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.floats = [];
    this.particles = [];
    this.occupied.clear();
    this.spawnQueue = [];
    this.waveActive = false;
    this.selectedKind = 'arrow';
    this.selectedTowerId = null;
    this.selectedEnemyId = null;
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

  step(dt: number): void {
    this.update(dt);
    this.draw();
  }

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
    };
  }

  canStartWave(): boolean {
    return this.phase === 'prepare' && this.waveIndex < WAVES_PER_LEVEL;
  }

  startWave(): void {
    if (!this.canStartWave() || !this.level) return;
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
    audio.play('wave');
    this.onHud?.();
  }

  tryPlace(c: number, r: number): boolean {
    if (this.phase !== 'prepare' && this.phase !== 'wave') return false;
    if (!this.selectedKind) return false;
    const x = c * TILE + TILE / 2;
    const y = r * TILE + TILE / 2;
    if (!canPlaceOnCell(this.grid, c, r)) {
      this.floats.push({ x, y, text: 'Blocked', color: '#ef476f', life: 0.7 });
      this.onToast?.('Towers cannot be placed on the path, water, or trees.');
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
    this.selectedKind = null;
    this.floats.push({ x, y: y - 20, text: `-${def.cost}g`, color: '#f4d35e', life: 0.8 });
    audio.play('place');
    this.onHud?.();
    return true;
  }

  selectTowerAt(c: number, r: number): boolean {
    const t = this.towers.find((x) => x.col === c && x.row === r);
    if (!t) return false;
    this.selectedTowerId = t.id;
    this.selectedEnemyId = null;
    this.selectedKind = null;
    audio.play('ui');
    this.onHud?.();
    return true;
  }

  selectEnemyAt(clientX: number, clientY: number): boolean {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    let best: Enemy | null = null;
    let bestD = 28;
    for (const e of this.enemies) {
      const d = dist({ x, y }, e.pos);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (!best) return false;
    this.selectedEnemyId = best.id;
    this.selectedTowerId = null;
    this.selectedKind = null;
    audio.play('ui');
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
    this.floats.push({
      x: t.x,
      y: t.y - 24,
      text: `Lv${t.level}`,
      color: '#57cc99',
      life: 0.9,
    });
    audio.play('upgrade');
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
    audio.play('ui');
    this.onHud?.();
    return true;
  }

  canvasToCell(clientX: number, clientY: number): { c: number; r: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { c: Math.floor(x / TILE), r: Math.floor(y / TILE) };
  }

  private rewardKill(e: Enemy): void {
    this.gold += e.reward;
    this.floats.push({
      x: e.pos.x,
      y: e.pos.y - 10,
      text: `+${e.reward}`,
      color: '#f4d35e',
      life: 0.7,
    });
    this.particles.push(...spawnKillBurst(e.pos.x, e.pos.y, e.color, 12));
    audio.play('kill');
  }

  private update(dt: number): void {
    this.renderer.time += dt;

    if (this.phase === 'paused' || this.phase === 'won' || this.phase === 'lost') {
      this.floats = this.floats
        .map((f) => ({ ...f, life: f.life - dt, y: f.y - 20 * dt }))
        .filter((f) => f.life > 0);
      this.particles = this.renderer.tickParticles(this.particles, dt);
      return;
    }

    if (this.waveActive) {
      this.waveTime += dt;
      while (this.spawnQueue.length && this.spawnQueue[0].at <= this.waveTime) {
        const s = this.spawnQueue.shift()!;
        this.enemies.push(new Enemy(s.kind, this.level.hpScale, this.waypoints));
      }
    }

    for (const e of this.enemies) {
      e.update(dt, this.waypoints);
      if (e.reachedEnd) {
        this.lives -= e.kind === 'lich' ? 5 : 1;
        this.floats.push({
          x: e.pos.x,
          y: e.pos.y,
          text: '-life',
          color: '#ef476f',
          life: 0.9,
        });
      }
    }
    const dead = this.enemies.filter((e) => !e.alive && !e.reachedEnd);
    for (const e of dead) this.rewardKill(e);
    this.enemies = this.enemies.filter((e) => e.alive);
    this.pruneSelection();

    // Leak loss before more combat so a fatal leak can't still shoot/earn that frame
    if (this.lives <= 0) {
      this.failLevel();
      return;
    }

    for (const t of this.towers) {
      t.cooldown = Math.max(0, t.cooldown - dt);
      if (t.cooldown > 0) continue;
      const target = this.pickTarget(t);
      if (!target) continue;
      t.cooldown = 1 / t.fireRate;
      t.targetId = target.id;
      t.aimAngle = Math.atan2(target.pos.y - t.y, target.pos.x - t.x);
      this.fire(t, target);
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
      if (hit) this.applyHit(p);
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);

    this.beams = this.beams
      .map((b) => ({ ...b, life: b.life - dt }))
      .filter((b) => b.life > 0);
    this.floats = this.floats
      .map((f) => ({ ...f, life: f.life - dt, y: f.y - 24 * dt }))
      .filter((f) => f.life > 0);
    this.particles = this.renderer.tickParticles(this.particles, dt);

    if (this.lives <= 0) {
      this.failLevel();
      return;
    }

    if (
      this.waveActive &&
      this.spawnQueue.length === 0 &&
      this.enemies.length === 0 &&
      this.projectiles.length === 0
    ) {
      this.waveActive = false;
      this.gold += 25 + this.waveIndex * 3;
      if (this.waveIndex >= WAVES_PER_LEVEL) {
        this.phase = 'won';
        const unlocked = loadProgress();
        const nextUnlock = Math.min(LEVELS.length, this.level.id + 1);
        if (nextUnlock > unlocked) saveProgress(nextUnlock);
        audio.play('win');
        this.onResult?.(true);
      } else {
        this.phase = 'prepare';
        this.onToast?.(`Wave ${this.waveIndex} cleared! +${25 + this.waveIndex * 3}g bonus`);
      }
      this.onHud?.();
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
    audio.shootFor(t.kind);
    if (def.chain > 0) {
      const hit = new Set<number>();
      let current: Enemy | null = target;
      let fromX = t.x;
      let fromY = t.y;
      let dmg = t.damage;
      for (let i = 0; i < def.chain && current; i++) {
        hit.add(current.id);
        this.beams.push({
          x1: fromX,
          y1: fromY,
          x2: current.pos.x,
          y2: current.pos.y,
          color: def.color,
          life: 0.2,
        });
        current.takeDamage(dmg, def.pierceArmor);
        audio.play('hit', 1.2);
        if (def.slow > 0) current.applySlow(def.slow, def.slowDuration);
        if (def.burnDps > 0) current.applyBurn(def.burnDps * status, def.burnDuration);
        if (def.poisonDps > 0) current.applyPoison(def.poisonDps * status, def.poisonDuration);
        fromX = current.pos.x;
        fromY = current.pos.y;
        dmg *= 0.7;
        const next = this.enemies
          .filter((e) => !hit.has(e.id) && dist(current!.pos, e.pos) < 90)
          .sort((a, b) => dist(current!.pos, a.pos) - dist(current!.pos, b.pos))[0];
        current = next ?? null;
      }
      for (const e of this.enemies) {
        if (!e.alive && !e.reachedEnd) this.rewardKill(e);
      }
      this.enemies = this.enemies.filter((e) => e.alive);
      this.pruneSelection();
      return;
    }

    this.projectiles.push(
      new Projectile({
        x: t.x,
        y: t.y - 12,
        tx: target.pos.x,
        ty: target.pos.y,
        speed: def.splash > 0 ? 280 : 420,
        damage: t.damage,
        splash: def.splash,
        pierceArmor: def.pierceArmor,
        slow: def.slow,
        slowDuration: def.slowDuration,
        burnDps: def.burnDps * status,
        burnDuration: def.burnDuration,
        poisonDps: def.poisonDps * status,
        poisonDuration: def.poisonDuration,
        chain: 0,
        color: def.color,
        towerKind: t.kind,
        targetId: target.id,
        trail: t.kind === 'arrow' || t.kind === 'fire',
      }),
    );
  }

  private applyHit(p: Projectile): void {
    audio.play('hit');
    const apply = (e: Enemy, mul = 1) => {
      e.takeDamage(p.damage * mul, p.pierceArmor);
      if (p.slow > 0) e.applySlow(p.slow, p.slowDuration);
      if (p.burnDps > 0) e.applyBurn(p.burnDps * mul, p.burnDuration);
      if (p.poisonDps > 0) e.applyPoison(p.poisonDps * mul, p.poisonDuration);
    };

    if (p.splash > 0) {
      for (const e of this.enemies) {
        const d = dist({ x: p.x, y: p.y }, e.pos);
        if (d <= p.splash) apply(e, d < p.splash * 0.4 ? 1 : 0.65);
      }
      this.particles.push(...spawnKillBurst(p.x, p.y, p.color, 6));
    } else if (p.targetId != null) {
      const tgt = this.enemies.find((e) => e.id === p.targetId);
      if (tgt) apply(tgt);
      else {
        const near = this.enemies.find((e) => dist({ x: p.x, y: p.y }, e.pos) < 20);
        if (near) apply(near);
      }
    }

    for (const e of this.enemies) {
      if (!e.alive && !e.reachedEnd) this.rewardKill(e);
    }
    this.enemies = this.enemies.filter((e) => e.alive);
    this.pruneSelection();
  }

  private pruneSelection(): void {
    if (this.selectedEnemyId && !this.enemies.some((e) => e.id === this.selectedEnemyId)) {
      this.selectedEnemyId = null;
    }
  }

  private failLevel(): void {
    this.lives = 0;
    this.enemies = [];
    this.spawnQueue = [];
    this.projectiles = [];
    this.waveActive = false;
    this.selectedEnemyId = null;
    if (this.phase === 'wave' || this.phase === 'prepare') {
      this.phase = 'lost';
      audio.play('lose');
      this.onResult?.(false);
      this.onHud?.();
    }
  }

  private draw(): void {
    this.renderer.clear();
    this.renderer.drawPathGlow(this.waypoints);
    const canPlace =
      !!this.hover &&
      !!this.selectedKind &&
      canPlaceOnCell(this.grid, this.hover.c, this.hover.r) &&
      !this.occupied.has(`${this.hover.c},${this.hover.r}`) &&
      this.gold >= TOWERS[this.selectedKind].cost;

    this.renderer.drawGrid(
      this.grid,
      this.hover,
      canPlace,
      this.selectedKind,
      !!this.selectedKind,
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
    this.renderer.drawParticles(this.particles);
    this.renderer.drawFloating(this.floats);
    if (this.phase === 'paused') this.renderer.drawPausedBanner();
  }
}
