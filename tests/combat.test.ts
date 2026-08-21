import { describe, expect, it } from 'vitest';
import { TOWERS } from '../src/game/constants';
import { ENEMY_GAIT } from '../src/game/enemies';
import { Enemy, Tower } from '../src/game/entities';
import { canPlaceOnCell, buildGrid, LEVELS, pathWaypoints } from '../src/game/levels';
import { pickTarget, splashMultiplier, canTarget, enemyAimPoint } from '../src/game/combat';
import { BURROW_UP, DASH_EVERY, DASH_MUL, FREEZE_EVERY, PHASE_UP, RALLY_MUL, SLIDE_EVERY, SLIDE_MUL, applyPackRally, stepEnemyVerb } from '../src/game/verbs';
import { CombatSandbox, waveEnemyCount } from './helpers/combatSandbox';

describe('shared combat rules', () => {
  it('aims at the foe furthest along the path', () => {
    const sim = new CombatSandbox();
    const tower = new Tower('arrow', 5, 4, 100, 100);
    const late = sim.spawn('grunt');
    const early = sim.spawn('grunt');
    late.pos = { x: 120, y: 100 };
    early.pos = { x: 130, y: 100 };
    late.progress = 0.8;
    early.progress = 0.2;
    expect(pickTarget(tower, sim.enemies)?.id).toBe(late.id);
  });

  it('cannon cannot lock or splash flyers; arrows can', () => {
    const cannon = new Tower('cannon', 6, 5, 100, 100);
    const arrow = new Tower('arrow', 6, 5, 100, 100);
    const sim = new CombatSandbox();
    const flyer = sim.spawn('swarm');
    const grunt = sim.spawn('grunt');
    flyer.pos = { x: 120, y: 100 };
    grunt.pos = { x: 130, y: 100 };
    flyer.progress = 0.9;
    grunt.progress = 0.2;
    expect(flyer.flying).toBe(true);
    expect(canTarget(cannon, flyer)).toBe(false);
    expect(pickTarget(cannon, sim.enemies)?.id).toBe(grunt.id);
    expect(pickTarget(arrow, sim.enemies)?.id).toBe(flyer.id);

    const splash = new CombatSandbox();
    splash.freezeEnemies = true;
    splash.place('cannon', 6, 5);
    const air = splash.spawn('swarm', 1);
    const ground = splash.spawn('grunt', 1);
    air.pos = { x: splash.towers[0].x + 30, y: splash.towers[0].y };
    ground.pos = { x: splash.towers[0].x + 40, y: splash.towers[0].y };
    splash.run(2.5);
    expect(ground.hp).toBeLessThan(ground.maxHp);
    expect(air.hp).toBe(air.maxHp);
  });

  it('spawns shots from the tower crown, not the tile center', () => {
    const sim = new CombatSandbox();
    sim.freezeEnemies = true;
    const ice = sim.place('ice', 6, 5);
    const grunt = sim.spawn('grunt', 1);
    grunt.pos = { x: ice.x + 40, y: ice.y };
    grunt.progress = 0.4;
    sim.step(1 / 30);
    const shot = sim.projectiles[0];
    expect(shot).toBeTruthy();
    expect(shot.oy).toBeLessThan(ice.y - 30);
  });

  it('aims higher on a boss than on a raider', () => {
    const sim = new CombatSandbox();
    const grunt = sim.spawn('grunt');
    const boss = sim.spawn('boss');
    grunt.pos = { x: 200, y: 200 };
    boss.pos = { x: 200, y: 200 };
    expect(enemyAimPoint(boss).y).toBeLessThan(enemyAimPoint(grunt).y);
  });

  it('uses splash falloff so the rim hits softer than the center', () => {
    expect(splashMultiplier(10, 100)).toBe(1);
    expect(splashMultiplier(50, 100)).toBe(0.65);
    expect(splashMultiplier(101, 100)).toBe(0);
  });
});

describe('tower combat sandbox', () => {
  it('arrow deals damage and can kill a grunt', () => {
    const sim = new CombatSandbox();
    sim.freezeEnemies = true;
    sim.place('arrow', 5, 4);
    const enemy = sim.spawn('grunt', 1);
    enemy.pos = { x: sim.towers[0].x + 40, y: sim.towers[0].y };
    enemy.progress = 0.2;
    sim.run(6);
    expect(sim.damageDealt).toBeGreaterThan(40);
    expect(enemy.alive).toBe(false);
  });

  it('cannon splash hits multiple', () => {
    const mortar = new CombatSandbox();
    mortar.freezeEnemies = true;
    mortar.place('cannon', 6, 5);
    const bruteB = mortar.spawn('brute', 1);
    const grunt = mortar.spawn('grunt', 1);
    bruteB.pos = { x: mortar.towers[0].x + 30, y: mortar.towers[0].y };
    grunt.pos = { x: mortar.towers[0].x + 50, y: mortar.towers[0].y };
    mortar.run(2.5);
    expect(mortar.damageDealt).toBeGreaterThan(0);
    expect(grunt.hp).toBeLessThan(grunt.maxHp);
    expect(TOWERS.cannon.pierceArmor).toBe(true);
  });

  it('ice applies slow', () => {
    const sim = new CombatSandbox();
    sim.freezeEnemies = true;
    sim.place('ice', 6, 5);
    const enemy = sim.spawn('scout', 1);
    enemy.pos = { x: sim.towers[0].x + 20, y: sim.towers[0].y };
    sim.run(1.5);
    expect(enemy.slowMul).toBeLessThan(1);
  });

  it('lightning chains across nearby foes', () => {
    const sim = new CombatSandbox();
    sim.freezeEnemies = true;
    sim.place('lightning', 6, 5);
    const a = sim.spawn('swarm', 1);
    const b = sim.spawn('swarm', 1);
    const c = sim.spawn('swarm', 1);
    const origin = sim.towers[0];
    a.pos = { x: origin.x + 20, y: origin.y };
    b.pos = { x: origin.x + 40, y: origin.y };
    c.pos = { x: origin.x + 60, y: origin.y };
    sim.run(1.2);
    const hurt = [a, b, c].filter((e) => e.hp < e.maxHp).length;
    expect(hurt).toBeGreaterThanOrEqual(2);
  });

  it('fire applies burn and poison applies DoT', () => {
    const fire = new CombatSandbox();
    fire.freezeEnemies = true;
    fire.place('fire', 6, 5);
    const e1 = fire.spawn('grunt', 1);
    e1.pos = { x: fire.towers[0].x + 20, y: fire.towers[0].y };
    fire.run(1.5);
    expect(e1.burnTimer).toBeGreaterThan(0);

    const poison = new CombatSandbox();
    poison.freezeEnemies = true;
    poison.place('poison', 6, 5);
    const e2 = poison.spawn('grunt', 1);
    e2.pos = { x: poison.towers[0].x + 20, y: poison.towers[0].y };
    poison.run(1.5);
    expect(e2.poisonTimer).toBeGreaterThan(0);
  });
});

describe('placement rules', () => {
  it('rejects every path tile across all levels', () => {
    for (const level of LEVELS) {
      const grid = buildGrid(level);
      for (const p of level.pathTiles) {
        expect(canPlaceOnCell(grid, p.c, p.r)).toBe(false);
      }
    }
  });

  it('rejects decor/tree tiles', () => {
    const grid = buildGrid(LEVELS[0]);
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === 'decor') expect(canPlaceOnCell(grid, c, r)).toBe(false);
      }
    }
  });
});

describe('wave pressure', () => {
  it('later waves spawn more total enemies than early ones on level 1', () => {
    expect(waveEnemyCount(1, 10)).toBeGreaterThan(waveEnemyCount(1, 1));
    expect(waveEnemyCount(10, 5)).toBeGreaterThan(waveEnemyCount(1, 5));
  });
});

describe('tower niches', () => {
  it('keeps tower niches from collapsing into each other', () => {
    expect(TOWERS.arrow.cost).toBeLessThan(TOWERS.cannon.cost);
    expect(TOWERS.arrow.fireRate).toBeGreaterThan(TOWERS.cannon.fireRate);
    expect(TOWERS.cannon.splash).toBeGreaterThan(TOWERS.fire.splash);
    expect(TOWERS.cannon.pierceArmor).toBe(true);
    expect(TOWERS.ice.slow).toBeGreaterThan(TOWERS.poison.slow);
    expect(TOWERS.lightning.chain).toBeGreaterThanOrEqual(3);
    expect(TOWERS.fire.burnDps).toBeGreaterThan(0);
    expect(TOWERS.poison.poisonDuration).toBeGreaterThan(TOWERS.fire.burnDuration);
    expect(TOWERS.poison.splash).toBeLessThan(TOWERS.fire.splash);
  });
});

describe('enemy gait', () => {
  it('makes scouts bob faster than brutes without changing speed stats', () => {
    expect(ENEMY_GAIT.scout.stepHz).toBeGreaterThan(ENEMY_GAIT.brute.stepHz);
    expect(ENEMY_GAIT.swarm.jitter).toBeGreaterThan(0);
    const wps = pathWaypoints(LEVELS[0]);
    const scout = new Enemy('scout', 1, wps);
    const brute = new Enemy('brute', 1, wps);
    const s0 = scout.bob;
    const b0 = brute.bob;
    scout.speed = 0;
    brute.speed = 0;
    scout.update(1, wps);
    brute.update(1, wps);
    expect(scout.bob - s0).toBeGreaterThan(brute.bob - b0);
    expect(scout.progress).toBe(0);
    expect(brute.progress).toBe(0);
  });
});

describe('desert verbs', () => {
  it('lets a scorpion burrow so towers cannot lock it', () => {
    const sim = new CombatSandbox();
    const arrow = sim.place('arrow', 6, 5);
    const bug = sim.spawn('scorpion');
    bug.pos = { x: arrow.x + 40, y: arrow.y };
    bug.verbT = 0;
    stepEnemyVerb(bug, BURROW_UP + 0.08);
    expect(bug.burrowed).toBe(true);
    expect(canTarget(arrow, bug)).toBe(false);
    expect(pickTarget(arrow, sim.enemies)).toBeNull();
  });

  it('makes a dune runner sprint for a beat', () => {
    const sim = new CombatSandbox();
    const runner = sim.spawn('duneRunner');
    runner.verbT = 0;
    stepEnemyVerb(runner, DASH_EVERY + 0.05);
    expect(runner.verbSpeedMul).toBe(DASH_MUL);
  });

  it('lets a dune tyrant choke nearby tower fire', () => {
    const sim = new CombatSandbox();
    sim.freezeEnemies = true;
    const arrow = sim.place('arrow', 6, 5);
    const tyrant = sim.spawn('duneTyrant');
    tyrant.pos = { x: arrow.x + 20, y: arrow.y };
    tyrant.progress = 0.4;
    sim.step(1 / 30);
    expect(arrow.choked).toBe(true);
  });

  it('has the sand khan call a caravan', () => {
    const sim = new CombatSandbox();
    const khan = sim.spawn('sandKhan');
    khan.nextSummonAt = 0.05;
    khan.verbT = 0;
    const ev = stepEnemyVerb(khan, 0.1);
    expect(ev.some((e) => e.type === 'summon' && e.kind === 'duneRunner' && e.count === 2)).toBe(true);
  });
});

describe('ice verbs', () => {
  it('lets a frost wisp phase so towers cannot lock it', () => {
    const sim = new CombatSandbox();
    const arrow = sim.place('arrow', 6, 5);
    const wisp = sim.spawn('frostWisp');
    wisp.pos = { x: arrow.x + 40, y: arrow.y };
    wisp.verbT = 0;
    stepEnemyVerb(wisp, PHASE_UP + 0.08);
    expect(wisp.phased).toBe(true);
    expect(canTarget(arrow, wisp)).toBe(false);
    expect(pickTarget(arrow, sim.enemies)).toBeNull();
  });

  it('makes an ice wolf slide for a beat', () => {
    const sim = new CombatSandbox();
    const wolf = sim.spawn('iceWolf');
    wolf.verbT = 0;
    stepEnemyVerb(wolf, SLIDE_EVERY + 0.05);
    expect(wolf.verbSpeedMul).toBe(SLIDE_MUL);
  });

  it('lets a pack lord rally nearby ice wolves', () => {
    const sim = new CombatSandbox();
    const wolf = sim.spawn('iceWolf');
    const lord = sim.spawn('packLord');
    wolf.pos = { x: 200, y: 200 };
    lord.pos = { x: 210, y: 200 };
    stepEnemyVerb(wolf, 0.05);
    applyPackRally(sim.enemies);
    expect(wolf.verbSpeedMul).toBe(RALLY_MUL);
  });

  it('lets a frost jarl freeze nearby tower fire', () => {
    const sim = new CombatSandbox();
    sim.freezeEnemies = true;
    const arrow = sim.place('arrow', 6, 5);
    const jarl = sim.spawn('frostJarl');
    const grunt = sim.spawn('grunt');
    jarl.pos = { x: arrow.x + 20, y: arrow.y };
    grunt.pos = { x: arrow.x + 36, y: arrow.y };
    jarl.progress = 0.4;
    grunt.progress = 0.5;
    jarl.verbT = 0;
    stepEnemyVerb(jarl, FREEZE_EVERY + 0.08);
    expect(jarl.freezing).toBe(true);
    sim.step(1 / 30);
    expect(arrow.frozen).toBe(true);
    expect(sim.projectiles.length).toBe(0);
  });
});
