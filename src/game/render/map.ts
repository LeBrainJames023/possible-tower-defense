import {
  COLS,
  MAP_H,
  MAP_W,
  ROWS,
  TILE,
  type BiomeTheme,
  type CellKind,
  type TowerKind,
  TOWERS,
} from '../constants';
import { hash2, roundRect } from './shapes';
import type { Vec2 } from '../../shared/math';

interface BiomePalette {
  sky0: string;
  sky1: string;
  grassA: string;
  grassB: string;
  grassSpeck: string;
  pathA: string;
  pathB: string;
  pathGlow: string;
  waterA: string;
  waterB: string;
  mountain: string;
  hill: string;
}

const PALETTES: Record<BiomeTheme, BiomePalette> = {
  meadow: {
    sky0: '#0c1a14',
    sky1: '#132a1c',
    grassA: '#1f4a32',
    grassB: '#1a3f2b',
    grassSpeck: 'rgba(140, 220, 160, 0.14)',
    pathA: '#4a3a2a',
    pathB: '#5c4a36',
    pathGlow: 'rgba(244, 196, 100, 0.22)',
    waterA: '#1a4a5c',
    waterB: '#2a6a7a',
    mountain: '#1a2830',
    hill: '#243d30',
  },
  river: {
    sky0: '#0a1620',
    sky1: '#123040',
    grassA: '#1a4334',
    grassB: '#163a2c',
    grassSpeck: 'rgba(120, 200, 170, 0.12)',
    pathA: '#3f3428',
    pathB: '#524436',
    pathGlow: 'rgba(120, 190, 220, 0.2)',
    waterA: '#14607a',
    waterB: '#2a90b0',
    mountain: '#1a3040',
    hill: '#1e3d38',
  },
  forest: {
    sky0: '#081410',
    sky1: '#0e2218',
    grassA: '#163828',
    grassB: '#123022',
    grassSpeck: 'rgba(80, 180, 110, 0.1)',
    pathA: '#3a2e22',
    pathB: '#4a3c2e',
    pathGlow: 'rgba(100, 180, 120, 0.18)',
    waterA: '#0e3a40',
    waterB: '#1a5560',
    mountain: '#14241c',
    hill: '#1a3024',
  },
  mist: {
    sky0: '#121820',
    sky1: '#1a2834',
    grassA: '#1e3438',
    grassB: '#182c30',
    grassSpeck: 'rgba(180, 210, 220, 0.1)',
    pathA: '#3a4048',
    pathB: '#4a5058',
    pathGlow: 'rgba(180, 200, 220, 0.2)',
    waterA: '#2a4050',
    waterB: '#3a5870',
    mountain: '#222e38',
    hill: '#283640',
  },
  swamp: {
    sky0: '#101808',
    sky1: '#1a2810',
    grassA: '#2a3a18',
    grassB: '#223214',
    grassSpeck: 'rgba(160, 180, 60, 0.1)',
    pathA: '#3a3420',
    pathB: '#4a4430',
    pathGlow: 'rgba(160, 180, 80, 0.16)',
    waterA: '#1a3a28',
    waterB: '#2a5a40',
    mountain: '#1a2818',
    hill: '#243420',
  },
  haunted: {
    sky0: '#140818',
    sky1: '#221030',
    grassA: '#241830',
    grassB: '#1c1228',
    grassSpeck: 'rgba(180, 120, 220, 0.1)',
    pathA: '#3a3040',
    pathB: '#4a4050',
    pathGlow: 'rgba(180, 100, 220, 0.2)',
    waterA: '#2a1840',
    waterB: '#3a2860',
    mountain: '#201028',
    hill: '#2a1834',
  },
  ice: {
    sky0: '#0c1828',
    sky1: '#183848',
    grassA: '#d8e8f0',
    grassB: '#c4d8e4',
    grassSpeck: 'rgba(255, 255, 255, 0.35)',
    pathA: '#7a9aaa',
    pathB: '#9ab8c8',
    pathGlow: 'rgba(160, 220, 255, 0.28)',
    waterA: '#3a7a9a',
    waterB: '#5aa0c0',
    mountain: '#2a4050',
    hill: '#a8c4d4',
  },
  alpine: {
    sky0: '#101828',
    sky1: '#1c3048',
    grassA: '#c8d8e0',
    grassB: '#b0c4d0',
    grassSpeck: 'rgba(255, 255, 255, 0.28)',
    pathA: '#6a7a88',
    pathB: '#8898a8',
    pathGlow: 'rgba(140, 180, 220, 0.24)',
    waterA: '#2a6080',
    waterB: '#4080a0',
    mountain: '#1a2838',
    hill: '#90a8b8',
  },
  volcanic: {
    sky0: '#1a0808',
    sky1: '#2a1010',
    grassA: '#2a1810',
    grassB: '#221410',
    grassSpeck: 'rgba(255, 100, 40, 0.12)',
    pathA: '#2a2420',
    pathB: '#3a322c',
    pathGlow: 'rgba(255, 120, 40, 0.22)',
    waterA: '#8a2010',
    waterB: '#d04018',
    mountain: '#1a1010',
    hill: '#2a1814',
  },
  bastion: {
    sky0: '#120a0a',
    sky1: '#241210',
    grassA: '#241818',
    grassB: '#1c1212',
    grassSpeck: 'rgba(255, 80, 40, 0.1)',
    pathA: '#3a3030',
    pathB: '#4a3e3a',
    pathGlow: 'rgba(255, 140, 60, 0.2)',
    waterA: '#6a1808',
    waterB: '#a82810',
    mountain: '#181010',
    hill: '#281818',
  },
};

function isSnow(theme: BiomeTheme): boolean {
  return theme === 'ice' || theme === 'alpine';
}

function isLavaWater(theme: BiomeTheme): boolean {
  return theme === 'volcanic' || theme === 'bastion';
}

export function clearBackdrop(ctx: CanvasRenderingContext2D, theme: BiomeTheme, time: number): void {
  const p = PALETTES[theme];
  const g = ctx.createLinearGradient(0, 0, 0, MAP_H);
  g.addColorStop(0, p.sky0);
  g.addColorStop(1, p.sky1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // Distant mountains
  ctx.fillStyle = p.mountain;
  ctx.beginPath();
  ctx.moveTo(0, 140);
  ctx.lineTo(80, 70);
  ctx.lineTo(160, 120);
  ctx.lineTo(260, 50);
  ctx.lineTo(360, 110);
  ctx.lineTo(480, 40);
  ctx.lineTo(600, 100);
  ctx.lineTo(720, 55);
  ctx.lineTo(840, 115);
  ctx.lineTo(960, 70);
  ctx.lineTo(960, 180);
  ctx.lineTo(0, 180);
  ctx.closePath();
  ctx.fill();

  // Soft hills
  ctx.fillStyle = p.hill;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  for (let x = 0; x <= MAP_W; x += 40) {
    const y = 175 + Math.sin(x * 0.012 + time * 0.15) * 12 + Math.cos(x * 0.03) * 8;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(MAP_W, 220);
  ctx.lineTo(0, 220);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  if (theme === 'mist' || theme === 'haunted') {
    ctx.fillStyle = theme === 'haunted' ? 'rgba(80, 40, 100, 0.12)' : 'rgba(180, 200, 220, 0.1)';
    ctx.fillRect(0, 0, MAP_W, MAP_H);
  }
}

function drawGrassTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  c: number,
  r: number,
  theme: BiomeTheme,
  showBuildHints: boolean,
): void {
  const p = PALETTES[theme];
  const h = hash2(c, r);
  ctx.fillStyle = (c + r) % 2 === 0 ? p.grassA : p.grassB;
  ctx.fillRect(x, y, TILE, TILE);

  ctx.fillStyle = p.grassSpeck;
  for (let i = 0; i < 5; i++) {
    const ox = 6 + ((h * (i + 3) * 97) % 36);
    const oy = 6 + ((h * (i + 7) * 53) % 36);
    const s = 1.2 + (h * (i + 1)) % 2.2;
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny grass blades
  if (!isSnow(theme) && !isLavaWater(theme)) {
    ctx.strokeStyle = 'rgba(160, 220, 140, 0.22)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const bx = x + 8 + ((h * (i + 11) * 37) % 32);
      const by = y + 14 + ((h * (i + 19) * 29) % 26);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 1.5, by - 5);
      ctx.stroke();
    }
  }

  if (isSnow(theme)) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 4, y + 4, TILE - 8, 3);
  }

  if (showBuildHints) {
    ctx.strokeStyle = 'rgba(244, 211, 94, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 6, y + 6, TILE - 12, TILE - 12);
  }
}

function drawPathTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  c: number,
  r: number,
  theme: BiomeTheme,
): void {
  const p = PALETTES[theme];
  const h = hash2(c + 11, r + 3);
  ctx.fillStyle = p.pathA;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = p.pathB;
  roundRect(ctx, x + 3, y + 3, TILE - 6, TILE - 6, 4);
  ctx.fill();

  ctx.fillStyle = isSnow(theme)
    ? 'rgba(220, 240, 255, 0.2)'
    : isLavaWater(theme)
      ? 'rgba(255, 120, 40, 0.08)'
      : 'rgba(255, 220, 140, 0.08)';
  for (let i = 0; i < 3; i++) {
    const ox = 8 + ((h * (i + 2) * 41) % 28);
    const oy = 8 + ((h * (i + 5) * 29) % 28);
    ctx.fillRect(x + ox, y + oy, 4, 3);
  }
}

function drawWaterTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  c: number,
  r: number,
  theme: BiomeTheme,
  time: number,
): void {
  const p = PALETTES[theme];
  const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
  g.addColorStop(0, p.waterA);
  g.addColorStop(1, p.waterB);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, TILE, TILE);

  ctx.strokeStyle = isLavaWater(theme)
    ? 'rgba(255, 200, 80, 0.35)'
    : 'rgba(180, 230, 255, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const phase = time * 2 + c * 0.7 + r * 0.4;
  ctx.moveTo(x + 4, y + 16 + Math.sin(phase) * 3);
  ctx.quadraticCurveTo(x + 24, y + 12 + Math.cos(phase) * 4, x + 44, y + 18 + Math.sin(phase + 1) * 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 30 + Math.cos(phase) * 2);
  ctx.quadraticCurveTo(x + 28, y + 34 + Math.sin(phase) * 3, x + 42, y + 28);
  ctx.stroke();
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: BiomeTheme,
  variant: number,
): void {
  if (theme === 'haunted' || theme === 'swamp') {
    ctx.strokeStyle = '#3a2a20';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 14);
    ctx.lineTo(cx - 2, cy - 6);
    ctx.lineTo(cx - 12, cy - 14);
    ctx.moveTo(cx - 2, cy - 2);
    ctx.lineTo(cx + 10, cy - 12);
    ctx.stroke();
    ctx.fillStyle = theme === 'haunted' ? 'rgba(120, 60, 140, 0.35)' : 'rgba(80, 100, 40, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 10, 6, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 8, 5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (isSnow(theme)) {
    ctx.fillStyle = '#5c4030';
    ctx.fillRect(cx - 3, cy + 2, 6, 12);
    ctx.fillStyle = '#dfefff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 18);
    ctx.lineTo(cx + 14, cy + 4);
    ctx.lineTo(cx - 14, cy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c8dff0';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 11, cy + 6);
    ctx.lineTo(cx - 11, cy + 6);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (isLavaWater(theme)) {
    ctx.fillStyle = '#2a2420';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 12);
    ctx.lineTo(cx - 4, cy - 4);
    ctx.lineTo(cx + 2, cy + 8);
    ctx.lineTo(cx + 8, cy - 2);
    ctx.lineTo(cx + 12, cy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 100, 40, 0.45)';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 4 + variant * 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = '#5c3d2e';
  ctx.fillRect(cx - 3, cy + 2, 6, 10);
  const canopy = ctx.createRadialGradient(cx - 2, cy - 6, 2, cx, cy - 2, 16);
  canopy.addColorStop(0, theme === 'forest' ? '#2f7a48' : '#3f8f5a');
  canopy.addColorStop(1, '#1f4d30');
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 13 + variant * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - 8, cy + 2, 8 + variant, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy + 2, 8 + variant, 0, Math.PI * 2);
  ctx.fill();
}

/** Soft mountain ridge over the top of the map (drawn after tiles so it stays visible). */
function drawHorizonOverlay(ctx: CanvasRenderingContext2D, theme: BiomeTheme): void {
  const p = PALETTES[theme];
  ctx.fillStyle = p.mountain;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 70);
  ctx.lineTo(90, 28);
  ctx.lineTo(180, 78);
  ctx.lineTo(300, 18);
  ctx.lineTo(420, 72);
  ctx.lineTo(540, 22);
  ctx.lineTo(680, 80);
  ctx.lineTo(800, 30);
  ctx.lineTo(960, 68);
  ctx.lineTo(960, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = p.hill;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(120, 55);
  ctx.lineTo(260, 95);
  ctx.lineTo(400, 48);
  ctx.lineTo(560, 92);
  ctx.lineTo(720, 50);
  ctx.lineTo(880, 88);
  ctx.lineTo(960, 60);
  ctx.lineTo(960, 110);
  ctx.lineTo(0, 110);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: CellKind[][],
  theme: BiomeTheme,
  hover: { c: number; r: number } | null,
  canPlace: boolean,
  selectedKind: TowerKind | null,
  showBuildHints: boolean,
  time: number,
): void {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE;
      const y = r * TILE;
      const kind = grid[r][c];
      if (kind === 'grass') {
        drawGrassTile(ctx, x, y, c, r, theme, showBuildHints);
      } else if (kind === 'path') {
        drawPathTile(ctx, x, y, c, r, theme);
      } else if (kind === 'water') {
        drawGrassTile(ctx, x, y, c, r, theme, false);
        drawWaterTile(ctx, x, y, c, r, theme, time);
      } else {
        drawGrassTile(ctx, x, y, c, r, theme, false);
        drawTree(ctx, x + TILE / 2, y + TILE / 2 + 2, theme, hash2(c, r) > 0.5 ? 1 : 0);
      }
    }
  }

  drawHorizonOverlay(ctx, theme);

  if (hover && selectedKind) {
    const x = hover.c * TILE;
    const y = hover.r * TILE;
    ctx.fillStyle = canPlace ? 'rgba(87, 204, 153, 0.32)' : 'rgba(239, 71, 111, 0.32)';
    ctx.fillRect(x, y, TILE, TILE);
    ctx.strokeStyle = canPlace ? '#57cc99' : '#ef476f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 2, y + 2, TILE - 4, TILE - 4);
    if (canPlace) {
      const def = TOWERS[selectedKind];
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + TILE / 2, def.range, 0, Math.PI * 2);
      ctx.strokeStyle = `${def.color}66`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

export function drawPathGlow(
  ctx: CanvasRenderingContext2D,
  waypoints: Vec2[],
  theme: BiomeTheme,
): void {
  if (waypoints.length < 2) return;
  const p = PALETTES[theme];
  ctx.strokeStyle = p.pathGlow;
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
  ctx.stroke();
}

export function drawSpawnExit(ctx: CanvasRenderingContext2D, waypoints: Vec2[]): void {
  if (waypoints.length < 2) return;
  const s = waypoints[0];
  const e = waypoints[waypoints.length - 1];
  const sg = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, 26);
  sg.addColorStop(0, 'rgba(91, 159, 212, 1)');
  sg.addColorStop(1, 'rgba(91, 159, 212, 0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dfefff';
  ctx.font = 'bold 11px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IN', s.x, s.y - 28);

  const eg = ctx.createRadialGradient(e.x, e.y, 2, e.x, e.y, 28);
  eg.addColorStop(0, 'rgba(239, 71, 111, 1)');
  eg.addColorStop(1, 'rgba(239, 71, 111, 0)');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(e.x, e.y, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd6e0';
  ctx.fillText('BASE', e.x, e.y - 30);
}
