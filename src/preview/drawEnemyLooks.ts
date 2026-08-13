/** Grim-fantasy enemy previews. Readable color, mean anatomy — Moria, not mascot. */

function oval(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function limb(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function skinGrad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  light: string,
  dark: string,
): CanvasGradient {
  const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.4, 1, x, y, r);
  g.addColorStop(0, light);
  g.addColorStop(0.55, light);
  g.addColorStop(1, dark);
  return g;
}

function meanEye(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, iris: string): void {
  ctx.fillStyle = '#1a100c';
  ctx.beginPath();
  ctx.moveTo(x - w * 1.35, y - w * 0.1);
  ctx.quadraticCurveTo(x, y - w * 1.25, x + w * 1.35, y);
  ctx.lineTo(x + w * 0.9, y + w * 0.25);
  ctx.quadraticCurveTo(x, y - w * 0.15, x - w * 0.9, y + w * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.08, y + w * 0.12, w * 0.72, w * 0.18, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0a0604';
  ctx.lineWidth = Math.max(1.4, w * 0.2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.4, y + w * 0.12);
  ctx.lineTo(x + w * 0.55, y + w * 0.16);
  ctx.stroke();
}

function snarl(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = '#2a1010';
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8dcc8';
  const n = 5;
  for (let i = 0; i < n; i++) {
    const tx = x - w * 0.7 + (i / (n - 1)) * w * 1.35;
    ctx.beginPath();
    ctx.moveTo(tx - 2, y - h * 0.15);
    ctx.lineTo(tx, y + h * 0.85);
    ctx.lineTo(tx + 2, y - h * 0.15);
    ctx.fill();
  }
}

function tusk(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, dir: number): void {
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * 4, y + len);
  ctx.lineTo(x + dir * 8, y + len * 0.2);
  ctx.closePath();
  ctx.fill();
}

function wart(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  oval(ctx, x, y, r, r * 0.8, color);
}

function rusty(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  ang: number,
  wide = 7,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = '#4a3020';
  ctx.fillRect(-3, 0, 6, 12);
  const g = ctx.createLinearGradient(-wide, 0, wide, 0);
  g.addColorStop(0, '#6a4a30');
  g.addColorStop(0.4, '#c8b090');
  g.addColorStop(0.55, '#8a5a30');
  g.addColorStop(1, '#4a3020');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -len);
  ctx.lineTo(wide * 0.45, 4);
  ctx.lineTo(-wide * 0.35, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function scene(ctx: CanvasRenderingContext2D, w: number, h: number, air: boolean, t: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, air ? '#3a4a58' : '#243038');
  sky.addColorStop(0.5, '#1a2428');
  sky.addColorStop(1, '#12180e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#24382a';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.58);
  ctx.quadraticCurveTo(w * 0.35, h * 0.48, w * 0.7, h * 0.56);
  ctx.lineTo(w, h * 0.52);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  ctx.fillStyle = '#3a5a34';
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  ctx.fillStyle = '#6a4a28';
  ctx.fillRect(0, h * 0.76, w, 22);
  ctx.fillStyle = '#8a6a40';
  ctx.fillRect(0, h * 0.76, w, 3);

  if (air) {
    ctx.fillStyle = 'rgba(200, 210, 220, 0.12)';
    const cx = ((t * 14) % (w + 90)) - 40;
    oval(ctx, cx, 40, 40, 11, 'rgba(200,210,220,0.14)');
  }
}

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  oval(ctx, x, y, rx, ry, 'rgba(0,0,0,0.42)');
}

export function drawEnemyLook(
  ctx: CanvasRenderingContext2D,
  kind: string,
  look: string,
  t: number,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const air = kind === 'hellbat' || kind === 'wyvern' || kind === 'drake';
  scene(ctx, w, h, air, t);
  ctx.save();
  ctx.translate(w * 0.5, air ? h * 0.48 : h * 0.72);
  switch (kind) {
    case 'goblin':
      drawGoblin(ctx, look, t);
      break;
    case 'raider':
      drawRaider(ctx, look, t);
      break;
    case 'imp':
      drawImp(ctx, look, t);
      break;
    case 'warg':
      drawWarg(ctx, look, t);
      break;
    case 'troll':
      drawTroll(ctx, look, t);
      break;
    case 'ogre':
      drawOgre(ctx, look, t);
      break;
    case 'warlord':
      drawWarlord(ctx, look, t);
      break;
    case 'hellbat':
      drawHellbat(ctx, look, t);
      break;
    case 'wyvern':
      drawWyvern(ctx, look, t);
      break;
    case 'drake':
      drawDrake(ctx, look, t);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawGoblin(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const gait = Math.sin(t * 7);
  const pal =
    look === 'sneak'
      ? { light: '#7a8a4a', dark: '#3a4a22', rag: '#2a2418', eye: '#d4c030' }
      : look === 'trickster'
        ? { light: '#6a7a38', dark: '#2e3a14', rag: '#4a2030', eye: '#e0b020' }
        : { light: '#6a7a40', dark: '#334018', rag: '#5a3828', eye: '#c8a028' };

  shadow(ctx, 4, 22, 26, 7);
  ctx.translate(gait * 2, Math.abs(gait) * 1.5);
  ctx.scale(1.35, 1.35);

  limb(ctx, -4, 10, -8 + gait * 8, 24, 6, pal.dark);
  limb(ctx, 6, 10, 10 - gait * 8, 24, 6, pal.dark);

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.quadraticCurveTo(-18, -6, 2, -16);
  ctx.quadraticCurveTo(18, -4, 12, 12);
  ctx.quadraticCurveTo(0, 16, -8, 8);
  ctx.fill();
  oval(ctx, 2, 2, 11, 10, skinGrad(ctx, 0, -2, 14, pal.light, pal.dark));
  oval(ctx, 2, 4, 8, 6, pal.rag);

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(-22, -28);
  ctx.lineTo(-2, -18);
  ctx.moveTo(10, -16);
  ctx.lineTo(24, -32);
  ctx.lineTo(14, -12);
  ctx.fill();
  ctx.fillStyle = pal.light;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(-16, -24);
  ctx.lineTo(-2, -16);
  ctx.fill();

  oval(ctx, 8, -18, 13, 11, skinGrad(ctx, 6, -22, 13, pal.light, pal.dark));
  wart(ctx, 2, -14, 2.2, pal.dark);
  if (look === 'sneak') {
    ctx.fillStyle = '#1e1810';
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.quadraticCurveTo(8, -36, 22, -16);
    ctx.lineTo(16, -10);
    ctx.quadraticCurveTo(6, -20, -6, -14);
    ctx.fill();
  }
  meanEye(ctx, 12, -20, 5.5, pal.eye);
  snarl(ctx, 14, -12, 7, 4);
  tusk(ctx, 10, -10, 6, -1);
  tusk(ctx, 16, -10, 5, 1);

  limb(ctx, 10, -2, 22, 6 + gait * 3, 5.5, pal.dark);
  if (look === 'stabber') rusty(ctx, 24, 4, 36, 0.85, 6);
  else if (look === 'trickster') {
    oval(ctx, 24, 10, 7, 6, '#3a2a14');
    oval(ctx, 24, 10, 3, 2.5, '#8a4030');
  } else rusty(ctx, 22, 6, 16, 1.1, 4);
}

function drawRaider(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const gait = Math.sin(t * 5.6);
  const pal =
    look === 'berserk'
      ? { light: '#6a5a38', dark: '#2e2414', rag: '#6a1818', eye: '#d4a020' }
      : look === 'captain'
        ? { light: '#5a4a30', dark: '#2a2010', rag: '#8a3a14', eye: '#e0b040' }
        : { light: '#5a4e34', dark: '#2a2414', rag: '#4a4440', eye: '#c89030' };

  shadow(ctx, 2, 30, 34, 9);
  ctx.translate(gait * 1.5, Math.abs(gait) * 1.2);
  ctx.scale(1.22, 1.22);

  limb(ctx, -8, 14, -14 + gait * 10, 34, 9, pal.dark);
  limb(ctx, 8, 14, 12 - gait * 10, 34, 9, pal.dark);

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.quadraticCurveTo(-20, -18, 4, -22);
  ctx.quadraticCurveTo(24, -8, 18, 16);
  ctx.quadraticCurveTo(0, 22, -16, 10);
  ctx.fill();
  oval(ctx, 0, 4, 18, 16, skinGrad(ctx, -4, 0, 20, pal.light, pal.dark));
  oval(ctx, 0, 8, 14, 8, pal.rag);
  if (look === 'berserk') {
    ctx.strokeStyle = '#8a2018';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(8, 10);
    ctx.moveTo(-6, 8);
    ctx.lineTo(12, -4);
    ctx.stroke();
  }

  oval(ctx, 6, -24, 15, 13, skinGrad(ctx, 4, -28, 15, pal.light, pal.dark));
  meanEye(ctx, 10, -26, 6, pal.eye);
  snarl(ctx, 12, -16, 8, 5);
  tusk(ctx, 8, -14, 10, -1);
  tusk(ctx, 16, -14, 11, 1);

  if (look === 'shield') {
    limb(ctx, -14, 2, -26, 10, 8, pal.dark);
    ctx.fillStyle = '#5a5048';
    ctx.beginPath();
    ctx.ellipse(-34, 8, 15, 18, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c8a060';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    rusty(ctx, 22, -6, 28, 0.45, 8);
  } else if (look === 'captain') {
    ctx.strokeStyle = '#3a2a14';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(16, 18);
    ctx.lineTo(20, -50);
    ctx.stroke();
    ctx.fillStyle = '#6a2010';
    ctx.beginPath();
    ctx.moveTo(20, -50);
    ctx.lineTo(46, -22);
    ctx.lineTo(20, -18);
    ctx.fill();
  } else {
    rusty(ctx, -20, -4, 24, -0.85, 7);
    rusty(ctx, 22, -2, 24, 0.7, 7);
  }
}

function drawImp(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const scuttle = Math.sin(t * 10);
  const pal =
    look === 'ember'
      ? { light: '#b05028', dark: '#4a180c', eye: '#e0a020', horn: '#2a140c' }
      : look === 'mite'
        ? { light: '#b8a090', dark: '#5a4840', eye: '#c04028', horn: '#d0c8c0' }
        : { light: '#5a6a30', dark: '#243018', eye: '#d4b030', horn: '#1e2810' };

  shadow(ctx, 2, 16, 16, 5);
  ctx.translate(scuttle * 4, Math.abs(scuttle) * 2);

  limb(ctx, -5, 6, -10, 14, 4, pal.dark);
  limb(ctx, 5, 6, 9, 14, 4, pal.dark);
  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-10, 4);
  ctx.quadraticCurveTo(-8, -10, 4, -8);
  ctx.quadraticCurveTo(14, 0, 8, 8);
  ctx.fill();

  ctx.fillStyle = pal.horn;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-10, -22);
  ctx.lineTo(0, -8);
  ctx.moveTo(6, -8);
  ctx.lineTo(16, -24);
  ctx.lineTo(8, -6);
  ctx.fill();

  oval(ctx, 4, -6, 9, 8, skinGrad(ctx, 2, -8, 9, pal.light, pal.dark));
  meanEye(ctx, 7, -8, 4, pal.eye);
  snarl(ctx, 8, -2, 6, 3.5);
  if (look === 'ember') {
    ctx.shadowColor = '#e06020';
    ctx.shadowBlur = 12;
    oval(ctx, 0, 4, 4, 3, '#e09040');
    ctx.shadowBlur = 0;
  }
}

function drawWarg(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const gait = t * 6.5;
  const a = Math.sin(gait) * 8;
  const b = Math.sin(gait + Math.PI) * 8;
  const pal =
    look === 'plated'
      ? { light: '#6a6058', dark: '#2e2a24', eye: '#d4a020', fur: '#4a4440' }
      : look === 'mane'
        ? { light: '#8a4a28', dark: '#3a1810', eye: '#e09030', fur: '#6a2814' }
        : { light: '#5a5248', dark: '#241e18', eye: '#d4b040', fur: '#3a342c' };

  shadow(ctx, 6, 24, 52, 9);
  ctx.translate(0, Math.sin(gait) * 1.5);

  limb(ctx, -22, 6, -28, 22 + a * 0.25, 8, pal.dark);
  limb(ctx, -6, 6, -4, 22 + b * 0.25, 8, pal.dark);
  limb(ctx, 18, 4, 16, 22 - a * 0.25, 8, pal.dark);
  limb(ctx, 32, 4, 38, 22 - b * 0.25, 8, pal.dark);

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-30, 6);
  ctx.quadraticCurveTo(-8, -22, 28, -8);
  ctx.quadraticCurveTo(40, 2, 34, 12);
  ctx.quadraticCurveTo(0, 16, -30, 6);
  ctx.fill();
  oval(ctx, 4, 0, 32, 12, skinGrad(ctx, 0, -8, 32, pal.light, pal.dark));

  ctx.beginPath();
  ctx.moveTo(-26, 2);
  ctx.quadraticCurveTo(-48, -8, -42, 10);
  ctx.quadraticCurveTo(-30, 8, -22, 4);
  ctx.fillStyle = pal.fur;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(28, -6);
  ctx.lineTo(58, 4);
  ctx.lineTo(54, 12);
  ctx.quadraticCurveTo(36, 8, 26, 4);
  ctx.fillStyle = pal.dark;
  ctx.fill();
  oval(ctx, 38, -2, 16, 9, skinGrad(ctx, 36, -6, 16, pal.light, pal.dark));
  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(28, -10);
  ctx.lineTo(22, -24);
  ctx.lineTo(34, -8);
  ctx.moveTo(40, -10);
  ctx.lineTo(38, -22);
  ctx.lineTo(46, -6);
  ctx.fill();
  meanEye(ctx, 40, -6, 5, pal.eye);
  snarl(ctx, 50, 4, 8, 4);
  tusk(ctx, 46, 4, 8, 1);

  if (look === 'plated') {
    ctx.fillStyle = '#8a8480';
    ctx.beginPath();
    ctx.ellipse(6, -8, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c8a060';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawTroll(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const gait = Math.sin(t * 3.2);
  const pal =
    look === 'frost'
      ? { light: '#8aa8b0', dark: '#3a4e58', eye: '#c8e0f0', rock: '#d0dce0' }
      : look === 'club'
        ? { light: '#6a7a48', dark: '#2e3a1c', eye: '#c8a030', rock: '#5a4a28' }
        : { light: '#5a6a40', dark: '#2a3418', eye: '#b8a040', rock: '#3a4a28' };

  shadow(ctx, 4, 44, 50, 12);
  ctx.translate(gait * 2, Math.abs(gait) * 1.4);
  ctx.scale(1.28, 1.28);

  limb(ctx, -14, 16, -22 + gait * 6, 46, 16, pal.dark);
  limb(ctx, 12, 16, 18 - gait * 6, 46, 16, pal.dark);

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-28, 12);
  ctx.quadraticCurveTo(-32, -28, 6, -36);
  ctx.quadraticCurveTo(36, -16, 28, 20);
  ctx.quadraticCurveTo(0, 28, -28, 12);
  ctx.fill();
  oval(ctx, 0, 2, 26, 24, skinGrad(ctx, -6, -8, 28, pal.light, pal.dark));
  wart(ctx, -10, 0, 5, pal.rock);
  wart(ctx, 12, 8, 4, pal.dark);
  if (look === 'moss') {
    oval(ctx, -12, -8, 9, 7, '#3a5a30');
    oval(ctx, 10, 4, 7, 5, '#4a6a38');
  }
  if (look === 'frost') {
    ctx.fillStyle = pal.rock;
    ctx.beginPath();
    ctx.moveTo(-18, -22);
    ctx.lineTo(-10, -40);
    ctx.lineTo(-4, -18);
    ctx.moveTo(10, -24);
    ctx.lineTo(20, -42);
    ctx.lineTo(16, -16);
    ctx.fill();
  }

  limb(ctx, -24, -4, -48, 16 + gait * 5, 14, pal.dark);
  oval(ctx, -52, 18, 12, 10, pal.dark);
  limb(ctx, 22, -2, 40, 10, 14, pal.dark);

  oval(ctx, 8, -32, 20, 16, skinGrad(ctx, 4, -38, 20, pal.light, pal.dark));
  oval(ctx, 14, -24, 10, 7, pal.dark);
  meanEye(ctx, 12, -36, 5, pal.eye);
  snarl(ctx, 16, -24, 10, 6);
  tusk(ctx, 10, -22, 9, -1);
  tusk(ctx, 20, -22, 8, 1);

  if (look === 'club') {
    ctx.save();
    ctx.translate(44, 6);
    ctx.rotate(0.5);
    ctx.fillStyle = '#4a3018';
    ctx.fillRect(-8, -6, 16, 58);
    oval(ctx, 0, -14, 18, 16, '#5a3a18');
    ctx.restore();
  }
}

function drawOgre(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const gait = Math.sin(t * 3.4);
  const pal =
    look === 'hide'
      ? { light: '#a08058', dark: '#4a3418', rag: '#3a2a14', eye: '#c86028' }
      : look === 'brute'
        ? { light: '#b08a58', dark: '#5a3818', rag: '#6a1810', eye: '#d49028' }
        : { light: '#a07848', dark: '#4a2e14', rag: '#2a2014', eye: '#d07030' };

  shadow(ctx, 2, 46, 52, 12);
  ctx.translate(gait * 1.5, Math.abs(gait));
  ctx.scale(1.08, 1.08);

  limb(ctx, -14, 20, -20, 48, 16, pal.dark);
  limb(ctx, 14, 20, 22, 48, 16, pal.dark);

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-32, 14);
  ctx.quadraticCurveTo(-28, -20, 4, -24);
  ctx.quadraticCurveTo(36, -8, 32, 22);
  ctx.quadraticCurveTo(0, 32, -32, 14);
  ctx.fill();
  oval(ctx, 0, 8, 32, 26, skinGrad(ctx, -8, 0, 34, pal.light, pal.dark));
  if (look === 'brute') {
    ctx.strokeStyle = pal.rag;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, -2);
    ctx.lineTo(14, 14);
    ctx.moveTo(-10, 10);
    ctx.lineTo(20, -4);
    ctx.stroke();
  }
  if (look === 'hide') {
    oval(ctx, -12, -6, 8, 6, '#d0c0a8');
    oval(ctx, 16, 6, 7, 5, '#c8b898');
  }

  oval(ctx, 8, -28, 14, 13, skinGrad(ctx, 6, -32, 14, pal.light, pal.dark));
  meanEye(ctx, 12, -30, 5, pal.eye);
  snarl(ctx, 14, -20, 8, 5);
  tusk(ctx, 10, -18, 8, -1);
  tusk(ctx, 18, -18, 7, 1);

  if (look === 'mauler') {
    ctx.save();
    ctx.translate(40, 0);
    ctx.rotate(0.5);
    ctx.fillStyle = '#3a2e24';
    ctx.fillRect(-8, 0, 16, 42);
    oval(ctx, 0, -6, 16, 14, '#5a5048');
    ctx.fillStyle = '#c0b8b0';
    for (const s of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(s, -16);
      ctx.lineTo(s + 3, -4);
      ctx.lineTo(s - 3, -4);
      ctx.fill();
    }
    ctx.restore();
  } else {
    limb(ctx, 26, 6, 42, 20, 15, pal.dark);
    oval(ctx, 46, 22, 12, 10, pal.dark);
  }
}

function drawWarlord(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const gait = Math.sin(t * 3);
  const pal =
    look === 'chief'
      ? { light: '#5a4a28', dark: '#241c0c', metal: '#b8b0a0', eye: '#d4a028' }
      : look === 'iron'
        ? { light: '#6a6864', dark: '#2a2824', metal: '#c8a050', eye: '#d06028' }
        : { light: '#5a6a38', dark: '#243014', metal: '#c8a040', eye: '#e0c040' };

  shadow(ctx, 2, 48, 54, 13);
  ctx.translate(gait * 1.2, Math.abs(gait));
  ctx.scale(1.12, 1.12);

  limb(ctx, -12, 18, -16, 50, 14, pal.dark);
  limb(ctx, 12, 18, 18, 50, 14, pal.dark);

  if (look !== 'iron') {
    ctx.fillStyle = '#2a1c10';
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(-38, 30);
    ctx.lineTo(-4, 26);
    ctx.fill();
  }

  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(-26, 12);
  ctx.quadraticCurveTo(-24, -24, 6, -28);
  ctx.quadraticCurveTo(32, -10, 26, 18);
  ctx.quadraticCurveTo(0, 26, -26, 12);
  ctx.fill();
  if (look === 'iron') {
    oval(ctx, 0, 4, 28, 28, skinGrad(ctx, -4, -4, 30, '#8a8884', '#2e2c28'));
    ctx.strokeStyle = pal.metal;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    oval(ctx, 0, 4, 26, 26, skinGrad(ctx, -4, -4, 28, pal.light, pal.dark));
  }

  oval(ctx, 6, -30, 16, 14, skinGrad(ctx, 4, -34, 16, pal.light, pal.dark));
  if (look === 'iron') {
    oval(ctx, 6, -30, 16, 13, '#3a3834');
    ctx.shadowColor = pal.eye;
    ctx.shadowBlur = 10;
    oval(ctx, 12, -28, 6, 3, pal.eye);
    ctx.shadowBlur = 0;
  } else {
    meanEye(ctx, 10, -32, 6, pal.eye);
    snarl(ctx, 12, -22, 8, 5);
    tusk(ctx, 8, -20, 11, -1);
    tusk(ctx, 16, -20, 12, 1);
  }

  if (look === 'king') {
    ctx.fillStyle = pal.metal;
    ctx.beginPath();
    ctx.moveTo(-10, -42);
    ctx.lineTo(-6, -58);
    ctx.lineTo(0, -42);
    ctx.lineTo(8, -60);
    ctx.lineTo(12, -42);
    ctx.lineTo(20, -56);
    ctx.lineTo(16, -40);
    ctx.lineTo(-12, -40);
    ctx.fill();
  }

  if (look === 'chief') {
    ctx.strokeStyle = '#3a2a14';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(22, 16);
    ctx.lineTo(26, -54);
    ctx.stroke();
    ctx.fillStyle = '#5a140c';
    ctx.beginPath();
    ctx.moveTo(26, -54);
    ctx.lineTo(52, -28);
    ctx.lineTo(26, -22);
    ctx.fill();
  } else {
    rusty(ctx, 30, -6, look === 'iron' ? 44 : 40, 0.5, 10);
  }
  if (look === 'iron') {
    ctx.fillStyle = '#5a5854';
    ctx.beginPath();
    ctx.ellipse(-30, 8, 16, 20, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.metal;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function tatteredWing(
  ctx: CanvasRenderingContext2D,
  side: number,
  flap: number,
  color: string,
  rib: string,
  span: number,
): void {
  ctx.save();
  ctx.translate(side * 6, -4);
  ctx.scale(side, 1);
  ctx.rotate(-0.2 - flap * 0.45);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-span * 0.35, -span * 0.45 * flap - 8, -span, 6);
  ctx.lineTo(-span * 0.72, 14);
  ctx.lineTo(-span * 0.55, 6);
  ctx.lineTo(-span * 0.4, 16);
  ctx.quadraticCurveTo(-span * 0.25, 10, 0, 10);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = rib;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-span * 0.92, 4);
  ctx.stroke();
  ctx.restore();
}

function drawHellbat(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const flap = 0.3 + Math.sin(t * 9) * 0.5;
  const bob = Math.sin(t * 4.5) * 5;
  const pal =
    look === 'ember'
      ? { light: '#8a3a20', dark: '#3a1408', wing: '#5a2014', eye: '#e09030' }
      : look === 'fang'
        ? { light: '#a09080', dark: '#4a3c34', wing: '#8a7a70', eye: '#c04028' }
        : { light: '#6a5448', dark: '#2e241c', wing: '#4a382e', eye: '#d4a028' };

  shadow(ctx, 0, 82, 24, 7);
  ctx.translate(0, bob);
  tatteredWing(ctx, -1, flap, pal.wing, pal.dark, 72);
  tatteredWing(ctx, 1, flap, pal.wing, pal.dark, 72);
  oval(ctx, 0, 4, 14, 10, skinGrad(ctx, 0, 0, 14, pal.light, pal.dark));
  oval(ctx, 10, 0, 11, 8, skinGrad(ctx, 10, -2, 11, pal.light, pal.dark));
  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(2, -6);
  ctx.lineTo(-4, -18);
  ctx.lineTo(8, -6);
  ctx.moveTo(12, -6);
  ctx.lineTo(18, -20);
  ctx.lineTo(16, -4);
  ctx.fill();
  meanEye(ctx, 12, -2, 4.5, pal.eye);
  snarl(ctx, 16, 4, 6, 3);
  tusk(ctx, 14, 4, 7, 1);
  if (look === 'ember') {
    ctx.shadowColor = '#e05018';
    ctx.shadowBlur = 12;
    oval(ctx, 0, 8, 4, 3, '#e08040');
    ctx.shadowBlur = 0;
  }
}

function drawWyvern(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const flap = 0.32 + Math.sin(t * 6.5) * 0.42;
  const bob = Math.sin(t * 3.6) * 4;
  const pal =
    look === 'storm'
      ? { light: '#6a7a88', dark: '#243040', wing: '#3a4a58', eye: '#c8d8e8', rib: '#c8a040' }
      : look === 'venom'
        ? { light: '#7a8a38', dark: '#2e3a14', wing: '#4a5a20', eye: '#c8d040', rib: '#a0c040' }
        : { light: '#5a6a40', dark: '#243018', wing: '#3a4a28', eye: '#d4b040', rib: '#8a9a50' };

  shadow(ctx, 4, 90, 38, 9);
  ctx.translate(0, bob);
  tatteredWing(ctx, -1, flap, pal.wing, pal.rib, 96);
  tatteredWing(ctx, 1, flap, pal.wing, pal.rib, 96);

  oval(ctx, 0, 10, 20, 12, skinGrad(ctx, 0, 4, 20, pal.light, pal.dark));
  limb(ctx, -4, 16, -10, 38, 8, pal.dark);
  limb(ctx, 8, 16, 16, 38, 8, pal.dark);
  oval(ctx, -10, 40, 8, 4, pal.dark);
  oval(ctx, 16, 40, 8, 4, pal.dark);

  ctx.beginPath();
  ctx.moveTo(-16, 8);
  ctx.quadraticCurveTo(-44, 0, -52, 20);
  ctx.quadraticCurveTo(-30, 12, -12, 10);
  ctx.fillStyle = pal.dark;
  ctx.fill();
  if (look === 'venom') {
    ctx.fillStyle = pal.rib;
    ctx.beginPath();
    ctx.moveTo(-52, 20);
    ctx.lineTo(-64, 14);
    ctx.lineTo(-54, 26);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.lineTo(48, -4);
  ctx.lineTo(52, 6);
  ctx.quadraticCurveTo(28, 12, 16, 10);
  ctx.fillStyle = pal.dark;
  ctx.fill();
  oval(ctx, 36, 0, 14, 9, skinGrad(ctx, 34, -4, 14, pal.light, pal.dark));
  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(28, -6);
  ctx.lineTo(24, -20);
  ctx.lineTo(34, -4);
  ctx.fill();
  meanEye(ctx, 38, -4, 5, pal.eye);
  snarl(ctx, 46, 4, 7, 3.5);
}

function drawDrake(ctx: CanvasRenderingContext2D, look: string, t: number): void {
  const flap = 0.28 + Math.sin(t * 5.5) * 0.38;
  const bob = Math.sin(t * 3.2) * 3.5;
  const pal =
    look === 'gilt'
      ? { light: '#b88838', dark: '#5a3a10', wing: '#8a6020', eye: '#f0d070', belly: '#e0c060' }
      : look === 'dusk'
        ? { light: '#7a58a0', dark: '#3a2060', wing: '#4a3078', eye: '#e0c0ff', belly: '#d4a040' }
        : { light: '#b05028', dark: '#4a180c', wing: '#7a2814', eye: '#e0a030', belly: '#e09040' };

  shadow(ctx, 2, 94, 44, 10);
  ctx.translate(0, bob);
  tatteredWing(ctx, -1, flap, pal.wing, pal.belly, 104);
  tatteredWing(ctx, 1, flap, pal.wing, pal.belly, 104);

  oval(ctx, 0, 12, 26, 16, skinGrad(ctx, 0, 4, 26, pal.light, pal.dark));
  oval(ctx, 2, 16, 16, 9, pal.belly);
  limb(ctx, -6, 20, -12, 44, 11, pal.dark);
  limb(ctx, 10, 20, 18, 44, 11, pal.dark);

  ctx.beginPath();
  ctx.moveTo(-22, 10);
  ctx.quadraticCurveTo(-52, -2, -58, 16);
  ctx.quadraticCurveTo(-36, 16, -18, 12);
  ctx.fillStyle = pal.dark;
  ctx.fill();

  oval(ctx, 32, 0, 18, 12, skinGrad(ctx, 30, -4, 18, pal.light, pal.dark));
  ctx.fillStyle = pal.dark;
  ctx.beginPath();
  ctx.moveTo(22, -10);
  ctx.lineTo(16, -28);
  ctx.lineTo(28, -8);
  ctx.moveTo(34, -12);
  ctx.lineTo(38, -30);
  ctx.lineTo(42, -8);
  ctx.fill();
  oval(ctx, 48, 4, 13, 6, pal.dark);
  meanEye(ctx, 36, -4, 6, pal.eye);
  snarl(ctx, 50, 6, 8, 4);
  ctx.shadowColor = pal.belly;
  ctx.shadowBlur = 14;
  oval(ctx, 52, 8, 5, 3, pal.belly);
  ctx.shadowBlur = 0;
}
