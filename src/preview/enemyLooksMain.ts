import { ENEMY_GALLERY } from './enemyGallery';
import { drawEnemyLook } from './drawEnemyLooks';
import './enemyLooks.css';

const gallery = document.getElementById('gallery')!;
const picksEl = document.getElementById('picks')!;
const picks: Record<string, string> = {};
const canvases: { canvas: HTMLCanvasElement; kind: string; look: string }[] = [];

for (const kind of ENEMY_GALLERY) {
  const section = document.createElement('section');
  section.className = 'kind';
  const lane = kind.lane === 'air' ? 'FLYING' : 'GROUND';
  section.innerHTML = `<h2><span class="lane ${kind.lane}">${lane}</span> ${kind.title}</h2>
    <p class="role">${kind.role}</p>`;
  const row = document.createElement('div');
  row.className = 'row';
  for (const look of kind.looks) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card';
    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 300;
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = look.name;
    const blurb = document.createElement('div');
    blurb.className = 'blurb';
    blurb.textContent = look.blurb;
    btn.append(canvas, name, blurb);
    btn.addEventListener('click', () => {
      picks[kind.id] = look.name;
      row.querySelectorAll('.card').forEach((el) => el.classList.remove('picked'));
      btn.classList.add('picked');
      syncPicks();
    });
    row.append(btn);
    canvases.push({ canvas, kind: kind.id, look: look.id });
  }
  section.append(row);
  gallery.append(section);
}

function syncPicks(): void {
  const parts = ENEMY_GALLERY.map((k) => {
    const v = picks[k.id];
    return v ? `${k.id}: ${v}` : `${k.id}: —`;
  });
  picksEl.innerHTML = `<strong>Your picks</strong> — ${parts.join(' · ')}`;
}

function tick(now: number): void {
  const t = now / 1000;
  for (const item of canvases) {
    const ctx = item.canvas.getContext('2d');
    if (!ctx) continue;
    drawEnemyLook(ctx, item.kind, item.look, t);
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
