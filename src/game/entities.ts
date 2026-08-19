import { TOWER_FEET, TOWERS, towerPaintHeight, type TowerKind } from './constants';
import { ENEMIES, ENEMY_GAIT, spriteFlip, type EnemyKind } from './enemies';
import { sellValueFor, upgradeCostFor } from './balance';
import type { Vec2 } from '../shared/math';
import { dist, pathTotalLength } from '../shared/math';

let nextId = 1;
function id(): number {
  return nextId++;
}

export class Enemy {
  id = id();
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  armor: number;
  radius: number;
  color: string;
  colorDark: string;
  flying: boolean;
  progress = 0;
  alive = true;
  reachedEnd = false;
  slowMul = 1;
  slowTimer = 0;
  burnDps = 0;
  burnTimer = 0;
  poisonDps = 0;
  poisonTimer = 0;
  pos: Vec2 = { x: 0, y: 0 };
  facing = 0;
  /** 1 = authored left, -1 = mirrored for travel right. */
  flip = 1;
  hitFlash = 0;
  bob = Math.random() * Math.PI * 2;
  footfall = false;
  private lastStep = -1;

  constructor(kind: EnemyKind, hpScale: number, waypoints: Vec2[]) {
    const def = ENEMIES[kind];
    this.kind = kind;
    this.maxHp = Math.round(def.hp * hpScale);
    this.hp = this.maxHp;
    this.speed = def.speed;
    this.reward = def.reward;
    this.armor = def.armor;
    this.radius = def.radius;
    this.color = def.color;
    this.colorDark = def.colorDark;
    this.flying = def.flying;
    this.pos = { ...waypoints[0] };
    if (waypoints.length >= 2) {
      const dx = waypoints[1].x - waypoints[0].x;
      const dy = waypoints[1].y - waypoints[0].y;
      const len = Math.hypot(dx, dy) || 1;
      this.facing = Math.atan2(dy, dx);
      this.flip = spriteFlip(dx / len, 1);
    }
  }

  applySlow(amount: number, duration: number): void {
    this.slowMul = Math.min(this.slowMul, 1 - amount);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  applyBurn(dps: number, duration: number): void {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burnTimer = Math.max(this.burnTimer, duration);
  }

  applyPoison(dps: number, duration: number): void {
    this.poisonDps = Math.max(this.poisonDps, dps);
    this.poisonTimer = Math.max(this.poisonTimer, duration);
  }

  takeDamage(raw: number, pierceArmor: boolean): void {
    const reduced = pierceArmor ? raw : raw * (1 - this.armor);
    this.hp -= reduced;
    if (raw > 1.5) this.hitFlash = 1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  update(dt: number, waypoints: Vec2[]): void {
    if (!this.alive) return;

    this.hitFlash = Math.max(0, this.hitFlash - dt * 5);
    const gait = ENEMY_GAIT[this.kind];
    const rate = gait.stepHz * (this.slowMul < 1 ? 0.45 : 1);
    this.bob += dt * rate * Math.PI * 2;
    const step = Math.floor(this.bob / Math.PI);
    this.footfall = gait.dust && step !== this.lastStep;
    this.lastStep = step;

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.takeDamage(this.burnDps * dt, true);
      if (this.burnTimer <= 0) this.burnDps = 0;
      if (!this.alive) return;
    }
    if (this.poisonTimer > 0) {
      this.poisonTimer -= dt;
      this.takeDamage(this.poisonDps * dt, false);
      if (this.poisonTimer <= 0) this.poisonDps = 0;
      if (!this.alive) return;
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMul = 1;
      }
    }

    const total = pathTotalLength(waypoints);
    if (total <= 0) return;
    const prev = { x: this.pos.x, y: this.pos.y };
    const speed = this.speed * this.slowMul;
    this.progress += (speed * dt) / total;
    if (this.progress >= 1) {
      this.progress = 1;
      this.alive = false;
      this.reachedEnd = true;
    }
    let travel = this.progress * total;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const seg = dist(waypoints[i], waypoints[i + 1]);
      if (travel <= seg) {
        const t = seg === 0 ? 0 : travel / seg;
        this.pos = {
          x: waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * t,
          y: waypoints[i].y + (waypoints[i + 1].y - waypoints[i].y) * t,
        };
        const dx = this.pos.x - prev.x;
        const dy = this.pos.y - prev.y;
        if (dx * dx + dy * dy > 0.01) {
          this.facing = Math.atan2(dy, dx);
          this.flip = spriteFlip(Math.cos(this.facing), this.flip);
        }
        return;
      }
      travel -= seg;
    }
    this.pos = { ...waypoints[waypoints.length - 1] };
  }
}

export class Tower {
  id = id();
  kind: TowerKind;
  col: number;
  row: number;
  x: number;
  y: number;
  level = 1;
  cooldown = 0;
  targetId: number | null = null;
  aim = -Math.PI / 2;
  recoil = 0;
  muzzle = 0;

  constructor(kind: TowerKind, col: number, row: number, x: number, y: number) {
    this.kind = kind;
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
  }

  get def() {
    return TOWERS[this.kind];
  }

  get damage(): number {
    return this.damageAt(this.level);
  }

  get range(): number {
    return this.rangeAt(this.level);
  }

  get fireRate(): number {
    return this.fireRateAt(this.level);
  }

  damageAt(level: number): number {
    return this.def.damage * Math.pow(this.def.upgradeMul, level - 1);
  }

  rangeAt(level: number): number {
    return this.def.range * (1 + (level - 1) * 0.08);
  }

  fireRateAt(level: number): number {
    return this.def.fireRate * (1 + (level - 1) * 0.1);
  }

  statusScale(): number {
    return Math.pow(this.def.upgradeMul, this.level - 1);
  }

  upgradeCost(): number {
    return upgradeCostFor(this.def.cost, this.level);
  }

  sellValue(): number {
    return sellValueFor(this.def.cost, this.level);
  }

  /**
   * Shot spawn: crown of still towers, turret/barrel of arrow + cannon.
   * Tile (x, y) is the feet — shots used to appear from the middle of the square.
   */
  muzzlePoint(): Vec2 {
    const h = towerPaintHeight(this.level);
    const feet = TOWER_FEET;
    let lift = h * 0.78 - feet;
    let along = 0;
    if (this.kind === 'arrow') {
      lift = h * 0.56 - feet;
      along = h * 0.26;
    } else if (this.kind === 'cannon') {
      lift = h * 0.28 - feet;
      along = h * 0.2;
    }
    const c = Math.cos(this.aim);
    const s = Math.sin(this.aim);
    return { x: this.x + c * along, y: this.y - lift + s * along };
  }
}

export class Projectile {
  id = id();
  kind: TowerKind;
  x: number;
  y: number;
  ox: number;
  oy: number;
  tx: number;
  ty: number;
  vx = 0;
  vy = 0;
  speed: number;
  arc: number;
  homing: number;
  damage: number;
  splash: number;
  pierceArmor: boolean;
  slow: number;
  slowDuration: number;
  burnDps: number;
  burnDuration: number;
  poisonDps: number;
  poisonDuration: number;
  chain: number;
  color: string;
  targetId: number | null;
  alive = true;
  trail: boolean;
  age = 0;

  constructor(opts: {
    x: number;
    y: number;
    tx: number;
    ty: number;
    speed: number;
    damage: number;
    splash: number;
    pierceArmor: boolean;
    slow: number;
    slowDuration: number;
    burnDps: number;
    burnDuration: number;
    poisonDps: number;
    poisonDuration: number;
    chain: number;
    color: string;
    targetId: number | null;
    trail?: boolean;
    kind?: TowerKind;
    arc?: number;
    homing?: number;
  }) {
    this.x = opts.x;
    this.y = opts.y;
    this.ox = opts.x;
    this.oy = opts.y;
    this.tx = opts.tx;
    this.ty = opts.ty;
    this.speed = opts.speed;
    this.damage = opts.damage;
    this.splash = opts.splash;
    this.pierceArmor = opts.pierceArmor;
    this.slow = opts.slow;
    this.slowDuration = opts.slowDuration;
    this.burnDps = opts.burnDps;
    this.burnDuration = opts.burnDuration;
    this.poisonDps = opts.poisonDps;
    this.poisonDuration = opts.poisonDuration;
    this.chain = opts.chain;
    this.color = opts.color;
    this.targetId = opts.targetId;
    this.trail = opts.trail ?? false;
    this.kind = opts.kind ?? 'arrow';
    this.arc = opts.arc ?? 0;
    this.homing = opts.homing ?? 1;
  }

  /** 0 at spawn, 1 at impact — used for mortar hang. */
  flightT(): number {
    const total = dist({ x: this.ox, y: this.oy }, { x: this.tx, y: this.ty });
    const left = dist({ x: this.x, y: this.y }, { x: this.tx, y: this.ty });
    if (total <= 1) return 1;
    return Math.max(0, Math.min(1, 1 - left / total));
  }

  visualY(): number {
    return this.y - Math.sin(this.flightT() * Math.PI) * this.arc;
  }

  update(dt: number): boolean {
    this.age += dt;
    const d = dist({ x: this.x, y: this.y }, { x: this.tx, y: this.ty });
    if (d < 8) {
      this.alive = false;
      return true;
    }
    const step = this.speed * dt;
    const t = Math.min(1, step / d);
    this.vx = this.tx - this.x;
    this.vy = this.ty - this.y;
    this.x += this.vx * t;
    this.y += this.vy * t;
    return false;
  }
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface BeamFx {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
  width: number;
  points: Vec2[];
}
