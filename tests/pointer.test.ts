import { describe, expect, it } from 'vitest';
import { clientToMap, layoutMapView } from '../src/shared/pointer';

describe('map view contain-fit', () => {
  it('sizes the canvas to the map when the host matches', () => {
    const view = layoutMapView(1280, 768, 1280, 768);
    expect(view.viewW).toBe(1280);
    expect(view.viewH).toBe(768);
    expect(view.padX).toBe(0);
    expect(view.padY).toBe(0);
  });

  it('keeps map aspect in a wide host (letterbox is outside the canvas)', () => {
    const view = layoutMapView(1600, 768, 1280, 768);
    expect(view.viewW).toBe(1280);
    expect(view.viewH).toBe(768);
    expect(view.padX).toBe(0);
    expect(view.padY).toBe(0);
  });

  it('keeps map aspect in a tall host', () => {
    const view = layoutMapView(1280, 968, 1280, 768);
    expect(view.viewW).toBe(1280);
    expect(view.viewH).toBe(768);
    expect(view.padX).toBe(0);
  });

  it('scales down uniformly when the host is smaller', () => {
    const view = layoutMapView(640, 384, 1280, 768);
    expect(view.viewW).toBe(640);
    expect(view.viewH).toBe(384);
    expect(view.scale).toBe(0.5);
  });
});

describe('client pointer → map', () => {
  const mapW = 1280;
  const mapH = 768;

  it('maps the top-left of the css box to map 0,0', () => {
    const rect = { left: 100, top: 50, width: 640, height: 384 };
    expect(clientToMap(100, 50, rect, mapW, mapH)).toEqual({ x: 0, y: 0 });
  });

  it('maps the center of any css size to the map center', () => {
    const rect = { left: 0, top: 0, width: 640, height: 384 };
    expect(clientToMap(320, 192, rect, mapW, mapH)).toEqual({ x: 640, y: 384 });
  });

  it('maps a point one tile in on a half-scale box', () => {
    const rect = { left: 10, top: 20, width: 640, height: 384 };
    const pt = clientToMap(10 + 32, 20 + 32, rect, mapW, mapH);
    expect(pt?.x).toBeCloseTo(64);
    expect(pt?.y).toBeCloseTo(64);
  });

  it('returns null outside the box', () => {
    const rect = { left: 0, top: 0, width: 640, height: 384 };
    expect(clientToMap(-1, 0, rect, mapW, mapH)).toBeNull();
    expect(clientToMap(0, -1, rect, mapW, mapH)).toBeNull();
    expect(clientToMap(641, 0, rect, mapW, mapH)).toBeNull();
    expect(clientToMap(0, 385, rect, mapW, mapH)).toBeNull();
  });
});
