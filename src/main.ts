import './style.css';
import { ENEMIES, TOWER_ORDER, TOWERS, type TowerKind, WAVES_PER_LEVEL } from './game/constants';
import { LEVELS } from './game/levels';
import { Game, loadProgress, saveProgress } from './game/Game';
import { audio } from './game/audio';

const screens = {
  title: document.getElementById('screen-title')!,
  how: document.getElementById('screen-how')!,
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
const hint = document.getElementById('hint')!;
const btnWave = document.getElementById('btn-wave') as HTMLButtonElement;
const btnSpeed = document.getElementById('btn-speed') as HTMLButtonElement;
const btnMute = document.getElementById('btn-mute') as HTMLButtonElement;
const btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
const pauseStrip = document.getElementById('pause-strip')!;
const leaveStrip = document.getElementById('leave-strip')!;
const toastEl = document.getElementById('toast')!;
const towerShop = document.getElementById('tower-shop')!;
const shopPop = document.getElementById('shop-pop')!;
const shopPopSwatch = document.getElementById('shop-pop-swatch')!;
const shopPopName = document.getElementById('shop-pop-name')!;
const shopPopBlurb = document.getElementById('shop-pop-blurb')!;
const levelGrid = document.getElementById('level-grid')!;
const inspectPanel = document.getElementById('inspect-panel')!;
const selectionTitle = document.getElementById('selection-title')!;
const selectionStats = document.getElementById('selection-stats')!;
const towerActions = document.getElementById('tower-actions')!;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const game = new Game(canvas);

let activeLevelId = 1;
let resultWon = false;
let toastTimer = 0;

function showToast(message: string): void {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.add('hidden'), 2200);
}

function showScreen(name: keyof typeof screens): void {
  for (const [key, el] of Object.entries(screens)) {
    const active = key === name;
    el.classList.toggle('active', active);
    el.setAttribute('aria-hidden', active ? 'false' : 'true');
  }
  if (name !== 'game') {
    overlayResult.classList.add('hidden');
    pauseStrip.classList.add('hidden');
    leaveStrip.classList.add('hidden');
    toastEl.classList.add('hidden');
    shopPop.classList.add('hidden');
    inspectPanel.classList.add('hidden');
  }
}

function ensureProgress(): void {
  if (!localStorage.getItem('ptd-progress-v1')) saveProgress(1);
}

function renderLevels(): void {
  const unlocked = loadProgress();
  levelGrid.innerHTML = '';
  for (const level of LEVELS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-card';
    if (level.id < unlocked) btn.classList.add('cleared');
    btn.disabled = level.id > unlocked;
    btn.innerHTML = `<strong>Level ${level.id}</strong><span>${level.name}</span><span>${level.blurb}</span>`;
    btn.addEventListener('click', () => startLevel(level.id));
    levelGrid.appendChild(btn);
  }
}

function selectTowerKind(kind: TowerKind): void {
  game.selectedKind = kind;
  game.selectedTowerId = null;
  game.selectedEnemyId = null;
  audio.play('ui');
  syncShopSelection();
  updateHud();
  const def = TOWERS[kind];
  showToast(`${def.name} selected — tap open grass to place`);
}

function clearTowerKind(): void {
  game.selectedKind = null;
  audio.play('ui');
  syncShopSelection();
  updateHud();
}

function renderShop(): void {
  towerShop.innerHTML = '';
  for (const kind of TOWER_ORDER) {
    const def = TOWERS[kind];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tower-icon';
    btn.dataset.kind = kind;
    btn.title = `${def.name} — ${def.cost}g`;
    btn.innerHTML = `
      <span class="tower-swatch" data-kind="${kind}" style="background:linear-gradient(145deg,${def.color},${def.colorDark})"></span>
      <strong>${def.name}</strong>
      <span class="cost">${def.cost}g</span>
    `;
    btn.addEventListener('click', () => {
      if (game.selectedKind === kind) clearTowerKind();
      else selectTowerKind(kind);
    });
    towerShop.appendChild(btn);
  }
  syncShopSelection();
}

function syncShopSelection(): void {
  towerShop.querySelectorAll('.tower-icon').forEach((el) => {
    const btn = el as HTMLButtonElement;
    const kind = btn.dataset.kind as TowerKind;
    btn.classList.toggle('selected', game.selectedKind === kind);
    btn.style.opacity = game.level && game.gold < TOWERS[kind].cost ? '0.5' : '1';
  });

  if (game.selectedKind) {
    const def = TOWERS[game.selectedKind];
    shopPop.classList.remove('hidden');
    shopPopSwatch.setAttribute('data-kind', def.kind);
    shopPopSwatch.style.background = `linear-gradient(145deg,${def.color},${def.colorDark})`;
    shopPopName.textContent = `${def.name} · ${def.role}`;
    shopPopBlurb.textContent = `${def.cost}g — ${def.description}. Tap grass (not path, water, rocks, or trees).`;
  } else {
    shopPop.classList.add('hidden');
  }
}

function updatePauseUi(): void {
  const paused = game.phase === 'paused';
  pauseStrip.classList.toggle('hidden', !paused);
  btnPause.textContent = paused ? 'Paused' : 'Pause';
}

function updateHud(): void {
  if (!game.level) return;
  hudLevel.textContent = String(game.level.id);
  hudWave.textContent = `${game.waveIndex} / ${WAVES_PER_LEVEL}`;
  hudLives.textContent = String(game.lives);
  hudGold.textContent = String(game.gold);
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
  const showInspect = !!(tower || enemy);

  inspectPanel.classList.toggle('hidden', !showInspect);

  if (tower) {
    towerActions.classList.remove('hidden');
    selectionTitle.textContent = `${tower.def.name} · Lv ${tower.level}`;
    selectionStats.textContent = `${tower.def.role}\n${tower.def.description}\nDmg ${Math.round(tower.damage)} · Range ${Math.round(tower.range)} · ${tower.fireRate.toFixed(1)}/s\nUpgrade ${tower.level >= 3 ? 'MAX' : tower.upgradeCost() + 'g'} · Sell ${tower.sellValue()}g`;
    const up = document.getElementById('btn-upgrade') as HTMLButtonElement;
    up.disabled = tower.level >= 3 || game.gold < tower.upgradeCost();
    up.textContent = tower.level >= 3 ? 'Max level' : `Upgrade (${tower.upgradeCost()}g)`;
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
    selectionStats.textContent = `${def.blurb}\nHP ${Math.ceil(enemy.hp)} / ${enemy.maxHp}\nArmor ${Math.round(def.armor * 100)}% · Speed ${def.speed}\nReward ${def.reward}g${effects ? `\nStatus: ${effects}` : ''}`;
  }

  if (game.selectedKind) {
    hint.textContent = `Placing ${TOWERS[game.selectedKind].name}`;
  } else if (tower) {
    hint.textContent = 'Tower selected';
  } else if (enemy) {
    hint.textContent = 'Enemy inspected';
  } else {
    hint.textContent = 'Pick a tower';
  }
  syncShopSelection();
  btnMute.textContent = audio.muted ? 'Muted' : 'Sound on';
}

function startLevel(id: number): void {
  activeLevelId = id;
  showScreen('game');
  overlayResult.classList.add('hidden');
  leaveStrip.classList.add('hidden');
  game.startLevel(id);
  updateHud();
  showToast(`Level ${id}: ${LEVELS.find((l) => l.id === id)?.name ?? ''}`);
}

game.onHud = updateHud;
game.onToast = showToast;
game.onResult = (won) => {
  resultWon = won;
  overlayResult.classList.remove('hidden');
  if (won) {
    resultTitle.textContent = activeLevelId >= LEVELS.length ? 'Campaign clear!' : 'Level cleared';
    resultBody.textContent =
      activeLevelId >= LEVELS.length
        ? 'You held the last bastion. Indie victory — nicely done.'
        : `Level ${activeLevelId} survived. Next map unlocked.`;
    btnResultPrimary.textContent =
      activeLevelId >= LEVELS.length ? 'Back to levels' : 'Next level';
  } else {
    resultTitle.textContent = 'Base fallen';
    resultBody.textContent = 'Enemies leaked through. Rebuild with a wider tower mix.';
    btnResultPrimary.textContent = 'Retry';
  }
};

btnSpeed.addEventListener('click', () => {
  game.timeScale = game.timeScale >= 2 ? 1 : 2;
  btnSpeed.textContent = `Speed ${game.timeScale}x`;
  audio.play('ui');
});

btnMute.addEventListener('click', () => {
  audio.toggleMute();
  updateHud();
  if (!audio.muted) audio.play('ui');
});

document.querySelectorAll('[data-action]').forEach((el) => {
  el.addEventListener('click', () => {
    const action = (el as HTMLElement).dataset.action;
    if (action === 'title') showScreen('title');
    if (action === 'how') showScreen('how');
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
  audio.play('ui');
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
document.getElementById('btn-shop-clear')!.addEventListener('click', () => clearTowerKind());

btnResultPrimary.addEventListener('click', () => {
  overlayResult.classList.add('hidden');
  if (resultWon) {
    if (activeLevelId >= LEVELS.length) {
      renderLevels();
      showScreen('levels');
      game.stopLoop();
    } else {
      startLevel(activeLevelId + 1);
    }
  } else {
    startLevel(activeLevelId);
  }
});

canvas.addEventListener('pointermove', (e) => {
  game.hover = game.canvasToCell(e.clientX, e.clientY);
});
canvas.addEventListener('pointerleave', () => {
  game.hover = null;
});
canvas.addEventListener('click', (e) => {
  if (game.selectEnemyAt(e.clientX, e.clientY)) return;
  const cell = game.canvasToCell(e.clientX, e.clientY);
  if (game.selectTowerAt(cell.c, cell.r)) return;
  game.tryPlace(cell.c, cell.r);
});

ensureProgress();
renderShop();
renderLevels();
showScreen('title');
updateHud();

declare global {
  interface Window {
    __PTD?: { game: Game; startLevel: (id: number) => void };
  }
}
window.__PTD = { game, startLevel };
