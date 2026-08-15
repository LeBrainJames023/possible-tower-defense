import {
  TILE,
  TOWERS,
  WAVES_PER_LEVEL,
  MAP_W,
  MAP_H,
  u,
  type TowerKind,
} from './constants';
import { leakLives } from './enemies';
import {
  buildGrid,
  buildWave,
  canPlaceOnCell,
  LEVELS,
  pathWaypoints,
  waveRoster,
  type LevelDef,
  type WaveSpawn,
} from './levels';
import { Enemy, Tower, Projectile, type BeamFx, type FloatingText } from './entities';
import { stepCombat, type CombatHooks } from './combat';
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
import { dist } from '../shared/math';
import { clientToMap, identityMapView, type MapView } from '../shared/pointer';
import { afterWin, canPlay, isAhead, loadProgress, saveProgress } from './progress';
import { isWetLevel } from './worlds';

export type GamePhase = 'prepare' | 'wave' | 'paused' | 'won' | 'lost';

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
    this.renderer.setLevel(level);
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
    this.renderer.spawnHeat = 0;
    this.renderer.keepWound = 0;
    this.fx.seedAmbient(MAP_W, MAP_H);
    this.audio.setAmbience(isWetLevel(level));
    this.audio.setScore('prepare');
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
    const groups = buildWave(this.level.stage, next, this.level.worldIndex);
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
    this.renderer.spawnHeat = 1;
    const spawn = this.waypoints[0];
    if (spawn) {
      this.fx.flash(spawn.x, spawn.y, '#c8e4ff', 48, 0.35);
      this.fx.ring(spawn.x, spawn.y, '#9ad0f0', 56, 3, 0.45);
    }
    this.audio.waveStart();
    this.audio.setScore('battle');
    this.onToast?.(`Wave ${next} — ${waveRoster(this.level.stage, next, this.level.worldIndex).join(', ')}`);
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
    this.renderer.spawnHeat = Math.max(0, this.renderer.spawnHeat - dt * 1.5);
    this.renderer.keepWound = Math.max(0, this.renderer.keepWound - dt * 1.8);
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
      if (e.footfall) {
        this.fx.burst(e.pos.x, e.pos.y + e.radius * 0.55, '#6a5340', 2, 'smoke', -18);
      }
      if (e.reachedEnd) {
        this.lives -= leakLives(e.kind);
        this.audio.leak();
        this.renderer.keepWound = 1;
        const gate = this.waypoints[this.waypoints.length - 1];
        if (gate) {
          this.fx.flash(gate.x, gate.y, '#ef476f', 44, 0.28);
          this.fx.ring(gate.x, gate.y, '#ef476f', 40, 3, 0.32);
        }
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

    stepCombat(this, dt, this.combatHooks());

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
        this.audio.setScore('off');
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
        this.audio.setScore('off');
        const cur = loadProgress();
        const next = afterWin(this.level);
        if (canPlay(cur, this.level) && isAhead(next, cur)) saveProgress(next);
        this.onResult?.(true);
      } else {
        this.phase = 'prepare';
        this.audio.setScore('prepare');
        this.onToast?.(`Wave ${this.waveIndex} cleared! +${bonus}g bonus`);
      }
      this.onHud?.();
    }
  }

  private combatHooks(): CombatHooks {
    return {
      damageMul: this.mods.damage,
      onMuzzle: (t) => {
        this.fx.muzzle(t.x, t.y, t.aim, t.def.color);
        this.audio.fire(t.kind);
      },
      onChainHop: (e, hop, color) => {
        this.fx.flash(e.pos.x, e.pos.y, '#fff8d0', 24 - hop * 3, 0.14);
        this.fx.burst(e.pos.x, e.pos.y, color, 10, 'spark', -8);
      },
      onChainDone: () => {
        this.fx.addShake(1.4);
        this.audio.impact('lightning');
        this.collectBounties();
      },
      onImpact: (p) => {
        this.fx.impact(p.x, p.y, p.kind, p.color, p.splash);
        this.audio.impact(p.kind);
      },
      afterHits: () => this.collectBounties(),
    };
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
          text: `+${payout}g`,
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
      !!this.buildCell,
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
