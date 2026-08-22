import { describe, expect, it } from 'vitest';
import { TRAY_SLOTS, slotsForTab, type TrayTab } from '../src/game/constants';

describe('build tray tabs', () => {
  it('keeps two pages of six slots so buttons never shrink to fill', () => {
    const tabs: TrayTab[] = ['keeps', 'elements'];
    for (const tab of tabs) {
      const slots = slotsForTab(tab);
      expect(slots).toHaveLength(6);
      expect(TRAY_SLOTS[tab]).toHaveLength(6);
    }
  });

  it('puts Arrow, Cannon, Longshot, and Hall on Keeps and leaves empty cells empty', () => {
    expect(TRAY_SLOTS.keeps).toEqual(['arrow', 'cannon', 'longshot', 'hall', null, null]);
    expect(TRAY_SLOTS.keeps.filter((slot) => slot == null)).toHaveLength(2);
  });

  it('puts Ice, Lightning, Fire, Poison, and Void on Elements with empty cells left empty', () => {
    expect(TRAY_SLOTS.elements).toEqual(['ice', 'lightning', 'fire', 'poison', 'void', null]);
    expect(TRAY_SLOTS.elements.filter((slot) => slot == null)).toHaveLength(1);
  });
});
