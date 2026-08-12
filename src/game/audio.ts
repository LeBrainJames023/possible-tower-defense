import type { TowerKind } from './constants';

/**
 * Tiny procedural SFX bus (Web Audio). No sample files.
 * Unlocks on first click — browsers block audio until then.
 */
export class AudioBus {
  muted = false;
  private ctx: AudioContext | null = null;
  private lastShot = 0;

  unlock(): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (ctx.state === 'suspended') void ctx.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) this.ctx?.suspend();
    else this.unlock();
    return this.muted;
  }

  ui(): void {
    this.tone(420, 0.05, 'square', 0.04);
  }

  fire(kind: TowerKind): void {
    const now = performance.now();
    if (now - this.lastShot < 40) return;
    this.lastShot = now;
    switch (kind) {
      case 'arrow':
        this.tone(880, 0.06, 'square', 0.05);
        break;
      case 'cannon':
        this.noise(0.12, 0.08, 180);
        this.tone(90, 0.14, 'sine', 0.1);
        break;
      case 'ice':
        this.tone(1400, 0.08, 'triangle', 0.045);
        break;
      case 'lightning':
        this.noise(0.07, 0.07, 900);
        this.tone(1600, 0.05, 'sawtooth', 0.04);
        break;
      case 'fire':
        this.noise(0.1, 0.05, 300);
        this.tone(220, 0.09, 'sawtooth', 0.04);
        break;
      case 'poison':
        this.tone(310, 0.1, 'sine', 0.05);
        break;
    }
  }

  impact(kind: TowerKind): void {
    if (kind === 'cannon') {
      this.noise(0.14, 0.1, 120);
      this.tone(70, 0.16, 'sine', 0.12);
    } else if (kind === 'lightning') {
      this.tone(1200, 0.04, 'square', 0.05);
    } else {
      this.tone(240, 0.05, 'triangle', 0.04);
    }
  }

  hit(): void {
    this.tone(180, 0.04, 'square', 0.03);
  }

  kill(): void {
    this.tone(520, 0.07, 'square', 0.045);
    this.tone(780, 0.05, 'triangle', 0.03, 0.03);
  }

  leak(): void {
    this.tone(140, 0.18, 'sawtooth', 0.07);
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    delay = 0,
  ): void {
    if (this.muted) return;
    try {
      const ctx = this.ensure();
      if (ctx.state !== 'running') return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.55), t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      /* audio optional */
    }
  }

  private noise(dur: number, vol: number, hp: number): void {
    if (this.muted) return;
    try {
      const ctx = this.ensure();
      if (ctx.state !== 'running') return;
      const n = ctx.sampleRate * dur;
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = hp;
      const gain = ctx.createGain();
      const t0 = ctx.currentTime;
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t0);
    } catch {
      /* audio optional */
    }
  }
}
