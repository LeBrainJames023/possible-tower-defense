import type { FriendlyUnit } from '../entities';

export function drawFriendly(ctx: CanvasRenderingContext2D, u: FriendlyUnit): void {
  const { x, y } = u.pos;
  const face = u.facing >= 0 ? 1 : -1;
  const knight = u.unitKind === 'knight';

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 8, knight ? 12 : 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (u.unitKind === 'paladin') {
    const plate = ctx.createLinearGradient(-8, -16, 8, 10);
    plate.addColorStop(0, '#fff6d0');
    plate.addColorStop(1, '#8a6b20');
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-6, -16);
    ctx.lineTo(6, -16);
    ctx.lineTo(8, -4);
    ctx.lineTo(5, 8);
    ctx.lineTo(-5, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c45c4a';
    ctx.fillRect(-5, -10, 10, 12);
    ctx.fillStyle = '#f4d35e';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(3, -2);
    ctx.lineTo(0, 4);
    ctx.lineTo(-3, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8c4a0';
    ctx.beginPath();
    ctx.arc(0, -18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7e7a0';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fff3a0';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, -24, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f0e6c0';
    ctx.fillRect(8, -16, 3, 20);
    ctx.fillStyle = '#f4d35e';
    ctx.beginPath();
    ctx.moveTo(9.5, -20);
    ctx.lineTo(14, -14);
    ctx.lineTo(9.5, -10);
    ctx.lineTo(5, -14);
    ctx.closePath();
    ctx.fill();
  } else if (knight) {
    // Body / plate
    const plate = ctx.createLinearGradient(-8, -16, 8, 10);
    plate.addColorStop(0, '#d0d8e8');
    plate.addColorStop(1, '#3a4558');
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-6, -16);
    ctx.lineTo(6, -16);
    ctx.lineTo(8, -4);
    ctx.lineTo(5, 8);
    ctx.lineTo(-5, 8);
    ctx.closePath();
    ctx.fill();

    // Helm
    ctx.fillStyle = '#8a96a8';
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(-5, -20, 10, 3);
    ctx.fillStyle = '#f4d35e';
    ctx.fillRect(-1, -26, 2, 8);

    // Shield
    ctx.fillStyle = '#6b8cae';
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-18, -6);
    ctx.lineTo(-18, 4);
    ctx.lineTo(-12, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f4d35e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sword
    ctx.fillStyle = '#c0c8d0';
    ctx.fillRect(8, -18, 3, 22);
    ctx.fillStyle = '#f4d35e';
    ctx.fillRect(5, -2, 9, 3);
  } else {
    // Warrior tunic
    const tunic = ctx.createLinearGradient(-7, -14, 7, 8);
    tunic.addColorStop(0, '#e8c89a');
    tunic.addColorStop(1, '#6a3a1a');
    ctx.fillStyle = tunic;
    ctx.beginPath();
    ctx.moveTo(-7, -2);
    ctx.lineTo(-5, -14);
    ctx.lineTo(5, -14);
    ctx.lineTo(7, -2);
    ctx.lineTo(4, 8);
    ctx.lineTo(-4, 8);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#e8c4a0';
    ctx.beginPath();
    ctx.arc(0, -17, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2818';
    ctx.beginPath();
    ctx.arc(0, -20, 6.5, Math.PI, 0);
    ctx.fill();

    // Axe
    ctx.strokeStyle = '#5a3d22';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(10, -16);
    ctx.stroke();
    ctx.fillStyle = '#a0a8b0';
    ctx.beginPath();
    ctx.moveTo(10, -18);
    ctx.lineTo(18, -14);
    ctx.lineTo(10, -8);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // HP bar
  const w = knight ? 22 : 18;
  const ratio = u.hp / u.maxHp;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x - w / 2, y - 34, w, 4);
  ctx.fillStyle = ratio > 0.35 ? '#57cc99' : '#ef476f';
  ctx.fillRect(x - w / 2, y - 34, w * ratio, 4);

  // Fighting clash spark
  if (u.targetEnemyId != null) {
    ctx.fillStyle = 'rgba(244, 211, 94, 0.7)';
    ctx.beginPath();
    ctx.arc(x + face * 10, y - 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
