import type { TowerKind } from './constants';
import { playCrackle, playNoise, playTone } from './audioSynth';

export function sfxPlace(ctx: AudioContext, dest: AudioNode): void {
  playNoise(ctx, dest, 0.09, 0.1, 180, 'lowpass');
  playTone(ctx, dest, 92, 0.14, 'sine', 0.1, 0, 0.45);
  playTone(ctx, dest, 220, 0.07, 'triangle', 0.045, 0.02, 0.7);
}

export function sfxUi(ctx: AudioContext, dest: AudioNode): void {
  playTone(ctx, dest, 420, 0.055, 'square', 0.055);
}

export function sfxWaveStart(ctx: AudioContext, dest: AudioNode): void {
  playNoise(ctx, dest, 0.22, 0.1, 420, 'bandpass');
  playTone(ctx, dest, 196, 0.42, 'sawtooth', 0.11, 0, 0.48);
  playTone(ctx, dest, 98, 0.5, 'sine', 0.1, 0, 0.55);
  playTone(ctx, dest, 294, 0.28, 'triangle', 0.055, 0.04, 0.7);
}

export function sfxLeak(ctx: AudioContext, dest: AudioNode): void {
  playNoise(ctx, dest, 0.18, 0.12, 90, 'lowpass');
  playTone(ctx, dest, 170, 0.28, 'sawtooth', 0.11, 0, 0.38);
  playTone(ctx, dest, 72, 0.32, 'sine', 0.09, 0.02, 0.5);
}

export function sfxPull(ctx: AudioContext, dest: AudioNode): void {
  playNoise(ctx, dest, 0.28, 0.1, 90, 'lowpass');
  playTone(ctx, dest, 48, 0.36, 'sine', 0.1, 0, 0.35);
  playTone(ctx, dest, 96, 0.22, 'triangle', 0.04, 0.04, 0.5);
}

export function sfxKill(ctx: AudioContext, dest: AudioNode): void {
  playTone(ctx, dest, 520, 0.08, 'square', 0.06);
  playTone(ctx, dest, 780, 0.055, 'triangle', 0.04, 0.03);
}

export function sfxHit(ctx: AudioContext, dest: AudioNode): void {
  playTone(ctx, dest, 180, 0.05, 'square', 0.045);
}

export function sfxFire(ctx: AudioContext, dest: AudioNode, kind: TowerKind): void {
  switch (kind) {
    case 'arrow':
      playNoise(ctx, dest, 0.05, 0.07, 2400, 'highpass');
      playTone(ctx, dest, 980, 0.04, 'triangle', 0.07, 0, 0.35);
      playTone(ctx, dest, 240, 0.04, 'sine', 0.03, 0.01);
      break;
    case 'cannon':
      playNoise(ctx, dest, 0.09, 0.1, 90, 'lowpass');
      playTone(ctx, dest, 72, 0.12, 'sine', 0.09, 0, 0.4);
      playTone(ctx, dest, 38, 0.1, 'triangle', 0.05, 0.02);
      break;
    case 'longshot':
      playNoise(ctx, dest, 0.07, 0.08, 1400, 'highpass');
      playTone(ctx, dest, 620, 0.08, 'triangle', 0.08, 0, 0.28);
      playTone(ctx, dest, 160, 0.1, 'sine', 0.045, 0.02);
      break;
    case 'ice':
      playNoise(ctx, dest, 0.06, 0.05, 4200, 'highpass');
      playTone(ctx, dest, 1680, 0.08, 'sine', 0.07, 0, 1.6);
      playTone(ctx, dest, 2100, 0.05, 'triangle', 0.035, 0.02, 1.3);
      break;
    case 'lightning':
      playNoise(ctx, dest, 0.03, 0.12, 2600);
      playTone(ctx, dest, 2400, 0.03, 'sawtooth', 0.07, 0, 0.2);
      playTone(ctx, dest, 380, 0.05, 'square', 0.035, 0.012);
      break;
    case 'fire':
      playNoise(ctx, dest, 0.1, 0.09, 620, 'bandpass');
      playCrackle(ctx, dest, 0.045, 5);
      playTone(ctx, dest, 190, 0.07, 'sawtooth', 0.035, 0, 0.5);
      break;
    case 'poison':
      playNoise(ctx, dest, 0.08, 0.07, 320, 'lowpass');
      playTone(ctx, dest, 180, 0.11, 'sine', 0.065, 0, 0.28);
      playTone(ctx, dest, 90, 0.09, 'sine', 0.035, 0.03, 0.5);
      break;
    case 'void':
      playNoise(ctx, dest, 0.07, 0.075, 180, 'lowpass');
      playTone(ctx, dest, 110, 0.12, 'sine', 0.07, 0, 0.35);
      playTone(ctx, dest, 220, 0.07, 'triangle', 0.035, 0.02, 0.6);
      break;
    case 'muster':
    case 'chapter':
      break;
  }
}

export function sfxImpact(ctx: AudioContext, dest: AudioNode, kind: TowerKind): void {
  switch (kind) {
    case 'arrow':
      playNoise(ctx, dest, 0.04, 0.06, 1400);
      playTone(ctx, dest, 210, 0.05, 'triangle', 0.05, 0, 0.45);
      break;
    case 'cannon':
      playNoise(ctx, dest, 0.32, 0.14, 65, 'lowpass');
      playTone(ctx, dest, 46, 0.3, 'sine', 0.12);
      playTone(ctx, dest, 88, 0.16, 'triangle', 0.05, 0.05);
      playNoise(ctx, dest, 0.16, 0.07, 200, 'lowpass', 0.05);
      break;
    case 'longshot':
      playNoise(ctx, dest, 0.06, 0.08, 900);
      playTone(ctx, dest, 140, 0.09, 'triangle', 0.065, 0, 0.4);
      playTone(ctx, dest, 90, 0.06, 'sine', 0.035, 0.02);
      break;
    case 'ice':
      playNoise(ctx, dest, 0.08, 0.08, 4800, 'highpass');
      playTone(ctx, dest, 1860, 0.06, 'triangle', 0.065, 0, 0.7);
      playTone(ctx, dest, 2480, 0.05, 'sine', 0.04, 0.015, 1.1);
      playTone(ctx, dest, 740, 0.07, 'sine', 0.03, 0.03);
      break;
    case 'lightning':
      playNoise(ctx, dest, 0.04, 0.1, 2000);
      playTone(ctx, dest, 1750, 0.035, 'square', 0.06, 0, 0.15);
      playTone(ctx, dest, 260, 0.065, 'sawtooth', 0.035, 0.018);
      break;
    case 'fire':
      playNoise(ctx, dest, 0.12, 0.09, 380, 'bandpass');
      playTone(ctx, dest, 64, 0.14, 'sine', 0.065);
      playCrackle(ctx, dest, 0.05, 7, 0.015);
      break;
    case 'poison':
      playNoise(ctx, dest, 0.1, 0.085, 200, 'lowpass');
      playTone(ctx, dest, 130, 0.13, 'sine', 0.07, 0, 0.25);
      playTone(ctx, dest, 70, 0.1, 'sine', 0.04, 0.04, 0.4);
      break;
    case 'void':
      playNoise(ctx, dest, 0.09, 0.09, 140, 'lowpass');
      playTone(ctx, dest, 70, 0.14, 'sine', 0.08);
      playTone(ctx, dest, 160, 0.08, 'triangle', 0.035, 0.03, 0.45);
      break;
    case 'muster':
    case 'chapter':
      break;
  }
}
