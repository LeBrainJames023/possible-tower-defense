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
    if (typeof AudioContext === 'undefined' && typeof (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === 'undefined') {
      return null;
    }
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  play(kind: SfxKind, pitch = 1): void {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const beep = (
      type: OscillatorType,
      freq: number,
      dur: number,
      vol: number,
      slideTo?: number,
    ) => {
      osc.type = type;
      osc.frequency.setValueAtTime(freq * pitch, now);
      if (slideTo != null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo * pitch), now + dur);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    };

    switch (kind) {
      case 'ui':
        beep('sine', 660, 0.06, 0.04);
        break;
      case 'place':
        beep('triangle', 220, 0.12, 0.06, 440);
        break;
      case 'shoot':
        beep('square', 380, 0.05, 0.035, 180);
        break;
      case 'hit':
        beep('sawtooth', 140, 0.07, 0.045, 60);
        break;
      case 'kill':
        beep('triangle', 520, 0.14, 0.055, 880);
        break;
      case 'wave':
        beep('sine', 300, 0.2, 0.05, 600);
        break;
      case 'upgrade':
        beep('sine', 440, 0.12, 0.05, 880);
        break;
      case 'win':
        beep('triangle', 523, 0.35, 0.06, 784);
        break;
      case 'lose':
        beep('sawtooth', 220, 0.4, 0.05, 80);
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
