/** Fit the map inside a view (object-fit: contain) and map pointers onto it. */

export interface MapView {
  scale: number;
  padX: number;
  padY: number;
  viewW: number;
  viewH: number;
  mapW: number;
  mapH: number;
}

export function layoutMapView(viewW: number, viewH: number, mapW: number, mapH: number): MapView {
  const vw = Math.max(1, viewW);
  const vh = Math.max(1, viewH);
  const scale = Math.min(vw / mapW, vh / mapH);
  return {
    scale,
    padX: (vw - mapW * scale) / 2,
    padY: (vh - mapH * scale) / 2,
    viewW: vw,
    viewH: vh,
    mapW,
    mapH,
  };
}

export function identityMapView(mapW: number, mapH: number): MapView {
  return { scale: 1, padX: 0, padY: 0, viewW: mapW, viewH: mapH, mapW, mapH };
}

/** Convert canvas-local pixels (offsetX/Y) to map pixels using the same contain-fit as drawing. */
export function offsetToMap(
  offsetX: number,
  offsetY: number,
  view: MapView,
): { x: number; y: number } | null {
  if (view.scale <= 0) return null;
  const x = (offsetX - view.padX) / view.scale;
  const y = (offsetY - view.padY) / view.scale;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (x < 0 || y < 0 || x >= view.mapW || y >= view.mapH) return null;
  return { x, y };
}

export function clientToMap(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number },
  view: MapView,
): { x: number; y: number } | null {
  return offsetToMap(clientX - rect.left, clientY - rect.top, view);
}

/**
 * Canvas CSS size = backing store = host size (no bitmap stretching).
 * The map is letterboxed inside via MapView; draw and pick share that view.
 */
export function fitCanvasToHost(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  mapW: number,
  mapH: number,
): MapView {
  const viewW = Math.max(1, Math.floor(host.clientWidth));
  const viewH = Math.max(1, Math.floor(host.clientHeight));
  canvas.style.width = `${viewW}px`;
  canvas.style.height = `${viewH}px`;
  if (canvas.width !== viewW) canvas.width = viewW;
  if (canvas.height !== viewH) canvas.height = viewH;
  return layoutMapView(viewW, viewH, mapW, mapH);
}
