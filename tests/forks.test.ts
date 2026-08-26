import { describe, expect, it } from 'vitest';
import { TOWER_ORDER, TOWERS } from '../src/game/constants';
import { Tower } from '../src/game/entities';
import { forksFor } from '../src/game/forks';
import { firstHallClick } from '../src/game/footprint';
import { Game } from '../src/game/Game';
import { TROOP_STATS, troopStatsAt } from '../src/game/troops';
import { LEVELS } from '../src/game/levels';
import { sellValueFor, upgradeCostFor } from '../src/game/balance';
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
  it('gives every keep two paths', () => {
    for (const kind of TOWER_ORDER) {
      const forks = forksFor(kind);
      expect(forks).not.toBeNull();
      expect(forks!.a.name.length).toBeGreaterThan(0);
      expect(forks!.b.name.length).toBeGreaterThan(0);
    }
  });

  it('names Element paths Flamethrower / Hail / Arc / Venom / Flicker vs the slow-heavy pair', () => {
    expect(forksFor('fire')!.a.name).toBe('Flamethrower');
    expect(forksFor('fire')!.b.name).toBe('Furnace');
    expect(forksFor('ice')!.a.name).toBe('Hail');
    expect(forksFor('ice')!.b.name).toBe('Blizzard');
    expect(forksFor('lightning')!.a.name).toBe('Arc');
    expect(forksFor('lightning')!.b.name).toBe('Thunder');
    expect(forksFor('poison')!.a.name).toBe('Venom');
    expect(forksFor('poison')!.b.name).toBe('Miasma');
    expect(forksFor('void')!.a.name).toBe('Flicker');
    expect(forksFor('void')!.b.name).toBe('Abyss');
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

describe('element path ladder', () => {
  it('keeps Arrow fork-and-done while Fire gets Flamethrower 1→2→3', () => {
    const arrow = new Tower('arrow', 2, 2, 100, 100);
    arrow.level = 3;
    arrow.fork = 'a';
    expect(arrow.displayName()).toBe('Arrow Faster');
    expect(arrow.canNumberUpgrade()).toBe(false);
    expect(arrow.canFork()).toBe(false);
    expect(arrow.isMaxed()).toBe(true);

    const fire = new Tower('fire', 2, 2, 100, 100);
    fire.level = 3;
    expect(fire.displayName()).toBe('Fire Lv 3');
    expect(fire.canFork()).toBe(true);
    expect(fire.canNumberUpgrade()).toBe(false);

    const atFork = fire.damageAt(3, 'a');
    fire.fork = 'a';
    fire.pathLevel = 1;
    expect(fire.displayName()).toBe('Flamethrower 1');
    expect(fire.canFork()).toBe(false);
    expect(fire.canNumberUpgrade()).toBe(true);
    expect(fire.isMaxed()).toBe(false);
    expect(fire.damageAt(3, 'a', 1)).toBeCloseTo(atFork);
    expect(fire.upgradeCost()).toBe(upgradeCostFor(TOWERS.fire.cost, 1));

    fire.pathLevel = 2;
    expect(fire.displayName()).toBe('Flamethrower 2');
    expect(fire.damageAt(3, 'a', 2)).toBeCloseTo(atFork * TOWERS.fire.upgradeMul);
    expect(fire.upgradeCost()).toBe(upgradeCostFor(TOWERS.fire.cost, 2));
    expect(fire.sellValue()).toBe(sellValueFor(TOWERS.fire.cost, 3, true, 2));
    expect(fire.sellValue()).toBeGreaterThan(sellValueFor(TOWERS.fire.cost, 3, true, 1));

    fire.pathLevel = 3;
    expect(fire.displayName()).toBe('Flamethrower 3');
    expect(fire.canNumberUpgrade()).toBe(false);
    expect(fire.isMaxed()).toBe(true);
    expect(fire.upgradeCost()).toBe(0);
  });

  it('Forest 1 Game: Fire 1→2→3, pay Flamethrower, other path gone, two more ranks', () => {
    globalThis.requestAnimationFrame = () => 0;
    globalThis.cancelAnimationFrame = () => {};
    const game = new Game(makeFakeCanvas());
    game.audio.muted = true;
    game.startLevel(1);
    game.stopLoop();

    let grass: { c: number; r: number } | null = null;
    const road = game.level.pathTiles;
    const from = Math.floor(road.length * 0.38);
    for (let i = from; i < road.length && !grass; i++) {
      const cell = road[i];
      for (const [dc, dr] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nc = cell.c + dc;
        const nr = cell.r + dr;
        if (game.canBuildAt(nc, nr)) {
          grass = { c: nc, r: nr };
          break;
        }
      }
    }
    expect(grass).not.toBeNull();
    game.gold = 2000;
    game.selectedKind = 'fire';
    expect(game.tryPlace(grass!.c, grass!.r)).toBe(true);
    const fire = game.towers[0];
    game.selectedTowerId = fire.id;
    expect(game.upgradeSelected()).toBe(true);
    expect(game.upgradeSelected()).toBe(true);
    expect(fire.level).toBe(3);
    expect(fire.canFork()).toBe(true);
    expect(game.chooseFork('a')).toBe(true);
    expect(fire.fork).toBe('a');
    expect(fire.pathLevel).toBe(1);
    expect(fire.displayName()).toBe('Flamethrower 1');
    expect(fire.canFork()).toBe(false);
    expect(game.chooseFork('b')).toBe(false);
    expect(fire.fork).toBe('a');
    expect(game.upgradeSelected()).toBe(true);
    expect(fire.pathLevel).toBe(2);
    expect(fire.displayName()).toBe('Flamethrower 2');
    expect(game.upgradeSelected()).toBe(true);
    expect(fire.pathLevel).toBe(3);
    expect(fire.displayName()).toBe('Flamethrower 3');
    expect(fire.isMaxed()).toBe(true);
    expect(game.upgradeSelected()).toBe(false);
    game.stopLoop();
  });
});
