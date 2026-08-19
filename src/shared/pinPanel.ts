/** Pin an on-map tray beside a tile, flipping left if the right side overflows. */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function tileBoxInHost(
  c: number,
  r: number,
  cols: number,
  rows: number,
  canvas: Rect,
  host: { left: number; top: number },
): Rect {
  const tw = canvas.width / cols;
  const th = canvas.height / rows;
  return {
    left: canvas.left - host.left + c * tw,
    top: canvas.top - host.top + r * th,
    width: tw,
    height: th,
  };
}

export function pinRectBeside(
  tile: Rect,
  panel: { width: number; height: number },
  host: { width: number; height: number },
  gap = 8,
  pad = 8,
): { left: number; top: number; side: 'right' | 'left' } {
  let side: 'right' | 'left' = 'right';
  let left = tile.left + tile.width + gap;
  if (left + panel.width > host.width - pad) {
    side = 'left';
    left = tile.left - panel.width - gap;
  }
  left = Math.max(pad, Math.min(left, Math.max(pad, host.width - panel.width - pad)));
  let top = tile.top + tile.height / 2 - panel.height / 2;
  top = Math.max(pad, Math.min(top, Math.max(pad, host.height - panel.height - pad)));
  return { left, top, side };
}
