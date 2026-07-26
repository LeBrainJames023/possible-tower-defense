import {
  BARRACKS_SPECS,
  TILE,
  TOWER_SPECS,
  WAVES_PER_LEVEL,
  enemyMeleeDamage,
  isBarracksKind,
  placeableCost,
  type BarracksSpecId,
  type PlaceableKind,
  type TargetingMode,
  type TowerSpecId,
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
  Barracks,
  Enemy,
  FriendlyUnit,
  Tower,
  Projectile,
  spawnKillBurst,
  type BeamFx,
  type FloatingText,
  type Particle,
} from './entities';
import { Renderer } from './render';
import { audio } from './audio';
import { dist, lengthAlongPath, nearestPathSample, pathTotalLength } from '../shared/math';

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
  selectedKind: PlaceableKind | null = 'arrow';
  selectedTowerId: number | null = null;
  selectedBarracksId: number | null = null;
  selectedEnemyId: number | null = null;
  /** When set, next valid map click sets that barracks' rally flag. */
  rallyModeBarracksId: number | null = null;

  towers: Tower[] = [];
  barracks: Barracks[] = [];
  friendlies: FriendlyUnit[] = [];
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
    this.barracks = [];
    this.friendlies = [];
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
    this.selectedBarracksId = null;
    this.selectedEnemyId = null;
    this.rallyModeBarracksId = null;
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
      barracks: this.barracks.length,
      friendlies: this.friendlies.length,
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
    if (this.phase !== 'prepare' && this.phase !== 'wave' && this.phase !== 'paused') return false;
    if (!this.selectedKind) return false;
    const x = c * TILE + TILE / 2;
    const y = r * TILE + TILE / 2;
    if (!canPlaceOnCell(this.grid, c, r)) {
      this.floats.push({ x, y, text: 'Blocked', color: '#ef476f', life: 0.7 });
      this.onToast?.('Cannot place on the path, water, or trees.');
      return false;
    }
    const key = `${c},${r}`;
    if (this.occupied.has(key)) {
      this.floats.push({ x, y, text: 'Taken', color: '#ef476f', life: 0.7 });
      return false;
    }
    const cost = placeableCost(this.selectedKind);
    if (this.gold < cost) {
      this.floats.push({ x, y, text: 'Need gold', color: '#f4d35e', life: 0.7 });
      this.onToast?.(`Need ${cost}g.`);
      return false;
    }

    this.gold -= cost;
    if (isBarracksKind(this.selectedKind)) {
      const kind = this.selectedKind;
      const rally = nearestPathSample(this.waypoints, x, y);
      const b = new Barracks(kind, c, r, x, y, rally.pos.x, rally.pos.y, rally.progress);
      this.barracks.push(b);
      this.occupied.add(key);
      this.selectedBarracksId = b.id;
      this.selectedTowerId = null;
      this.selectedEnemyId = null;
      this.selectedKind = null;
      this.rallyModeBarracksId = null;
      this.floats.push({ x, y: y - 20, text: `-${cost}g`, color: '#f4d35e', life: 0.8 });
      audio.play('place');
      this.onHud?.();
      return true;
    }

    const tower = new Tower(this.selectedKind, c, r, x, y);
    this.towers.push(tower);
    this.occupied.add(key);
    this.selectedTowerId = tower.id;
    this.selectedBarracksId = null;
    this.selectedEnemyId = null;
    this.selectedKind = null;
    this.rallyModeBarracksId = null;
    this.floats.push({ x, y: y - 20, text: `-${cost}g`, color: '#f4d35e', life: 0.8 });
    audio.play('place');
    this.onHud?.();
    return true;
  }

  selectTowerAt(c: number, r: number): boolean {
    const t = this.towers.find((x) => x.col === c && x.row === r);
    if (t) {
      this.selectedTowerId = t.id;
      this.selectedBarracksId = null;
      this.selectedEnemyId = null;
      this.selectedKind = null;
      this.rallyModeBarracksId = null;
      audio.play('ui');
      this.onHud?.();
      return true;
    }
    const b = this.barracks.find((x) => x.col === c && x.row === r);
    if (!b) return false;
    this.selectedBarracksId = b.id;
    this.selectedTowerId = null;
    this.selectedEnemyId = null;
    this.selectedKind = null;
    audio.play('ui');
    this.onHud?.();
    return true;
  }

  selectEnemyAt(clientX: number, clientY: number): boolean {
    if (this.rallyModeBarracksId != null) return false;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    let best: Enemy | null = null;
    let bestD = 28;
    for (const e of this.enemies) {
      const ey = e.flying ? e.pos.y - 14 : e.pos.y;
      const d = dist({ x, y }, { x: e.pos.x, y: ey });
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    if (!best) return false;
    this.selectedEnemyId = best.id;
    this.selectedTowerId = null;
    this.selectedBarracksId = null;
    this.selectedKind = null;
    this.rallyModeBarracksId = null;
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

  getSelectedBarracks(): Barracks | null {
    return this.barracks.find((b) => b.id === this.selectedBarracksId) ?? null;
  }

  upgradeSelected(): boolean {
    const t = this.getSelectedTower();
    if (t) {
      if (t.level >= 3 || t.spec) return false;
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

    const b = this.getSelectedBarracks();
    if (!b || b.level >= 3 || b.spec) return false;
    const cost = b.upgradeCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    b.level += 1;
    this.refreshBarracksUnits(b);
    this.floats.push({
      x: b.x,
      y: b.y - 24,
      text: `Lv${b.level}`,
      color: '#57cc99',
      life: 0.9,
    });
    audio.play('upgrade');
    this.onHud?.();
    return true;
  }

  applySpec(specId: TowerSpecId): boolean {
    const t = this.getSelectedTower();
    if (!t || !t.needsSpec()) return false;
    const match = TOWER_SPECS[t.kind].find((s) => s.id === specId);
    if (!match) return false;
    const cost = t.specCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    t.spec = specId;
    t.specGoldSpent = cost;
    this.floats.push({
      x: t.x,
      y: t.y - 28,
      text: match.name,
      color: '#f0c94d',
      life: 1.1,
    });
    audio.play('upgrade');
    this.onHud?.();
    return true;
  }

  applyBarracksSpec(specId: BarracksSpecId): boolean {
    const b = this.getSelectedBarracks();
    if (!b || !b.needsSpec()) return false;
    const match = BARRACKS_SPECS[b.kind].find((s) => s.id === specId);
    if (!match) return false;
    const cost = b.specCost();
    if (this.gold < cost) return false;
    this.gold -= cost;
    b.spec = specId;
    b.specGoldSpent = cost;
    this.refreshBarracksUnits(b);
    this.floats.push({
      x: b.x,
      y: b.y - 28,
      text: match.name,
      color: '#f0c94d',
      life: 1.1,
    });
    audio.play('upgrade');
    this.onHud?.();
    return true;
  }

  setTargeting(mode: TargetingMode): boolean {
    const t = this.getSelectedTower();
    if (!t) return false;
    t.targeting = mode;
    audio.play('ui');
    this.onHud?.();
    return true;
  }

  private refreshBarracksUnits(b: Barracks): void {
    for (const u of this.friendlies) {
      if (u.barracksId !== b.id || !u.alive) continue;
      const ratio = u.hp / u.maxHp;
      u.maxHp = b.unitHp();
      u.hp = Math.max(1, Math.round(u.maxHp * ratio));
      u.damage = b.unitDamage();
      u.attackRate = b.unitAttackRate();
      u.engageRange = b.unitEngage();
      u.smiteMul = b.smiteMul();
      u.slowOnHit = b.slowOnHit();
      u.slowOnHitDuration = b.slowOnHitDuration();
      u.damageTakenMul = b.damageTakenMul();
    }
  }

  sellSelected(): boolean {
    const t = this.getSelectedTower();
    if (t) {
      this.gold += t.sellValue();
      this.occupied.delete(`${t.col},${t.row}`);
      this.towers = this.towers.filter((x) => x.id !== t.id);
      this.selectedTowerId = null;
      audio.play('ui');
      this.onHud?.();
      return true;
    }
    const b = this.getSelectedBarracks();
    if (!b) return false;
    this.gold += b.sellValue();
    this.occupied.delete(`${b.col},${b.row}`);
    this.barracks = this.barracks.filter((x) => x.id !== b.id);
    this.friendlies = this.friendlies.filter((u) => u.barracksId !== b.id);
    this.selectedBarracksId = null;
    if (this.rallyModeBarracksId === b.id) this.rallyModeBarracksId = null;
    audio.play('ui');
    this.onHud?.();
    return true;
  }

  beginRallyMode(): boolean {
    const b = this.getSelectedBarracks();
    if (!b) return false;
    this.rallyModeBarracksId = b.id;
    this.selectedKind = null;
    audio.play('ui');
    this.onToast?.('Tap the path within the circle to plant the rally flag.');
    this.onHud?.();
    return true;
  }

  cancelRallyMode(): void {
    this.rallyModeBarracksId = null;
    this.onHud?.();
  }

  trySetRally(clientX: number, clientY: number): boolean {
    if (this.rallyModeBarracksId == null) return false;
    const b = this.barracks.find((x) => x.id === this.rallyModeBarracksId);
    if (!b) {
      this.rallyModeBarracksId = null;
      return false;
    }
    const { x, y } = this.clientToWorld(clientX, clientY);
    if (dist({ x, y }, { x: b.x, y: b.y }) > b.rallyRadius) {
      this.floats.push({ x, y, text: 'Too far', color: '#ef476f', life: 0.7 });
      this.onToast?.('Rally flag must stay inside the barracks circle.');
      return false;
    }
    const snap = nearestPathSample(this.waypoints, x, y);
    b.rallyX = snap.pos.x;
    b.rallyY = snap.pos.y;
    b.rallyProgress = snap.progress;
    for (const u of this.friendlies) {
      if (u.barracksId === b.id) {
        u.rallyProgress = snap.progress + (u.slot - 1) * 0.01;
      }
    }
    this.rallyModeBarracksId = null;
    this.floats.push({ x: snap.pos.x, y: snap.pos.y - 16, text: 'Flag set', color: '#57cc99', life: 0.85 });
    audio.play('flag');
    this.onHud?.();
    return true;
  }

  canvasToCell(clientX: number, clientY: number): { c: number; r: number } {
    const { x, y } = this.clientToWorld(clientX, clientY);
    return { c: Math.floor(x / TILE), r: Math.floor(y / TILE) };
  }

  clientToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
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

    for (const e of this.enemies) e.blocked = false;

    this.updateBarracks(dt);
    this.updateFriendlies(dt);

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
          p.ty = tgt.pos.y - (tgt.flying ? 14 : 0);
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

  private updateBarracks(dt: number): void {
    for (const b of this.barracks) {
      const living = this.friendlies.filter((u) => u.barracksId === b.id && u.alive).length;
      if (living >= b.def.unitCap) {
        b.spawnTimer = b.def.respawnTime;
        continue;
      }
      b.spawnTimer -= dt;
      if (b.spawnTimer > 0) continue;
      this.spawnFriendly(b);
      b.spawnTimer = b.def.respawnTime;
    }
  }

  private spawnFriendly(b: Barracks): void {
    const used = new Set(
      this.friendlies.filter((u) => u.barracksId === b.id && u.alive).map((u) => u.slot),
    );
    let slot = 0;
    for (let i = 0; i < b.def.unitCap; i++) {
      if (!used.has(i)) {
        slot = i;
        break;
      }
    }
    const door = nearestPathSample(this.waypoints, b.x, b.y + 8);
    const unit = new FriendlyUnit({
      barracksId: b.id,
      unitKind: b.def.unitKind,
      slot,
      hp: b.unitHp(),
      damage: b.unitDamage(),
      attackRate: b.unitAttackRate(),
      speed: b.def.unit.speed,
      engageRange: b.unitEngage(),
      radius: b.def.unit.radius,
      color: b.def.color,
      colorDark: b.def.colorDark,
      progress: door.progress,
      rallyProgress: b.rallyProgress + (slot - 1) * 0.01,
      pos: door.pos,
      smiteMul: b.smiteMul(),
      slowOnHit: b.slowOnHit(),
      slowOnHitDuration: b.slowOnHitDuration(),
      damageTakenMul: b.damageTakenMul(),
    });
    this.friendlies.push(unit);
    this.particles.push(...spawnKillBurst(b.x, b.y - 8, b.def.color, 6));
    audio.play('spawn');
  }

  private updateFriendlies(dt: number): void {
    const total = pathTotalLength(this.waypoints);
    const claimed = new Set<number>();

    for (const u of this.friendlies) {
      if (!u.alive) continue;
      u.attackCd = Math.max(0, u.attackCd - dt);
      u.enemyStrikeCd = Math.max(0, u.enemyStrikeCd - dt);

      // Drop dead / missing targets
      if (u.targetEnemyId != null) {
        const tgt = this.enemies.find((e) => e.id === u.targetEnemyId && e.alive);
        if (!tgt || dist(u.pos, tgt.pos) > u.engageRange * 1.35) {
          u.targetEnemyId = null;
        }
      }

      // Acquire target — ground only (flyers ignore barracks)
      if (u.targetEnemyId == null) {
        let best: Enemy | null = null;
        let bestD = u.engageRange;
        for (const e of this.enemies) {
          if (!e.alive || e.flying || claimed.has(e.id)) continue;
          const d = dist(u.pos, e.pos);
          if (d < bestD) {
            bestD = d;
            best = e;
          }
        }
        if (best) {
          u.targetEnemyId = best.id;
          claimed.add(best.id);
        }
      } else {
        claimed.add(u.targetEnemyId);
      }

      const target =
        u.targetEnemyId != null
          ? (this.enemies.find((e) => e.id === u.targetEnemyId && e.alive && !e.flying) ?? null)
          : null;

      if (target) {
        target.blocked = true;
        u.facing = target.pos.x >= u.pos.x ? 1 : -1;
        const ang = Math.atan2(target.pos.y - u.pos.y, target.pos.x - u.pos.x);
        u.pos = {
          x: u.pos.x + Math.cos(ang) * 8 * dt,
          y: u.pos.y + Math.sin(ang) * 8 * dt,
        };

        if (u.attackCd <= 0) {
          let dmg = u.damage;
          if (u.unitKind === 'paladin' && target.undead) dmg *= u.smiteMul;
          target.takeDamage(dmg, false);
          if (u.slowOnHit > 0) target.applySlow(u.slowOnHit, u.slowOnHitDuration);
          u.attackCd = 1 / u.attackRate;
          audio.play('hit', 0.85);
          this.particles.push({
            x: (u.pos.x + target.pos.x) / 2,
            y: (u.pos.y + target.pos.y) / 2,
            vx: 0,
            vy: -30,
            life: 0.2,
            maxLife: 0.2,
            color: u.unitKind === 'paladin' ? '#f7e7a0' : '#f4d35e',
            size: 3,
          });
        }
        if (u.enemyStrikeCd <= 0) {
          u.takeDamage(enemyMeleeDamage(target.kind));
          u.enemyStrikeCd = 0.85;
        }
        if (!target.alive && !target.reachedEnd) {
          this.rewardKill(target);
        }
        continue;
      }

      // Walk along path toward rally
      if (total > 0) {
        const delta = u.rallyProgress - u.progress;
        if (Math.abs(delta) > 0.002) {
          const step = (u.speed * dt) / total;
          u.progress += Math.sign(delta) * Math.min(step, Math.abs(delta));
          u.facing = Math.sign(delta) || u.facing;
        }
        u.pos = lengthAlongPath(this.waypoints, u.progress);
      }
    }

    const died = this.friendlies.filter((u) => !u.alive);
    for (const u of died) {
      this.particles.push(...spawnKillBurst(u.pos.x, u.pos.y, u.color, 8));
      audio.play('unitDown');
    }
    this.friendlies = this.friendlies.filter((u) => u.alive);
    this.enemies = this.enemies.filter((e) => e.alive);
  }

  private pickTarget(t: Tower): Enemy | null {
    const inRange = this.enemies.filter((e) => {
      if (dist({ x: t.x, y: t.y }, e.pos) > t.range) return false;
      if (e.flying && !t.hitsAir) return false;
      if (!e.flying && !t.hitsGround) return false;
      return true;
    });
    if (!inRange.length) return null;
    if (t.targeting === 'strong') {
      inRange.sort((a, b) => b.maxHp - a.maxHp || b.progress - a.progress);
    } else if (t.targeting === 'close') {
      inRange.sort(
        (a, b) =>
          dist({ x: t.x, y: t.y }, a.pos) - dist({ x: t.x, y: t.y }, b.pos) ||
          b.progress - a.progress,
      );
    } else {
      inRange.sort((a, b) => b.progress - a.progress);
    }
    return inRange[0];
  }

  private fire(t: Tower, target: Enemy): void {
    const def = t.def;
    const status = t.statusScale();
    audio.shootFor(t.kind);
    if (t.chain > 0) {
      const hit = new Set<number>();
      let current: Enemy | null = target;
      let fromX = t.x;
      let fromY = t.y;
      let dmg = t.damage;
      for (let i = 0; i < t.chain && current; i++) {
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
        if (t.slow > 0) current.applySlow(t.slow, t.slowDuration);
        if (t.burnDps > 0) current.applyBurn(t.burnDps * status, t.burnDuration);
        if (t.poisonDps > 0) current.applyPoison(t.poisonDps * status, t.poisonDuration);
        if (t.curseDps > 0) current.applyCurse(t.curseDps * status, t.curseDuration);
        if (t.armorShred > 0) current.applyArmorShred(t.armorShred, t.armorShredDuration);
        if (t.goldOnHit > 0) {
          this.gold += t.goldOnHit;
          this.floats.push({
            x: current.pos.x,
            y: current.pos.y - 8,
            text: `+${t.goldOnHit}`,
            color: '#c77dff',
            life: 0.5,
          });
        }
        fromX = current.pos.x;
        fromY = current.pos.y;
        dmg *= 0.7;
        const next = this.enemies
          .filter((e) => {
            if (hit.has(e.id) || dist(current!.pos, e.pos) >= 90) return false;
            if (e.flying && !t.hitsAir) return false;
            if (!e.flying && !t.hitsGround) return false;
            return true;
          })
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

    const flyerLift = target.flying ? 14 : 0;
    this.projectiles.push(
      new Projectile({
        x: t.x,
        y: t.y - 12,
        tx: target.pos.x,
        ty: target.pos.y - flyerLift,
        speed: t.kind === 'dark' ? 260 : t.splash > 0 ? 280 : 420,
        damage: t.damage,
        splash: t.splash,
        pierceArmor: def.pierceArmor,
        slow: t.slow,
        slowDuration: t.slowDuration,
        burnDps: t.burnDps * status,
        burnDuration: t.burnDuration,
        poisonDps: t.poisonDps * status,
        poisonDuration: t.poisonDuration,
        curseDps: t.curseDps * status,
        curseDuration: t.curseDuration,
        armorShred: t.armorShred,
        armorShredDuration: t.armorShredDuration,
        goldOnHit: t.goldOnHit,
        chain: 0,
        color: def.color,
        towerKind: t.kind,
        spec: t.spec,
        targetId: target.id,
        trail: t.kind === 'arrow' || t.kind === 'fire' || t.kind === 'light' || t.kind === 'dark',
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
      if (p.curseDps > 0) e.applyCurse(p.curseDps * mul, p.curseDuration);
      if (p.armorShred > 0) e.applyArmorShred(p.armorShred, p.armorShredDuration);
      if (p.goldOnHit > 0) {
        const gain = Math.round(p.goldOnHit * mul);
        if (gain > 0) {
          this.gold += gain;
          this.floats.push({
            x: e.pos.x,
            y: e.pos.y - 8,
            text: `+${gain}`,
            color: '#c77dff',
            life: 0.5,
          });
        }
      }
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
    this.rallyModeBarracksId = null;
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
      this.gold >= placeableCost(this.selectedKind);

    this.renderer.drawGrid(
      this.grid,
      this.hover,
      canPlace,
      this.selectedKind,
      !!this.selectedKind,
    );
    this.renderer.drawSpawnExit(this.waypoints);

    for (const b of this.barracks) {
      this.renderer.drawBarracks(
        b,
        b.id === this.selectedBarracksId,
        this.rallyModeBarracksId === b.id,
      );
    }
    for (const t of this.towers) {
      this.renderer.drawTower(t, t.id === this.selectedTowerId);
    }
    for (const u of this.friendlies) {
      this.renderer.drawFriendly(u);
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
