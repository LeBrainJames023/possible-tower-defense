/**
 * Pointer mapping for a BCI / OS cursor.
 *
 * Gold standard: the cursor lives in viewport (client) space. The canvas
 * element's on-screen box *is* the map. Fraction across that box = fraction
 * across the map. Never use offsetX/offsetY on <canvas> — browsers disagree
 * on whether that is CSS pixels or bitmap pixels, and a wrong hit looks like
 * "the tile two or three over."
 *
 * Letterbox bars belong on the flex parent, not inside the bitmap.
 */

export interface MapView {
  scale: number;
  padX: number;
  padY: number;
  viewW: number;
  viewH: number;
  mapW: number;
  mapH: number;
}

export interface ClientRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Size a canvas so the map contain-fits the host. No internal padding. */
export function layoutMapView(hostW: number, hostH: number, mapW: number, mapH: number): MapView {
  const hw = Math.max(1, hostW);
  const hh = Math.max(1, hostH);
  const scale = Math.min(hw / mapW, hh / mapH);
  const viewW = Math.max(1, Math.round(mapW * scale));
  const viewH = Math.max(1, Math.round(mapH * scale));
  return {
    scale: viewW / mapW,
    padX: 0,
    padY: 0,
    viewW,
    viewH,
    mapW,
    mapH,
  };
}

export function identityMapView(mapW: number, mapH: number): MapView {
  return { scale: 1, padX: 0, padY: 0, viewW: mapW, viewH: mapH, mapW, mapH };
}

/**
 * Convert a viewport pointer onto map pixels using the canvas CSS box.
 * `rect` must be getBoundingClientRect() of the canvas.
 */
export function clientToMap(
  clientX: number,
  clientY: number,
  rect: ClientRect,
  mapW: number,
  mapH: number,
): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
  if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return null;
  return {
    x: Math.min(nx, 1 - 1e-9) * mapW,
    y: Math.min(ny, 1 - 1e-9) * mapH,
  };
}

/**
 * Canvas CSS size = backing store = contain-fit map box (not the host).
 * Parent flex-centers this box; leftover space is letterbox, not map.
 */
export function fitCanvasToHost(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  mapW: number,
  mapH: number,
): MapView {
  const view = layoutMapView(host.clientWidth, host.clientHeight, mapW, mapH);
  canvas.style.width = `${view.viewW}px`;
  canvas.style.height = `${view.viewH}px`;
  if (canvas.width !== view.viewW) canvas.width = view.viewW;
  if (canvas.height !== view.viewH) canvas.height = view.viewH;
  return view;
}
