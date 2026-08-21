/**
 * Headless campaign sim — real Game combat/economy, fake canvas, no save writes.
 * Run: npx vite-node tools/simCampaign.ts
 */
import { writeFileSync } from 'node:fs';
import { COLS, ROWS, TILE, TOWERS, type TowerKind } from '../src/game/constants';
import { buildWave, LEVELS, pathWaypoints } from '../src/game/levels';
import { ENEMIES } from '../src/game/enemies';
import { Game } from '../src/game/Game';
import { makeFakeCanvas } from '../tests/helpers/combatSandbox';
import { DIFFICULTY, scaleGold, waveClearBonus, waveHpMul, waveKillGold, waveTotalIncome, type DifficultyId } from '../src/game/balance';
import { WORLDS } from '../src/game/worlds';
import { dist, lengthAlongPath, pathTotalLength } from '../src/shared/math';

const mem = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, v);
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
  key: () => null,
  get length() {
    return mem.size;
  },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageStub, configurable: true });
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

Game.prototype.step = function step(dt: number) {
  (this as unknown as { update: (d: number) => void }).update(dt);
};

export interface WaveLog {
  wave: number;
  livesBefore: number;
  livesAfter: number;
  leaks: number;
  goldAfter: number;
  towers: number;
  seconds: number;
}

export interface LevelResult {
  id: number;
  world: string;
  worldIndex: number;
  stage: number;
  name: string;
  difficulty: DifficultyId;
  outcome: 'won' | 'lost' | 'stall';
  lostOnWave: number | null;
  livesLeft: number;
  goldLeft: number;
  towers: number;
  kit: Record<string, number>;
  leaksTotal: number;
  minGold: number;
  waves: WaveLog[];
}

function kitOf(game: Game): Record<string, number> {
  const kit: Record<string, number> = {};
  for (const t of game.towers) kit[t.kind] = (kit[t.kind] ?? 0) + 1;
  return kit;
}

function pathSamples(game: Game): Array<{ x: number; y: number; along: number }> {
  const total = pathTotalLength(game.waypoints);
  const n = 96;
  const out: Array<{ x: number; y: number; along: number }> = [];
  for (let i = 0; i <= n; i++) {
    const along = i / n;
    const p = lengthAlongPath(game.waypoints, along);
    out.push({ x: p.x, y: p.y, along });
  }
  void total;
  return out;
}

/** Pick the grass tile whose arrow-range covers the most useful path (not the last stretch). */
function bestSite(game: Game): { c: number; r: number } | null {
  const samples = pathSamples(game);
  const range = TOWERS.arrow.range;
  let best: { c: number; r: number; score: number } | null = null;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!game.canBuildAt(c, r)) continue;
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      const opening = game.towers.length < 4;
      let cover = 0;
      let earliest = 1;
      for (const s of samples) {
        if (s.along > 0.86) continue;
        if (dist({ x, y }, s) > range) continue;
        let weight = 1;
        if (opening) {
          if (s.along < 0.42) weight = 1.6;
          else if (s.along > 0.62) weight = 0.25;
        } else if (s.along < 0.08) weight = 0.5;
        else if (s.along > 0.72) weight = 0.55;
        cover += weight;
        earliest = Math.min(earliest, s.along);
      }
      if (cover < 4) continue;
      let near = 0;
      let stack = 0;
      for (const t of game.towers) {
        const d = dist({ x, y }, { x: t.x, y: t.y });
        if (opening) {
          if (d < TILE * 1.05) stack += 28;
          else if (d < TILE * 1.6) stack += 16;
          else if (d < TILE * 2.4) stack += 4;
        } else {
          if (d < TILE * 1.15) near += 6;
          else if (d < TILE * 2.2) near += 1.5;
        }
      }
      const score = cover * 4 - near + stack + (earliest > 0.08 && earliest < 0.48 ? 8 : 0);
      if (!best || score > best.score) best = { c, r, score };
    }
  }
  return best;
}

/** Rank grass tiles by arrow-range coverage of the useful path. */
function rankedSites(game: Game, limit = 12): Array<{ c: number; r: number }> {
  const samples = pathSamples(game);
  const range = TOWERS.arrow.range;
  const ranked: Array<{ c: number; r: number; score: number }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!game.canBuildAt(c, r)) continue;
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      let cover = 0;
      for (const s of samples) {
        if (s.along > 0.82 || s.along < 0.04) continue;
        if (dist({ x, y }, s) > range) continue;
        cover += s.along < 0.45 ? 1.5 : 1;
      }
      if (cover >= 4) ranked.push({ c, r, score: cover });
    }
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map(({ c, r }) => ({ c, r }));
}

function makeGame(levelId: number, difficulty: DifficultyId): Game {
  mem.clear();
  const canvas = makeFakeCanvas();
  const game = new Game(canvas);
  game.audio.muted = true;
  game.difficulty = difficulty;
  game.startLevel(levelId);
  game.stopLoop();
  return game;
}

function placeArrows(game: Game, cells: Array<{ c: number; r: number }>): number {
  let n = 0;
  for (const cell of cells) {
    if (game.gold < TOWERS.arrow.cost) break;
    game.selectedKind = 'arrow';
    if (game.tryPlace(cell.c, cell.r)) n++;
    game.selectedKind = null;
  }
  return n;
}

/** Wave 1 only, no mid-wave spend — used to score openings. */
function probeWave1(game: Game, dt = 1 / 10, maxSeconds = 90): number {
  const lives = game.lives;
  game.startWave();
  let t = 0;
  while (game.phase === 'wave') {
    game.step(dt);
    t += dt;
    if (t > maxSeconds) break;
  }
  return Math.max(0, lives - game.lives);
}

/** Pack k arrows around the best coverage tile — a choke, not a spread line. */
function clusterSites(game: Game, k: number): Array<{ c: number; r: number }> {
  const sites = rankedSites(game, 24);
  if (!sites.length) return [];
  const anchor = sites[0];
  const rest = sites.slice(1).sort((a, b) => {
    const da = dist({ x: a.c, y: a.r }, { x: anchor.c, y: anchor.r });
    const db = dist({ x: b.c, y: b.r }, { x: anchor.c, y: anchor.r });
    return da - db;
  });
  return [anchor, ...rest].slice(0, k);
}

/** Try 3- or 4-arrow openings on the best coverage tiles. Cluster, greedy, then a short search. */
function searchOpening(
  levelId: number,
  difficulty: DifficultyId,
): Array<{ c: number; r: number }> | null {
  const probe = makeGame(levelId, difficulty);
  const affordable = Math.floor(probe.gold / TOWERS.arrow.cost);
  const k = Math.min(4, affordable);
  const sites = rankedSites(probe, 8);
  if (sites.length < k || k < 3) return null;

  const cluster = clusterSites(probe, Math.min(16, affordable));
  const clusterGame = makeGame(levelId, difficulty);
  placeArrows(clusterGame, cluster);
  const clusterLeaks = cluster.length >= k ? probeWave1(clusterGame) : 99;
  if (clusterLeaks === 0) return cluster;

  const greedy = sites.slice(0, k);
  const greedyGame = makeGame(levelId, difficulty);
  placeArrows(greedyGame, greedy);
  const greedyLeaks = probeWave1(greedyGame);
  if (greedyLeaks === 0) return greedy;

  let best: { leaks: number; cells: Array<{ c: number; r: number }> } =
    clusterLeaks <= greedyLeaks
      ? { leaks: clusterLeaks, cells: cluster }
      : { leaks: greedyLeaks, cells: greedy };
  if (affordable > 4) return best.cells;
  const n = sites.length;
  const visit = (start: number, acc: Array<{ c: number; r: number }>): boolean => {
    if (acc.length === k) {
      const game = makeGame(levelId, difficulty);
      placeArrows(game, acc);
      const leaks = probeWave1(game);
      if (leaks < best.leaks) best = { leaks, cells: acc.slice() };
      return leaks === 0;
    }
    for (let i = start; i < n; i++) {
      acc.push(sites[i]);
      if (visit(i + 1, acc)) return true;
      acc.pop();
    }
    return false;
  };
  visit(0, []);
  return best.cells;
}

function countKind(game: Game, kind: TowerKind): number {
  return game.towers.filter((t) => t.kind === kind).length;
}

function pickKind(game: Game, nextWave: number): TowerKind | null {
  const gold = game.gold;
  const arrows = countKind(game, 'arrow');
  const ice = countKind(game, 'ice');
  const lightning = countKind(game, 'lightning');
  const cannon = countKind(game, 'cannon');
  const poison = countKind(game, 'poison');
  const fire = countKind(game, 'fire');
  const n = game.towers.length;
  const flyersSoon = nextWave === 4 || nextWave === 6 || nextWave === 8 || nextWave === 10;
  const armorSoon = nextWave === 5 || nextWave >= 7;

  if (arrows < 4 && gold >= TOWERS.arrow.cost) return 'arrow';
  if (flyersSoon && lightning < 1 && gold >= TOWERS.lightning.cost) return 'lightning';
  if (nextWave >= 3 && ice < 1 && arrows >= 3 && gold >= TOWERS.ice.cost) return 'ice';
  if (armorSoon && cannon < 1 && gold >= TOWERS.cannon.cost) return 'cannon';
  if (nextWave >= 4 && lightning < Math.min(2, 1 + Math.floor(n / 6)) && gold >= TOWERS.lightning.cost) {
    return 'lightning';
  }
  if (armorSoon && poison < 1 && gold >= TOWERS.poison.cost) return 'poison';
  if (nextWave >= 6 && fire < 1 && gold >= TOWERS.fire.cost) return 'fire';
  if (arrows < 3 && gold >= TOWERS.arrow.cost) return 'arrow';
  if (ice < 2 && nextWave >= 6 && gold >= TOWERS.ice.cost) return 'ice';
  if (cannon < 2 && nextWave >= 7 && gold >= TOWERS.cannon.cost) return 'cannon';
  if (gold >= TOWERS.arrow.cost && n < 14) return 'arrow';
  return null;
}

function maybeUpgrade(game: Game): boolean {
  const order: TowerKind[] = ['lightning', 'cannon', 'ice', 'arrow', 'poison', 'fire'];
  const ranked = [...game.towers].sort((a, b) => {
    const ia = order.indexOf(a.kind);
    const ib = order.indexOf(b.kind);
    if (a.level !== b.level) return a.level - b.level;
    return ia - ib;
  });
  for (const t of ranked) {
    if (t.level >= 3) continue;
    const cost = t.upgradeCost();
    if (game.gold < cost) continue;
    if (game.towers.length < 3 && cost > TOWERS.arrow.cost) continue;
    game.selectedTowerId = t.id;
    if (game.upgradeSelected()) return true;
  }
  return false;
}

function spend(game: Game, nextWave: number): void {
  for (let i = 0; i < 20; i++) {
    const kind = pickKind(game, nextWave);
    const site = kind ? bestSite(game) : null;
    let placed = false;
    if (kind && site && game.gold >= TOWERS[kind].cost) {
      game.selectedKind = kind;
      placed = game.tryPlace(site.c, site.r);
      game.selectedKind = null;
    }
    const upgraded = maybeUpgrade(game);
    if (!placed && !upgraded) break;
  }
}

function runWave(game: Game, dt = 1 / 20, maxSeconds = 240): { seconds: number; stall: boolean } {
  const start = game.waveIndex;
  game.startWave();
  let t = 0;
  let spendAt = 1.5;
  while (game.phase === 'wave') {
    game.step(dt);
    t += dt;
    if (t >= spendAt) {
      spend(game, game.waveIndex + 1);
      spendAt += 4;
    }
    if (t > maxSeconds) return { seconds: t, stall: true };
  }
  if (game.waveIndex === start && game.phase !== 'lost' && game.phase !== 'won') {
    return { seconds: t, stall: true };
  }
  return { seconds: t, stall: false };
}

export function simLevel(levelId: number, difficulty: DifficultyId): LevelResult {
  const level = LEVELS.find((l) => l.id === levelId);
  const opening = difficulty === 'hard' ? searchOpening(levelId, difficulty) : null;
  const game = makeGame(levelId, difficulty);

  const waves: WaveLog[] = [];
  let minGold = game.gold;
  let leaksTotal = 0;
  if (opening) placeArrows(game, opening);
  spend(game, 1);

  for (let w = 1; w <= 10; w++) {
    if (game.phase === 'lost' || game.phase === 'won') break;
    const livesBefore = game.lives;
    const goldBefore = game.gold;
    spend(game, w);
    const { seconds, stall } = runWave(game);
    const leaks = Math.max(0, livesBefore - game.lives);
    leaksTotal += leaks;
    minGold = Math.min(minGold, game.gold, goldBefore);
    waves.push({
      wave: w,
      livesBefore,
      livesAfter: game.lives,
      leaks,
      goldAfter: game.gold,
      towers: game.towers.length,
      seconds: Math.round(seconds * 10) / 10,
    });
    if (stall) {
      return finish(game, difficulty, 'stall', w, waves, leaksTotal, minGold);
    }
    if (game.phase === 'lost') {
      return finish(game, difficulty, 'lost', w, waves, leaksTotal, minGold);
    }
  }
  const outcome = game.phase === 'won' ? 'won' : game.phase === 'lost' ? 'lost' : 'stall';
  return finish(game, difficulty, outcome, outcome === 'lost' ? game.waveIndex : null, waves, leaksTotal, minGold);
}

function finish(
  game: Game,
  difficulty: DifficultyId,
  outcome: LevelResult['outcome'],
  lostOnWave: number | null,
  waves: WaveLog[],
  leaksTotal: number,
  minGold: number,
): LevelResult {
  return {
    id: game.level.id,
    world: game.level.world,
    worldIndex: game.level.worldIndex,
    stage: game.level.stage,
    name: game.level.name,
    difficulty,
    outcome,
    lostOnWave,
    livesLeft: game.lives,
    goldLeft: game.gold,
    towers: game.towers.length,
    kit: kitOf(game),
    leaksTotal,
    minGold,
    waves,
  };
}

function summarize(results: LevelResult[]) {
  const byWorld = WORLDS.map((world) => {
    const rows = results.filter((r) => r.world === world.id);
    const won = rows.filter((r) => r.outcome === 'won').length;
    const lost = rows.filter((r) => r.outcome === 'lost').length;
    const stall = rows.filter((r) => r.outcome === 'stall').length;
    const leakAvg =
      rows.reduce((s, r) => s + r.leaksTotal, 0) / Math.max(1, rows.length);
    const livesAvgWon =
      rows.filter((r) => r.outcome === 'won').reduce((s, r) => s + r.livesLeft, 0) /
      Math.max(1, won);
    const firstLoss = rows.find((r) => r.outcome !== 'won');
    const tightGold = Math.min(...rows.map((r) => r.minGold));
    return {
      world: world.name,
      id: world.id,
      hpMul: world.hpMul,
      played: rows.length,
      won,
      lost,
      stall,
      leakAvg: Math.round(leakAvg * 10) / 10,
      livesAvgWon: won ? Math.round(livesAvgWon * 10) / 10 : 0,
      firstFail: firstLoss ? `${world.name} ${firstLoss.stage} wave ${firstLoss.lostOnWave}` : null,
      tightGold,
    };
  });
  return byWorld;
}

function waveHpPool(stage: number, wave: number, worldIndex: number, hpScale: number): number {
  return buildWave(stage, wave, worldIndex).reduce(
    (sum, g) => sum + ENEMIES[g.kind].hp * g.count * hpScale * waveHpMul(wave),
    0,
  );
}

function budgetLine(level: (typeof LEVELS)[number], diff: DifficultyId = 'normal') {
  const mods = DIFFICULTY[diff];
  const pathLen = pathTotalLength(pathWaypoints(level));
  let killGold = 0;
  let clearGold = 0;
  let hp = 0;
  for (let w = 1; w <= 10; w++) {
    killGold += scaleGold(waveKillGold(level.stage, w, level.worldIndex), mods.gold);
    clearGold += scaleGold(waveClearBonus(w), mods.gold);
    hp += waveHpPool(level.stage, w, level.worldIndex, level.hpScale) * mods.hp;
  }
  const start = scaleGold(level.startingGold, mods.startGold);
  const gruntTransit = pathLen / ENEMIES.grunt.speed;
  const openArrows = Math.floor(start / TOWERS.arrow.cost);
  return {
    startingGold: start,
    killGold,
    clearGold,
    totalGold: start + killGold + clearGold,
    hpPool: Math.round(hp),
    pathTiles: level.pathTiles.length,
    gruntTransitSec: Math.round(gruntTransit * 10) / 10,
    openingArrows: openArrows,
    wave1Gold: scaleGold(waveTotalIncome(level.stage, 1, level.worldIndex), mods.gold),
    wave1Hp: Math.round(waveHpPool(level.stage, 1, level.worldIndex, level.hpScale) * mods.hp),
    damageMul: mods.damage,
  };
}

async function main() {
  const difficulties: DifficultyId[] = (process.env.PTD_SIM_DIFF ?? 'normal')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is DifficultyId => s === 'easy' || s === 'normal' || s === 'hard');
  const all: LevelResult[] = [];
  const t0 = Date.now();
  const stageFilter = (process.env.PTD_SIM_STAGES ?? '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => n >= 1 && n <= 10);
  const worldFilter = (process.env.PTD_SIM_WORLD ?? '').trim();
  for (const diff of difficulties) {
    const limit = Number(process.env.PTD_SIM_MAX || LEVELS.length);
    const pool = LEVELS.slice(0, limit).filter((l) => {
      if (stageFilter.length && !stageFilter.includes(l.stage)) return false;
      if (worldFilter && l.world !== worldFilter) return false;
      return true;
    });
    for (const level of pool) {
      const row = simLevel(level.id, diff);
      all.push(row);
      const mark = row.outcome === 'won' ? 'W' : row.outcome === 'lost' ? 'L' : 'S';
      const leakWaves = row.waves.filter((w) => w.leaks > 0).map((w) => `w${w.wave}:${w.leaks}`).join(',') || 'none';
      const b = budgetLine(level, diff);
      console.error(
        `[${diff}] ${level.world} ${level.stage} ${level.name} -> ${mark}` +
          (row.lostOnWave ? ` fail@w${row.lostOnWave}` : '') +
          ` lives ${row.livesLeft}/${row.waves[0]?.livesBefore ?? '?'} gold ${row.goldLeft} towers ${row.towers}` +
          ` leaks ${row.leaksTotal} [${leakWaves}] kit ${JSON.stringify(row.kit)}` +
          ` open ${b.openingArrows}arr $${b.startingGold} w1hp ${b.wave1Hp} transit ${b.gruntTransitSec}s`,
      );
    }
  }
  const budgets = all.map((r) => {
    const level = LEVELS.find((l) => l.id === r.id)!;
    return {
      world: r.world,
      stage: r.stage,
      name: r.name,
      difficulty: r.difficulty,
      outcome: r.outcome,
      leaksTotal: r.leaksTotal,
      livesLeft: r.livesLeft,
      zeroLeak: r.outcome === 'won' && r.leaksTotal === 0,
      ...budgetLine(level, r.difficulty),
    };
  });
  const payload = {
    generatedAt: new Date().toISOString(),
    bot: 'coverage-greedy: 3 arrows first, lightning before flyers, ice after 3 arrows, cannon for armor, then mix + upgrades. Sites scored by arrow-range path coverage.',
    note: 'Uses real Game.update / combat.ts / economy. Isolated localStorage. A win with 0 leaks is a proof of possibility, not of ease. A leak means this bot leaked — not always that a human cannot 0-life it.',
    elapsedMs: Date.now() - t0,
    zeroLeak: budgets.filter((b) => b.zeroLeak).map((b) => `${b.world} ${b.stage}`),
    leaked: budgets.filter((b) => !b.zeroLeak).map((b) => `${b.world} ${b.stage} leaks=${b.leaksTotal} ${b.outcome}`),
    budgets,
    summary: summarize(all),
    results: all,
  };
  const out = '/tmp/ptd-campaign-sim.json';
  writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log(out);
  console.log(JSON.stringify(payload.summary, null, 2));
}

void main();
