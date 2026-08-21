import './style.css';
import { COLS, MAP_H, MAP_W, ROWS, TILE, TOWER_ORDER, TOWERS, type TowerKind, WAVES_PER_LEVEL } from './game/constants';
import { ENEMIES, type EnemyKind } from './game/enemies';
import { LEVELS, levelsInWorld, waveRoster } from './game/levels';
import { paintLevelThumb } from './game/levelThumb';
import { Game } from './game/Game';
import { Enemy, Tower } from './game/entities';
import {
  afterWin,
  canPlay,
  isCampaignClear,
  isCleared,
  isWorldCleared,
  isWorldOpen,
  loadProgress,
  saveProgress,
  worldClearedCount,
} from './game/progress';
import { DIFFICULTY, killPayout, type DifficultyId } from './game/balance';
import { introKindsForLevel, introRoleLabel, markKindsSeen } from './game/intros';
import { themeFor } from './game/themes';
import { WORLDS, worldById, worldByIndex } from './game/worlds';
import { fitCanvasToHost } from './shared/pointer';
import { expandRect, pinRectBeside, tileBoxInHost } from './shared/pinPanel';

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
const placeStrip = document.getElementById('place-strip')!;
const placeStripLabel = document.getElementById('place-strip-label')!;
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
const btnMute = document.getElementById('btn-mute') as HTMLButtonElement;
const mapOverlay = document.getElementById('map-overlay')!;
const buildPanel = document.getElementById('build-panel')!;
const buildDetail = document.getElementById('build-detail')!;
const buildBlurb = document.getElementById('build-blurb')!;
const buildStats = document.getElementById('build-stats')!;
const inspectPanel = document.getElementById('inspect-panel')!;
const selectionBlurb = document.getElementById('selection-blurb')!;
const upgradeConfirm = document.getElementById('upgrade-confirm')!;
const buildTitle = document.getElementById('build-title')!;
const btnBuild = document.getElementById('btn-build') as HTMLButtonElement;
const playfield = document.getElementById('playfield')!;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const game = new Game(canvas);
const gameBody = canvas.parentElement!;

function layoutPlayfield(): void {
  if (!screens.game.classList.contains('active')) return;
  game.mapView = fitCanvasToHost(canvas, gameBody, MAP_W, MAP_H);
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
type InspectStep = 'idle' | 'preview' | 'confirm';
let inspectStep: InspectStep = 'idle';

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
    blurb.textContent = open ? level.blurb : 'Locked - beat the previous world to play.';
    btn.append(thumb, badge, label, name, blurb);
    btn.style.borderColor = themeFor(level).ui;
    btn.addEventListener('click', () => {
      if (!open) {
        showToast('Beat the previous world to play here. Worlds takes you back.');
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
  buildDetail.classList.toggle('hidden', !confirming);
  if (confirming && game.selectedKind) {
    buildTitle.textContent = TOWERS[game.selectedKind].name;
  } else {
    buildTitle.textContent = 'Build';
  }
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
  syncOverlay();
}

function stopPlacing(): void {
  game.placeKind = null;
  closeBuildMenu();
  updateHud();
}

function syncPlaceStrip(): void {
  const kind = game.placeKind;
  if (kind) {
    placeStrip.classList.remove('hidden');
    placeStripLabel.textContent = `${TOWERS[kind].name} ready — click grass for another.`;
  } else {
    placeStrip.classList.add('hidden');
  }
}

function openBuildMenu(c: number, r: number): void {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  game.upgradePreview = false;
  inspectStep = 'idle';
  game.buildCell = { c, r };
  if (game.placeKind) {
    game.selectedKind = game.placeKind;
    fillBuildDetail(game.placeKind);
  } else {
    game.selectedKind = null;
  }
  syncShopSelection();
  syncOverlay();
}

function fillBuildDetail(kind: TowerKind): void {
  const def = TOWERS[kind];
  buildBlurb.textContent = def.description;
  const extra = extraTowerLine(def);
  const rows: Array<[string, string]> = [
    ['Range', `${(def.range / TILE).toFixed(1)} tiles`],
    ['Attack', String(def.damage)],
    ['Fire', `${def.fireRate.toFixed(1)} /s`],
  ];
  if (extra) rows.push(['Extra', extra]);
  buildStats.innerHTML = statGridHtml(rows);
  btnBuild.disabled = !!(game.level && game.gold < def.cost);
  btnBuild.textContent = game.level && game.gold < def.cost ? `Need ${def.cost}g` : `Build ${def.cost}g`;
}

function renderShop(): void {
  towerShop.innerHTML = '';
  for (const kind of TOWER_ORDER) {
    const def = TOWERS[kind];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tower-btn';
    btn.dataset.kind = kind;
    btn.setAttribute('aria-label', `${def.name} ${def.cost} gold`);
    btn.innerHTML = `
      <img class="tower-portrait" src="/sprites/towers/${kind}.png" alt="" />
      <span class="tower-cost">${def.cost}</span>
    `;
    btn.addEventListener('click', () => {
      game.selectedKind = kind;
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
  const tile = tileBoxInHost(c, r, COLS, ROWS, canvasRect, hostRect);
  const avoid = (game.level?.pathTiles ?? []).map((p) =>
    tileBoxInHost(p.c, p.r, COLS, ROWS, canvasRect, hostRect),
  );
  avoid.push(tile);
  const tower = game.getSelectedTower();
  const rangeWorld = tower
    ? game.upgradePreview
      ? tower.rangeAt(tower.level + 1)
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

function fillInspectTower(t: Tower): void {
  const curD = Math.round(game.shotDamage(t));
  const curR = t.range / TILE;
  const curRate = t.fireRate;
  selectionTitle.textContent = `${t.def.name} Lv ${t.level}`;
  selectionBlurb.textContent = t.def.description;
  const preview = inspectStep !== 'idle' && t.level < 3;
  const rows: Array<[string, string]> = preview
    ? [
        ['Range', arrowStat(curR, t.rangeAt(t.level + 1) / TILE, 1) + ' tiles'],
        ['Attack', arrowStat(curD, Math.round(t.damageAt(t.level + 1) * game.mods.damage))],
        ['Fire', arrowStat(curRate, t.fireRateAt(t.level + 1), 1) + ' /s'],
        ['Cost', `${t.upgradeCost()}g`],
      ]
    : [
        ['Range', `${curR.toFixed(1)} tiles`],
        ['Attack', String(curD)],
        ['Fire', `${curRate.toFixed(1)} /s`],
      ];
  selectionStats.innerHTML = statGridHtml(rows);
  const maxed = t.level >= 3;
  const up = document.getElementById('btn-upgrade') as HTMLButtonElement;
  up.disabled = maxed || (inspectStep === 'preview' && game.gold < t.upgradeCost());
  up.textContent = maxed ? 'Max' : inspectStep === 'preview' ? 'Upgrade tower' : `Upgrade ${t.upgradeCost()}g`;
  towerActions.classList.toggle('hidden', inspectStep === 'confirm');
  upgradeConfirm.classList.toggle('hidden', inspectStep !== 'confirm');
}

function fillInspectEnemy(enemy: Enemy): void {
  const def = ENEMIES[enemy.kind];
  const effects = [
    enemy.slowMul < 1 ? 'chilled' : '',
    enemy.burnTimer > 0 ? 'burning' : '',
    enemy.poisonTimer > 0 ? 'poisoned' : '',
  ]
    .filter(Boolean)
    .join(', ');
  const roleTag =
    def.role === 'champion' ? 'Champion' : def.role === 'boss' ? 'Boss' : def.role === 'special' ? 'Local' : '';
  selectionTitle.textContent = roleTag ? `${def.name} ${roleTag}` : def.name;
  selectionBlurb.textContent = def.flying ? `${def.blurb} Flying - cannon cannot hit.` : def.blurb;
  const rows: Array<[string, string]> = [
    ['HP', `${Math.ceil(enemy.hp)} / ${enemy.maxHp}`],
    ['Armor', `${Math.round(def.armor * 100)}%`],
    ['Speed', `${(def.speed / TILE).toFixed(2)} /s`],
    ['Gold', `${killPayout(def.reward, game.level.worldIndex, game.mods.gold)}g`],
  ];
  if (effects) rows.push(['Status', effects]);
  selectionStats.innerHTML = statGridHtml(rows);
  towerActions.classList.add('hidden');
  upgradeConfirm.classList.add('hidden');
}

function updateHud(): void {
  if (!game.level) return;
  hudLevel.innerHTML = `<span class="hud-world">${worldById(game.level.world).name}</span><span class="hud-stage"> - ${game.level.stage}</span>`;
  hudWave.textContent = `${game.waveIndex} / ${WAVES_PER_LEVEL}`;
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
  btnWave.textContent =
    game.waveIndex >= WAVES_PER_LEVEL
      ? 'Complete'
      : game.phase === 'wave'
        ? 'Wave running'
        : `Start wave ${game.waveIndex + 1}`;
  syncPlaceStrip();
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
    upgradeConfirm.classList.add('hidden');
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
  showToast(`${where} - click grass to build`);
}

game.onHud = updateHud;
game.onToast = showToast;
game.onResult = (won) => {
  resultWon = won;
  overlayResult.classList.remove('hidden');
  if (won) {
    const level = game.level;
    const next = afterWin(level);
    if (lookMode) {
      resultTitle.textContent = 'Look finished';
      resultBody.textContent = 'Nice hold. This land unlocks when you beat the previous world.';
      btnResultPrimary.textContent = 'Back to worlds';
    } else if (isCampaignClear(next)) {
      resultTitle.textContent = 'Campaign clear!';
      resultBody.textContent = 'You held The Hollow. The magician-s door is shut.';
      btnResultPrimary.textContent = 'Back to worlds';
    } else if (next.world > level.worldIndex) {
      const opened = worldByIndex(next.world);
      resultTitle.textContent = `${worldById(level.world).name} cleared`;
      resultBody.textContent = `${opened.name} is open.`;
      btnResultPrimary.textContent = 'Worlds';
    } else {
      resultTitle.textContent = 'Level cleared';
      resultBody.textContent = `${level.name} survived. Next map unlocked.`;
      btnResultPrimary.textContent = 'Next map';
    }
  } else {
    resultTitle.textContent = 'Base fallen';
    resultBody.textContent = 'Enemies leaked through. Rebuild with a wider tower mix.';
    btnResultPrimary.textContent = 'Retry';
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
  if (!t || t.level >= 3) return;
  if (inspectStep === 'idle') {
    inspectStep = 'preview';
    game.upgradePreview = true;
    updateHud();
    game.audio.ui();
    return;
  }
  if (inspectStep === 'preview') {
    inspectStep = 'confirm';
    updateHud();
    game.audio.ui();
  }
});
document.getElementById('btn-upgrade-yes')!.addEventListener('click', () => {
  game.upgradeSelected();
  inspectStep = 'idle';
  game.upgradePreview = false;
  updateHud();
});
document.getElementById('btn-upgrade-no')!.addEventListener('click', () => {
  inspectStep = 'preview';
  game.upgradePreview = true;
  updateHud();
});
document.getElementById('btn-sell')!.addEventListener('click', () => {
  game.sellSelected();
  inspectStep = 'idle';
  updateHud();
});
document.getElementById('btn-inspect-close')!.addEventListener('click', () => {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  inspectStep = 'idle';
  game.upgradePreview = false;
  updateHud();
});
document.getElementById('btn-place-done')!.addEventListener('click', () => stopPlacing());
document.getElementById('btn-build-close')!.addEventListener('click', () => {
  if (game.placeKind) stopPlacing();
  else closeBuildMenu();
});
document.getElementById('btn-build-back')!.addEventListener('click', () => {
  game.selectedKind = null;
  syncShopSelection();
  syncOverlay();
});
btnBuild.addEventListener('click', () => {
  const cell = game.buildCell;
  const kind = game.selectedKind;
  if (!cell || !kind) return;
  const ok = game.tryPlace(cell.c, cell.r);
  if (ok) {
    closeBuildMenu();
    showToast(`${TOWERS[kind].name} ready — click grass for another, or Done placing.`);
  }
  updateHud();
});

btnResultPrimary.addEventListener('click', () => {
  overlayResult.classList.add('hidden');
  if (resultWon) {
    const next = afterWin(game.level);
    if (lookMode || isCampaignClear(next) || next.world > game.level.worldIndex) {
      renderWorlds();
      showScreen('worlds');
      game.stopLoop();
    } else {
      startLevel(game.level.id + 1);
    }
  } else {
    startLevel(activeLevelId);
  }
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
  if (e.button === 0 && game.selectEnemyAt()) {
    game.buildCell = null;
    game.selectedKind = null;
    updateHud();
    return;
  }
  const cell = game.hover;
  if (!cell) return;
  if (e.button === 0 && game.selectTowerAt(cell.c, cell.r)) {
    game.buildCell = null;
    game.selectedKind = null;
    updateHud();
    return;
  }
  if (game.canBuildAt(cell.c, cell.r)) {
    if (e.button === 2) {
      openBuildMenu(cell.c, cell.r);
      return;
    }
    if (game.placeKind && !game.buildCell) {
      game.selectedKind = game.placeKind;
      const ok = game.tryPlace(cell.c, cell.r);
      game.selectedKind = null;
      if (!ok) openBuildMenu(cell.c, cell.r);
      updateHud();
      return;
    }
    openBuildMenu(cell.c, cell.r);
    return;
  }
  if (e.button === 2) return;
  showToast('Towers cannot be placed on the path or trees.');
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
