import { describe, expect, it } from 'vitest';
import { pinRectBeside, tileBoxInHost } from '../src/shared/pinPanel';

describe('tileBoxInHost', () => {
  it('maps a cell into host space from the canvas box', () => {
    const box = tileBoxInHost(
      2,
      1,
      20,
      12,
      { left: 100, top: 50, width: 640, height: 384 },
      { left: 80, top: 40 },
    );
    expect(box.left).toBe(20 + 64);
    expect(box.top).toBe(10 + 32);
    expect(box.width).toBe(32);
    expect(box.height).toBe(32);
  });
});

describe('pinRectBeside', () => {
  const panel = { width: 180, height: 240 };

  it('sits to the right of the tile when there is room', () => {
    const pin = pinRectBeside(
      { left: 40, top: 80, width: 32, height: 32 },
      panel,
      { width: 800, height: 500 },
    );
    expect(pin.side).toBe('right');
    expect(pin.left).toBe(40 + 32 + 8);
  });

  it('flips left when the right side would overflow', () => {
    const pin = pinRectBeside(
      { left: 700, top: 80, width: 32, height: 32 },
      panel,
      { width: 800, height: 500 },
    );
    expect(pin.side).toBe('left');
    expect(pin.left).toBe(700 - 180 - 8);
  });

  it('clamps vertically so the tray stays on the map', () => {
    const pin = pinRectBeside(
      { left: 40, top: 0, width: 32, height: 32 },
      panel,
      { width: 800, height: 200 },
    );
    expect(pin.top).toBe(8);
  });
});
