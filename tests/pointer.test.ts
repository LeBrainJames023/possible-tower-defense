import { describe, expect, it } from 'vitest';
import { clientToMap, layoutMapView, offsetToMap } from '../src/shared/pointer';

describe('map view contain-fit', () => {
  it('fills the view when aspect matches', () => {
    const view = layoutMapView(1280, 768, 1280, 768);
    expect(view.scale).toBe(1);
    expect(view.padX).toBe(0);
    expect(view.padY).toBe(0);
    expect(offsetToMap(64, 64, view)).toEqual({ x: 64, y: 64 });
  });

  it('letterboxes horizontally when the view is too wide', () => {
    const view = layoutMapView(1600, 768, 1280, 768);
    expect(view.scale).toBe(1);
    expect(view.padX).toBe(160);
    expect(view.padY).toBe(0);
    expect(offsetToMap(160 + 64, 64, view)).toEqual({ x: 64, y: 64 });
    expect(offsetToMap(2, 64, view)).toBeNull();
  });

  it('letterboxes vertically when the view is too tall', () => {
    const view = layoutMapView(1280, 968, 1280, 768);
    expect(view.scale).toBe(1);
    expect(view.padX).toBe(0);
    expect(view.padY).toBe(100);
    expect(offsetToMap(64, 100 + 64, view)).toEqual({ x: 64, y: 64 });
    expect(offsetToMap(64, 10, view)).toBeNull();
  });

  it('scales down uniformly when the view is smaller', () => {
    const view = layoutMapView(640, 384, 1280, 768);
    expect(view.scale).toBe(0.5);
    expect(offsetToMap(32, 32, view)).toEqual({ x: 64, y: 64 });
  });

  it('maps client coordinates through the same pads', () => {
    const view = layoutMapView(1600, 768, 1280, 768);
    const pt = clientToMap(10 + 160 + 64, 20 + 64, { left: 10, top: 20 }, view);
    expect(pt).toEqual({ x: 64, y: 64 });
  });
});
