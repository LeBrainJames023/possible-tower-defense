import { describe, expect, it } from 'vitest';
import { AudioBus } from '../src/game/audio';

describe('AudioBus', () => {
  it('stays silent when muted and does not throw', () => {
    const bus = new AudioBus();
    bus.muted = true;
    expect(() => {
      bus.unlock();
      bus.place();
      bus.ui();
      bus.fire('arrow');
      bus.fire('cannon');
      bus.impact('ice');
      bus.pull();
      bus.kill();
      bus.leak();
      bus.waveStart();
      bus.setScore('battle');
      bus.setAmbience(true);
    }).not.toThrow();
    expect(bus.muted).toBe(true);
  });

  it('toggleMute turns sound off, then back on without throwing in Node', () => {
    const bus = new AudioBus();
    expect(bus.toggleMute()).toBe(true);
    expect(bus.muted).toBe(true);
    expect(bus.toggleMute()).toBe(false);
    expect(bus.muted).toBe(false);
  });

  it('setScore off stops the pad while muted', () => {
    const bus = new AudioBus();
    bus.muted = true;
    bus.setScore('prepare');
    bus.setScore('off');
    expect(bus.muted).toBe(true);
  });
});
