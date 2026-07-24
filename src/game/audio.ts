/** Procedural Web Audio SFX — no external asset files. */

const MUTE_KEY = 'ptd-mute-v1';

type SfxKind =
  | 'ui'
  | 'place'
  | 'shoot'
  | 'hit'
  | 'kill'
  | 'wave'
  | 'win'
  | 'lose'
  | 'upgrade';

class GameAudio {
  private ctx: AudioContext | null = null;
  muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  private ensure(): AudioContext | null {
    if (typeof AudioContext === 'undefined') {
      const W = globalThis as unknown as {
        webkitAudioContext?: typeof AudioContext;
      };
      if (typeof W.webkitAudioContext === 'undefined') return null;
    }
    if (!this.ctx) {
      const W = globalThis as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AC = W.AudioContext ?? W.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private tone(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    dur: number,
    vol: number,
    when: number,
    slideTo?: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slideTo != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), when + dur);
    }
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(vol, when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + dur + 0.03);
  }

  play(kind: SfxKind, pitch = 1): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const p = pitch;

    switch (kind) {
      case 'ui':
        this.tone(ctx, 'sine', 680 * p, 0.05, 0.035, now);
        break;
      case 'place':
        this.tone(ctx, 'triangle', 200 * p, 0.1, 0.05, now, 420 * p);
        this.tone(ctx, 'sine', 420 * p, 0.08, 0.025, now + 0.05);
        break;
      case 'shoot':
        this.tone(ctx, 'square', 360 * p, 0.045, 0.028, now, 160 * p);
        break;
      case 'hit':
        this.tone(ctx, 'sawtooth', 150 * p, 0.06, 0.04, now, 70 * p);
        break;
      case 'kill':
        this.tone(ctx, 'triangle', 520 * p, 0.1, 0.045, now, 780 * p);
        this.tone(ctx, 'sine', 880 * p, 0.12, 0.03, now + 0.04);
        break;
      case 'wave':
        this.tone(ctx, 'sine', 280 * p, 0.12, 0.04, now, 420 * p);
        this.tone(ctx, 'triangle', 420 * p, 0.14, 0.03, now + 0.08, 620 * p);
        break;
      case 'upgrade':
        this.tone(ctx, 'sine', 440 * p, 0.08, 0.04, now);
        this.tone(ctx, 'sine', 660 * p, 0.1, 0.035, now + 0.07);
        break;
      case 'win':
        this.tone(ctx, 'triangle', 523 * p, 0.16, 0.05, now);
        this.tone(ctx, 'triangle', 659 * p, 0.16, 0.045, now + 0.12);
        this.tone(ctx, 'triangle', 784 * p, 0.22, 0.04, now + 0.24);
        break;
      case 'lose':
        this.tone(ctx, 'sawtooth', 220 * p, 0.22, 0.04, now, 110 * p);
        this.tone(ctx, 'sine', 140 * p, 0.28, 0.03, now + 0.1, 70 * p);
        break;
    }
  }

  shootFor(towerKind: string): void {
    const pitch =
      towerKind === 'cannon'
        ? 0.7
        : towerKind === 'ice'
          ? 1.3
          : towerKind === 'lightning'
            ? 1.5
            : towerKind === 'fire'
              ? 0.85
              : towerKind === 'poison'
                ? 0.9
                : 1;
    this.play('shoot', pitch);
  }
}

export const audio = new GameAudio();
