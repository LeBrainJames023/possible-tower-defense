import {
  TILE,
  TOWERS,
  WAVES_PER_LEVEL,
  MAP_W,
  MAP_H,
  u,
  isTroopHall,
  type TowerKind,
} from './constants';
import { ENEMIES, leakLives } from './enemies';
import { forkDef, type ForkId } from './forks';
import { applyPackRally, stepEnemyVerb } from './verbs';
import {
  buildGrid,
  buildWave,
  LEVELS,
  pathWaypoints,
  waveRoster,
  type LevelDef,
  type WaveSpawn,
} from './levels';
import { Enemy, Tower, Projectile, type BeamFx, type FloatingText } from './entities';
import { stepCombat, type CombatHooks } from './combat';
import type { Vortex } from './vortices';
import {
  canUseBuildCell,
  freeFootprint,
  hallCenter,
  hallPairFromClick,
  hallPreviewFromClick,
  occupyFootprint,
  towerOnCell,
} from './footprint';
import { applyHallForkToTroops, assignDefaultRally, dropHallLocks, setRallyPoint as applyRallyPoint, stepHalls, type Troop } from './troops';
import { Renderer } from './renderer';
import { FxWorld } from './fx';
import { AudioBus } from './audio';
import {
  DIFFICULTY,
  killPayout,
  scaleGold,
  scaleLives,
  waveClearBonus,
  waveHpMul,
  type DifficultyId,
} from './balance';
import { dist, pathTotalLength } from '../shared/math';
import { clientToMap, identityMapView, type MapView } from '../shared/pointer';
import { afterWin, canPlay, isAhead, loadProgress, saveProgress } from './progress';
import { isWetLevel } from './worlds';
import { scheduleWave } from './spawnSchedule';

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
  /** After clicking Upgrade — show the wider gold range ring. */
  upgradePreview = false;
  /** After clicking Rally — show the pick circle; path tiles are legal. */
  rallyPreview = false;

  towers: Tower[] = [];
  troops: Troop[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  beams: BeamFx[] = [];
  vortices: Vortex[] = [];
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

  /** Playback speed (1, 2, or 3). */
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
    this.gold = scaleGold(level.startingGold, this.mods.startGold);
    this.lives = scaleLives(level.lives, this.mods.lives);
    this.waveIndex = 0;
    this.phase = 'prepare';
    this.towers = [];
    this.troops = [];
    this.enemies = [];
    this.projectiles = [];
    this.beams = [];
    this.vortices = [];
    this.floats = [];
    this.occupied.clear();
    this.spawnQueue = [];
    this.waveActive = false;
    this.selectedKind = null;
    this.selectedTowerId = null;
    this.selectedEnemyId = null;
    this.buildCell = null;
    this.upgradePreview = false;
    this.rallyPreview = false;
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
    this.spawnQueue = scheduleWave(groups, pathTotalLength(this.waypoints), {
      worldIndex: this.level.worldIndex,
      stage: this.level.stage,
      wave: next,
    });
    this.waveTime = 0;
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
    if (!this.selectedKind) return canUseBuildCell(this.grid, this.occupied, c, r);
    if (isTroopHall(this.selectedKind)) {
      return hallPairFromClick((cc, rr) => canUseBuildCell(this.grid, this.occupied, cc, rr), c, r) != null;
    }
    return canUseBuildCell(this.grid, this.occupied, c, r);
  }

  /** Hall pick always lights two tiles — the click plus its side neighbor. */
  hallPreviewAt(
    focus: { c: number; r: number } | null,
    kind: TowerKind | null,
  ): { left: number; row: number; cells: Array<{ c: number; r: number }>; ok: boolean } | null {
    if (!focus || !kind || !isTroopHall(kind)) return null;
    return hallPreviewFromClick((cc, rr) => canUseBuildCell(this.grid, this.occupied, cc, rr), focus.c, focus.r);
  }

  tryPlace(c: number, r: number): boolean {
    if (this.phase !== 'prepare' && this.phase !== 'wave') return false;
    if (!this.selectedKind) return false;
    const hall = isTroopHall(this.selectedKind);
    const pair = hall
      ? hallPairFromClick((cc, rr) => canUseBuildCell(this.grid, this.occupied, cc, rr), c, r)
      : null;
    const col = hall ? pair?.left ?? c : c;
    const row = hall ? pair?.row ?? r : r;
    const pos = hall ? hallCenter(col, row) : { x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 };
    if (hall ? !pair : !canUseBuildCell(this.grid, this.occupied, c, r)) {
      this.floats.push({ x: pos.x, y: pos.y, text: 'Blocked', color: '#ef476f', life: 0.7 });
      this.onToast?.(
        hall
          ? 'Halls need two grass tiles side by side. Path and trees are blocked.'
          : 'Buildings cannot be placed on the path or trees.',
      );
      return false;
    }
    const def = TOWERS[this.selectedKind];
    if (this.gold < def.cost) {
      this.floats.push({ x: pos.x, y: pos.y, text: 'Need gold', color: '#f4d35e', life: 0.7 });
      this.onToast?.(`Need ${def.cost}g for ${def.name}.`);
      return false;
    }

    this.gold -= def.cost;
    const tower = new Tower(this.selectedKind, col, row, pos.x, pos.y);
    if (isTroopHall(tower.kind)) assignDefaultRally(tower, this.grid);
    this.towers.push(tower);
    occupyFootprint(this.occupied, tower.kind, col, row);
    this.selectedTowerId = null;
    this.selectedEnemyId = null;
    this.fx.burst(pos.x, pos.y, def.color, 10, 'spark');
    this.audio.place();
    this.floats.push({ x: pos.x, y: pos.y - 20, text: `-${def.cost}g`, color: '#f4d35e', life: 0.8 });
    this.onHud?.();
    return true;
  }

  selectTowerAt(c: number, r: number): boolean {
    const t = this.towers.find((x) => towerOnCell(x, c, r));
    if (!t) return false;
    this.selectedTowerId = t.id;
    this.selectedEnemyId = null;
    this.upgradePreview = false;
    this.rallyPreview = false;
    for (const x of this.towers) x.previewFork = null;
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
    this.upgradePreview = false;
    this.rallyPreview = false;
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
    if (!t || !t.canNumberUpgrade()) return false;
    const cost = t.upgradeCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    t.level += 1;
    this.upgradePreview = false;
    t.previewFork = null;
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

  chooseFork(id: ForkId): boolean {
    const t = this.getSelectedTower();
    if (!t || !t.canFork()) return false;
    const cost = t.upgradeCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    t.fork = id;
    t.previewFork = null;
    this.upgradePreview = false;
    if (isTroopHall(t.kind)) applyHallForkToTroops(t, this.troops);
    this.fx.burst(t.x, t.y, t.def.color, 18, 'spark');
    this.fx.ring(t.x, t.y, '#f4d35e', 34, 2);
    const name = forkDef(t.kind, id)?.name ?? 'Path';
    this.floats.push({
      x: t.x,
      y: t.y - 24,
      text: name,
      color: '#f4d35e',
      life: 0.9,
    });
    this.onHud?.();
    return true;
  }

  sellSelected(): boolean {
    const t = this.getSelectedTower();
    if (!t) return false;
    this.gold += t.sellValue();
    freeFootprint(this.occupied, t);
    this.towers = this.towers.filter((x) => x.id !== t.id);
    this.troops = this.troops.filter((tr) => tr.hallId !== t.id);
    this.selectedTowerId = null;
    this.upgradePreview = false;
    this.rallyPreview = false;
    this.onHud?.();
    return true;
  }

  setRallyPoint(c: number, r: number): boolean {
    const t = this.getSelectedTower();
    if (!t || !isTroopHall(t.kind)) return false;
    if (!applyRallyPoint(t, this.grid, c, r)) return false;
    dropHallLocks(this.troops, t.id);
    this.rallyPreview = false;
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
    this.renderer.keepWound = Math.max(0, this.renderer.keepWound - dt * 1.05);
    this.fx.update(dt, MAP_W, MAP_H);

    if (this.waveActive) {
      this.waveTime += dt;
      while (this.spawnQueue.length && this.spawnQueue[0].at <= this.waveTime) {
        const s = this.spawnQueue.shift()!;
        this.enemies.push(
          new Enemy(s.kind, this.level.hpScale * this.mods.hp * waveHpMul(this.waveIndex), this.waypoints),
        );
      }
    }

    for (const e of this.enemies) {
      e.update(dt, this.waypoints);
      for (const ev of stepEnemyVerb(e, dt)) {
        if (ev.type === 'burrow') {
          this.fx.burst(e.pos.x, e.pos.y + e.radius * 0.4, '#c4a060', 8, 'smoke', -12);
        } else if (ev.type === 'emerge') {
          this.fx.burst(e.pos.x, e.pos.y + e.radius * 0.4, '#e0c080', 10, 'smoke', -8);
        } else if (ev.type === 'dash') {
          this.fx.burst(e.pos.x, e.pos.y + e.radius * 0.5, '#d4b060', 6, 'smoke', -24);
        } else if (ev.type === 'phase') {
          this.fx.burst(e.pos.x, e.pos.y - e.radius, '#b8e8ff', 8, 'shard', -20);
        } else if (ev.type === 'appear') {
          this.fx.burst(e.pos.x, e.pos.y - e.radius, '#e8fbff', 10, 'spark', -8);
        } else if (ev.type === 'slide') {
          this.fx.burst(e.pos.x, e.pos.y + e.radius * 0.5, '#c8e8ff', 7, 'smoke', -28);
        } else if (ev.type === 'freeze') {
          this.fx.ring(e.pos.x, e.pos.y, '#9ae4f7', 52, 4, 0.6);
          this.fx.burst(e.pos.x, e.pos.y, '#c8f4ff', 14, 'shard', 20);
          this.floats.push({ x: e.pos.x, y: e.pos.y - 28, text: 'Freeze!', color: '#9ae4f7', life: 1 });
        } else if (ev.type === 'summon') {
          const scale = e.maxHp / ENEMIES[e.kind].hp;
          for (let i = 0; i < ev.count; i++) {
            const pup = new Enemy(ev.kind, scale, this.waypoints);
            pup.reward = 0;
            pup.progress = Math.max(0, e.progress - 0.035 * (i + 1));
            pup.update(0, this.waypoints);
            this.enemies.push(pup);
          }
          const erupt = ev.kind === 'magmaHound';
          const tint = erupt ? '#ff6b4a' : '#e0b050';
          this.fx.ring(e.pos.x, e.pos.y, tint, erupt ? 52 : 42, 4, 0.55);
          this.fx.burst(e.pos.x, e.pos.y, tint, 16, erupt ? 'spark' : 'smoke', -10);
          this.floats.push({
            x: e.pos.x,
            y: e.pos.y - 28,
            text: erupt ? 'Erupt!' : 'Caravan!',
            color: tint,
            life: 1,
          });
        } else if (ev.type === 'warp') {
          e.update(0, this.waypoints);
          this.fx.ring(e.pos.x, e.pos.y, '#c77dff', 56, 4, 0.6);
          this.fx.burst(e.pos.x, e.pos.y - e.radius, '#e0b0ff', 16, 'spark', -12);
          this.floats.push({ x: e.pos.x, y: e.pos.y - 28, text: 'Warp!', color: '#c77dff', life: 1 });
        }
      }
      this.fx.statusTicks(e, dt);
      if (e.footfall) {
        this.fx.burst(e.pos.x, e.pos.y + e.radius * 0.55, '#6a5340', 2, 'smoke', -18);
      }
      if (e.reachedEnd) {
        this.lives -= leakLives(e.kind);
        this.onHud?.();
        this.audio.leak();
        this.renderer.keepWound = 1;
        this.fx.addShake(5);
        const gate = this.waypoints[this.waypoints.length - 1];
        if (gate) {
          this.fx.flash(gate.x, gate.y, '#ef476f', 64, 0.45);
          this.fx.ring(gate.x, gate.y, '#ef476f', 56, 5, 0.45);
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
    applyPackRally(this.enemies);
    this.collectBounties();
    stepHalls(this, dt);
    stepCombat(this, dt, this.combatHooks());

    this.floats = this.floats
      .map((f) => ({ ...f, life: f.life - dt, y: f.y - 24 * dt }))
      .filter((f) => f.life > 0);

    if (this.lives <= 0) {
      this.lives = 0;
      this.enemies = [];
      this.troops = [];
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
        const m = t.muzzlePoint();
        this.fx.muzzle(m.x, m.y, t.aim, t.def.color);
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
        if (p.opensVortex) {
          this.fx.ring(p.x, p.y, '#140818', Math.max(p.splash * 2.4, u(72)), 6, 0.7);
          this.fx.flash(p.x, p.y, '#2a1048', u(40), 0.22);
          this.fx.addShake(2.2);
        }
        this.audio.impact(p.kind);
      },
      afterHits: () => this.collectBounties(),
    };
  }

  private collectBounties(): void {
    let paid = false;
    for (const e of this.enemies) {
      if (!e.alive && !e.reachedEnd) {
        const payout = killPayout(e.reward, this.level.worldIndex, this.mods.gold);
        if (payout > 0) {
          this.gold += payout;
          paid = true;
          this.floats.push({
            x: e.pos.x,
            y: e.pos.y - 18,
            text: `+${payout}g`,
            color: '#f4d35e',
            life: 1.65,
          });
        }
        this.fx.death(e);
        this.audio.kill();
      }
    }
    this.enemies = this.enemies.filter((e) => e.alive);
    if (this.selectedEnemyId && !this.enemies.some((e) => e.id === this.selectedEnemyId)) {
      this.selectedEnemyId = null;
    }
    if (paid) this.onHud?.();
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
    const brush = this.selectedKind;
    const preview = this.hallPreviewAt(focus, brush);
    const hoverCells = preview?.cells ?? (focus ? [focus] : []);
    const canPlace = brush
      ? isTroopHall(brush)
        ? !!preview?.ok && this.gold >= TOWERS[brush].cost
        : !!focus && canUseBuildCell(this.grid, this.occupied, focus.c, focus.r) && this.gold >= TOWERS[brush].cost
      : false;
    const rangeAt = preview ? hallCenter(preview.left, preview.row) : null;

    this.renderer.drawGrid(this.grid, hoverCells, canPlace, brush, !!this.buildCell, rangeAt);
    this.renderer.drawSpawnExit(this.waypoints);
    const units: Array<{ y: number; z: number; draw: () => void }> = [];
    for (const t of this.towers) {
      units.push({
        y: t.y,
        z: 0,
        draw: () =>
          this.renderer.drawTower(
            t,
            t.id === this.selectedTowerId,
            this.upgradePreview,
            this.rallyPreview && t.id === this.selectedTowerId,
          ),
      });
    }
    for (const e of this.enemies) {
      units.push({
        y: e.pos.y,
        z: 1,
        draw: () => this.renderer.drawEnemy(e, e.id === this.selectedEnemyId),
      });
    }
    for (const tr of this.troops) {
      units.push({
        y: tr.pos.y,
        z: 1,
        draw: () => this.renderer.drawTroop(tr),
      });
    }
    units.sort((a, b) => a.y - b.y || a.z - b.z);
    for (const unit of units) unit.draw();
    for (const p of this.projectiles) this.renderer.drawProjectile(p);
    this.renderer.drawVortices(this.vortices);
    this.renderer.drawBeams(this.beams);
    this.renderer.drawParticles(this.fx);
    this.renderer.drawFloating(this.floats);
    this.renderer.drawAtmosphere();
    if (this.phase === 'paused') this.renderer.drawPausedBanner();
    this.ctx.restore();
  }
}
