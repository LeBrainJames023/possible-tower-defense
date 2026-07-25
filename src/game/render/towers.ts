import type { Tower } from '../entities';
import { roundRect } from './shapes';

function stoneBase(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + 16, r + 4, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const rim = ctx.createRadialGradient(x - 3, y + 4, 2, x, y + 9, r + 1);
  rim.addColorStop(0, '#4a5568');
  rim.addColorStop(0.55, '#2a3340');
  rim.addColorStop(1, '#151b24');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(x, y + 9, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + 9, r - 1, 0, Math.PI * 2);
  ctx.stroke();

  // paving cracks
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y + 9);
  ctx.lineTo(x - 2, y + 14);
  ctx.moveTo(x + 4, y + 6);
  ctx.lineTo(x + r * 0.55, y + 12);
  ctx.stroke();
}

function brickFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  light: string,
  dark: string,
): void {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, light);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 3);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 1;
  const rows = Math.max(2, Math.floor(h / 7));
  for (let i = 1; i < rows; i++) {
    const yy = y + (h * i) / rows;
    ctx.beginPath();
    ctx.moveTo(x + 2, yy);
    ctx.lineTo(x + w - 2, yy);
    ctx.stroke();
  }
}

function levelBadge(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  if (level <= 1) return;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x - 12, y + 22, 24, 14, 4);
  ctx.fill();
  ctx.fillStyle = '#f4d35e';
  ctx.font = 'bold 11px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`L${level}`, x, y + 33);
}

function drawArrowTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  aim: number,
): void {
  const h = 30 + level * 6;
  stoneBase(ctx, x, y, 17);

  // Keep shaft
  brickFill(ctx, x - 13, y - h + 12, 26, h - 2, '#8ec0e8', '#1a4060');

  // Door
  ctx.fillStyle = '#2a1a12';
  roundRect(ctx, x - 5, y - 2, 10, 12, 2);
  ctx.fill();

  // Window slits with glow
  ctx.fillStyle = 'rgba(8, 16, 24, 0.7)';
  ctx.fillRect(x - 7, y - h + 24, 5, 8);
  ctx.fillRect(x + 2, y - h + 24, 5, 8);
  ctx.fillStyle = 'rgba(244, 211, 94, 0.35)';
  ctx.fillRect(x - 6, y - h + 26, 3, 4);
  ctx.fillRect(x + 3, y - h + 26, 3, 4);

  // Wooden platform ring
  ctx.fillStyle = '#5c3d2e';
  roundRect(ctx, x - 16, y - h + 10, 32, 7, 2);
  ctx.fill();

  // Battlements
  ctx.fillStyle = '#2a4a62';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(x + i * 6 - 2.5, y - h + 2, 5, 10);
  }
  ctx.fillStyle = '#3d6a88';
  ctx.fillRect(x - 14, y - h + 8, 28, 3);

  // Big crossbow on roof
  const cx = x;
  const cy = y - h + 6;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(aim);

  // Stock
  ctx.fillStyle = '#3d2918';
  roundRect(ctx, -6, -5, 14, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#6b4423';
  roundRect(ctx, 4, -3.5, 20 + level * 2, 7, 2);
  ctx.fill();

  // Prod (bow arms)
  ctx.strokeStyle = '#c9a66b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(8, 0, 13, -Math.PI * 0.8, Math.PI * 0.8);
  ctx.stroke();
  ctx.strokeStyle = '#e8d5a8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(8, -12);
  ctx.lineTo(8, 12);
  ctx.stroke();

  // Bolt
  ctx.fillStyle = '#eef4ff';
  ctx.fillRect(10, -1.5, 18 + level, 3);
  ctx.beginPath();
  ctx.moveTo(30 + level, 0);
  ctx.lineTo(24 + level, -4);
  ctx.lineTo(24 + level, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b9fd4';
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(5, -4);
  ctx.lineTo(7, 0);
  ctx.lineTo(5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCannonTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  aim: number,
): void {
  stoneBase(ctx, x, y, 19);

  // Bastion body
  brickFill(ctx, x - 18, y - 10, 36, 26, '#e8a060', '#6a2a08');

  // Iron bands
  ctx.fillStyle = '#2a2220';
  ctx.fillRect(x - 18, y - 2, 36, 3);
  ctx.fillRect(x - 18, y + 8, 36, 3);

  // Side buttresses
  ctx.fillStyle = '#7a3410';
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 14);
  ctx.lineTo(x - 24, y + 16);
  ctx.lineTo(x - 18, y - 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 14);
  ctx.lineTo(x + 24, y + 16);
  ctx.lineTo(x + 18, y - 4);
  ctx.fill();

  // Carriage
  ctx.fillStyle = '#3a2820';
  roundRect(ctx, x - 10, y - 12, 20, 12, 3);
  ctx.fill();
  ctx.fillStyle = '#1a1514';
  ctx.beginPath();
  ctx.arc(x - 10, y + 2, 5, 0, Math.PI * 2);
  ctx.arc(x + 10, y + 2, 5, 0, Math.PI * 2);
  ctx.fill();

  // Barrel
  ctx.save();
  ctx.translate(x, y - 10);
  ctx.rotate(aim);
  const barrelLen = 26 + level * 4;
  const barrel = ctx.createLinearGradient(0, -6, 0, 6);
  barrel.addColorStop(0, '#4a4440');
  barrel.addColorStop(0.5, '#1a1514');
  barrel.addColorStop(1, '#3a3430');
  ctx.fillStyle = barrel;
  roundRect(ctx, -4, -6, barrelLen, 12, 3);
  ctx.fill();
  // Rings on barrel
  ctx.strokeStyle = '#6a6058';
  ctx.lineWidth = 2;
  for (const ox of [6, 14, barrelLen - 8]) {
    ctx.beginPath();
    ctx.ellipse(ox, 0, 2, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#0a0808';
  ctx.beginPath();
  ctx.arc(barrelLen, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2420';
  ctx.beginPath();
  ctx.arc(barrelLen, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Rivets
  ctx.fillStyle = '#f0c94d';
  for (const [ox, oy] of [
    [-14, 0],
    [14, 0],
    [-14, 10],
    [14, 10],
  ]) {
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIceTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  time: number,
): void {
  stoneBase(ctx, x, y, 15);
  const tip = y - 36 - level * 5;
  const pulse = 0.85 + Math.sin(time * 3) * 0.1;

  // Pedestal
  ctx.fillStyle = '#3a5a6a';
  roundRect(ctx, x - 12, y - 2, 24, 12, 3);
  ctx.fill();

  // Main crystal
  const g = ctx.createLinearGradient(x, tip, x, y + 6);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.3, `rgba(180, 235, 255, ${pulse})`);
  g.addColorStop(1, '#1f5f78');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x + 13 + level, y + 4);
  ctx.lineTo(x + 6, y + 10);
  ctx.lineTo(x - 6, y + 10);
  ctx.lineTo(x - 13 - level, y + 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x - 2, y + 8);
  ctx.moveTo(x, tip);
  ctx.lineTo(x + 3, y + 6);
  ctx.stroke();

  // Side shards
  ctx.fillStyle = 'rgba(200, 240, 255, 0.92)';
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x - 10, y - 22);
  ctx.lineTo(x - 5, y + 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + 10, y - 22);
  ctx.lineTo(x + 5, y + 2);
  ctx.fill();
  if (level > 1) {
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 8);
    ctx.lineTo(x - 2, y - 28);
    ctx.lineTo(x + 2, y - 6);
    ctx.fill();
  }

  ctx.shadowColor = '#7ec8e3';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(x, tip + 10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawLightningTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  time: number,
): void {
  stoneBase(ctx, x, y, 16);

  // Stone hut
  brickFill(ctx, x - 12, y - 8, 24, 20, '#5a5040', '#2a2418');
  ctx.fillStyle = '#1a1810';
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 8);
  ctx.lineTo(x, y - 18);
  ctx.lineTo(x + 14, y - 8);
  ctx.closePath();
  ctx.fill();

  // Support poles
  ctx.strokeStyle = '#6a5a30';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 8);
  ctx.lineTo(x - 8, y - 20);
  ctx.moveTo(x + 10, y + 8);
  ctx.lineTo(x + 8, y - 20);
  ctx.stroke();

  // Coil stack
  const coils = 3 + level;
  for (let i = 0; i < coils; i++) {
    const yy = y - 16 - i * 8;
    const coil = ctx.createLinearGradient(x - 13, yy, x + 13, yy);
    coil.addColorStop(0, '#6a5200');
    coil.addColorStop(0.5, '#f5d76e');
    coil.addColorStop(1, '#6a5200');
    ctx.fillStyle = coil;
    ctx.beginPath();
    ctx.ellipse(x, yy, 13 - i * 0.4, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,200,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const tipY = y - 16 - (coils - 1) * 8 - 6;
  // Rod
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(x - 2, tipY, 4, 14);

  const spark = 0.7 + Math.sin(time * 14) * 0.3;
  ctx.shadowColor = '#f0c94d';
  ctx.shadowBlur = 14 * spark;
  ctx.fillStyle = `rgba(255, 240, 150, ${spark})`;
  ctx.beginPath();
  ctx.arc(x, tipY - 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255, 250, 200, 0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 10, tipY + 4);
  ctx.lineTo(x - 2, tipY - 10);
  ctx.lineTo(x + 4, tipY);
  ctx.lineTo(x + 10, tipY - 8);
  ctx.stroke();
}

function drawFireTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  time: number,
): void {
  stoneBase(ctx, x, y, 17);

  brickFill(ctx, x - 14, y - 6, 28, 20, '#ff7a5c', '#5a1008');

  // Chimney
  ctx.fillStyle = '#3a2018';
  roundRect(ctx, x - 9, y - 28 - level * 3, 18, 26 + level * 3, 3);
  ctx.fill();
  ctx.fillStyle = '#2a1810';
  ctx.fillRect(x - 6, y - 20, 4, 10);
  ctx.fillRect(x + 2, y - 18, 4, 8);

  // Brazier bowl
  const bowlY = y - 28 - level * 3;
  ctx.fillStyle = '#1a100c';
  ctx.beginPath();
  ctx.ellipse(x, bowlY, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a2818';
  ctx.beginPath();
  ctx.ellipse(x, bowlY, 14, 5, 0, Math.PI, 0);
  ctx.fill();

  // Flames (flicker)
  const flicker = Math.sin(time * 12) * 3;
  const fy = bowlY - 4;
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.moveTo(x, fy - 18 + flicker);
  ctx.quadraticCurveTo(x + 14, fy - 2, x + 4, fy + 8);
  ctx.quadraticCurveTo(x, fy + 2, x - 4, fy + 8);
  ctx.quadraticCurveTo(x - 14, fy - 2, x, fy - 18 + flicker);
  ctx.fill();
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.moveTo(x, fy - 12 + flicker * 0.5);
  ctx.quadraticCurveTo(x + 8, fy, x + 2, fy + 6);
  ctx.quadraticCurveTo(x, fy + 1, x - 2, fy + 6);
  ctx.quadraticCurveTo(x - 8, fy, x, fy - 12 + flicker * 0.5);
  ctx.fill();
  ctx.fillStyle = '#fff3a0';
  ctx.beginPath();
  ctx.moveTo(x, fy - 7);
  ctx.quadraticCurveTo(x + 4, fy, x, fy + 4);
  ctx.quadraticCurveTo(x - 4, fy, x, fy - 7);
  ctx.fill();

  ctx.shadowColor = '#e85d4c';
  ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(255, 140, 60, 0.35)';
  ctx.beginPath();
  ctx.arc(x, fy - 4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawPoisonTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  level: number,
  time: number,
): void {
  stoneBase(ctx, x, y, 16);

  // Alchemist hut
  brickFill(ctx, x - 13, y - 8, 26, 22, '#8adf90', '#1a5a30');
  ctx.fillStyle = '#2a3a28';
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 8);
  ctx.lineTo(x, y - 20);
  ctx.lineTo(x + 15, y - 8);
  ctx.closePath();
  ctx.fill();

  // Window
  ctx.fillStyle = 'rgba(180, 255, 160, 0.35)';
  roundRect(ctx, x - 4, y - 2, 8, 8, 2);
  ctx.fill();

  // Tripod legs
  ctx.strokeStyle = '#2a3a30';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 10);
  ctx.lineTo(x - 16, y + 10);
  ctx.moveTo(x + 8, y - 10);
  ctx.lineTo(x + 16, y + 10);
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y + 10);
  ctx.stroke();

  // Cauldron
  const cy = y - 16 - level * 2;
  ctx.fillStyle = '#1a2a20';
  ctx.beginPath();
  ctx.ellipse(x, cy, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a5a40';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, cy - 2, 15, 6, 0, Math.PI, 0);
  ctx.stroke();

  const brew = ctx.createRadialGradient(x - 3, cy - 4, 1, x, cy - 2, 12);
  brew.addColorStop(0, '#d4ff90');
  brew.addColorStop(0.5, '#3dff8a');
  brew.addColorStop(1, '#1a6b3a');
  ctx.fillStyle = brew;
  ctx.beginPath();
  ctx.ellipse(x, cy - 3, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bubbles
  const t = time * 4;
  ctx.fillStyle = 'rgba(220, 255, 230, 0.95)';
  ctx.beginPath();
  ctx.arc(x - 5 + Math.sin(t) * 2, cy - 14 - (t % 3), 3.5, 0, Math.PI * 2);
  ctx.arc(x + 4 + Math.cos(t * 1.3) * 2, cy - 20 - ((t * 1.2) % 4), 2.8, 0, Math.PI * 2);
  ctx.arc(x + Math.sin(t * 0.7) * 3, cy - 26 - ((t * 0.8) % 3), 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Pipe spout
  ctx.fillStyle = '#4a6a50';
  roundRect(ctx, x + 10, cy - 6, 10, 4, 2);
  ctx.fill();
}

function drawSpecFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  spec: Tower['spec'],
): void {
  if (!spec) return;
  ctx.save();
  ctx.font = 'bold 9px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, x - 22, y - 48, 44, 12, 3);
  ctx.fill();
  ctx.fillStyle = '#f4d35e';
  const label =
    spec === 'rapidFire'
      ? 'RAPID'
      : spec === 'heavyBolt'
        ? 'HEAVY'
        : spec === 'cluster'
          ? 'CLUSTER'
          : spec === 'siege'
            ? 'SIEGE'
            : spec === 'deepFreeze'
              ? 'DEEP'
              : spec === 'frostNova'
                ? 'NOVA'
                : spec === 'stormChain'
                  ? 'STORM'
                  : spec === 'thunderstrike'
                    ? 'STRIKE'
                    : spec === 'inferno'
                      ? 'INFERNO'
                      : spec === 'meteor'
                        ? 'METEOR'
                        : spec === 'contagion'
                          ? 'PLAGUE'
                          : 'SPIKE';
  ctx.fillText(label, x, y - 39);

  // Visual accents per path
  if (spec === 'rapidFire') {
    ctx.strokeStyle = 'rgba(91, 159, 212, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 14, y - 30);
    ctx.lineTo(x + 22, y - 34);
    ctx.moveTo(x + 14, y - 26);
    ctx.lineTo(x + 22, y - 26);
    ctx.stroke();
  } else if (spec === 'heavyBolt') {
    ctx.fillStyle = '#eef4ff';
    ctx.beginPath();
    ctx.moveTo(x + 18, y - 28);
    ctx.lineTo(x + 28, y - 30);
    ctx.lineTo(x + 18, y - 32);
    ctx.closePath();
    ctx.fill();
  } else if (spec === 'cluster') {
    ctx.fillStyle = 'rgba(217, 119, 58, 0.8)';
    for (const [ox, oy] of [
      [16, -28],
      [22, -24],
      [20, -32],
    ]) {
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (spec === 'siege') {
    ctx.fillStyle = '#1a1514';
    ctx.beginPath();
    ctx.arc(x + 20, y - 28, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (spec === 'deepFreeze' || spec === 'frostNova') {
    ctx.strokeStyle = 'rgba(180, 235, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y - 20, spec === 'frostNova' ? 16 : 10, 0, Math.PI * 2);
    ctx.stroke();
  } else if (spec === 'stormChain' || spec === 'thunderstrike') {
    ctx.strokeStyle = '#fff6b0';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#f0c94d';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 40);
    ctx.lineTo(x - 2, y - 48);
    ctx.lineTo(x + 4, y - 42);
    ctx.lineTo(x + 12, y - 52);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (spec === 'inferno' || spec === 'meteor') {
    ctx.fillStyle = spec === 'meteor' ? '#ff6b35' : '#ffb347';
    ctx.beginPath();
    ctx.arc(x + 14, y - 36, spec === 'meteor' ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (spec === 'contagion' || spec === 'venomSpike') {
    ctx.fillStyle = '#3dff8a';
    ctx.beginPath();
    ctx.arc(x + 12, y - 34, 3, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 30, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTower(
  ctx: CanvasRenderingContext2D,
  t: Tower,
  selected: boolean,
  time = 0,
): void {
  const { x, y } = t;
  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  switch (t.kind) {
    case 'arrow':
      drawArrowTower(ctx, x, y, t.level, t.aimAngle);
      break;
    case 'cannon':
      drawCannonTower(ctx, x, y, t.level, t.aimAngle);
      break;
    case 'ice':
      drawIceTower(ctx, x, y, t.level, time);
      break;
    case 'lightning':
      drawLightningTower(ctx, x, y, t.level, time);
      break;
    case 'fire':
      drawFireTower(ctx, x, y, t.level, time);
      break;
    case 'poison':
      drawPoisonTower(ctx, x, y, t.level, time);
      break;
  }

  drawSpecFlourish(ctx, x, y, t.spec);
  levelBadge(ctx, x, y, t.level);
}
