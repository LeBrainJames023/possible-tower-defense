import type { TowerKind } from './constants';

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
