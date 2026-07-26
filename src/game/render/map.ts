import {
  BARRACKS,
  COLS,
  MAP_H,
  MAP_W,
  ROWS,
  TILE,
  TOWERS,
  isTowerKind,
  type BiomeTheme,
  type CellKind,
  type PlaceableKind,
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

function meadowFlowerColor(theme: BiomeTheme, seed: number): string {
  if (theme === 'forest') {
    return seed < 0.5 ? 'rgba(220, 90, 120, 0.55)' : 'rgba(240, 200, 80, 0.5)';
  }
  if (theme === 'river') {
    return seed < 0.5 ? 'rgba(100, 180, 255, 0.5)' : 'rgba(240, 220, 120, 0.48)';
  }
  // meadow
  return seed < 0.33
    ? 'rgba(255, 120, 160, 0.55)'
    : seed < 0.66
      ? 'rgba(255, 220, 90, 0.52)'
      : 'rgba(180, 140, 255, 0.48)';
}

function drawGrassTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  c: number,
  r: number,
  theme: BiomeTheme,
  showBuildHints: boolean,
  time: number,
): void {
  const p = PALETTES[theme];
  const h = hash2(c, r);
  ctx.fillStyle = (c + r) % 2 === 0 ? p.grassA : p.grassB;
  ctx.fillRect(x, y, TILE, TILE);

  // Soft ground mottling (stays under scenery; never on path)
  ctx.fillStyle = p.grassSpeck;
  for (let i = 0; i < 6; i++) {
    const ox = 5 + ((h * (i + 3) * 97) % 38);
    const oy = 5 + ((h * (i + 7) * 53) % 38);
    const s = 1.1 + (h * (i + 1) * 17) % 2.4;
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Textured grass blades with wind sway
  if (!isSnow(theme) && !isLavaWater(theme)) {
    const bladeN = theme === 'forest' ? 8 : theme === 'meadow' || theme === 'river' ? 7 : 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < bladeN; i++) {
      const bx = x + 6 + ((h * (i + 11) * 37) % 36);
      const by = y + 16 + ((h * (i + 19) * 29) % 28);
      const tall = 4.5 + ((h * (i + 5) * 13) % 5);
      const lean = ((h * (i + 23) * 11) % 3) - 1;
      const sway = Math.sin(time * 2.4 + c * 0.55 + r * 0.4 + i * 0.85) * 2.2;
      const tipX = bx + lean + sway;
      const tipY = by - tall;
      const midX = bx + lean * 0.4 + sway * 0.55;
      const midY = by - tall * 0.55;
      ctx.strokeStyle =
        i % 3 === 0 ? 'rgba(170, 230, 150, 0.28)' : 'rgba(120, 190, 120, 0.2)';
      ctx.lineWidth = 1 + ((h * (i + 2)) % 1.15);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();
    }
  }

  // Scattered meadow flowers (grass tiles only — path stays clear)
  if (theme === 'meadow' || theme === 'forest' || theme === 'river') {
    const flowerChance = theme === 'meadow' ? 0.42 : theme === 'river' ? 0.28 : 0.22;
    if (h > 1 - flowerChance) {
      const n = 1 + Math.floor((h * 7) % 2);
      for (let i = 0; i < n; i++) {
        const fx = x + 8 + ((h * (i + 31) * 43) % 32);
        const fy = y + 10 + ((h * (i + 41) * 31) % 28);
        const bob = Math.sin(time * 1.8 + fx * 0.08 + i) * 0.8;
        ctx.fillStyle = meadowFlowerColor(theme, (h * (i + 9) * 3) % 1);
        ctx.beginPath();
        ctx.arc(fx, fy + bob, 1.6 + (h * (i + 1)) % 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 240, 180, 0.65)';
        ctx.beginPath();
        ctx.arc(fx, fy + bob, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (isSnow(theme)) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 4, y + 4, TILE - 8, 3);
    // Soft snow glitter
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 3; i++) {
      const ox = 8 + ((h * (i + 4) * 61) % 32);
      const oy = 10 + ((h * (i + 8) * 47) % 28);
      const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + h * 20 + i);
      ctx.globalAlpha = 0.15 + twinkle * 0.25;
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (showBuildHints) {
    ctx.strokeStyle = 'rgba(244, 211, 94, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
    // Soft "build here" glow
    ctx.fillStyle = 'rgba(87, 204, 153, 0.08)';
    ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
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
  // Soft edge bevel
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x, y, TILE, 3);
  ctx.fillRect(x, y, 3, TILE);
  ctx.fillStyle = p.pathB;
  roundRect(ctx, x + 4, y + 4, TILE - 8, TILE - 8, 5);
  ctx.fill();

  ctx.fillStyle = isSnow(theme)
    ? 'rgba(220, 240, 255, 0.28)'
    : isLavaWater(theme)
      ? 'rgba(255, 120, 40, 0.12)'
      : 'rgba(255, 220, 140, 0.12)';
  for (let i = 0; i < 4; i++) {
    const ox = 8 + ((h * (i + 2) * 41) % 28);
    const oy = 8 + ((h * (i + 5) * 29) % 28);
    ctx.beginPath();
    ctx.ellipse(x + ox, y + oy, 3, 2, h, 0, Math.PI * 2);
    ctx.fill();
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
  const hot = isLavaWater(theme);
  const icy = isSnow(theme);
  const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
  g.addColorStop(0, p.waterA);
  g.addColorStop(0.55, p.waterB);
  g.addColorStop(1, hot ? '#ff8040' : icy ? '#a8d8f0' : p.waterA);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, TILE, TILE);

  const phase = time * 2 + c * 0.7 + r * 0.4;
  const waveColor = hot
    ? 'rgba(255, 200, 80, 0.38)'
    : icy
      ? 'rgba(220, 245, 255, 0.4)'
      : 'rgba(180, 230, 255, 0.3)';
  ctx.strokeStyle = waveColor;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 16 + Math.sin(phase) * 3);
  ctx.quadraticCurveTo(x + 24, y + 12 + Math.cos(phase) * 4, x + 44, y + 18 + Math.sin(phase + 1) * 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 30 + Math.cos(phase) * 2);
  ctx.quadraticCurveTo(x + 28, y + 34 + Math.sin(phase) * 3, x + 42, y + 28);
  ctx.stroke();
  // Third shimmer ridge
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 22 + Math.sin(phase * 1.3 + 0.8) * 2.5);
  ctx.quadraticCurveTo(
    x + 26,
    y + 20 + Math.cos(phase * 1.1) * 3,
    x + 40,
    y + 24 + Math.sin(phase + 2) * 2,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Moving highlight glint
  const glintX = x + 12 + ((Math.sin(phase * 0.7) + 1) * 0.5) * 22;
  const glintY = y + 14 + ((Math.cos(phase * 0.9) + 1) * 0.5) * 18;
  ctx.fillStyle = hot
    ? 'rgba(255, 220, 120, 0.22)'
    : icy
      ? 'rgba(255, 255, 255, 0.28)'
      : 'rgba(200, 240, 255, 0.18)';
  ctx.beginPath();
  ctx.ellipse(glintX, glintY, hot ? 7 : 6, 3, phase * 0.2, 0, Math.PI * 2);
  ctx.fill();

  if (hot) {
    // Soft lava pulse
    const pulse = 0.12 + 0.1 * Math.sin(time * 3.5 + c + r);
    ctx.fillStyle = `rgba(255, 80, 20, ${pulse})`;
    ctx.beginPath();
    ctx.arc(x + TILE * 0.45, y + TILE * 0.55, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (icy) {
    // Ice sparkle flecks
    const h = hash2(c + 3, r + 5);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 2; i++) {
      const ox = 10 + ((h * (i + 2) * 51) % 28);
      const oy = 10 + ((h * (i + 6) * 37) % 28);
      ctx.globalAlpha = 0.2 + 0.35 * Math.max(0, Math.sin(time * 4 + h * 30 + i * 2));
      ctx.fillRect(x + ox, y + oy, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}

function drawRock(ctx: CanvasRenderingContext2D, cx: number, cy: number, theme: BiomeTheme): void {
  const cool = isSnow(theme);
  const hot = isLavaWater(theme);
  ctx.fillStyle = cool ? '#8aa0b0' : hot ? '#3a2a28' : '#5a5348';
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 10);
  ctx.lineTo(cx - 8, cy - 4);
  ctx.lineTo(cx + 2, cy - 10);
  ctx.lineTo(cx + 12, cy - 2);
  ctx.lineTo(cx + 10, cy + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = cool ? 'rgba(255,255,255,0.35)' : hot ? 'rgba(255,120,60,0.25)' : 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 2);
  ctx.lineTo(cx + 2, cy - 8);
  ctx.lineTo(cx + 6, cy);
  ctx.closePath();
  ctx.fill();
}

function drawTaperedTrunk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  lean: number,
  baseW: number,
  height: number,
): void {
  const topY = cy - height;
  const topW = baseW * 0.45;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - baseW + lean * 0.15, cy + 12);
  ctx.lineTo(cx + baseW + lean * 0.15, cy + 12);
  ctx.lineTo(cx + topW + lean, topY);
  ctx.lineTo(cx - topW + lean, topY);
  ctx.closePath();
  ctx.fill();
}

function drawCanopyCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color0: string,
  color1: string,
): void {
  const g = ctx.createRadialGradient(cx - rx * 0.25, cy - ry * 0.3, 1, cx, cy, Math.max(rx, ry));
  g.addColorStop(0, color0);
  g.addColorStop(1, color1);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  theme: BiomeTheme,
  variant: number,
): void {
  // Rocks / ruins as blocked landmarks (variety of "can't build here")
  if (variant > 0.72) {
    drawRock(ctx, cx, cy, theme);
    return;
  }

  const lean = (variant - 0.5) * 6;
  const scale = 0.88 + variant * 0.28;

  if (theme === 'haunted' || theme === 'swamp') {
    // Gnarled: twisted trunk + sparse mossy / purple clusters
    const trunk = theme === 'haunted' ? '#2a1a28' : '#3a3220';
    drawTaperedTrunk(ctx, cx, cy, trunk, lean * 1.4, 3.2 * scale, 16 * scale);
    ctx.strokeStyle = trunk;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + lean * 0.3, cy - 2);
    ctx.quadraticCurveTo(cx - 10 + lean, cy - 10, cx - 14 + lean, cy - 18);
    ctx.moveTo(cx + lean * 0.2, cy + 2);
    ctx.quadraticCurveTo(cx + 12 + lean, cy - 6, cx + 15 + lean, cy - 14);
    ctx.stroke();
    const leaf0 = theme === 'haunted' ? 'rgba(140, 70, 170, 0.55)' : 'rgba(100, 130, 50, 0.55)';
    const leaf1 = theme === 'haunted' ? 'rgba(60, 30, 80, 0.65)' : 'rgba(40, 60, 28, 0.65)';
    drawCanopyCluster(ctx, cx - 8 + lean, cy - 12, 7 * scale, 6 * scale, leaf0, leaf1);
    drawCanopyCluster(ctx, cx + 7 + lean, cy - 10, 6.5 * scale, 5.5 * scale, leaf0, leaf1);
    if (variant > 0.4) {
      drawCanopyCluster(ctx, cx + lean * 0.5, cy - 16, 5 * scale, 4.5 * scale, leaf0, leaf1);
    }
    return;
  }

  if (isSnow(theme)) {
    // Pine: tapered trunk + layered triangular canopy
    drawTaperedTrunk(ctx, cx, cy, '#4a3428', lean * 0.6, 3.4 * scale, 14 * scale);
    const layers = [
      { y: -4, w: 15 * scale, c0: '#eef6ff', c1: '#b8d0e4' },
      { y: -12, w: 12 * scale, c0: '#e4f0fa', c1: '#a8c4d8' },
      { y: -19, w: 8.5 * scale, c0: '#f4faff', c1: '#c0d8ea' },
    ];
    for (const layer of layers) {
      const tipY = cy + layer.y - 10 * scale;
      const baseY = cy + layer.y + 8 * scale;
      const g = ctx.createLinearGradient(cx, tipY, cx, baseY);
      g.addColorStop(0, layer.c0);
      g.addColorStop(1, layer.c1);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx + lean * 0.4, tipY);
      ctx.lineTo(cx + layer.w + lean * 0.2, baseY);
      ctx.lineTo(cx - layer.w + lean * 0.2, baseY);
      ctx.closePath();
      ctx.fill();
    }
    // Soft snow cap fleck
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(cx + lean * 0.4, cy - 22 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (isLavaWater(theme)) {
    // Charred stump / slag with ember glow
    drawTaperedTrunk(ctx, cx, cy, '#2a2420', lean * 0.4, 4 * scale, 10 * scale);
    ctx.fillStyle = '#1a1412';
    ctx.beginPath();
    ctx.moveTo(cx - 11 * scale, cy + 12);
    ctx.lineTo(cx - 5 * scale + lean, cy - 4);
    ctx.lineTo(cx + 2 * scale, cy + 6);
    ctx.lineTo(cx + 8 * scale + lean, cy - 2);
    ctx.lineTo(cx + 13 * scale, cy + 12);
    ctx.closePath();
    ctx.fill();
    const ember = ctx.createRadialGradient(cx, cy + 2, 1, cx, cy + 2, 8);
    ember.addColorStop(0, 'rgba(255, 160, 60, 0.75)');
    ember.addColorStop(1, 'rgba(255, 60, 20, 0)');
    ctx.fillStyle = ember;
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Lush deciduous (meadow / forest / river / mist / default)
  const trunkTint = theme === 'forest' ? '#4a3224' : '#5c3d2e';
  drawTaperedTrunk(ctx, cx, cy, trunkTint, lean, 3.6 * scale, 13 * scale);
  const bright = theme === 'forest' ? '#3a9a55' : theme === 'mist' ? '#5a9a78' : '#4aaf68';
  const deep = theme === 'forest' ? '#143824' : theme === 'mist' ? '#1a4034' : '#1a4a2c';
  const ox = lean * 0.35;
  drawCanopyCluster(ctx, cx + ox, cy - 8 * scale, 13 * scale, 11 * scale, bright, deep);
  drawCanopyCluster(ctx, cx - 9 * scale + ox, cy + 1 * scale, 9 * scale, 8 * scale, bright, deep);
  drawCanopyCluster(ctx, cx + 9 * scale + ox, cy + 1 * scale, 9 * scale, 8 * scale, bright, deep);
  if (variant > 0.35) {
    drawCanopyCluster(
      ctx,
      cx + 2 * scale + ox,
      cy - 14 * scale,
      7 * scale,
      6 * scale,
      bright,
      deep,
    );
  }
  // Highlight leaf cluster
  ctx.fillStyle = 'rgba(180, 255, 180, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx - 4 * scale + ox, cy - 11 * scale, 5 * scale, 4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlockedMark(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = 'rgba(239, 71, 111, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 14);
  ctx.lineTo(x + TILE - 14, y + TILE - 14);
  ctx.moveTo(x + TILE - 14, y + 14);
  ctx.lineTo(x + 14, y + TILE - 14);
  ctx.stroke();
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
  selectedKind: PlaceableKind | null,
  showBuildHints: boolean,
  time: number,
): void {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE;
      const y = r * TILE;
      const kind = grid[r][c];
      if (kind === 'grass') {
        drawGrassTile(ctx, x, y, c, r, theme, showBuildHints, time);
      } else if (kind === 'path') {
        drawPathTile(ctx, x, y, c, r, theme);
      } else if (kind === 'water') {
        drawGrassTile(ctx, x, y, c, r, theme, false, time);
        drawWaterTile(ctx, x, y, c, r, theme, time);
        if (showBuildHints) drawBlockedMark(ctx, x, y);
      } else {
        drawGrassTile(ctx, x, y, c, r, theme, false, time);
        drawTree(ctx, x + TILE / 2, y + TILE / 2 + 2, theme, hash2(c, r));
        if (showBuildHints) drawBlockedMark(ctx, x, y);
      }
      if (kind === 'path' && showBuildHints) drawBlockedMark(ctx, x, y);
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
      const range = isTowerKind(selectedKind)
        ? TOWERS[selectedKind].range
        : BARRACKS[selectedKind].rallyRadius;
      const color = isTowerKind(selectedKind)
        ? TOWERS[selectedKind].color
        : BARRACKS[selectedKind].color;
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + TILE / 2, range, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}66`;
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
