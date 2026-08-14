import type { TowerKind } from './constants';

/** Sit under the wind bed — old mix was peaking too hard on every shot. */
const MIX = 0.48;

/**
 * Combat SFX stay procedural (Web Audio). Wind/water beds are baked mp3 loops.
 * Unlocks on first click — browsers block audio until then.
 */
export class AudioBus {
  muted = false;
  private ctx: AudioContext | null = null;
  private lastShot = 0;
  private windBuf: AudioBuffer | null = null;
  private waterBuf: AudioBuffer | null = null;
  private windSrc: AudioBufferSourceNode | null = null;
  private waterSrc: AudioBufferSourceNode | null = null;
  private bedsPromise: Promise<void> | null = null;
  private wet = false;

  unlock(): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (ctx.state === 'suspended') void ctx.resume();
    void this.loadBeds().then(() => this.startAmbience(this.wet));
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAmbience();
      this.ctx?.suspend();
    } else {
      this.unlock();
    }
    return this.muted;
  }

  setAmbience(wet: boolean): void {
    this.wet = wet;
    if (this.muted) {
      this.stopAmbience();
      return;
    }
    void this.loadBeds().then(() => this.startAmbience(this.wet));
  }

  place(): void {
    this.noise(0.06, 0.05, 220);
    this.tone(160, 0.08, 'sine', 0.045);
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
        this.noise(0.05, 0.05, 2800);
        this.tone(1100, 0.04, 'triangle', 0.035);
        break;
      case 'cannon':
        this.noise(0.08, 0.07, 110, 'lowpass');
        this.tone(64, 0.12, 'sine', 0.07);
        break;
      case 'ice':
        this.noise(0.07, 0.03, 3600);
        this.tone(1480, 0.08, 'sine', 0.035, 0, 1.45);
        break;
      case 'lightning':
        this.noise(0.028, 0.07, 2400);
        this.tone(2100, 0.03, 'sawtooth', 0.04);
        this.tone(420, 0.05, 'square', 0.02, 0.018);
        break;
      case 'fire':
        this.noise(0.1, 0.05, 220, 'lowpass');
        this.crackle(0.028, 4);
        break;
      case 'poison':
        this.noise(0.09, 0.04, 280, 'lowpass');
        this.tone(220, 0.1, 'sine', 0.035, 0, 0.4);
        break;
    }
  }

  impact(kind: TowerKind): void {
    switch (kind) {
      case 'arrow':
        this.noise(0.035, 0.04, 1100);
        this.tone(190, 0.045, 'triangle', 0.03);
        break;
      case 'cannon':
        this.noise(0.28, 0.09, 70, 'lowpass');
        this.tone(48, 0.26, 'sine', 0.08);
        this.tone(92, 0.12, 'triangle', 0.03, 0.05);
        this.noise(0.16, 0.04, 180, 'lowpass', 0.06);
        break;
      case 'ice':
        this.noise(0.08, 0.045, 4200);
        this.tone(1760, 0.05, 'triangle', 0.04);
        this.tone(2400, 0.04, 'sine', 0.025, 0.02, 1.2);
        this.tone(880, 0.07, 'sine', 0.02, 0.04);
        break;
      case 'lightning':
        this.noise(0.04, 0.055, 1800);
        this.tone(1600, 0.03, 'square', 0.035);
        this.tone(280, 0.06, 'sawtooth', 0.02, 0.02);
        break;
      case 'fire':
        this.noise(0.1, 0.05, 140, 'lowpass');
        this.tone(70, 0.1, 'sine', 0.04);
        this.crackle(0.032, 6, 0.02);
        break;
      case 'poison':
        this.noise(0.1, 0.05, 240, 'lowpass');
        this.tone(150, 0.1, 'sine', 0.04, 0, 0.35);
        break;
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

  private loadBeds(): Promise<void> {
    if (!this.bedsPromise) {
      this.bedsPromise = (async () => {
        try {
          const ctx = this.ensure();
          this.windBuf = await this.decode('/sfx/wind.mp3', ctx);
          this.waterBuf = await this.decode('/sfx/water.mp3', ctx);
        } catch {
          /* beds optional */
        }
      })();
    }
    return this.bedsPromise;
  }

  private async decode(url: string, ctx: AudioContext): Promise<AudioBuffer | null> {
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.arrayBuffer();
    return ctx.decodeAudioData(raw.slice(0));
  }

  private startAmbience(wet: boolean): void {
    if (this.muted) return;
    this.stopAmbience();
    const ctx = this.ensure();
    if (ctx.state !== 'running') return;
    if (this.windBuf) {
      this.windSrc = this.loop(ctx, this.windBuf, 0.045);
    }
    if (this.waterBuf) {
      const g = ctx.createGain();
      g.gain.value = wet ? 0.05 : 0.012;
      const src = ctx.createBufferSource();
      src.buffer = this.waterBuf;
      src.loop = true;
      src.connect(g);
      g.connect(ctx.destination);
      src.start();
      this.waterSrc = src;
    }
  }

  stopAmbience(): void {
    try {
      this.windSrc?.stop();
    } catch {
      /* already stopped */
    }
    try {
      this.waterSrc?.stop();
    } catch {
      /* already stopped */
    }
    this.windSrc = null;
    this.waterSrc = null;
  }

  private loop(ctx: AudioContext, buf: AudioBuffer, vol: number): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.loop = true;
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    return src;
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    }
    return this.ctx;
  }

  private crackle(vol: number, pops: number, delay = 0): void {
    for (let i = 0; i < pops; i++) {
      this.noise(
        0.016 + Math.random() * 0.02,
        vol,
        1300 + Math.random() * 1800,
        'bandpass',
        delay + i * 0.03,
      );
    }
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    delay = 0,
    endRatio = 0.55,
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
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * endRatio), t0 + dur);
      gain.gain.setValueAtTime(vol * MIX, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      /* audio optional */
    }
  }

  private noise(
    dur: number,
    vol: number,
    hp: number,
    type: BiquadFilterType = 'bandpass',
    delay = 0,
  ): void {
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
      filter.type = type;
      filter.frequency.value = hp;
      const gain = ctx.createGain();
      const t0 = ctx.currentTime + delay;
      gain.gain.setValueAtTime(vol * MIX, t0);
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
