import type { TowerKind } from './constants';
import {
  sfxFire,
  sfxHit,
  sfxImpact,
  sfxKill,
  sfxLeak,
  sfxPlace,
  sfxPull,
  sfxUi,
  sfxWaveStart,
} from './audioSfx';

type ScoreMode = 'off' | 'prepare' | 'battle';

/**
 * Combat SFX stay procedural (Web Audio). Wind/water beds are baked mp3 loops.
 * Unlocks on first click — browsers block audio until then.
 *
 * Page-local only: mute/suspend this tab. Does not touch OS TTS or other apps.
 */
export class AudioBus {
  muted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private lastShot = 0;
  private lastImpact = 0;
  private lastKill = 0;
  private windBuf: AudioBuffer | null = null;
  private waterBuf: AudioBuffer | null = null;
  private windSrc: AudioBufferSourceNode | null = null;
  private waterSrc: AudioBufferSourceNode | null = null;
  private bedsPromise: Promise<void> | null = null;
  private wet = false;
  private score: ScoreMode = 'off';
  private musicGain: GainNode | null = null;
  private scoreNodes: AudioScheduledSourceNode[] = [];
  private musicVol = 0.07;

  unlock(): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    void this.loadBeds().then(() => {
      this.startAmbience(this.wet);
      this.startScore(this.score);
    });
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAmbience();
      this.stopScore();
      if (this.master) this.master.gain.value = 0;
      void this.ctx?.suspend();
    } else {
      if (this.master) this.master.gain.value = 1;
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

  setScore(mode: ScoreMode): void {
    this.score = mode;
    this.stopScore();
    if (this.muted || mode === 'off') return;
    this.startScore(mode);
  }

  waveStart(): void {
    if (!this.ready()) return;
    sfxWaveStart(this.ctx!, this.sfxOut());
    this.duck();
  }

  duck(): void {
    if (this.muted || !this.musicGain || !this.ctx) return;
    try {
      const g = this.musicGain.gain;
      const t0 = this.ctx.currentTime;
      g.cancelScheduledValues(t0);
      g.setValueAtTime(Math.max(0.008, g.value), t0);
      g.linearRampToValueAtTime(this.musicVol * 0.32, t0 + 0.04);
      g.linearRampToValueAtTime(this.musicVol, t0 + 0.28);
    } catch {
      /* audio optional */
    }
  }

  place(): void {
    if (!this.ready()) return;
    sfxPlace(this.ctx!, this.sfxOut());
  }

  ui(): void {
    if (!this.ready()) return;
    sfxUi(this.ctx!, this.sfxOut());
  }

  fire(kind: TowerKind): void {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastShot < 40) return;
    this.lastShot = now;
    sfxFire(this.ctx!, this.sfxOut(), kind);
    this.duck();
  }

  impact(kind: TowerKind): void {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastImpact < 25) return;
    this.lastImpact = now;
    sfxImpact(this.ctx!, this.sfxOut(), kind);
    this.duck();
  }

  pull(): void {
    if (!this.ready()) return;
    sfxPull(this.ctx!, this.sfxOut());
    this.duck();
  }

  hit(): void {
    if (!this.ready()) return;
    sfxHit(this.ctx!, this.sfxOut());
  }

  kill(): void {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastKill < 70) return;
    this.lastKill = now;
    sfxKill(this.ctx!, this.sfxOut());
  }

  leak(): void {
    if (!this.ready()) return;
    sfxLeak(this.ctx!, this.sfxOut());
  }

  private ready(): boolean {
    if (this.muted) return false;
    const ctx = this.ensure();
    if (!ctx) return false;
    if (ctx.state === 'suspended') void ctx.resume();
    return true;
  }

  private loadBeds(): Promise<void> {
    if (!this.bedsPromise) {
      this.bedsPromise = (async () => {
        try {
          const ctx = this.ensure();
          if (!ctx) return;
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
    if (!ctx || !this.master) return;
    if (this.windBuf) this.windSrc = this.loop(ctx, this.windBuf, 0.1);
    if (this.waterBuf) this.waterSrc = this.loop(ctx, this.waterBuf, wet ? 0.08 : 0.02);
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

  private startScore(mode: ScoreMode): void {
    if (mode === 'off' || this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    try {
      this.stopScore();
      this.musicVol = mode === 'prepare' ? 0.072 : 0.12;
      const master = ctx.createGain();
      master.gain.value = this.musicVol;
      master.connect(this.master);
      this.musicGain = master;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 0.7;
      filter.frequency.value = mode === 'prepare' ? 1400 : 900;
      filter.connect(master);

      const parts =
        mode === 'prepare'
          ? [
              { f: 110, type: 'sine' as const, v: 0.5 },
              { f: 165, type: 'sine' as const, v: 0.3 },
              { f: 220, type: 'triangle' as const, v: 0.12 },
              { f: 330, type: 'sine' as const, v: 0.06 },
            ]
          : [
              { f: 82, type: 'sine' as const, v: 0.58 },
              { f: 123, type: 'triangle' as const, v: 0.22 },
              { f: 164, type: 'sine' as const, v: 0.12 },
              { f: 246, type: 'sine' as const, v: 0.05 },
            ];
      for (const p of parts) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = p.type;
        osc.frequency.value = p.f;
        g.gain.value = p.v;
        osc.connect(g);
        g.connect(filter);
        osc.start();
        this.scoreNodes.push(osc);
      }

      const breath = ctx.createOscillator();
      const breathG = ctx.createGain();
      breath.frequency.value = mode === 'prepare' ? 0.09 : 1.55;
      breathG.gain.value = this.musicVol * (mode === 'prepare' ? 0.22 : 0.3);
      breath.connect(breathG);
      breathG.connect(master.gain);
      breath.start();
      this.scoreNodes.push(breath);

      const sweep = ctx.createOscillator();
      const sweepG = ctx.createGain();
      sweep.frequency.value = mode === 'prepare' ? 0.07 : 0.22;
      sweepG.gain.value = mode === 'prepare' ? 420 : 180;
      sweep.connect(sweepG);
      sweepG.connect(filter.frequency);
      sweep.start();
      this.scoreNodes.push(sweep);
    } catch {
      /* audio optional */
    }
  }

  private stopScore(): void {
    for (const node of this.scoreNodes) {
      try {
        node.stop();
      } catch {
        /* already stopped */
      }
    }
    this.scoreNodes = [];
    try {
      this.musicGain?.disconnect();
    } catch {
      /* already disconnected */
    }
    this.musicGain = null;
  }

  private loop(ctx: AudioContext, buf: AudioBuffer, vol: number): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    src.loop = true;
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(this.master ?? ctx.destination);
    src.start();
    return src;
  }

  private sfxOut(): AudioNode {
    return this.sfxGain ?? this.master ?? this.ctx!.destination;
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AC =
      typeof AudioContext !== 'undefined'
        ? AudioContext
        : typeof window !== 'undefined'
          ? window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          : undefined;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 8;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.14;
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 1;
    this.sfxGain.connect(compressor);
    compressor.connect(this.master);
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }
}
