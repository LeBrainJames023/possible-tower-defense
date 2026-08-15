import './style.css';
import { ENEMIES, MAP_H, MAP_W, TILE, TOWER_ORDER, TOWERS, type TowerKind, WAVES_PER_LEVEL } from './game/constants';
import { LEVELS, levelsInWorld, waveRoster } from './game/levels';
import { drawLevelThumb } from './game/levelThumb';
import { Game } from './game/Game';
import {
  afterWin,
  canPlay,
  isCampaignClear,
  isCleared,
  isWorldCleared,
  isWorldOpen,
  loadProgress,
  saveProgress,
} from './game/progress';
import { DIFFICULTY, scaleGold, type DifficultyId } from './game/balance';
import { themeFor } from './game/themes';
import { WORLDS, worldById, worldByIndex } from './game/worlds';
import { fitCanvasToHost } from './shared/pointer';

const screens = {
  title: document.getElementById('screen-title')!,
  how: document.getElementById('screen-how')!,
  worlds: document.getElementById('screen-worlds')!,
  levels: document.getElementById('screen-levels')!,
  game: document.getElementById('screen-game')!,
};

const overlayResult = document.getElementById('overlay-result')!;
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
const hint = document.getElementById('hint')!;
const btnWave = document.getElementById('btn-wave') as HTMLButtonElement;
const btnSpeed = document.getElementById('btn-speed') as HTMLButtonElement;
const btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
const pauseStrip = document.getElementById('pause-strip')!;
const leaveStrip = document.getElementById('leave-strip')!;
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
const buildDetailText = document.getElementById('build-detail-text')!;
const inspectPanel = document.getElementById('inspect-panel')!;
const buildTitle = document.getElementById('build-title')!;
const btnBuild = document.getElementById('btn-build') as HTMLButtonElement;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const game = new Game(canvas);
const gameBody = canvas.parentElement!;

function layoutPlayfield(): void {
  if (!screens.game.classList.contains('active')) return;
  game.mapView = fitCanvasToHost(canvas, gameBody, MAP_W, MAP_H);
}

new ResizeObserver(() => layoutPlayfield()).observe(gameBody);
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
let lastGold = -1;
let lastLives = -1;

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
    if (!open) btn.classList.add('locked');
    btn.disabled = !open;
    const badge = document.createElement('span');
    badge.className = 'level-badge';
    badge.textContent = cleared ? 'Cleared' : open ? 'Open' : 'Locked';
    const name = document.createElement('strong');
    name.textContent = world.name;
    const blurb = document.createElement('span');
    blurb.className = 'world-blurb';
    blurb.textContent = open ? world.blurb : 'Clear the previous world first.';
    btn.append(badge, name, blurb);
    btn.style.borderColor = world.theme.ui;
    btn.addEventListener('click', () => {
      if (!open) return;
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
  levelsLede.textContent = `${world.blurb} Ten maps. Beat them in order.`;
  levelGrid.innerHTML = '';
  for (const level of levelsInWorld(activeWorldIndex)) {
    const open = canPlay(p, level);
    const cleared = isCleared(p, level);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-card';
    if (cleared) btn.classList.add('cleared');
    if (!open) btn.classList.add('locked');
    btn.disabled = !open;
    const thumb = document.createElement('canvas');
    thumb.className = 'level-thumb';
    thumb.width = 200;
    thumb.height = 96;
    thumb.setAttribute('aria-hidden', 'true');
    const tctx = thumb.getContext('2d');
    if (tctx) drawLevelThumb(tctx, level, thumb.width, thumb.height);
    const badge = document.createElement('span');
    badge.className = 'level-badge';
    badge.textContent = cleared ? 'Cleared' : open ? 'Open' : 'Locked';
    const label = document.createElement('strong');
    label.textContent = `Stage ${level.stage}`;
    const name = document.createElement('span');
    name.className = 'level-name';
    name.textContent = level.name;
    const blurb = document.createElement('span');
    blurb.textContent = open ? level.blurb : 'Clear the previous map first.';
    btn.append(thumb, badge, label, name, blurb);
    btn.style.borderColor = themeFor(level).ui;
    btn.addEventListener('click', () => startLevel(level.id));
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
  buildPanel.classList.toggle('is-confirm', confirming);
  inspectPanel.classList.toggle('hidden', !inspect);
  buildDetail.classList.toggle('hidden', !confirming);
  if (confirming && game.selectedKind) {
    buildTitle.textContent = TOWERS[game.selectedKind].name;
  } else {
    buildTitle.textContent = 'Build';
  }
  requestAnimationFrame(layoutPlayfield);
}

function closeBuildMenu(): void {
  game.buildCell = null;
  game.selectedKind = null;
  syncOverlay();
}

function openBuildMenu(c: number, r: number): void {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  game.buildCell = { c, r };
  game.selectedKind = null;
  syncShopSelection();
  syncOverlay();
  showToast('Pick a tower, then Build.');
}

function renderShop(): void {
  towerShop.innerHTML = '';
  for (const kind of TOWER_ORDER) {
    const def = TOWERS[kind];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tower-btn';
    btn.dataset.kind = kind;
    btn.innerHTML = `
      <img class="tower-portrait" src="/icons/${kind}.png" alt="" />
      <span class="tower-cost">${def.cost}g</span>
      <strong>${def.name}</strong>
    `;
    btn.addEventListener('click', () => {
      game.selectedKind = kind;
      syncShopSelection();
      const rangeTiles = (def.range / TILE).toFixed(1);
      buildDetailText.textContent = `${def.description}\n${def.cost}g · Range ${rangeTiles} tiles · ${def.fireRate.toFixed(1)}/s`;
      btnBuild.disabled = !!(game.level && game.gold < def.cost);
      btnBuild.textContent = game.level && game.gold < def.cost ? `Need ${def.cost}g` : `Build ${def.name}`;
      syncOverlay();
      game.audio.ui();
    });
    towerShop.appendChild(btn);
  }
  syncShopSelection();
}

function syncShopSelection(): void {
  towerShop.querySelectorAll('.tower-btn').forEach((el) => {
    const btn = el as HTMLButtonElement;
    const kind = btn.dataset.kind as TowerKind;
    const broke = !!(game.level && game.gold < TOWERS[kind].cost);
    btn.classList.toggle('selected', game.selectedKind === kind);
    btn.classList.toggle('broke', broke);
    btn.classList.toggle('affordable', !broke && !!game.level);
  });
}

function updatePauseUi(): void {
  const paused = game.phase === 'paused';
  pauseStrip.classList.toggle('hidden', !paused);
  btnPause.textContent = paused ? 'Paused' : 'Pause';
}

function updateHud(): void {
  if (!game.level) return;
  hudLevel.textContent = `${worldById(game.level.world).name} ${game.level.stage}`;
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
        ? 'Wave running…'
        : `Start wave ${game.waveIndex + 1}`;
  updatePauseUi();

  const tower = game.getSelectedTower();
  const enemy = game.getSelectedEnemy();
  if (tower) {
    towerActions.classList.remove('hidden');
    selectionTitle.textContent = `${tower.def.name} · Lv ${tower.level}`;
    selectionStats.textContent = `${tower.def.role} tower\n${tower.def.description}\nDamage ${Math.round(game.shotDamage(tower))} · Range ${(tower.range / TILE).toFixed(1)} tiles · Rate ${tower.fireRate.toFixed(1)}/s\nUpgrade ${tower.level >= 3 ? 'MAX' : tower.upgradeCost() + 'g'} · Sell ${tower.sellValue()}g`;
    const up = document.getElementById('btn-upgrade') as HTMLButtonElement;
    up.disabled = tower.level >= 3 || game.gold < tower.upgradeCost();
    up.textContent = tower.level >= 3 ? 'Max level' : `Upgrade (${tower.upgradeCost()}g)`;
    hint.textContent = 'Upgrade, sell, or close.';
  } else if (enemy) {
    towerActions.classList.add('hidden');
    const def = ENEMIES[enemy.kind];
    const effects = [
      enemy.slowMul < 1 ? 'chilled' : '',
      enemy.burnTimer > 0 ? 'burning' : '',
      enemy.poisonTimer > 0 ? 'poisoned' : '',
    ]
      .filter(Boolean)
      .join(', ');
    selectionTitle.textContent = def.name;
    selectionStats.textContent = `${def.blurb}\nHP ${Math.ceil(enemy.hp)} / ${enemy.maxHp}\nArmor ${Math.round(def.armor * 100)}% · Speed ${(def.speed / TILE).toFixed(2)} tiles/s\nReward ${scaleGold(def.reward, game.mods.gold)}g${effects ? `\nStatus: ${effects}` : ''}`;
    hint.textContent = 'Pause to study packs without pressure.';
  } else {
    towerActions.classList.add('hidden');
    selectionTitle.textContent = 'Inspector';
    selectionStats.textContent = '';
    hint.textContent = 'Click grass to build. Click a tower or enemy to inspect.';
  }

  syncShopSelection();
  syncOverlay();
}

function startLevel(id: number): void {
  const level = LEVELS.find((l) => l.id === id) ?? LEVELS[0];
  activeLevelId = level.id;
  activeWorldIndex = level.worldIndex;
  showScreen('game');
  overlayResult.classList.add('hidden');
  leaveStrip.classList.add('hidden');
  game.audio.unlock();
  lastGold = -1;
  lastLives = -1;
  game.startLevel(level.id);
  updateHud();
  showToast(`${worldById(level.world).name} ${level.stage}: ${level.name} — click grass to build`);
}

game.onHud = updateHud;
game.onToast = showToast;
game.onResult = (won) => {
  resultWon = won;
  overlayResult.classList.remove('hidden');
  if (won) {
    const level = game.level;
    const next = afterWin(level);
    if (isCampaignClear(next)) {
      resultTitle.textContent = 'Campaign clear!';
      resultBody.textContent = 'You held The Hollow. The magician’s door is shut.';
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
  game.timeScale = game.timeScale >= 2 ? 1 : 2;
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
    showToast(`${DIFFICULTY[id].label} — ${DIFFICULTY[id].blurb}`);
  });
});

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
btnPause.addEventListener('click', () => {
  game.togglePause();
  leaveStrip.classList.add('hidden');
  updateHud();
});
document.getElementById('btn-resume')!.addEventListener('click', () => {
  if (game.phase === 'paused') game.togglePause();
  updateHud();
});
document.getElementById('btn-leave')!.addEventListener('click', () => {
  if (game.phase !== 'paused' && (game.phase === 'wave' || game.phase === 'prepare')) {
    game.togglePause();
  }
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

document.getElementById('btn-upgrade')!.addEventListener('click', () => game.upgradeSelected());
document.getElementById('btn-sell')!.addEventListener('click', () => game.sellSelected());
document.getElementById('btn-deselect')!.addEventListener('click', () => {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  updateHud();
});
document.getElementById('btn-inspect-close')!.addEventListener('click', () => {
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  updateHud();
});
document.getElementById('btn-build-close')!.addEventListener('click', () => closeBuildMenu());
document.getElementById('btn-build-back')!.addEventListener('click', () => {
  game.selectedKind = null;
  syncShopSelection();
  syncOverlay();
});
btnBuild.addEventListener('click', () => {
  const cell = game.buildCell;
  if (!cell || !game.selectedKind) return;
  const ok = game.tryPlace(cell.c, cell.r);
  if (ok) closeBuildMenu();
  updateHud();
});

btnResultPrimary.addEventListener('click', () => {
  overlayResult.classList.add('hidden');
  if (resultWon) {
    const next = afterWin(game.level);
    if (isCampaignClear(next) || next.world > game.level.worldIndex) {
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
canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  game.setPointerFromEvent(e);
  if (game.selectEnemyAt()) {
    game.buildCell = null;
    game.selectedKind = null;
    updateHud();
    return;
  }
  const cell = game.hover;
  if (!cell) return;
  if (game.selectTowerAt(cell.c, cell.r)) {
    game.buildCell = null;
    game.selectedKind = null;
    updateHud();
    return;
  }
  if (game.canBuildAt(cell.c, cell.r)) {
    openBuildMenu(cell.c, cell.r);
    return;
  }
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
