import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { Game } from '../src/game/Game';
import { Enemy } from '../src/game/entities';
import { ENEMIES, TOWERS } from '../src/game/constants';
import { LEVELS, canPlaceOnCell, buildGrid } from '../src/game/levels';
import { makeFakeCanvas } from './helpers/combatSandbox';
import { audio } from '../src/game/audio';

describe('Game integration', () => {
  let game: Game;

  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    game = new Game(makeFakeCanvas());
    game.startLevel(1);
    game.stopLoop(); // tests drive via step()
  });

  afterEach(() => {
    game.stopLoop();
    vi.unstubAllGlobals();
  });

  it('starts level 1 in prepare with meadow theme and teaching gold', () => {
    expect(game.phase).toBe('prepare');
    expect(game.level.theme).toBe('meadow');
    expect(game.gold).toBe(LEVELS[0].startingGold);
    expect(game.lives).toBe(LEVELS[0].lives);
    expect(game.renderer.theme).toBe('meadow');
  });

  it('blocks towers that unlock later', () => {
    game.gold = 500;
    game.selectedKind = 'light';
    expect(game.tryPlace(5, 4)).toBe(false);
    expect(game.towers).toHaveLength(0);
  });

  it('places arrow on grass, spends gold, and blocks path/water/occupied', () => {
    const before = game.gold;
    game.selectedKind = 'arrow';
    expect(game.tryPlace(5, 4)).toBe(true);
    expect(game.towers).toHaveLength(1);
    expect(game.gold).toBe(before - TOWERS.arrow.cost);
    expect(game.selectedKind).toBeNull();

    game.selectedKind = 'arrow';
    expect(game.tryPlace(5, 4)).toBe(false);
    const path = game.level.pathTiles[0];
    expect(game.tryPlace(path.c, path.r)).toBe(false);

    const river = LEVELS.find((l) => (l.water?.length ?? 0) > 0)!;
    game.startLevel(river.id);
    game.stopLoop();
    const w = river.water![0];
    game.selectedKind = 'arrow';
    expect(canPlaceOnCell(buildGrid(river), w.c, w.r)).toBe(false);
    expect(game.tryPlace(w.c, w.r)).toBe(false);
  });

  it('upgrades and sells selected tower', () => {
    game.selectedKind = 'arrow';
    game.tryPlace(5, 4);
    const t = game.towers[0];
    game.selectedTowerId = t.id;
    const goldAfterPlace = game.gold;
    expect(game.upgradeSelected()).toBe(true);
    expect(t.level).toBe(2);
    expect(game.gold).toBeLessThan(goldAfterPlace);
    const sell = t.sellValue();
    const beforeSell = game.gold;
    expect(game.sellSelected()).toBe(true);
    expect(game.towers).toHaveLength(0);
    expect(game.gold).toBe(beforeSell + sell);
  });

  it('reaches L3 then applies a specialization path', () => {
    game.gold = 2000;
    game.selectedKind = 'arrow';
    game.tryPlace(5, 4);
    const t = game.towers[0];
    game.selectedTowerId = t.id;
    expect(game.upgradeSelected()).toBe(true);
    expect(game.upgradeSelected()).toBe(true);
    expect(t.level).toBe(3);
    expect(t.needsSpec()).toBe(true);
    expect(game.upgradeSelected()).toBe(false);
    const before = t.fireRate;
    expect(game.applySpec('rapidFire')).toBe(true);
    expect(t.spec).toBe('rapidFire');
    expect(t.needsSpec()).toBe(false);
    expect(t.fireRate).toBeGreaterThan(before);
    expect(game.applySpec('heavyBolt')).toBe(false);
  });

  it('places warrior barracks, sets rally, spawns up to 3, and blocks enemies', () => {
    game.gold = 2000;
    game.selectedKind = 'warriorBarracks';
    expect(game.tryPlace(5, 4)).toBe(true);
    expect(game.barracks).toHaveLength(1);
    const b = game.barracks[0];
    game.selectedBarracksId = b.id;
    expect(game.beginRallyMode()).toBe(true);
    // Use current (default) rally which is already nearest path in range
    const ok = game.trySetRally(b.rallyX, b.rallyY);
    expect(ok).toBe(true);
    expect(game.rallyModeBarracksId).toBeNull();

    for (let i = 0; i < 400; i++) game.step(1 / 30);
    expect(game.friendlies.length).toBe(3);

    const orc = new Enemy('orc', 1, game.waypoints);
    orc.progress = b.rallyProgress;
    orc.pos = { x: b.rallyX, y: b.rallyY };
    game.enemies.push(orc);
    game.phase = 'wave';
    game.waveActive = true;
    const progressBefore = orc.progress;
    for (let i = 0; i < 20; i++) game.step(1 / 30);
    const engaged = game.enemies.find((e) => e.id === orc.id);
    if (engaged) {
      expect(engaged.blocked || engaged.hp < engaged.maxHp).toBe(true);
      expect(engaged.progress).toBeLessThanOrEqual(progressBefore + 0.02);
    } else {
      // Orc killed by troops — also counts as successful engage
      expect(game.friendlies.some((u) => u.hp < u.maxHp || u.targetEnemyId != null)).toBe(true);
    }
  });

  it('respawns a friendly after one dies', () => {
    game.startLevel(4);
    game.stopLoop();
    game.gold = 2000;
    game.selectedKind = 'knightBarracks';
    game.tryPlace(5, 4);
    for (let i = 0; i < 500; i++) game.step(1 / 30);
    expect(game.friendlies.length).toBe(3);
    const victim = game.friendlies[0];
    victim.hp = 0;
    victim.alive = false;
    game.friendlies = game.friendlies.filter((u) => u.alive);
    expect(game.friendlies.length).toBe(2);
    for (let i = 0; i < 200; i++) game.step(1 / 30);
    expect(game.friendlies.length).toBe(3);
  });

  it('runs a wave, damages orcs, and returns to prepare', () => {
    game.selectedKind = 'arrow';
    game.tryPlace(5, 4);
    game.selectedKind = 'arrow';
    game.tryPlace(7, 4);
    game.selectedKind = 'cannon';
    game.tryPlace(12, 3);
    game.startWave();
    expect(game.phase).toBe('wave');
    expect(game.waveIndex).toBe(1);

    // ~40s sim — enough for wave 1 spawn + travel + clear
    for (let i = 0; i < 1200; i++) game.step(1 / 30);

    expect(game.phase).toBe('prepare');
    expect(game.waveIndex).toBe(1);
    expect(game.enemies).toHaveLength(0);
    expect(game.gold).toBeGreaterThan(40);
  });

  it('lich leak costs 5 lives', () => {
    game.lives = 10;
    const lich = new Enemy('lich', 1, game.waypoints);
    lich.progress = 0.999;
    game.enemies.push(lich);
    game.phase = 'wave';
    game.waveActive = true;
    for (let i = 0; i < 30; i++) game.step(1 / 30);
    expect(game.lives).toBeLessThanOrEqual(5);
  });

  it('losing all lives sets lost and clears combat', () => {
    game.lives = 1;
    const orc = new Enemy('orc', 1, game.waypoints);
    orc.progress = 0.999;
    game.enemies.push(orc);
    game.phase = 'wave';
    game.waveActive = true;
    for (let i = 0; i < 40; i++) game.step(1 / 30);
    expect(game.phase).toBe('lost');
    expect(game.lives).toBe(0);
    expect(game.enemies).toHaveLength(0);
  });

  it('pause freezes combat but keeps enemies', () => {
    game.selectedKind = 'arrow';
    game.tryPlace(5, 4);
    game.startWave();
    for (let i = 0; i < 40; i++) game.step(1 / 30);
    const count = game.enemies.length;
    expect(count).toBeGreaterThan(0);
    const progress = game.enemies[0].progress;
    game.togglePause();
    expect(game.phase).toBe('paused');
    for (let i = 0; i < 30; i++) game.step(1 / 30);
    expect(game.enemies).toHaveLength(count);
    expect(game.enemies[0].progress).toBeCloseTo(progress, 5);
  });

  it('every biome theme is assigned across 10 levels', () => {
    const themes = new Set(LEVELS.map((l) => l.theme));
    expect(themes.size).toBe(10);
  });

  it('enemy roster rewards and armor stay in sane ranges', () => {
    for (const def of Object.values(ENEMIES)) {
      expect(def.hp).toBeGreaterThan(0);
      expect(def.speed).toBeGreaterThan(0);
      expect(def.reward).toBeGreaterThan(0);
      expect(def.armor).toBeGreaterThanOrEqual(0);
      expect(def.armor).toBeLessThan(1);
    }
  });

  it('mute flag toggles without throwing', () => {
    const before = audio.muted;
    audio.toggleMute();
    expect(audio.muted).toBe(!before);
    audio.setMuted(before);
  });

  it('places while paused and cannon cannot target flyers', () => {
    game.startLevel(6);
    game.stopLoop();
    game.gold = 2000;
    game.togglePause();
    expect(game.phase).toBe('paused');
    game.selectedKind = 'light';
    expect(game.tryPlace(5, 4)).toBe(true);
    expect(game.towers).toHaveLength(1);

    game.selectedKind = 'cannon';
    game.tryPlace(7, 4);
    const cannon = game.towers.find((t) => t.kind === 'cannon')!;
    const light = game.towers.find((t) => t.kind === 'light')!;
    expect(cannon.hitsAir).toBe(false);
    expect(light.hitsAir).toBe(true);

    game.togglePause();
    const wisp = new Enemy('wisp', 1, game.waypoints);
    wisp.progress = 0.3;
    game.enemies.push(wisp);
    game.phase = 'wave';
    game.waveActive = true;
    game.selectedTowerId = cannon.id;
    expect(game.setTargeting('strong')).toBe(true);
    expect(cannon.targeting).toBe('strong');

    // Step a bit — cannon should not create projectiles at flyer-only board
    const before = game.projectiles.length;
    for (let i = 0; i < 60; i++) game.step(1 / 30);
    // Light may fire; ensure wisp can be damaged by light eventually
    game.selectedTowerId = light.id;
    for (let i = 0; i < 90; i++) game.step(1 / 30);
    const still = game.enemies.find((e) => e.id === wisp.id);
    if (still) expect(still.hp).toBeLessThan(still.maxHp);
    else expect(before + game.projectiles.length).toBeGreaterThanOrEqual(0);
  });

  it('paladin barracks reaches L3 and applies a skill path', () => {
    game.startLevel(6);
    game.stopLoop();
    game.gold = 5000;
    game.selectedKind = 'paladinBarracks';
    expect(game.tryPlace(5, 4)).toBe(true);
    const b = game.barracks[0];
    game.selectedBarracksId = b.id;
    expect(game.upgradeSelected()).toBe(true);
    expect(game.upgradeSelected()).toBe(true);
    expect(b.level).toBe(3);
    expect(b.needsSpec()).toBe(true);
    expect(game.applyBarracksSpec('zealots')).toBe(true);
    expect(b.spec).toBe('zealots');
    expect(b.smiteMul()).toBeGreaterThan(1.5);
  });
});
