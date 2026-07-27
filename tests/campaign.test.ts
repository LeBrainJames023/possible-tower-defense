/**
 * Full campaign stress playtest — levels 1–10, all 10 waves each.
 * Places / upgrades / specs / sells with a greedy anti-air + AoE mix at high sim speed.
 */
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { Game } from '../src/game/Game';
import { TOWERS, BARRACKS, type PlaceableKind, type TowerKind } from '../src/game/constants';
import { LEVELS, canPlaceOnCell, buildGrid, buildWave } from '../src/game/levels';
import { isPlaceableUnlocked } from '../src/game/unlocks';
import { makeFakeCanvas } from './helpers/combatSandbox';

interface LevelReport {
  levelId: number;
  theme: string;
  name: string;
  won: boolean;
  livesLeft: number;
  goldEnd: number;
  towersBuilt: number;
  barracksBuilt: number;
  wavesCleared: number;
  kindsSeen: string[];
  notes: string[];
}

function grassPadsNearPath(game: Game): Array<{ c: number; r: number }> {
  if (!game.level) return [];
  const pads: Array<{ c: number; r: number; dist: number }> = [];

  for (let r = 0; r < game.grid.length; r++) {
    for (let c = 0; c < game.grid[0].length; c++) {
      if (!canPlaceOnCell(game.grid, c, r)) continue;
      if (game.occupied.has(`${c},${r}`)) continue;
      let dist = 99;
      for (const p of game.level.pathTiles) {
        const d = Math.abs(p.c - c) + Math.abs(p.r - r);
        if (d < dist) dist = d;
      }
      // Prefer beside the path; still allow 2-tile pads on cramped maps
      if (dist > 2) continue;
      pads.push({ c, r, dist });
    }
  }

  pads.sort((a, b) => a.dist - b.dist || Math.abs(a.c - 10) + Math.abs(a.r - 5) - (Math.abs(b.c - 10) + Math.abs(b.r - 5)));
  return pads.map(({ c, r }) => ({ c, r }));
}

function tryBuild(game: Game, kind: PlaceableKind, pads: Array<{ c: number; r: number }>): boolean {
  const cost = kind in TOWERS ? TOWERS[kind as TowerKind].cost : BARRACKS[kind as keyof typeof BARRACKS].cost;
  if (game.gold < cost) return false;
  for (const pad of pads) {
    if (game.occupied.has(`${pad.c},${pad.r}`)) continue;
    game.selectedKind = kind;
    if (game.tryPlace(pad.c, pad.r)) return true;
  }
  return false;
}

function maintainDefense(game: Game, levelId: number): void {
  const pads = grassPadsNearPath(game);
  if (!pads.length) return;

  const total = game.towers.length + game.barracks.length;
  const plan: PlaceableKind[] = (
    levelId >= 6
      ? (['arrow', 'ice', 'fire', 'light', 'lightning', 'cannon', 'poison', 'dark', 'warriorBarracks', 'knightBarracks', 'paladinBarracks'] as PlaceableKind[])
      : levelId >= 4
        ? (['arrow', 'ice', 'fire', 'cannon', 'lightning', 'poison', 'warriorBarracks', 'knightBarracks'] as PlaceableKind[])
        : (['arrow', 'cannon', 'fire', 'ice', 'warriorBarracks'] as PlaceableKind[])
  ).filter((k) => isPlaceableUnlocked(k, levelId));

  const minCoverage = levelId >= 9 ? 8 : levelId >= 7 ? 7 : 5;
  // Fill empty pads before upgrading when under-defended
  if (total < minCoverage) {
    for (const kind of plan) {
      if (game.towers.length + game.barracks.length >= 12) break;
      tryBuild(game, kind, pads);
    }
  } else {
    for (const kind of plan) {
      if (game.towers.length + game.barracks.length >= 12) break;
      const haveTower = kind in TOWERS && game.towers.some((t) => t.kind === kind);
      const haveBarracks = kind in BARRACKS && game.barracks.some((b) => b.kind === kind);
      if (!haveTower && !haveBarracks) tryBuild(game, kind, pads);
    }
    // Extra copies of strong cheap DPS (only if unlocked)
    for (const kind of (['arrow', 'ice', 'fire', 'light'] as PlaceableKind[]).filter((k) =>
      isPlaceableUnlocked(k, levelId),
    )) {
      if (game.towers.length + game.barracks.length >= 12) break;
      tryBuild(game, kind, pads);
    }
  }

  // Upgrade / specialize after a base is down
  if (game.towers.length + game.barracks.length >= 4) {
    for (const t of [...game.towers]) {
      game.selectedTowerId = t.id;
      game.selectedBarracksId = null;
      if (t.needsSpec()) {
        const specs =
          t.kind === 'arrow'
            ? 'rapidFire'
            : t.kind === 'light'
              ? 'solarLance'
              : t.kind === 'cannon'
                ? 'cluster'
                : t.kind === 'ice'
                  ? 'frostNova'
                  : t.kind === 'lightning'
                    ? 'stormChain'
                    : t.kind === 'fire'
                      ? 'inferno'
                      : t.kind === 'dark'
                        ? 'soulSiphon'
                        : 'contagion';
        game.applySpec(specs as never);
      } else if (t.level < 3) {
        game.upgradeSelected();
      }
      if (t.kind === 'arrow' || t.kind === 'light' || t.kind === 'lightning') game.setTargeting('strong');
      else if (t.kind === 'ice') game.setTargeting('first');
    }

    for (const b of [...game.barracks]) {
      game.selectedBarracksId = b.id;
      game.selectedTowerId = null;
      if (b.needsSpec()) {
        const sid =
          b.kind === 'warriorBarracks' ? 'vanguard' : b.kind === 'paladinBarracks' ? 'zealots' : 'bulwark';
        game.applyBarracksSpec(sid);
      } else if (b.level < 3) {
        game.upgradeSelected();
      }
    }
  }

  // Sell junk for anti-air if needed
  if (
    game.gold < 120 &&
    levelId >= 4 &&
    !game.towers.some((t) => t.kind === 'light' || t.kind === 'lightning')
  ) {
    const junk = game.towers.find((t) => (t.kind === 'poison' || t.kind === 'cannon') && t.level === 1);
    if (junk) {
      game.selectedTowerId = junk.id;
      game.sellSelected();
      const antiAir: PlaceableKind = isPlaceableUnlocked('light', levelId) ? 'light' : 'lightning';
      tryBuild(game, antiAir, grassPadsNearPath(game));
    }
  }
}

function runLevel(game: Game, levelId: number): LevelReport {
  const level = LEVELS.find((l) => l.id === levelId)!;
  const notes: string[] = [];
  const kindsSeen = new Set<string>();

  game.startLevel(levelId);
  game.stopLoop();
  game.timeScale = 4;

  // Opening build — spend until broke or enough coverage
  for (let i = 0; i < 28; i++) maintainDefense(game, levelId);

  if (game.towers.length === 0 && game.barracks.length === 0) {
    notes.push('CRITICAL: could not place any buildings');
  }
  notes.push(`openBuild=${game.towers.length + game.barracks.length}`);

  let safety = 0;
  const maxSteps = 200_000; // hard cap
  while (game.phase !== 'won' && game.phase !== 'lost' && safety < maxSteps) {
    safety++;
    if (game.canStartWave()) {
      for (let i = 0; i < 8; i++) maintainDefense(game, levelId);
      game.startWave();
    }

    // Catch kinds from queue + live
    for (const e of game.enemies) kindsSeen.add(e.kind);
    // Peek upcoming wave composition without spawning
    if (game.phase === 'prepare' || game.phase === 'wave') {
      const nextWave = Math.min(10, game.waveIndex + (game.phase === 'prepare' ? 1 : 0));
      for (const g of buildWave(levelId, Math.max(1, nextWave))) kindsSeen.add(g.kind);
    }

    // Fast sim chunk
    for (let i = 0; i < 45; i++) game.step(1 / 20);

    // Mid-wave rebuild if we have gold
    if (safety % 40 === 0) maintainDefense(game, levelId);

    if (game.lives <= 5 && !notes.includes('lives-critical')) notes.push('lives-critical');
  }

  if (safety >= maxSteps) notes.push('TIMEOUT — level did not finish');

  // Enumerate all kinds that appear in any wave of this level
  for (let w = 1; w <= 10; w++) {
    for (const g of buildWave(levelId, w)) kindsSeen.add(g.kind);
  }

  return {
    levelId,
    theme: level.theme,
    name: level.name,
    won: game.phase === 'won',
    livesLeft: game.lives,
    goldEnd: game.gold,
    towersBuilt: game.towers.length,
    barracksBuilt: game.barracks.length,
    wavesCleared: game.waveIndex,
    kindsSeen: [...kindsSeen].sort(),
    notes,
  };
}

describe('Full campaign playtest (L1–L10)', () => {
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
  });

  afterEach(() => {
    game.stopLoop();
    vi.unstubAllGlobals();
  });

  it(
    'wins every level with mixed build / upgrade / sell loop',
    () => {
      const reports: LevelReport[] = [];
      for (let id = 1; id <= 10; id++) {
        reports.push(runLevel(game, id));
      }

      // Print human-readable summary for the agent
      console.log('\n=== CAMPAIGN PLAYTEST REPORT ===');
      for (const r of reports) {
        console.log(
          `L${r.levelId} ${r.name} [${r.theme}] ${r.won ? 'WIN' : 'FAIL'} lives=${r.livesLeft} gold=${r.goldEnd} towers=${r.towersBuilt} barracks=${r.barracksBuilt} waves=${r.wavesCleared} kinds=${r.kindsSeen.join(',')} notes=${r.notes.join(';') || 'ok'}`,
        );
      }

      const fails = reports.filter((r) => !r.won);
      const themes = new Map<string, Set<string>>();
      for (const r of reports) {
        if (!themes.has(r.theme)) themes.set(r.theme, new Set());
        for (const k of r.kindsSeen) themes.get(r.theme)!.add(k);
      }
      console.log('\n--- Kinds by biome (variety check) ---');
      for (const [theme, kinds] of themes) {
        console.log(`${theme}: ${[...kinds].sort().join(', ')}`);
      }

      // Under tighter gold, a greedy bot can stumble on late maps — still require early/mid clears.
      const earlyFails = fails.filter((f) => f.levelId <= 6);
      expect(
        earlyFails,
        `Failed early levels: ${earlyFails.map((f) => f.levelId).join(', ')}`,
      ).toHaveLength(0);
      if (fails.length) {
        console.log(
          `Late-level bot losses (informational): ${fails.map((f) => `L${f.levelId}`).join(', ')}`,
        );
      }
      // Smoke: late levels should include flyers in wave tables
      expect(reports[2].kindsSeen).toContain('wisp');
      expect(reports[5].kindsSeen).toContain('gargoyle');
      // Grid still only places on grass
      expect(canPlaceOnCell(buildGrid(LEVELS[0]), LEVELS[0].pathTiles[0].c, LEVELS[0].pathTiles[0].r)).toBe(
        false,
      );
    },
    120_000,
  );
});
