import './style.css';
import {
  BARRACKS,
  BARRACKS_ORDER,
  BARRACKS_SPECS,
  ENEMIES,
  TOWER_ORDER,
  TOWER_SPECS,
  TOWERS,
  WAVES_PER_LEVEL,
  airGroundLabel,
  isTowerKind,
  placeableColor,
  placeableCost,
  placeableName,
  type BarracksSpecId,
  type PlaceableKind,
  type TargetingMode,
  type TowerSpecId,
} from './game/constants';
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
const barracksShop = document.getElementById('barracks-shop')!;
const shopPop = document.getElementById('shop-pop')!;
const shopPopSwatch = document.getElementById('shop-pop-swatch')!;
const shopPopName = document.getElementById('shop-pop-name')!;
const shopPopBlurb = document.getElementById('shop-pop-blurb')!;
const levelGrid = document.getElementById('level-grid')!;
const inspectPanel = document.getElementById('inspect-panel')!;
const selectionTitle = document.getElementById('selection-title')!;
const selectionRole = document.getElementById('selection-role')!;
const selectionStats = document.getElementById('selection-stats')!;
const towerActions = document.getElementById('tower-actions')!;
const targetingActions = document.getElementById('targeting-actions')!;
const specActions = document.getElementById('spec-actions')!;
const btnUpgrade = document.getElementById('btn-upgrade') as HTMLButtonElement;
const btnSpecA = document.getElementById('btn-spec-a') as HTMLButtonElement;
const btnSpecB = document.getElementById('btn-spec-b') as HTMLButtonElement;
const btnSetFlag = document.getElementById('btn-set-flag') as HTMLButtonElement;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const game = new Game(canvas);

let activeLevelId = 1;
let resultWon = false;
let toastTimer = 0;
let pendingSpecA: TowerSpecId | BarracksSpecId | null = null;
let pendingSpecB: TowerSpecId | BarracksSpecId | null = null;
let pendingSpecIsBarracks = false;

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
    btn.innerHTML = `<span class="biome-chip">${level.theme}</span><strong>Level ${level.id} · ${level.name}</strong><span>${level.blurb}</span>`;
    btn.addEventListener('click', () => startLevel(level.id));
    levelGrid.appendChild(btn);
  }
}

function selectPlaceable(kind: PlaceableKind): void {
  game.selectedKind = kind;
  game.selectedTowerId = null;
  game.selectedBarracksId = null;
  game.selectedEnemyId = null;
  game.rallyModeBarracksId = null;
  audio.play('ui');
  syncShopSelection();
  updateHud();
  showToast(`${placeableName(kind)} selected — tap open grass to place`);
}

function clearPlaceable(): void {
  game.selectedKind = null;
  audio.play('ui');
  syncShopSelection();
  updateHud();
}

function shortShopName(kind: PlaceableKind): string {
  if (kind === 'warriorBarracks') return 'Warrior';
  if (kind === 'knightBarracks') return 'Knight';
  if (kind === 'paladinBarracks') return 'Paladin';
  if (kind === 'light') return 'Radiant';
  if (kind === 'dark') return 'Void';
  return placeableName(kind);
}

function makeShopButton(kind: PlaceableKind): HTMLButtonElement {
  const cost = placeableCost(kind);
  const colors = placeableColor(kind);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tower-icon';
  btn.dataset.kind = kind;
  btn.title = `${placeableName(kind)} — ${cost}g`;
  btn.innerHTML = `
      <span class="tower-swatch" data-kind="${kind}" style="background:linear-gradient(145deg,${colors.color},${colors.colorDark})"></span>
      <strong>${shortShopName(kind)}</strong>
      <span class="cost">${cost}g</span>
    `;
  btn.addEventListener('click', () => {
    if (game.selectedKind === kind) clearPlaceable();
    else selectPlaceable(kind);
  });
  return btn;
}

function renderShop(): void {
  towerShop.innerHTML = '';
  barracksShop.innerHTML = '';
  for (const kind of TOWER_ORDER) towerShop.appendChild(makeShopButton(kind));
  for (const kind of BARRACKS_ORDER) barracksShop.appendChild(makeShopButton(kind));
  syncShopSelection();
}

function syncShopButton(btn: HTMLButtonElement): void {
  const kind = btn.dataset.kind as PlaceableKind;
  btn.classList.toggle('selected', game.selectedKind === kind);
  btn.style.opacity = game.level && game.gold < placeableCost(kind) ? '0.5' : '1';
}

function syncShopSelection(): void {
  towerShop.querySelectorAll('.tower-icon').forEach((el) => syncShopButton(el as HTMLButtonElement));
  barracksShop
    .querySelectorAll('.tower-icon')
    .forEach((el) => syncShopButton(el as HTMLButtonElement));

  if (game.selectedKind) {
    const kind = game.selectedKind;
    const colors = placeableColor(kind);
    shopPop.classList.remove('hidden');
    shopPopSwatch.setAttribute('data-kind', kind);
    shopPopSwatch.style.background = `linear-gradient(145deg,${colors.color},${colors.colorDark})`;
    if (isTowerKind(kind)) {
      const def = TOWERS[kind];
      shopPopName.textContent = `${def.name} · ${def.role}`;
      shopPopBlurb.textContent = `${def.cost}g · ${airGroundLabel(def)} · Dmg ${def.damage} · Range ${def.range} · ${def.fireRate}/s · Splash ${def.splash > 0 ? Math.round(def.splash) : 'none'}. ${def.description}`;
    } else {
      const def = BARRACKS[kind];
      shopPopName.textContent = `${def.name} · ${def.role}`;
      shopPopBlurb.textContent = `${def.cost}g · 3 ${def.unit.name}s · HP ${def.unit.hp} · Dmg ${def.unit.damage} · Rally ${def.rallyRadius}. ${def.description}`;
    }
  } else {
    shopPop.classList.add('hidden');
  }
}

function updatePauseUi(): void {
  const paused = game.phase === 'paused';
  pauseStrip.classList.toggle('hidden', !paused);
  pauseStrip.querySelector('span')!.textContent =
    'Paused — build, upgrade, and plan freely. Map stays visible.';
  btnPause.textContent = paused ? 'Paused' : 'Pause';
}

function effectLines(tower: ReturnType<Game['getSelectedTower']>): string {
  if (!tower) return '';
  const bits: string[] = [];
  if (tower.splash > 0) bits.push(`Splash ${Math.round(tower.splash)}`);
  else if (tower.chain > 0) bits.push(`Chain ${tower.chain}`);
  else bits.push('Single target');
  if (tower.slow > 0) bits.push(`Slow ${Math.round(tower.slow * 100)}%`);
  if (tower.burnDps > 0) bits.push(`Burn ${tower.burnDps.toFixed(0)}/s`);
  if (tower.poisonDps > 0) bits.push(`Poison ${tower.poisonDps.toFixed(0)}/s`);
  if (tower.curseDps > 0) bits.push(`Curse ${tower.curseDps.toFixed(0)}/s`);
  if (tower.armorShred > 0) bits.push(`Shred ${Math.round(tower.armorShred * 100)}%`);
  if (tower.goldOnHit > 0) bits.push(`+${tower.goldOnHit}g/hit`);
  if (tower.def.pierceArmor) bits.push('Pierce armor');
  return bits.join(' · ');
}

function updateHud(): void {
  if (!game.level) return;
  const prevGold = Number(hudGold.textContent);
  hudLevel.textContent = String(game.level.id);
  hudWave.textContent = `${game.waveIndex} / ${WAVES_PER_LEVEL}`;
  hudLives.textContent = String(game.lives);
  hudGold.textContent = String(game.gold);
  if (Number.isFinite(prevGold) && prevGold !== game.gold) {
    hudGold.classList.remove('pulse');
    void hudGold.offsetWidth;
    hudGold.classList.add('pulse');
  }
  const livesBlock = hudLives.parentElement;
  livesBlock?.classList.toggle('lives-low', game.lives <= 5);
  btnWave.disabled = !game.canStartWave();
  btnWave.textContent =
    game.waveIndex >= WAVES_PER_LEVEL
      ? 'Complete'
      : game.phase === 'wave'
        ? 'Wave running…'
        : `Start wave ${game.waveIndex + 1}`;
  updatePauseUi();

  const tower = game.getSelectedTower();
  const barracks = game.getSelectedBarracks();
  const enemy = game.getSelectedEnemy();
  const showInspect = !!(tower || barracks || enemy);

  inspectPanel.classList.toggle('hidden', !showInspect);
  pendingSpecA = null;
  pendingSpecB = null;
  pendingSpecIsBarracks = false;

  if (tower) {
    towerActions.classList.remove('hidden');
    targetingActions.classList.remove('hidden');
    btnSetFlag.classList.add('hidden');
    const needSpec = tower.needsSpec();
    btnUpgrade.classList.toggle('hidden', needSpec);
    specActions.classList.toggle('hidden', !needSpec);

    selectionTitle.textContent = `${tower.displayName} · Lv ${tower.level}`;
    selectionRole.textContent = `${tower.def.role} · ${airGroundLabel(tower.def)}`;
    const upLine = needSpec
      ? `Choose a skill path (${tower.specCost()}g)`
      : tower.level >= 3
        ? tower.spec
          ? `Specialized · Sell ${tower.sellValue()}g`
          : `Max level · Sell ${tower.sellValue()}g`
        : `Upgrade ${tower.upgradeCost()}g · Sell ${tower.sellValue()}g`;
    selectionStats.textContent = `${tower.def.description}\nDmg ${Math.round(tower.damage)} · Range ${Math.round(tower.range)} · ${tower.fireRate.toFixed(1)}/s\n${effectLines(tower)}\n${upLine}`;

    document.querySelectorAll('#targeting-actions .btn').forEach((el) => {
      const btn = el as HTMLButtonElement;
      btn.classList.toggle('selected', btn.dataset.target === tower.targeting);
    });

    if (needSpec) {
      const [a, b] = TOWER_SPECS[tower.kind];
      pendingSpecA = a.id;
      pendingSpecB = b.id;
      const cost = tower.specCost();
      btnSpecA.innerHTML = `<strong>${a.name}</strong><span>${a.description}</span><em>${cost}g</em>`;
      btnSpecB.innerHTML = `<strong>${b.name}</strong><span>${b.description}</span><em>${cost}g</em>`;
      btnSpecA.disabled = game.gold < cost;
      btnSpecB.disabled = game.gold < cost;
    } else {
      btnUpgrade.disabled = tower.level >= 3 || game.gold < tower.upgradeCost();
      btnUpgrade.textContent =
        tower.level >= 3
          ? tower.spec
            ? 'Specialized'
            : 'Max level'
          : `Upgrade (${tower.upgradeCost()}g)`;
    }
  } else if (barracks) {
    towerActions.classList.remove('hidden');
    targetingActions.classList.add('hidden');
    const needSpec = barracks.needsSpec();
    btnUpgrade.classList.toggle('hidden', needSpec);
    specActions.classList.toggle('hidden', !needSpec);
    btnSetFlag.classList.remove('hidden');
    const living = game.friendlies.filter((u) => u.barracksId === barracks.id && u.alive).length;
    const cap = barracks.def.unitCap;
    selectionTitle.textContent = `${barracks.displayName} · Lv ${barracks.level}`;
    selectionRole.textContent = `${barracks.def.role} · Ground blockers · Cap ${cap}`;
    const upLine = needSpec
      ? `Choose a skill path (${barracks.specCost()}g)`
      : barracks.level >= 3
        ? barracks.spec
          ? `Specialized · Sell ${barracks.sellValue()}g`
          : `Max level · Sell ${barracks.sellValue()}g`
        : `Upgrade ${barracks.upgradeCost()}g · Sell ${barracks.sellValue()}g`;
    selectionStats.textContent = `${barracks.def.description}\nTroops ${living}/${cap} · Respawn ${barracks.def.respawnTime}s · Rally ${Math.round(barracks.rallyRadius)}\n${barracks.def.unit.name}: HP ${barracks.unitHp()} · Dmg ${Math.round(barracks.unitDamage())} · ${barracks.unitAttackRate().toFixed(1)}/s\n${upLine}`;
    if (needSpec) {
      pendingSpecIsBarracks = true;
      const [a, b] = BARRACKS_SPECS[barracks.kind];
      pendingSpecA = a.id;
      pendingSpecB = b.id;
      const cost = barracks.specCost();
      btnSpecA.innerHTML = `<strong>${a.name}</strong><span>${a.description}</span><em>${cost}g</em>`;
      btnSpecB.innerHTML = `<strong>${b.name}</strong><span>${b.description}</span><em>${cost}g</em>`;
      btnSpecA.disabled = game.gold < cost;
      btnSpecB.disabled = game.gold < cost;
    } else {
      btnUpgrade.disabled = barracks.level >= 3 || game.gold < barracks.upgradeCost();
      btnUpgrade.textContent =
        barracks.level >= 3
          ? barracks.spec
            ? 'Specialized'
            : 'Max level'
          : `Upgrade (${barracks.upgradeCost()}g)`;
    }
    btnSetFlag.textContent =
      game.rallyModeBarracksId === barracks.id ? 'Cancel Flag' : 'Set Flag';
  } else if (enemy) {
    towerActions.classList.add('hidden');
    targetingActions.classList.add('hidden');
    const def = ENEMIES[enemy.kind];
    const effects = [
      enemy.flying ? 'flying' : '',
      enemy.undead ? 'undead' : '',
      enemy.slowMul < 1 ? 'chilled' : '',
      enemy.burnTimer > 0 ? 'burning' : '',
      enemy.poisonTimer > 0 ? 'poisoned' : '',
      enemy.curseTimer > 0 ? 'cursed' : '',
      enemy.armorShred > 0 ? 'shredded' : '',
      enemy.blocked ? 'blocked' : '',
    ]
      .filter(Boolean)
      .join(', ');
    selectionTitle.textContent = def.name;
    selectionRole.textContent = enemy.flying ? 'Flying enemy' : 'Ground enemy';
    selectionStats.textContent = `${def.blurb}\nHP ${Math.ceil(enemy.hp)} / ${enemy.maxHp}\nArmor ${Math.round(enemy.armor * 100)}% · Speed ${def.speed}\nReward ${def.reward}g${effects ? `\nStatus: ${effects}` : ''}`;
  }

  if (game.rallyModeBarracksId != null) {
    hint.textContent = 'Tap path inside circle for rally flag';
  } else if (game.phase === 'paused') {
    hint.textContent = 'Paused — build and plan freely';
  } else if (game.selectedKind) {
    hint.textContent = `Placing ${placeableName(game.selectedKind)}`;
  } else if (tower) {
    hint.textContent = tower.needsSpec() ? 'Choose a skill path' : 'Tower selected';
  } else if (barracks) {
    hint.textContent = barracks.needsSpec() ? 'Choose a barracks path' : 'Barracks selected';
  } else if (enemy) {
    hint.textContent = 'Enemy inspected';
  } else {
    hint.textContent = 'Pick a tower or barracks';
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
  const panel = document.getElementById('result-panel')!;
  const eyebrow = document.getElementById('result-eyebrow')!;
  panel.classList.toggle('won', won);
  panel.classList.toggle('lost', !won);
  eyebrow.textContent = won ? 'Victory' : 'Defeat';
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

btnUpgrade.addEventListener('click', () => game.upgradeSelected());
btnSpecA.addEventListener('click', () => {
  if (!pendingSpecA) return;
  if (pendingSpecIsBarracks) game.applyBarracksSpec(pendingSpecA as BarracksSpecId);
  else game.applySpec(pendingSpecA as TowerSpecId);
});
btnSpecB.addEventListener('click', () => {
  if (!pendingSpecB) return;
  if (pendingSpecIsBarracks) game.applyBarracksSpec(pendingSpecB as BarracksSpecId);
  else game.applySpec(pendingSpecB as TowerSpecId);
});
btnSetFlag.addEventListener('click', () => {
  if (game.rallyModeBarracksId != null) game.cancelRallyMode();
  else game.beginRallyMode();
  updateHud();
});
document.querySelectorAll('#targeting-actions .btn').forEach((el) => {
  el.addEventListener('click', () => {
    const mode = (el as HTMLElement).dataset.target as TargetingMode;
    game.setTargeting(mode);
  });
});
document.getElementById('btn-sell')!.addEventListener('click', () => game.sellSelected());
document.getElementById('btn-deselect')!.addEventListener('click', () => {
  game.selectedTowerId = null;
  game.selectedBarracksId = null;
  game.selectedEnemyId = null;
  game.cancelRallyMode();
  updateHud();
});
document.getElementById('btn-shop-clear')!.addEventListener('click', () => clearPlaceable());

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
  if (game.rallyModeBarracksId != null) {
    game.trySetRally(e.clientX, e.clientY);
    return;
  }
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
