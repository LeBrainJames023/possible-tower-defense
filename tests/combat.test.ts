import { describe, expect, it } from 'vitest';
import { TOWERS } from '../src/game/constants';
import { canPlaceOnCell, buildGrid, LEVELS } from '../src/game/levels';
import { CombatSandbox, waveEnemyCount } from './helpers/combatSandbox';

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
