/** Shared SFX mix — keep under 1 so a 10-keep volley does not clip. */
export const SFX_MIX = 0.82;

export function playTone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  delay = 0,
  endRatio = 0.55,
): void {
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * endRatio), t0 + dur);
  gain.gain.setValueAtTime(Math.max(0.0001, vol * SFX_MIX), t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playNoise(
  ctx: AudioContext,
  dest: AudioNode,
  dur: number,
  vol: number,
  hp: number,
  type: BiquadFilterType = 'bandpass',
  delay = 0,
): void {
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
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
  gain.gain.setValueAtTime(Math.max(0.0001, vol * SFX_MIX), t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(t0);
}

export function playCrackle(
  ctx: AudioContext,
  dest: AudioNode,
  vol: number,
  pops: number,
  delay = 0,
): void {
  for (let i = 0; i < pops; i++) {
    playNoise(
      ctx,
      dest,
      0.016 + Math.random() * 0.02,
      vol,
      1300 + Math.random() * 1800,
      'bandpass',
      delay + i * 0.03,
    );
  }
}
