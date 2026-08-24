import { describe, expect, it } from 'vitest';
import { TOWER_ORDER, TOWERS } from '../src/game/constants';
import { Tower } from '../src/game/entities';
import { forksFor } from '../src/game/forks';
import { firstHallClick } from '../src/game/footprint';
import { Game } from '../src/game/Game';
import { TROOP_STATS, troopStatsAt } from '../src/game/troops';
import { LEVELS } from '../src/game/levels';
import { CombatSandbox, makeFakeCanvas } from './helpers/combatSandbox';

function grassBesidePath(grid: CombatSandbox['grid']): { c: number; r: number } | null {
  return firstHallClick(grid, new Set(), true, LEVELS[0].pathTiles);
}

function firstPath(grid: CombatSandbox['grid']): { c: number; r: number } | null {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 'path') return { c, r };
    }
  }
  return null;
}

describe('keep forks', () => {
  it('gives every keep a Faster vs Heavier path', () => {
    for (const kind of TOWER_ORDER) {
      const forks = forksFor(kind);
      expect(forks).not.toBeNull();
      expect(forks!.a.name.length).toBeGreaterThan(0);
      expect(forks!.b.name.length).toBeGreaterThan(0);
    }
  });

  it('lets Ice / Lightning / Fire / Poison / Void / Longshot fork after Lv3', () => {
    for (const kind of ['ice', 'lightning', 'fire', 'poison', 'void', 'longshot'] as const) {
      const t = new Tower(kind, 2, 2, 100, 100);
      t.level = 3;
      expect(t.canNumberUpgrade()).toBe(false);
      expect(t.canFork()).toBe(true);
      expect(t.fireRateAt(3, 'a')).toBeGreaterThan(t.fireRateAt(3, 'b'));
      expect(t.damageAt(3, 'b')).toBeGreaterThan(t.damageAt(3, 'a'));
    }
  });

  it('makes Ice heavier freeze harder and Void heavier splash bigger', () => {
    const ice = new Tower('ice', 2, 2, 100, 100);
    ice.level = 3;
    expect(ice.slowAt('b')).toBeGreaterThan(ice.slowAt('a'));
    expect(ice.slowDurationAt('b')).toBeGreaterThan(ice.slowDurationAt('a'));
    const v = new Tower('void', 2, 2, 100, 100);
    v.level = 3;
    expect(v.splashAt('b')).toBeGreaterThan(v.splashAt('a'));
    expect(v.splashAt('b')).toBeGreaterThan(TOWERS.void.splash);
  });

  it('adds Lightning hops on heavier and does not invent a Void vortex flag', () => {
    const bolt = new Tower('lightning', 2, 2, 100, 100);
    bolt.level = 3;
    expect(bolt.chainAt('a')).toBe(3);
    expect(bolt.chainAt('b')).toBe(5);
    expect(bolt.pierceArmor).toBe(false);
    bolt.fork = 'b';
    expect(bolt.pierceArmor).toBe(true);
    const v = new Tower('void', 2, 2, 100, 100);
    v.fork = 'b';
    expect(v.def.chain).toBe(0);
    expect(v.chainAt()).toBe(0);
  });

  it('lets halls fork from inspect without a number ladder', () => {
    const muster = new Tower('muster', 2, 2, 100, 100);
    expect(muster.canNumberUpgrade()).toBe(false);
    expect(muster.canFork()).toBe(true);
    expect(muster.isMaxed()).toBe(false);
    expect(muster.upgradeCost()).toBeGreaterThan(TOWERS.muster.cost);
    const fast = troopStatsAt('muster', 'a');
    const heavy = troopStatsAt('muster', 'b');
    expect(fast.hp).toBeLessThan(TROOP_STATS.warrior.hp);
    expect(heavy.hp).toBeGreaterThan(TROOP_STATS.warrior.hp);
    expect(fast.trainTime).toBeLessThan(TROOP_STATS.warrior.trainTime);
    expect(heavy.trainTime).toBeGreaterThan(TROOP_STATS.warrior.trainTime);
    expect(troopStatsAt('muster', null).hp).toBe(TROOP_STATS.warrior.hp);
    expect(troopStatsAt('chapter', null).hp).toBe(TROOP_STATS.knight.hp);
  });

  it('Forest 1 Game: Arrow damages, path blocked, Muster fork restats troops', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    const game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.difficulty = 'normal';
    game.startLevel(1);
    game.stopLoop();

    const hallClick = firstHallClick(game.grid, game.occupied, true, game.level.pathTiles);
    expect(hallClick).not.toBeNull();
    let arrow: { c: number; r: number } | null = null;
    for (let r = 0; r < game.grid.length && !arrow; r++) {
      for (let c = 0; c < game.grid[0].length; c++) {
        if (!game.canBuildAt(c, r)) continue;
        if (Math.abs(c - hallClick!.c) <= 1 && r === hallClick!.r) continue;
        arrow = { c, r };
        break;
      }
    }
    expect(arrow).not.toBeNull();
    const path = firstPath(game.grid);
    expect(path).not.toBeNull();

    game.selectedKind = 'arrow';
    expect(game.tryPlace(path!.c, path!.r)).toBe(false);
    expect(game.tryPlace(arrow!.c, arrow!.r)).toBe(true);
    game.selectedKind = 'muster';
    expect(game.tryPlace(hallClick!.c, hallClick!.r)).toBe(true);
    const hall = game.towers.find((t) => t.kind === 'muster')!;
    game.selectedTowerId = hall.id;
    expect(game.setRallyPoint(hall.rallyCol, hall.rallyRow)).toBe(true);

    game.startWave();
    const tick = game as unknown as { update(dt: number): void };
    for (let i = 0; i < 280; i++) tick.update(1 / 20);
    const raiders = game.enemies.filter((e) => e.kind === 'grunt');
    expect(raiders.length).toBeGreaterThan(0);
    expect(raiders.some((e) => e.hp < e.maxHp || e.meleeHold)).toBe(true);
    expect(game.troops.length).toBeGreaterThan(0);
    expect(game.troops[0].maxHp).toBe(TROOP_STATS.warrior.hp);

    game.gold = Math.max(game.gold, hall.upgradeCost());
    const beforeGold = game.gold;
    expect(game.chooseFork('b')).toBe(true);
    expect(game.gold).toBeLessThan(beforeGold);
    expect(hall.fork).toBe('b');
    expect(game.troops[0].maxHp).toBe(troopStatsAt('muster', 'b').hp);
    game.stopLoop();
  });

  it('spawns heavier Muster warriors with more HP', () => {
    const sim = new CombatSandbox();
    const grass = grassBesidePath(sim.grid);
    expect(grass).not.toBeNull();
    if (!grass) return;
    const hall = sim.place('muster', grass.c, grass.r);
    hall.fork = 'b';
    sim.run(4);
    expect(sim.troops.length).toBeGreaterThan(0);
    expect(sim.troops[0].maxHp).toBe(troopStatsAt('muster', 'b').hp);
  });
});
