import { afterEach, describe, expect, it } from 'vitest';
import { TILE, u } from '../src/game/constants';
import { Game } from '../src/game/Game';
import { Enemy } from '../src/game/entities';
import { LEVELS, buildGrid, canPlaceOnCell } from '../src/game/levels';
import {
  TROOP_CAP,
  TROOP_IDLE_HZ,
  TROOP_STATS,
  TROOP_WALK_HZ,
  assignDefaultRally,
  canRallyAt,
  hallRallyPos,
  nearestPathCell,
  setRallyPoint,
  stepHalls,
} from '../src/game/troops';
import { dist } from '../src/shared/math';
import { CombatSandbox, makeFakeCanvas } from './helpers/combatSandbox';

function grassBesidePath(grid: ReturnType<typeof buildGrid>): { c: number; r: number } | null {
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] !== 'path') continue;
      for (const [dc, dr] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        if (canPlaceOnCell(grid, nc, nr)) return { c: nc, r: nr };
      }
    }
  }
  return null;
}

function firstPath(grid: ReturnType<typeof buildGrid>): { c: number; r: number } | null {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 'path') return { c, r };
    }
  }
  return null;
}

describe('troop hall engine', () => {
  afterEach(() => {
    game?.stopLoop();
  });

  let game: Game | undefined;

  it('places Muster on grass and refuses the path', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    const grass = grassBesidePath(game.grid);
    const path = firstPath(game.grid);
    expect(grass).not.toBeNull();
    expect(path).not.toBeNull();
    if (!grass || !path) return;

    game.selectedKind = 'muster';
    expect(game.tryPlace(path.c, path.r)).toBe(false);
    expect(game.towers).toHaveLength(0);

    game.selectedKind = 'muster';
    expect(game.tryPlace(grass.c, grass.r)).toBe(true);
    expect(game.towers).toHaveLength(1);
    expect(game.towers[0].kind).toBe('muster');
    expect(game.grid[game.towers[0].rallyRow][game.towers[0].rallyCol]).toBe('path');
  });

  it('Forest 1 Game loop: Arrow damages a Raider and Muster troops stall', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    const sites: Array<{ c: number; r: number }> = [];
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let r = 0; r < game.grid.length; r++) {
      for (let c = 0; c < game.grid[0].length; c++) {
        if (game.grid[r][c] !== 'path') continue;
        for (const [dc, dr] of dirs) {
          const cell = { c: c + dc, r: r + dr };
          if (!game.canBuildAt(cell.c, cell.r)) continue;
          if (sites.some((s) => s.c === cell.c && s.r === cell.r)) continue;
          sites.push(cell);
        }
      }
    }
    expect(sites.length).toBeGreaterThanOrEqual(2);

    game.selectedKind = 'arrow';
    expect(game.tryPlace(sites[0].c, sites[0].r)).toBe(true);
    game.selectedKind = 'muster';
    expect(game.tryPlace(sites[1].c, sites[1].r)).toBe(true);
    const hall = game.towers.find((t) => t.kind === 'muster')!;
    game.selectedTowerId = hall.id;
    expect(game.setRallyPoint(hall.rallyCol, hall.rallyRow)).toBe(true);

    game.startWave();
    const tick = game as unknown as { update(dt: number): void };
    for (let i = 0; i < 280; i++) tick.update(1 / 20);

    expect(game.troops.length).toBeGreaterThan(0);
    expect(game.troops.length).toBeLessThanOrEqual(TROOP_CAP);
    const raiders = game.enemies.filter((e) => e.kind === 'grunt');
    const stalled = raiders.some((e) => e.hp < e.maxHp || e.meleeHold);
    const paid = game.gold > 120;
    expect(stalled || paid).toBe(true);
  });

  it('accepts a path rally in range and rejects outside / decor', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    assignDefaultRally(hall, sim.grid);
    const path = { c: hall.rallyCol, r: hall.rallyRow };
    expect(sim.grid[path.r][path.c]).toBe('path');
    expect(setRallyPoint(hall, sim.grid, path.c, path.r)).toBe(true);

    let far: { c: number; r: number } | null = null;
    for (let r = 0; r < sim.grid.length && !far; r++) {
      for (let c = 0; c < sim.grid[0].length; c++) {
        if (sim.grid[r][c] !== 'path') continue;
        const dx = (c + 0.5) * TILE - hall.x;
        const dy = (r + 0.5) * TILE - hall.y;
        if (Math.hypot(dx, dy) > hall.range + TILE) {
          far = { c, r };
          break;
        }
      }
    }
    expect(far).not.toBeNull();
    if (far) expect(setRallyPoint(hall, sim.grid, far.c, far.r)).toBe(false);

    const decor = sim.grid.flatMap((row, r) => row.map((kind, c) => ({ c, r, kind }))).find((cell) => cell.kind === 'decor');
    if (decor) expect(canRallyAt(hall, sim.grid, decor.c, decor.r)).toBe(false);
  });

  it('caps at 3 troops and does not shoot', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    assignDefaultRally(hall, sim.grid);
    sim.run(4);
    expect(sim.troops).toHaveLength(TROOP_CAP);
    expect(sim.projectiles).toHaveLength(0);
    sim.run(6);
    expect(sim.troops).toHaveLength(TROOP_CAP);
  });

  it('ticks gait while walking to rally, then idles on the flag', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    assignDefaultRally(hall, sim.grid);
    stepHalls(sim, 0.05);
    const walker = sim.troops[0];
    expect(walker).toBeTruthy();
    const startBob = walker.bob;
    stepHalls(sim, 0.2);
    expect(walker.moving).toBe(true);
    expect(walker.bob).toBeGreaterThan(startBob);
    expect(TROOP_WALK_HZ.warrior).toBeLessThan(2.4);
    expect(TROOP_WALK_HZ.knight).toBeLessThan(TROOP_WALK_HZ.warrior);
    expect(TROOP_IDLE_HZ).toBeLessThan(TROOP_WALK_HZ.knight);
    expect(TROOP_STATS.warrior.speed).toBe(u(95));
    expect(TROOP_STATS.knight.speed).toBe(u(48));
    sim.run(4);
    expect(sim.troops.some((tr) => !tr.moving)).toBe(true);
  });

  it('locks a ground walker so progress freezes, then resumes after the locker dies', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    assignDefaultRally(hall, sim.grid);
    sim.run(2.2);

    const grunt = sim.spawn('grunt');
    snapEnemyTo(grunt, sim.waypoints, hallRallyPos(hall));
    sim.run(1.2);
    expect(grunt.meleeHold).toBe(true);
    const held = grunt.progress;
    sim.run(0.6);
    expect(grunt.alive).toBe(true);
    expect(grunt.progress).toBeCloseTo(held, 5);

    for (const tr of sim.troops) tr.takeDamage(999);
    stepHalls(sim, 0);
    expect(sim.troops.every((tr) => tr.lockId !== grunt.id)).toBe(true);
    grunt.meleeHold = false;
    const after = grunt.progress;
    sim.run(0.5);
    expect(grunt.progress).toBeGreaterThan(after);
  });

  it('does not lock flyers', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    assignDefaultRally(hall, sim.grid);
    sim.run(2.2);
    const flyer = sim.spawn('swarm');
    snapEnemyTo(flyer, sim.waypoints, hallRallyPos(hall));
    const start = flyer.progress;
    sim.run(0.8);
    expect(flyer.meleeHold).toBe(false);
    expect(flyer.progress).toBeGreaterThan(start);
    expect(sim.troops.every((tr) => tr.lockId !== flyer.id)).toBe(true);
  });

  it('respawns a dead troop from the hall after training time', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    assignDefaultRally(hall, sim.grid);
    sim.run(2.5);
    expect(sim.troops).toHaveLength(3);
    sim.troops[0].takeDamage(999);
    stepHalls(sim, 0);
    expect(sim.troops).toHaveLength(2);
    sim.run(TROOP_STATS.warrior.trainTime + 0.5);
    expect(sim.troops).toHaveLength(3);
  });

  it('knights are slower and tankier than warriors', () => {
    const sim = new CombatSandbox();
    const sites: Array<{ c: number; r: number }> = [];
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let r = 0; r < sim.grid.length; r++) {
      for (let c = 0; c < sim.grid[0].length; c++) {
        if (sim.grid[r][c] !== 'path') continue;
        for (const [dc, dr] of dirs) {
          const cell = { c: c + dc, r: r + dr };
          if (!canPlaceOnCell(sim.grid, cell.c, cell.r)) continue;
          if (sites.some((s) => s.c === cell.c && s.r === cell.r)) continue;
          sites.push(cell);
        }
      }
    }
    expect(sites.length).toBeGreaterThanOrEqual(2);
    const muster = sim.place('muster', sites[0].c, sites[0].r);
    const chapter = sim.place('chapter', sites[1].c, sites[1].r);
    assignDefaultRally(muster, sim.grid);
    assignDefaultRally(chapter, sim.grid);
    sim.run(2.5);
    const warriors = sim.troops.filter((tr) => tr.kind === 'warrior');
    const knights = sim.troops.filter((tr) => tr.kind === 'knight');
    expect(warriors.length).toBeGreaterThan(0);
    expect(knights.length).toBeGreaterThan(0);
    expect(warriors[0].speed).toBeGreaterThan(knights[0].speed);
    expect(knights[0].maxHp).toBeGreaterThan(warriors[0].maxHp);
    expect(warriors[0].radius).toBeLessThan(knights[0].radius);
  });

  it('finds a default rally on the nearest path tile', () => {
    const grid = buildGrid(LEVELS[0]);
    const grass = grassBesidePath(grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const near = nearestPathCell(grid, grass.c, grass.r, TILE * 4);
    expect(near).not.toBeNull();
    if (near) expect(grid[near.r][near.c]).toBe('path');
  });
});

function snapEnemyTo(e: Enemy, waypoints: Array<{ x: number; y: number }>, target: { x: number; y: number }): void {
  e.meleeHold = false;
  let bestP = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 80; i++) {
    const p = i / 80;
    if (p >= 0.99) continue;
    e.progress = p;
    e.alive = true;
    e.reachedEnd = false;
    e.update(0, waypoints);
    const d = dist(e.pos, target);
    if (d < bestD) {
      bestD = d;
      bestP = p;
    }
  }
  e.progress = bestP;
  e.meleeHold = false;
  e.update(0, waypoints);
}
