/** Pin an on-map tray toward empty grass / a screen edge, keeping the path readable. */

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type PinSide = 'right' | 'left' | 'above' | 'below';

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

export function expandRect(r: Rect, pad: number): Rect {
  return {
    left: r.left - pad,
    top: r.top - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

export function rectsOverlapArea(a: Rect, b: Rect): number {
  const x = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
  return x * y;
}

function clampPanel(
  left: number,
  top: number,
  panel: { width: number; height: number },
  host: { width: number; height: number },
  pad: number,
): { left: number; top: number } {
  return {
    left: Math.max(pad, Math.min(left, Math.max(pad, host.width - panel.width - pad))),
    top: Math.max(pad, Math.min(top, Math.max(pad, host.height - panel.height - pad))),
  };
}

function scoreAgainst(box: Rect, avoid: Rect[]): number {
  let area = 0;
  for (const r of avoid) area += rectsOverlapArea(box, r);
  return area;
}

function distToTile(box: Rect, tile: Rect): number {
  const ax = box.left + box.width / 2;
  const ay = box.top + box.height / 2;
  const bx = tile.left + tile.width / 2;
  const by = tile.top + tile.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

export function pinRectBeside(
  tile: Rect,
  panel: { width: number; height: number },
  host: { width: number; height: number },
  gap = 8,
  pad = 8,
  avoid: Rect[] = [],
): { left: number; top: number; side: PinSide } {
  const midY = tile.top + tile.height / 2 - panel.height / 2;
  const midX = tile.left + tile.width / 2 - panel.width / 2;
  const snug: Array<{ side: PinSide; left: number; top: number }> = [
    { side: 'right', left: tile.left + tile.width + gap, top: midY },
    { side: 'left', left: tile.left - panel.width - gap, top: midY },
    { side: 'below', left: midX, top: tile.top + tile.height + gap },
    { side: 'above', left: midX, top: tile.top - panel.height - gap },
  ];

  if (avoid.length === 0) {
    let side: PinSide = 'right';
    let left = snug[0].left;
    if (left + panel.width > host.width - pad) {
      side = 'left';
      left = snug[1].left;
    }
    const clamped = clampPanel(left, midY, panel, host, pad);
    return { ...clamped, side };
  }

  const farLeft = pad;
  const farRight = host.width - panel.width - pad;
  const farTop = pad;
  const farBottom = host.height - panel.height - pad;
  const candidates: Array<{ side: PinSide; left: number; top: number }> = [
    ...snug,
    { side: 'right', left: farRight, top: midY },
    { side: 'left', left: farLeft, top: midY },
    { side: 'below', left: midX, top: farBottom },
    { side: 'above', left: midX, top: farTop },
    { side: 'left', left: farLeft, top: farTop },
    { side: 'right', left: farRight, top: farTop },
    { side: 'left', left: farLeft, top: farBottom },
    { side: 'right', left: farRight, top: farBottom },
  ];

  let best = candidates[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const c of candidates) {
    const pos = clampPanel(c.left, c.top, panel, host, pad);
    const box = { left: pos.left, top: pos.top, width: panel.width, height: panel.height };
    const overlap = scoreAgainst(box, avoid);
    const score = overlap * 1_000_000 - distToTile(box, tile);
    if (score < bestScore) {
      bestScore = score;
      best = { side: c.side, ...pos };
    }
  }
  return best;
}
