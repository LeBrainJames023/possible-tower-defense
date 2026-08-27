import './style.css';
import {
  COLS,
  MAP_H,
  MAP_W,
  ROWS,
  TILE,
  TOWER_ORDER,
  TOWERS,
  slotsForTab,
  isTroopHall,
  type TowerKind,
  type TrayTab,
  WAVES_PER_LEVEL,
} from './game/constants';
import { ENEMIES, type EnemyKind } from './game/enemies';
import { LEVELS, levelsInWorld, waveRoster } from './game/levels';
import { paintLevelThumb } from './game/levelThumb';
import { Game } from './game/Game';
import { Enemy, Tower } from './game/entities';
import {
  afterWin,
  canPlay,
  isCleared,
  isWorldCleared,
  isWorldOpen,
  loadProgress,
  saveProgress,
  worldClearedCount,
} from './game/progress';
import { DIFFICULTY, killPayout, type DifficultyId } from './game/balance';
import { forksFor, voidPullEvery, type ForkId } from './game/forks';
import { introKindsForLevel, introRoleLabel, markKindsSeen } from './game/intros';
import { themeFor } from './game/themes';
import { WORLDS, buildSurfaceWord, worldById, worldByIndex } from './game/worlds';
import { winResultCopy, type ResultPrimary, type ResultSecondary } from './game/resultCard';
import { canRallyAt, troopStatsAt, troopStatsFor } from './game/troops';
import { dist } from './shared/math';
import { fitCanvasToHost } from './shared/pointer';
import { expandRect, panelLimitsForHost, pinRectBeside, tileBoxInHost } from './shared/pinPanel';

const screens = {
  title: document.getElementById('screen-title')!,
  how: document.getElementById('screen-how')!,
  worlds: document.getElementById('screen-worlds')!,
  levels: document.getElementById('screen-levels')!,
  game: document.getElementById('screen-game')!,
};

const overlayResult = document.getElementById('overlay-result')!;
const overlayIntro = document.getElementById('overlay-intro')!;
const introEyebrow = document.getElementById('intro-eyebrow')!;
const introName = document.getElementById('intro-name')!;
const introBody = document.getElementById('intro-body')!;
const resultTitle = document.getElementById('result-title')!;
const resultBody = document.getElementById('result-body')!;
const btnResultPrimary = document.getElementById('btn-result-primary') as HTMLButtonElement;
const btnResultSecondary = document.getElementById('btn-result-secondary') as HTMLButtonElement;

const hudLevel = document.getElementById('hud-level')!;
const hudWave = document.getElementById('hud-wave')!;
const hudLives = document.getElementById('hud-lives')!;
const hudGold = document.getElementById('hud-gold')!;
const hudNext = document.getElementById('hud-next')!;
const chipLives = document.getElementById('chip-lives')!;
const chipGold = document.getElementById('chip-gold')!;
const btnWave = document.getElementById('btn-wave') as HTMLButtonElement;
const btnSpeed = document.getElementById('btn-speed') as HTMLButtonElement;
const btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
const pauseStrip = document.getElementById('pause-strip')!;
const leaveStrip = document.getElementById('leave-strip')!;
const restartStrip = document.getElementById('restart-strip')!;
const toastEl = document.getElementById('toast')!;
const towerShop = document.getElementById('tower-shop')!;
const levelGrid = document.getElementById('level-grid')!;
const worldList = document.getElementById('world-list')!;
const levelsTitle = document.getElementById('levels-title')!;
const levelsLede = document.getElementById('levels-lede')!;
const selectionTitle = document.getElementById('selection-title')!;
const selectionStats = document.getElementById('selection-stats')!;
const towerActions = document.getElementById('tower-actions')!;
const forkActions = document.getElementById('fork-actions')!;
const upgradeRow = document.getElementById('upgrade-row')!;
const rallyRow = document.getElementById('rally-row')!;
const btnRally = document.getElementById('btn-rally') as HTMLButtonElement;
const sellConfirm = document.getElementById('sell-confirm')!;
const btnSell = document.getElementById('btn-sell') as HTMLButtonElement;
const btnSellYes = document.getElementById('btn-sell-yes') as HTMLButtonElement;
const btnMute = document.getElementById('btn-mute') as HTMLButtonElement;
const mapOverlay = document.getElementById('map-overlay')!;
const buildPanel = document.getElementById('build-panel')!;
const buildDetail = document.getElementById('build-detail')!;
const buildPortrait = document.getElementById('build-portrait') as HTMLImageElement;
const buildBlurb = document.getElementById('build-blurb')!;
const buildStats = document.getElementById('build-stats')!;
const inspectPanel = document.getElementById('inspect-panel')!;
const selectionBlurb = document.getElementById('selection-blurb')!;
const buildTitle = document.getElementById('build-title')!;
const btnBuild = document.getElementById('btn-build') as HTMLButtonElement;
const hallFit = document.getElementById('hall-fit')!;
const btnHallLeft = document.getElementById('btn-hall-left') as HTMLButtonElement;
const btnHallRight = document.getElementById('btn-hall-right') as HTMLButtonElement;
const btnHallTurnLeft = document.getElementById('btn-hall-turn-left') as HTMLButtonElement;
const btnHallTurnRight = document.getElementById('btn-hall-turn-right') as HTMLButtonElement;
const playfield = document.getElementById('playfield')!;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const game = new Game(canvas);
const gameBody = canvas.parentElement!;

function layoutPlayfield(): void {
  if (!screens.game.classList.contains('active')) return;
  game.mapView = fitCanvasToHost(canvas, gameBody, MAP_W, MAP_H);
  syncOverlay();
}

new ResizeObserver(() => layoutPlayfield()).observe(gameBody);
new ResizeObserver(() => layoutPlayfield()).observe(screens.game);
window.addEventListener('resize', layoutPlayfield);

const DIFF_KEY = 'ptd-difficulty-v1';
const MUTE_KEY = 'ptd-mute-v1';

function loadDifficulty(): DifficultyId {
  const raw = localStorage.getItem(DIFF_KEY);
  if (raw === 'easy' || raw === 'hard' || raw === 'normal') return raw;
  return 'normal';
}

function applyDifficulty(id: DifficultyId): void {
  game.difficulty = id;
  localStorage.setItem(DIFF_KEY, id);
  document.documentElement.dataset.diff = id;
  document.querySelectorAll('.diff-btn').forEach((el) => {
    el.classList.toggle('selected', (el as HTMLElement).dataset.diff === id);
  });
}

function syncMuteUi(): void {
  btnMute.textContent = game.audio.muted ? 'Sound off' : 'Sound on';
}
let resultWon = false;
let toastTimer = 0;
let activeLevelId = 1;
let activeWorldIndex = 1;
/** Playing a map that is not yet unlocked - win does not save. */
let lookMode = false;
let lastGold = -1;
let lastLives = -1;
let introQueue: EnemyKind[] = [];
type InspectStep = 'idle' | 'preview' | 'forkA' | 'forkB' | 'sell' | 'rally';
let inspectStep: InspectStep = 'idle';
let resultPrimary: ResultPrimary = 'next-map';
let resultSecondary: ResultSecondary = 'worlds';
let buildTab: TrayTab = 'keeps';

const tabKeeps = document.getElementById('tab-keeps') as HTMLButtonElement;
const tabElements = document.getElementById('tab-elements') as HTMLButtonElement;

function flashChip(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), 450);
}

function showToast(message: string, ms = 2200): void {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.add('hidden'), ms);
}

function showScreen(name: keyof typeof screens): void {
  for (const [key, el] of Object.entries(screens)) {
    const active = key === name;
    el.classList.toggle('active', active);
    el.setAttribute('aria-hidden', active ? 'false' : 'true');
  }
  if (name !== 'game') {
    game.audio.stopAmbience();
    game.audio.setScore('off');
    overlayResult.classList.add('hidden');
    overlayIntro.classList.add('hidden');
    pauseStrip.classList.add('hidden');
    leaveStrip.classList.add('hidden');
    toastEl.classList.add('hidden');
  } else {
    requestAnimationFrame(layoutPlayfield);
  }
}

function ensureProgress(): void {
  if (!localStorage.getItem('ptd-progress-v2')) saveProgress(loadProgress());
}

function renderWorlds(): void {
  const p = loadProgress();
  worldList.innerHTML = '';
  for (const world of WORLDS) {
    const open = isWorldOpen(p, world.index);
    const cleared = isWorldCleared(p, world.index);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'world-card';
    if (cleared) btn.classList.add('cleared');
    if (!open) btn.classList.add('look');
    const thumb = document.createElement('canvas');
    thumb.className = 'world-thumb';
    thumb.width = 200;
    thumb.height = 96;
    thumb.setAttribute('aria-hidden', 'true');
    const preview = levelsInWorld(world.index)[0];
    if (preview) paintLevelThumb(thumb, preview);
    const badge = document.createElement('span');
    badge.className = 'level-badge';
    badge.textContent = cleared ? 'Cleared' : open ? 'Open' : 'Locked';
    const name = document.createElement('strong');
    name.textContent = world.name;
    const meta = document.createElement('span');
    meta.className = 'world-meta';
    meta.textContent = `${worldClearedCount(p, world.index)} / 10`;
    const blurb = document.createElement('span');
    blurb.className = 'world-blurb';
    blurb.textContent = open
      ? world.blurb
      : 'Peek at the maps. Beat the previous world to play here.';
    const copy = document.createElement('div');
    copy.className = 'world-copy';
    copy.append(badge, name, meta, blurb);
    btn.append(thumb, copy);
    btn.style.borderColor = world.theme.ui;
    btn.addEventListener('click', () => {
      activeWorldIndex = world.index;
      renderLevels();
      showScreen('levels');
    });
    worldList.appendChild(btn);
  }
}

function renderLevels(): void {
  const p = loadProgress();
  const world = worldByIndex(activeWorldIndex);
  levelsTitle.textContent = world.name;
  const worldOpen = isWorldOpen(p, activeWorldIndex);
  levelsLede.textContent = worldOpen
    ? `${world.blurb} Ten maps. Beat them in order.`
    : `${world.blurb} Peek only - beat the previous world to play these maps.`;
  levelGrid.innerHTML = '';
  for (const level of levelsInWorld(activeWorldIndex)) {
    const open = canPlay(p, level);
    const cleared = isCleared(p, level);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-card';
    if (cleared) btn.classList.add('cleared');
    if (!open) btn.classList.add('look');
    const thumb = document.createElement('canvas');
    thumb.className = 'level-thumb';
    thumb.width = 200;
    thumb.height = 96;
    thumb.setAttribute('aria-hidden', 'true');
    paintLevelThumb(thumb, level);
    const badge = document.createElement('span');
    badge.className = 'level-badge';
    badge.textContent = cleared ? 'Cleared' : open ? 'Open' : 'Locked';
    const label = document.createElement('strong');
    label.textContent = `Stage ${level.stage}`;
    const name = document.createElement('span');
    name.className = 'level-name';
    name.textContent = level.name;
    const blurb = document.createElement('span');
    blurb.textContent = open
      ? level.blurb
      : worldOpen
        ? 'Locked — beat the previous map first.'
        : 'Locked — beat the previous world to play.';
    btn.append(thumb, badge, label, name, blurb);
    btn.style.borderColor = themeFor(level).ui;
    btn.addEventListener('click', () => {
      if (!open) {
        showToast(
          worldOpen
            ? 'Beat the previous map first.'
            : 'Beat the previous world to play here. Worlds takes you back.',
        );
        return;
      }
      startLevel(level.id);
    });
    levelGrid.appendChild(btn);
  }
}

function syncOverlay(): void {
  const building = !!game.buildCell;
  const confirming = building && !!game.selectedKind;
  const tower = game.getSelectedTower();
  const enemy = game.getSelectedEnemy();
  const inspect = !!(tower || enemy);
  mapOverlay.classList.toggle('hidden', !building && !inspect);
  buildPanel.classList.toggle('hidden', !building);
  inspectPanel.classList.toggle('hidden', !inspect);
  towerShop.classList.toggle('hidden', confirming);
  buildDetail.classList.toggle('hidden', !confirming);
  if (confirming && game.selectedKind) {
    buildTitle.textContent = TOWERS[game.selectedKind].name;
  } else {
    buildTitle.textContent = 'Build';
  }
  syncHallFit();
  requestAnimationFrame(() => {
    if (game.buildCell && !buildPanel.classList.contains('hidden')) {
      pinPanelToCell(buildPanel, game.buildCell.c, game.buildCell.r);
    }
    const focus = game.getSelectedTower();
    if (focus && !inspectPanel.classList.contains('hidden')) {
      pinPanelToCell(inspectPanel, focus.col, focus.row);
    } else if (game.getSelectedEnemy() && !inspectPanel.classList.contains('hidden')) {
      const e = game.getSelectedEnemy()!;
      pinPanelToCell(inspectPanel, Math.floor(e.pos.x / TILE), Math.floor(e.pos.y / TILE));
    }
  });
}

function closeBuildMenu(): void {
  game.buildCell = null;
  game.selectedKind = null;
  game.hallDir = null;
  syncOverlay();
}

function openBuildMenu(c: number, r: number): void {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  game.upgradePreview = false;
  inspectStep = 'idle';
  game.buildCell = { c, r };
  game.selectedKind = null;
  game.hallDir = null;
  setBuildTab('keeps');
  syncShopSelection();
  syncOverlay();
}

function fillBuildDetail(kind: TowerKind): void {
  const def = TOWERS[kind];
  buildPortrait.src = `/sprites/towers/${kind}.png${isTroopHall(kind) ? '?v=wide2' : ''}`;
  buildPortrait.classList.toggle('hall-look', isTroopHall(kind));
  buildBlurb.textContent = def.description;
  const extra = extraTowerLine(def);
  const rows: Array<[string, string]> = isTroopHall(kind)
    ? [
        ['Troops', '3'],
        ['Rally', `${(def.range / TILE).toFixed(1)} tiles`],
      ]
    : [
        ['Range', `${(def.range / TILE).toFixed(1)} tiles`],
        ['Attack', String(def.damage)],
        ['Fire', `${def.fireRate.toFixed(1)} /s`],
      ];
  if (extra) rows.push(['Extra', extra]);
  buildStats.innerHTML = statGridHtml(rows);
  btnBuild.disabled = !!(game.level && game.gold < def.cost);
  btnBuild.textContent = game.level && game.gold < def.cost ? `Need ${def.cost}g` : `Build ${def.cost}g`;
  syncHallFit();
}

function syncHallFit(): void {
  const hall = !!game.selectedKind && isTroopHall(game.selectedKind);
  const opts = game.hallFitOptions();
  const any = opts.left || opts.right || opts.turnLeft || opts.turnRight;
  hallFit.classList.toggle('hidden', !hall || !any);
  btnHallLeft.classList.toggle('hidden', !opts.left);
  btnHallRight.classList.toggle('hidden', !opts.right);
  btnHallTurnLeft.classList.toggle('hidden', !opts.turnLeft);
  btnHallTurnRight.classList.toggle('hidden', !opts.turnRight);
}

function setBuildTab(tab: TrayTab): void {
  buildTab = tab;
  tabKeeps.classList.toggle('selected', tab === 'keeps');
  tabElements.classList.toggle('selected', tab === 'elements');
  tabKeeps.setAttribute('aria-selected', tab === 'keeps' ? 'true' : 'false');
  tabElements.setAttribute('aria-selected', tab === 'elements' ? 'true' : 'false');
  if (game.selectedKind && !slotsForTab(tab).includes(game.selectedKind)) {
    game.selectedKind = null;
  }
  renderShop();
}

function renderShop(): void {
  towerShop.innerHTML = '';
  for (const kind of slotsForTab(buildTab)) {
    if (!kind) {
      const empty = document.createElement('div');
      empty.className = 'tower-slot empty';
      empty.setAttribute('aria-hidden', 'true');
      towerShop.appendChild(empty);
      continue;
    }
    const def = TOWERS[kind];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tower-btn';
    btn.dataset.kind = kind;
    btn.setAttribute('aria-label', `${def.name} ${def.cost} gold`);
    const portrait = `<img class="tower-portrait${isTroopHall(kind) ? ' hall-portrait' : ''}" src="/sprites/towers/${kind}.png${isTroopHall(kind) ? '?v=wide2' : ''}" alt="" />`;
    btn.innerHTML = `
      ${portrait}
      <span class="tower-cost">${def.cost}</span>
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.selectedKind = kind;
      game.hallDir = null;
      if (isTroopHall(kind)) game.ensureHallDir();
      if (game.buildCell) game.hover = { ...game.buildCell };
      syncShopSelection();
      fillBuildDetail(kind);
      syncOverlay();
      game.audio.ui();
    });
    towerShop.appendChild(btn);
  }
  syncShopSelection();
}

function pinPanelToCell(panel: HTMLElement, c: number, r: number): void {
  const canvasRect = canvas.getBoundingClientRect();
  const hostRect = playfield.getBoundingClientRect();
  const limits = panelLimitsForHost(hostRect);
  panel.style.maxWidth = `${limits.maxWidth}px`;
  panel.style.maxHeight = `${limits.maxHeight}px`;
  const tile = tileBoxInHost(c, r, COLS, ROWS, canvasRect, hostRect);
  const avoid = (game.level?.pathTiles ?? []).map((p) =>
    tileBoxInHost(p.c, p.r, COLS, ROWS, canvasRect, hostRect),
  );
  avoid.push(tile);
  const tower = game.getSelectedTower();
  const rangeWorld = tower
    ? game.upgradePreview
      ? tower.previewRange()
      : tower.range
    : game.selectedKind
      ? TOWERS[game.selectedKind].range
      : Math.max(...TOWER_ORDER.map((k) => TOWERS[k].range));
  const ringPad = game.getSelectedEnemy() && !tower ? tile.width * 1.2 : (rangeWorld / TILE) * tile.width;
  avoid.push(expandRect(tile, ringPad));
  const pin = pinRectBeside(
    tile,
    { width: panel.offsetWidth, height: panel.offsetHeight },
    hostRect,
    8,
    8,
    avoid,
  );
  panel.style.left = `${pin.left}px`;
  panel.style.top = `${pin.top}px`;
}

function statGridHtml(rows: Array<[string, string]>): string {
  return rows
    .map(([label, value]) => `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}

function arrowStat(cur: number, next: number, digits = 0): string {
  const a = digits ? cur.toFixed(digits) : String(Math.round(cur));
  const b = digits ? next.toFixed(digits) : String(Math.round(next));
  if (Math.abs(next - cur) < (digits ? 0.05 : 0.5)) return `${a} (same)`;
  return `${a} ? ${b}`;
}

function extraTowerLine(def: (typeof TOWERS)[TowerKind]): string | null {
  if (def.kind === 'muster') return '3 warriors stall walkers on the path';
  if (def.kind === 'chapter') return '3 knights stall walkers on the path';
  if (def.kind === 'void') return 'Every 4th orb pulls foes together';
  if (def.splash > 0) return `Splash ${(def.splash / TILE).toFixed(1)} tiles`;
  if (def.chain > 0) return `Chain ${def.chain}`;
  if (def.slow > 0) return `Slow ${Math.round(def.slow * 100)}%`;
  return null;
}

function syncShopSelection(): void {
  towerShop.querySelectorAll('.tower-btn').forEach((el) => {
    const btn = el as HTMLButtonElement;
    const kind = btn.dataset.kind as TowerKind;
    const broke = !!(game.level && game.gold < TOWERS[kind].cost);
    btn.classList.toggle('selected', game.selectedKind === kind);
    btn.classList.toggle('broke', broke);
  });
}

function hideConfirmStrips(): void {
  leaveStrip.classList.add('hidden');
  restartStrip.classList.add('hidden');
}

function showIntroCard(kind: EnemyKind): void {
  const def = ENEMIES[kind];
  introEyebrow.textContent = introRoleLabel(kind);
  introName.textContent = def.name;
  introBody.textContent = def.blurb;
  overlayIntro.classList.remove('hidden');
}

function showNextIntro(): void {
  const kind = introQueue[0];
  if (!kind) {
    overlayIntro.classList.add('hidden');
    return;
  }
  showIntroCard(kind);
}

function queueLevelIntros(level: (typeof LEVELS)[number]): void {
  introQueue = introKindsForLevel(level);
  showNextIntro();
}

function updatePauseUi(): void {
  const paused = game.phase === 'paused';
  pauseStrip.classList.toggle('hidden', !paused);
  btnPause.textContent = paused ? 'Paused' : 'Pause';
  if (!paused) restartStrip.classList.add('hidden');
}

function forkExtraRows(t: Tower, previewFork: ForkId): Array<[string, string]> {
  const extra: Array<[string, string]> = [];
  if (t.def.splash > 0 || t.splashAt(previewFork) > 0) {
    extra.push(['Splash', arrowStat(t.splash / TILE, t.splashAt(previewFork) / TILE, 1) + ' tiles']);
  }
  if (t.def.chain > 0) {
    extra.push(['Chain', arrowStat(t.chainAt(null), t.chainAt(previewFork))]);
  }
  if (t.def.slow > 0) {
    extra.push(['Slow', arrowStat(t.slowAt(null) * 100, t.slowAt(previewFork) * 100) + '%']);
  }
  if (t.def.burnDps > 0) {
    extra.push(['Burn', arrowStat(t.burnDpsAt(null), t.burnDpsAt(previewFork)) + '/s']);
  }
  if (t.def.poisonDps > 0) {
    extra.push(['Poison', arrowStat(t.poisonDpsAt(null), t.poisonDpsAt(previewFork)) + '/s']);
  }
  if (t.kind === 'void') {
    extra.push(['Pull', voidPullEvery(previewFork) === 3 ? 'Every 3rd orb' : 'Every 4th orb']);
  }
  return extra;
}

function fillInspectTower(t: Tower): void {
  const hall = isTroopHall(t.kind);
  const curD = Math.round(game.shotDamage(t));
  const curR = t.range / TILE;
  const curRate = t.fireRate;
  selectionTitle.textContent = t.displayName();
  const previewingFork = inspectStep === 'forkA' || inspectStep === 'forkB';
  const previewFork = inspectStep === 'forkA' ? 'a' : inspectStep === 'forkB' ? 'b' : null;
  selectionBlurb.textContent =
    inspectStep === 'rally'
      ? 'Click a tile in the circle. The path is allowed.'
      : previewFork && forksFor(t.kind)
        ? forksFor(t.kind)![previewFork].blurb
        : t.def.description;
  const preview = inspectStep === 'preview' && t.canNumberUpgrade();
  const next = preview ? t.previewUpgradeArgs() : null;
  const living = game.troops.filter((tr) => tr.hallId === t.id).length;
  const hallNow = troopStatsFor(t);
  const rows: Array<[string, string]> = hall
    ? previewingFork && previewFork
      ? [
          ['Troops', '3'],
          ['HP', arrowStat(hallNow.hp, troopStatsAt(t.kind, previewFork).hp)],
          ['Train', arrowStat(hallNow.trainTime, troopStatsAt(t.kind, previewFork).trainTime, 1) + 's'],
          ['Cost', `${t.upgradeCost()}g`],
        ]
      : [
          ['Troops', `${living} / 3`],
          ['Rally', `${curR.toFixed(1)} tiles`],
          ['HP', String(hallNow.hp)],
        ]
    : preview && next
      ? [
          ['Range', arrowStat(curR, t.rangeAt(next.level, next.fork, next.pathLevel) / TILE, 1) + ' tiles'],
          ['Attack', arrowStat(curD, Math.round(t.damageAt(next.level, next.fork, next.pathLevel) * game.mods.damage))],
          ['Fire', arrowStat(curRate, t.fireRateAt(next.level, next.fork, next.pathLevel), 1) + ' /s'],
          ['Cost', `${t.upgradeCost()}g`],
        ]
      : previewingFork && previewFork
        ? [
            ['Range', arrowStat(curR, t.rangeAt(3, previewFork) / TILE, 1) + ' tiles'],
            ['Attack', arrowStat(curD, Math.round(t.damageAt(3, previewFork) * game.mods.damage))],
            ['Fire', arrowStat(curRate, t.fireRateAt(3, previewFork), 1) + ' /s'],
            ...forkExtraRows(t, previewFork),
            ['Cost', `${t.upgradeCost()}g`],
          ]
        : [
            ['Range', `${curR.toFixed(1)} tiles`],
            ['Attack', String(curD)],
            ['Fire', `${curRate.toFixed(1)} /s`],
          ];
  if (!hall && t.kind === 'void' && !preview && !previewingFork) {
    rows.push(['Pull', voidPullEvery(t.fork) === 3 ? 'Every 3rd orb' : 'Every 4th orb']);
  }
  if (!hall) {
    if (t.choked) rows.push(['Status', 'Sandstorm — firing slow']);
    if (t.frozen) rows.push(['Status', 'Frozen — cannot fire']);
    if (t.hazed) rows.push(['Status', 'Heat haze — shots weaker']);
    if (t.muffled) rows.push(['Status', 'Hex — firing slow']);
    if (t.sealed) rows.push(['Status', 'Sealed — cannot fire']);
  }
  selectionStats.innerHTML = statGridHtml(rows);

  const selling = inspectStep === 'sell';
  const up = document.getElementById('btn-upgrade') as HTMLButtonElement;
  const forking = t.canFork();
  upgradeRow.classList.toggle('hidden', selling || hall);
  rallyRow.classList.toggle('hidden', selling || !hall);
  forkActions.classList.toggle('hidden', selling || !forking);
  up.classList.toggle('hidden', selling || forking || hall);
  btnSell.classList.toggle('hidden', selling);
  sellConfirm.classList.toggle('hidden', !selling);
  if (!selling) {
    up.disabled = t.isMaxed() || (inspectStep === 'preview' && game.gold < t.upgradeCost());
    up.textContent = t.isMaxed() ? 'Max' : `Upgrade ${t.upgradeCost()}g`;
    btnRally.textContent = inspectStep === 'rally' ? 'Cancel rally' : 'Rally';
    btnSell.textContent = `Sell ${t.sellValue()}g`;
    if (forking) {
      const forks = forksFor(t.kind)!;
      const cost = t.upgradeCost();
      const a = document.getElementById('btn-fork-a') as HTMLButtonElement;
      const b = document.getElementById('btn-fork-b') as HTMLButtonElement;
      a.textContent = inspectStep === 'forkA' ? `Pay ${forks.a.name} ${cost}g` : `${forks.a.name} ${cost}g`;
      b.textContent = inspectStep === 'forkB' ? `Pay ${forks.b.name} ${cost}g` : `${forks.b.name} ${cost}g`;
      a.disabled = inspectStep === 'forkA' && game.gold < cost;
      b.disabled = inspectStep === 'forkB' && game.gold < cost;
    }
  } else {
    btnSellYes.textContent = `Sell ${t.sellValue()}g`;
  }
  towerActions.classList.remove('hidden');
}

function fillInspectEnemy(enemy: Enemy): void {
  const def = ENEMIES[enemy.kind];
  const effects = [
    enemy.slowMul < 1 ? 'chilled' : '',
    enemy.burnTimer > 0 ? 'burning' : '',
    enemy.poisonTimer > 0 ? 'poisoned' : '',
    enemy.burrowed ? 'burrowed' : '',
    enemy.phased ? 'phased' : '',
    enemy.kind === 'duneRunner' && enemy.verbSpeedMul > 1.4 ? 'dashing' : '',
    enemy.kind === 'iceWolf' && enemy.verbSpeedMul > 1.5 ? 'sliding' : '',
    enemy.kind === 'iceWolf' && enemy.verbSpeedMul > 1.15 && enemy.verbSpeedMul <= 1.5 ? 'rallied' : '',
    enemy.kind === 'duneTyrant' ? 'sandstorm' : '',
    enemy.kind === 'packLord' ? 'rally' : '',
    enemy.kind === 'cinderKing' ? 'heat haze' : '',
    enemy.kind === 'magmaHound' && enemy.burnTimer <= 0 ? 'smoldering' : '',
    enemy.kind === 'cinderBrute' && enemy.armor > 0.4 ? 'crusted' : '',
    enemy.kind === 'cinderBrute' && enemy.burnTimer > 0 ? 'crust melted' : '',
    enemy.freezing ? 'freezing towers' : '',
  ]
    .filter(Boolean)
    .join(', ');
  const roleTag =
    def.role === 'champion' ? 'Champion' : def.role === 'boss' ? 'Boss' : def.role === 'special' ? 'Local' : '';
  selectionTitle.textContent = roleTag ? `${def.name} ${roleTag}` : def.name;
  selectionBlurb.textContent = def.flying ? `${def.blurb} Flying - cannon cannot hit.` : def.blurb;
  const rows: Array<[string, string]> = [
    ['HP', `${Math.ceil(enemy.hp)} / ${enemy.maxHp}`],
    ['Armor', `${Math.round(enemy.armor * 100)}%`],
    ['Speed', `${(def.speed / TILE).toFixed(2)} /s`],
    ['Gold', `${killPayout(def.reward, game.level.worldIndex, game.mods.gold)}g`],
  ];
  if (effects) rows.push(['Status', effects]);
  selectionStats.innerHTML = statGridHtml(rows);
  towerActions.classList.add('hidden');
}

function updateHud(): void {
  if (!game.level) return;
  hudLevel.innerHTML = `<span class="hud-world">${worldById(game.level.world).name}</span><span class="hud-stage"> - ${game.level.stage}</span>`;
  hudWave.textContent = game.endless ? `Wave ${game.waveIndex}` : `${game.waveIndex} / ${WAVES_PER_LEVEL}`;
  hudLives.textContent = String(game.lives);
  hudGold.textContent = String(game.gold);
  if (lastGold >= 0 && game.gold !== lastGold) flashChip(chipGold, 'pulse');
  if (lastLives >= 0 && game.lives < lastLives) flashChip(chipLives, 'wound');
  lastGold = game.gold;
  lastLives = game.lives;
  if (game.canStartWave()) {
    hudNext.textContent = `Next: ${waveRoster(game.level.stage, game.waveIndex + 1, game.level.worldIndex).join(', ')}`;
  } else if (game.phase === 'wave') {
    hudNext.textContent = `Now: ${waveRoster(game.level.stage, game.waveIndex, game.level.worldIndex).join(', ')}`;
  } else {
    hudNext.textContent = 'Line held.';
  }
  btnWave.disabled = !game.canStartWave();
  btnWave.textContent = game.phase === 'wave'
    ? 'Wave running'
    : game.canStartWave()
      ? `Start wave ${game.waveIndex + 1}`
      : 'Complete';
  updatePauseUi();

  const tower = game.getSelectedTower();
  const enemy = game.getSelectedEnemy();
  if (tower) {
    fillInspectTower(tower);
  } else if (enemy) {
    inspectStep = 'idle';
    game.upgradePreview = false;
    fillInspectEnemy(enemy);
  } else {
    inspectStep = 'idle';
    game.upgradePreview = false;
    towerActions.classList.add('hidden');
    selectionTitle.textContent = 'Inspector';
    selectionBlurb.textContent = '';
    selectionStats.innerHTML = '';
  }

  syncShopSelection();
  syncOverlay();
}

function startLevel(id: number): void {
  const level = LEVELS.find((l) => l.id === id) ?? LEVELS[0];
  if (!canPlay(loadProgress(), level)) {
    showToast('Beat the previous world to play here. Worlds takes you back.');
    return;
  }
  lookMode = false;
  activeLevelId = level.id;
  activeWorldIndex = level.worldIndex;
  showScreen('game');
  screens.game.dataset.world = level.world;
  overlayResult.classList.add('hidden');
  hideConfirmStrips();
  game.audio.unlock();
  lastGold = -1;
  lastLives = -1;
  game.startLevel(level.id);
  updateHud();
  queueLevelIntros(level);
  const where = `${worldById(level.world).name} ${level.stage}: ${level.name}`;
  const clickHint = `click ${buildSurfaceWord(level.world)} to build`;
  showToast(`${where} - ${clickHint}`);
}

game.onHud = updateHud;
game.onToast = showToast;
game.onResult = (won) => {
  resultWon = won;
  overlayResult.classList.remove('hidden');
  if (won) {
    const copy = winResultCopy(game.level, lookMode);
    resultTitle.textContent = copy.title;
    resultBody.textContent = copy.body;
    btnResultPrimary.textContent = copy.primaryLabel;
    btnResultSecondary.textContent = copy.secondaryLabel;
    resultPrimary = copy.primary;
    resultSecondary = copy.secondary;
  } else {
    resultTitle.textContent = 'Base fallen';
    resultBody.textContent = 'Enemies leaked through. Rebuild with a wider tower mix.';
    btnResultPrimary.textContent = 'Retry';
    btnResultSecondary.textContent = 'Worlds';
    resultPrimary = 'retry';
    resultSecondary = 'worlds';
  }
};

btnSpeed.addEventListener('click', () => {
  game.timeScale = game.timeScale >= 3 ? 1 : game.timeScale + 1;
  btnSpeed.textContent = `Speed ${game.timeScale}x`;
  game.audio.ui();
});

btnMute.addEventListener('click', () => {
  game.audio.unlock();
  const muted = game.audio.toggleMute();
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  syncMuteUi();
});

document.querySelectorAll('[data-diff]').forEach((el) => {
  el.addEventListener('click', () => {
    const id = (el as HTMLElement).dataset.diff as DifficultyId;
    applyDifficulty(id);
    game.audio.unlock();
    game.audio.ui();
    showToast(`${DIFFICULTY[id].label} - ${DIFFICULTY[id].blurb}`);
  });
});

function goWorlds(): void {
  renderWorlds();
  showScreen('worlds');
  game.stopLoop();
}

function goTitle(): void {
  overlayResult.classList.add('hidden');
  showScreen('title');
  game.stopLoop();
}

function openWorldLevels(worldIndex: number): void {
  overlayResult.classList.add('hidden');
  activeWorldIndex = worldIndex;
  renderLevels();
  showScreen('levels');
  game.stopLoop();
}

document.getElementById('btn-play')?.addEventListener('click', goWorlds);

document.querySelectorAll('[data-action]').forEach((el) => {
  el.addEventListener('click', () => {
    const action = (el as HTMLElement).dataset.action;
    if (action === 'title') showScreen('title');
    if (action === 'how') showScreen('how');
    if (action === 'worlds') {
      renderWorlds();
      showScreen('worlds');
      game.stopLoop();
    }
    if (action === 'levels') {
      renderLevels();
      showScreen('levels');
      game.stopLoop();
    }
  });
});

btnWave.addEventListener('click', () => game.startWave());
document.getElementById('btn-intro-got-it')!.addEventListener('click', () => {
  const shown = introQueue.shift();
  if (shown) markKindsSeen([shown]);
  showNextIntro();
});
btnPause.addEventListener('click', () => {
  game.togglePause();
  hideConfirmStrips();
  updateHud();
});
document.getElementById('btn-resume')!.addEventListener('click', () => {
  if (game.phase === 'paused') game.togglePause();
  hideConfirmStrips();
  updateHud();
});
document.getElementById('btn-restart')!.addEventListener('click', () => {
  leaveStrip.classList.add('hidden');
  restartStrip.classList.remove('hidden');
});
document.getElementById('btn-restart-cancel')!.addEventListener('click', () => {
  restartStrip.classList.add('hidden');
});
document.getElementById('btn-restart-confirm')!.addEventListener('click', () => {
  hideConfirmStrips();
  startLevel(activeLevelId);
});
document.getElementById('btn-leave')!.addEventListener('click', () => {
  if (game.phase !== 'paused' && (game.phase === 'wave' || game.phase === 'prepare')) {
    game.togglePause();
  }
  restartStrip.classList.add('hidden');
  leaveStrip.classList.remove('hidden');
  updateHud();
});
document.getElementById('btn-leave-cancel')!.addEventListener('click', () => {
  leaveStrip.classList.add('hidden');
});
document.getElementById('btn-leave-confirm')!.addEventListener('click', () => {
  leaveStrip.classList.add('hidden');
  renderLevels();
  showScreen('levels');
  game.stopLoop();
});

document.getElementById('btn-upgrade')!.addEventListener('click', () => {
  const t = game.getSelectedTower();
  if (!t || !t.canNumberUpgrade()) return;
  if (inspectStep === 'idle') {
    inspectStep = 'preview';
    game.upgradePreview = true;
    t.previewFork = null;
    updateHud();
    game.audio.ui();
    return;
  }
  if (inspectStep === 'preview') {
    if (game.upgradeSelected()) {
      inspectStep = 'idle';
      game.upgradePreview = false;
    }
    updateHud();
  }
});

function onForkClick(id: ForkId): void {
  const t = game.getSelectedTower();
  if (!t || !t.canFork()) return;
  const step: InspectStep = id === 'a' ? 'forkA' : 'forkB';
  if (inspectStep !== step) {
    inspectStep = step;
    t.previewFork = id;
    game.upgradePreview = true;
    updateHud();
    game.audio.ui();
    return;
  }
  if (game.chooseFork(id)) inspectStep = 'idle';
  updateHud();
}
document.getElementById('btn-fork-a')!.addEventListener('click', () => onForkClick('a'));
document.getElementById('btn-fork-b')!.addEventListener('click', () => onForkClick('b'));
btnRally.addEventListener('click', () => {
  const t = game.getSelectedTower();
  if (!t || !isTroopHall(t.kind)) return;
  if (inspectStep === 'rally') {
    inspectStep = 'idle';
    game.rallyPreview = false;
    updateHud();
    game.audio.ui();
    return;
  }
  inspectStep = 'rally';
  game.rallyPreview = true;
  game.upgradePreview = false;
  updateHud();
  showToast('Click a tile in the circle. The path is allowed.');
  game.audio.ui();
});
document.getElementById('btn-sell')!.addEventListener('click', () => {
  const t = game.getSelectedTower();
  if (!t) return;
  inspectStep = 'sell';
  game.upgradePreview = false;
  t.previewFork = null;
  updateHud();
  game.audio.ui();
});
document.getElementById('btn-sell-keep')!.addEventListener('click', () => {
  inspectStep = 'idle';
  updateHud();
  game.audio.ui();
});
document.getElementById('btn-sell-yes')!.addEventListener('click', () => {
  game.sellSelected();
  inspectStep = 'idle';
  updateHud();
});
document.getElementById('btn-inspect-close')!.addEventListener('click', () => {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  inspectStep = 'idle';
  game.upgradePreview = false;
  game.rallyPreview = false;
  updateHud();
});
document.getElementById('btn-build-close')!.addEventListener('click', () => closeBuildMenu());
buildPanel.addEventListener('pointerdown', (e) => e.stopPropagation());
inspectPanel.addEventListener('pointerdown', (e) => e.stopPropagation());
tabKeeps.addEventListener('click', () => {
  game.selectedKind = null;
  game.hallDir = null;
  setBuildTab('keeps');
  syncShopSelection();
  syncOverlay();
  game.audio.ui();
});
tabElements.addEventListener('click', () => {
  game.selectedKind = null;
  game.hallDir = null;
  setBuildTab('elements');
  syncShopSelection();
  syncOverlay();
  game.audio.ui();
});
document.getElementById('btn-build-back')!.addEventListener('click', () => {
  game.selectedKind = null;
  game.hallDir = null;
  syncShopSelection();
  syncOverlay();
});
btnHallLeft.addEventListener('click', () => {
  if (game.nudgeHall('w')) {
    game.audio.ui();
    syncOverlay();
  }
});
btnHallRight.addEventListener('click', () => {
  if (game.nudgeHall('e')) {
    game.audio.ui();
    syncOverlay();
  }
});
btnHallTurnLeft.addEventListener('click', () => {
  if (game.rotateHall(-1)) {
    game.audio.ui();
    syncOverlay();
  }
});
btnHallTurnRight.addEventListener('click', () => {
  if (game.rotateHall(1)) {
    game.audio.ui();
    syncOverlay();
  }
});
btnBuild.addEventListener('click', () => {
  const cell = game.buildCell;
  const kind = game.selectedKind;
  if (!cell || !kind) return;
  const ok = game.tryPlace(cell.c, cell.r);
  if (ok) {
    closeBuildMenu();
  }
  updateHud();
});

btnResultPrimary.addEventListener('click', () => {
  overlayResult.classList.add('hidden');
  if (!resultWon || resultPrimary === 'retry') {
    startLevel(activeLevelId);
    return;
  }
  if (resultPrimary === 'keep-playing') {
    game.enterEndless();
    return;
  }
  if (resultPrimary === 'worlds') {
    goWorlds();
    return;
  }
  if (resultPrimary === 'next-world') {
    openWorldLevels(afterWin(game.level).world);
    return;
  }
  startLevel(game.level.id + 1);
});

btnResultSecondary.addEventListener('click', () => {
  overlayResult.classList.add('hidden');
  if (resultSecondary === 'title') goTitle();
  else goWorlds();
});

canvas.addEventListener('pointermove', (e) => {
  game.setPointerFromEvent(e);
});
canvas.addEventListener('pointerleave', () => {
  game.clearPointer();
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 && e.button !== 2) return;
  game.setPointerFromEvent(e);
  const cell = game.hover;
  if (inspectStep === 'rally' && e.button === 0) {
    const hall = game.getSelectedTower();
    if (!cell || !hall || !isTroopHall(hall.kind)) {
      inspectStep = 'idle';
      game.rallyPreview = false;
      updateHud();
      return;
    }
    if (game.setRallyPoint(cell.c, cell.r)) {
      inspectStep = 'idle';
      showToast('Rally set.');
      updateHud();
      game.audio.ui();
      return;
    }
    const x = cell.c * TILE + TILE / 2;
    const y = cell.r * TILE + TILE / 2;
    if (dist({ x: hall.x, y: hall.y }, { x, y }) > hall.range + 1) {
      showToast('Outside rally.');
    } else if (!canRallyAt(hall, game.grid, cell.c, cell.r)) {
      showToast('Rally needs grass or the path.');
    } else {
      showToast('Outside rally.');
    }
    return;
  }
  if (e.button === 0 && game.selectEnemyAt()) {
    game.buildCell = null;
    game.selectedKind = null;
    inspectStep = 'idle';
    updateHud();
    return;
  }
  if (!cell) return;
  if (e.button === 0) {
    const keep = game.hitTowerAt(cell.c, cell.r);
    if (keep) {
      game.buildCell = null;
      game.selectedKind = null;
      inspectStep = 'idle';
      game.selectTower(keep);
      updateHud();
      return;
    }
  }
  if (game.buildCell && e.button === 0) {
    if (cell.c === game.buildCell.c && cell.r === game.buildCell.r) return;
    if (game.canBuildAt(cell.c, cell.r)) {
      game.buildCell = { c: cell.c, r: cell.r };
      game.hover = { c: cell.c, r: cell.r };
      game.hallDir = null;
      if (game.selectedKind && isTroopHall(game.selectedKind)) game.ensureHallDir();
      syncOverlay();
      return;
    }
  }
  if (game.canBuildAt(cell.c, cell.r)) {
    openBuildMenu(cell.c, cell.r);
    return;
  }
  if (e.button === 2) return;
  showToast('Buildings cannot be placed on the path or trees.');
});

ensureProgress();
applyDifficulty(loadDifficulty());
if (localStorage.getItem(MUTE_KEY) === '1') {
  game.audio.muted = true;
}
syncMuteUi();
renderShop();
renderLevels();
showScreen('title');
updateHud();

document.addEventListener(
  'pointerdown',
  () => {
    game.audio.unlock();
  },
  { once: true },
);

declare global {
  interface Window {
    __PTD?: { game: Game; startLevel: (id: number) => void };
  }
}
window.__PTD = { game, startLevel };
