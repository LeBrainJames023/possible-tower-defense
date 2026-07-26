import {
  BARRACKS,
  BARRACKS_SPECS,
  ENEMIES,
  TOWERS,
  TOWER_SPECS,
  type BarracksKind,
  type BarracksSpecDef,
  type BarracksSpecId,
  type EnemyKind,
  type FriendlyUnitKind,
  type TargetingMode,
  type TowerKind,
  type TowerSpecDef,
  type TowerSpecId,
} from './constants';
import type { Vec2 } from '../shared/math';
import { dist, lengthAlongPath, pathTotalLength } from '../shared/math';

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
  baseArmor: number;
  radius: number;
  color: string;
  colorDark: string;
  flying: boolean;
  undead: boolean;
  progress = 0;
  alive = true;
  reachedEnd = false;
  slowMul = 1;
  slowTimer = 0;
  burnDps = 0;
  burnTimer = 0;
  poisonDps = 0;
  poisonTimer = 0;
  curseDps = 0;
  curseTimer = 0;
  armorShred = 0;
  armorShredTimer = 0;
  /** Set each frame by friendlies — freezes path movement while dueling. */
  blocked = false;
  pos: Vec2 = { x: 0, y: 0 };

  constructor(kind: EnemyKind, hpScale: number, waypoints: Vec2[]) {
    const def = ENEMIES[kind];
    this.kind = kind;
    this.maxHp = Math.round(def.hp * hpScale);
    this.hp = this.maxHp;
    this.speed = def.speed;
    this.reward = def.reward;
    this.baseArmor = def.armor;
    this.radius = def.radius;
    this.color = def.color;
    this.colorDark = def.colorDark;
    this.flying = !!def.flying;
    this.undead = !!def.undead;
    this.pos = { ...waypoints[0] };
  }

  get armor(): number {
    return Math.max(0, this.baseArmor - this.armorShred);
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

  applyCurse(dps: number, duration: number): void {
    this.curseDps = Math.max(this.curseDps, dps);
    this.curseTimer = Math.max(this.curseTimer, duration);
  }

  applyArmorShred(amount: number, duration: number): void {
    this.armorShred = Math.max(this.armorShred, amount);
    this.armorShredTimer = Math.max(this.armorShredTimer, duration);
  }

  takeDamage(raw: number, pierceArmor: boolean): void {
    const reduced = pierceArmor ? raw : raw * (1 - this.armor);
    this.hp -= reduced;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  update(dt: number, waypoints: Vec2[]): void {
    if (!this.alive) return;

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
    if (this.curseTimer > 0) {
      this.curseTimer -= dt;
      this.takeDamage(this.curseDps * dt, true);
      if (this.curseTimer <= 0) this.curseDps = 0;
      if (!this.alive) return;
    }

    if (this.armorShredTimer > 0) {
      this.armorShredTimer -= dt;
      if (this.armorShredTimer <= 0) {
        this.armorShredTimer = 0;
        this.armorShred = 0;
      }
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.slowMul = 1;
      }
    }

    if (this.blocked) return;

    const total = pathTotalLength(waypoints);
    if (total <= 0) return;
    const speed = this.speed * this.slowMul;
    this.progress += (speed * dt) / total;
    if (this.progress >= 1) {
      this.progress = 1;
      this.alive = false;
      this.reachedEnd = true;
    }
    this.pos = lengthAlongPath(waypoints, this.progress);
  }
}

function specMul(spec: TowerSpecDef | null, key: keyof TowerSpecDef, fallback = 1): number {
  if (!spec) return fallback;
  const v = spec[key];
  return typeof v === 'number' ? v : fallback;
}

function bSpecMul(spec: BarracksSpecDef | null, key: keyof BarracksSpecDef, fallback = 1): number {
  if (!spec) return fallback;
  const v = spec[key];
  return typeof v === 'number' ? v : fallback;
}

export class Tower {
  id = id();
  kind: TowerKind;
  col: number;
  row: number;
  x: number;
  y: number;
  level = 1;
  /** Permanent L3 specialization — null until chosen. */
  spec: TowerSpecId | null = null;
  specGoldSpent = 0;
  targeting: TargetingMode = 'first';
  cooldown = 0;
  targetId: number | null = null;
  /** Radians — where the weapon points (updated when acquiring a target). */
  aimAngle = -Math.PI / 2;

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

  get specDef(): TowerSpecDef | null {
    if (!this.spec) return null;
    return TOWER_SPECS[this.kind].find((s) => s.id === this.spec) ?? null;
  }

  get displayName(): string {
    const s = this.specDef;
    return s ? `${this.def.name} · ${s.name}` : this.def.name;
  }

  private levelMul(): number {
    return Math.pow(this.def.upgradeMul, this.level - 1);
  }

  get damage(): number {
    return this.def.damage * this.levelMul() * specMul(this.specDef, 'damageMul');
  }

  get range(): number {
    return this.def.range * (1 + (this.level - 1) * 0.08) * specMul(this.specDef, 'rangeMul');
  }

  get fireRate(): number {
    return this.def.fireRate * (1 + (this.level - 1) * 0.1) * specMul(this.specDef, 'fireRateMul');
  }

  get splash(): number {
    const s = this.specDef;
    const base = this.def.splash * specMul(s, 'splashMul');
    return base + (s?.splashAdd ?? 0);
  }

  get slow(): number {
    return Math.min(0.85, this.def.slow * specMul(this.specDef, 'slowMul'));
  }

  get slowDuration(): number {
    return this.def.slowDuration * specMul(this.specDef, 'slowDurationMul');
  }

  get chain(): number {
    const s = this.specDef;
    if (s?.chainSet != null) return s.chainSet;
    return Math.max(0, this.def.chain + (s?.chainAdd ?? 0));
  }

  get burnDps(): number {
    return this.def.burnDps * specMul(this.specDef, 'burnDpsMul');
  }

  get burnDuration(): number {
    return this.def.burnDuration * specMul(this.specDef, 'burnDurationMul');
  }

  get poisonDps(): number {
    return this.def.poisonDps * specMul(this.specDef, 'poisonDpsMul');
  }

  get poisonDuration(): number {
    return this.def.poisonDuration * specMul(this.specDef, 'poisonDurationMul');
  }

  get armorShred(): number {
    return Math.min(0.7, this.def.armorShred * specMul(this.specDef, 'armorShredMul'));
  }

  get armorShredDuration(): number {
    return this.def.armorShredDuration * specMul(this.specDef, 'armorShredDurationMul');
  }

  get curseDps(): number {
    return this.def.curseDps * specMul(this.specDef, 'curseDpsMul');
  }

  get curseDuration(): number {
    return this.def.curseDuration * specMul(this.specDef, 'curseDurationMul');
  }

  get goldOnHit(): number {
    return this.def.goldOnHit + (this.specDef?.goldOnHitAdd ?? 0);
  }

  get hitsAir(): boolean {
    return this.def.hitsAir;
  }

  get hitsGround(): boolean {
    return this.def.hitsGround;
  }

  statusScale(): number {
    return this.levelMul();
  }

  /** True when L3 and still needs a specialization pick. */
  needsSpec(): boolean {
    return this.level >= 3 && this.spec == null;
  }

  upgradeCost(): number {
    return Math.round(this.def.upgradeCost * Math.pow(1.35, this.level - 1));
  }

  specCost(): number {
    return Math.round(this.def.upgradeCost * Math.pow(1.35, 2) * 1.5);
  }

  sellValue(): number {
    const base = this.def.cost;
    const upgrades = this.def.upgradeCost * (this.level - 1) * 0.7;
    const spec = this.specGoldSpent * 0.7;
    return Math.round((base + upgrades + spec) * 0.65);
  }
}

export class Barracks {
  id = id();
  kind: BarracksKind;
  col: number;
  row: number;
  x: number;
  y: number;
  level = 1;
  spec: BarracksSpecId | null = null;
  specGoldSpent = 0;
  rallyX: number;
  rallyY: number;
  rallyProgress: number;
  spawnTimer: number;

  constructor(
    kind: BarracksKind,
    col: number,
    row: number,
    x: number,
    y: number,
    rallyX: number,
    rallyY: number,
    rallyProgress: number,
  ) {
    this.kind = kind;
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
    this.rallyX = rallyX;
    this.rallyY = rallyY;
    this.rallyProgress = rallyProgress;
    this.spawnTimer = 0.6;
  }

  get def() {
    return BARRACKS[this.kind];
  }

  get specDef(): BarracksSpecDef | null {
    if (!this.spec) return null;
    return BARRACKS_SPECS[this.kind].find((s) => s.id === this.spec) ?? null;
  }

  get displayName(): string {
    const s = this.specDef;
    return s ? `${this.def.name} · ${s.name}` : this.def.name;
  }

  get rallyRadius(): number {
    return this.def.rallyRadius * (1 + (this.level - 1) * 0.08);
  }

  unitHp(): number {
    return Math.round(
      this.def.unit.hp * (1 + (this.level - 1) * 0.22) * bSpecMul(this.specDef, 'hpMul'),
    );
  }

  unitDamage(): number {
    return this.def.unit.damage * (1 + (this.level - 1) * 0.18) * bSpecMul(this.specDef, 'damageMul');
  }

  unitAttackRate(): number {
    return (
      this.def.unit.attackRate *
      (1 + (this.level - 1) * 0.08) *
      bSpecMul(this.specDef, 'attackRateMul')
    );
  }

  unitEngage(): number {
    return this.def.unit.engageRange * bSpecMul(this.specDef, 'engageMul');
  }

  smiteMul(): number {
    return bSpecMul(this.specDef, 'smiteMul', 1.55);
  }

  slowOnHit(): number {
    return this.specDef?.slowOnHit ?? 0;
  }

  slowOnHitDuration(): number {
    return this.specDef?.slowOnHitDuration ?? 0;
  }

  damageTakenMul(): number {
    return bSpecMul(this.specDef, 'damageTakenMul', 1);
  }

  needsSpec(): boolean {
    return this.level >= 3 && this.spec == null;
  }

  upgradeCost(): number {
    return Math.round(this.def.upgradeCost * Math.pow(1.35, this.level - 1));
  }

  specCost(): number {
    return Math.round(this.def.upgradeCost * Math.pow(1.35, 2) * 1.5);
  }

  sellValue(): number {
    const base = this.def.cost;
    const upgrades = this.def.upgradeCost * (this.level - 1) * 0.7;
    const spec = this.specGoldSpent * 0.7;
    return Math.round((base + upgrades + spec) * 0.65);
  }
}

export class FriendlyUnit {
  id = id();
  barracksId: number;
  unitKind: FriendlyUnitKind;
  slot: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackRate: number;
  speed: number;
  engageRange: number;
  radius: number;
  color: string;
  colorDark: string;
  progress: number;
  rallyProgress: number;
  pos: Vec2;
  targetEnemyId: number | null = null;
  attackCd = 0;
  enemyStrikeCd = 0;
  smiteMul = 1.55;
  slowOnHit = 0;
  slowOnHitDuration = 0;
  damageTakenMul = 1;
  alive = true;
  facing = 1;

  constructor(opts: {
    barracksId: number;
    unitKind: FriendlyUnitKind;
    slot: number;
    hp: number;
    damage: number;
    attackRate: number;
    speed: number;
    engageRange: number;
    radius: number;
    color: string;
    colorDark: string;
    progress: number;
    rallyProgress: number;
    pos: Vec2;
    smiteMul?: number;
    slowOnHit?: number;
    slowOnHitDuration?: number;
    damageTakenMul?: number;
  }) {
    this.barracksId = opts.barracksId;
    this.unitKind = opts.unitKind;
    this.slot = opts.slot;
    this.maxHp = opts.hp;
    this.hp = opts.hp;
    this.damage = opts.damage;
    this.attackRate = opts.attackRate;
    this.speed = opts.speed;
    this.engageRange = opts.engageRange;
    this.radius = opts.radius;
    this.color = opts.color;
    this.colorDark = opts.colorDark;
    this.progress = opts.progress;
    this.rallyProgress = opts.rallyProgress;
    this.pos = { ...opts.pos };
    this.smiteMul = opts.smiteMul ?? 1.55;
    this.slowOnHit = opts.slowOnHit ?? 0;
    this.slowOnHitDuration = opts.slowOnHitDuration ?? 0;
    this.damageTakenMul = opts.damageTakenMul ?? 1;
  }

  takeDamage(raw: number): void {
    this.hp -= raw * this.damageTakenMul;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }
}

export class Projectile {
  id = id();
  x: number;
  y: number;
  px: number;
  py: number;
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
  curseDps: number;
  curseDuration: number;
  armorShred: number;
  armorShredDuration: number;
  goldOnHit: number;
  chain: number;
  color: string;
  towerKind: TowerKind;
  spec: TowerSpecId | null;
  targetId: number | null;
  alive = true;
  trail: boolean;

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
    curseDps?: number;
    curseDuration?: number;
    armorShred?: number;
    armorShredDuration?: number;
    goldOnHit?: number;
    chain: number;
    color: string;
    towerKind: TowerKind;
    spec?: TowerSpecId | null;
    targetId: number | null;
    trail?: boolean;
  }) {
    this.x = opts.x;
    this.y = opts.y;
    this.px = opts.x;
    this.py = opts.y;
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
    this.curseDps = opts.curseDps ?? 0;
    this.curseDuration = opts.curseDuration ?? 0;
    this.armorShred = opts.armorShred ?? 0;
    this.armorShredDuration = opts.armorShredDuration ?? 0;
    this.goldOnHit = opts.goldOnHit ?? 0;
    this.chain = opts.chain;
    this.color = opts.color;
    this.towerKind = opts.towerKind;
    this.spec = opts.spec ?? null;
    this.targetId = opts.targetId;
    this.trail = opts.trail ?? false;
  }

  update(dt: number): boolean {
    this.px = this.x;
    this.py = this.y;
    const d = dist({ x: this.x, y: this.y }, { x: this.tx, y: this.ty });
    if (d < 8) {
      this.alive = false;
      return true;
    }
    const step = this.speed * dt;
    const t = Math.min(1, step / d);
    this.x += (this.tx - this.x) * t;
    this.y += (this.ty - this.y) * t;
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
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function spawnKillBurst(x: number, y: number, color: string, count = 10): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const sp = 40 + Math.random() * 90;
    out.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 20,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
      color,
      size: 2 + Math.random() * 3.5,
    });
  }
  return out;
}
