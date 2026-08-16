/**
 * Escort scheduler — who/how-many stays in buildWave; this decides when.
 *
 * Slow units leave first. Fast units get a computed head-start delay so they
 * catch the tanks around mid-path. Ground and air packets share the same
 * beats so flyers steal attention while tanks soak. Same map+wave = same
 * times on retry (seeded). A couple of stragglers land off the beat.
 */
import { u } from './constants';
import { ENEMIES, type EnemyKind } from './enemies';
import type { WaveSpawn } from './levels';
import { clamp } from '../shared/math';
import { mulberry32, waveSeed } from '../shared/rng';

/** Catch-up target as a fraction of path length (not the portal, not the gate). */
export const MEET_FRAC = 0.45;
const JITTER = 0.12;
const PACKET_GAP = 1.15;
const MIN_LEAD = 0.35;
const MAX_LEAD = 7.5;
const SPEED_GAP = 1.2;

export interface SpawnEvent {
  kind: EnemyKind;
  at: number;
}

export interface ScheduleSeed {
  worldIndex: number;
  stage: number;
  wave: number;
}

interface Packet {
  slow: EnemyKind[];
  fast: EnemyKind[];
}

function speedOf(kind: EnemyKind): number {
  return ENEMIES[kind].speed;
}

function jitter(rng: () => number): number {
  return 1 + (rng() * 2 - 1) * JITTER;
}

function spacing(kind: EnemyKind): number {
  const def = ENEMIES[kind];
  if (def.role === 'boss') return 1.55;
  if (def.role === 'champion') return 1.3;
  if (def.speed < u(40)) return 1.02;
  if (def.speed > u(70)) return 0.36;
  return 0.7;
}

/** Seconds the slow unit must leave before the fast one to meet at MEET_FRAC. */
export function escortLead(slow: EnemyKind, fast: EnemyKind, pathLength: number): number {
  const vs = speedOf(slow);
  const vf = speedOf(fast);
  if (vf <= vs * 1.08 || pathLength <= 0) return 0;
  const meet = pathLength * MEET_FRAC;
  return clamp(meet * (1 / vs - 1 / vf), MIN_LEAD, MAX_LEAD);
}

function expand(members: WaveSpawn[]): EnemyKind[] {
  const out: EnemyKind[] = [];
  for (const m of members) {
    for (let i = 0; i < m.count; i++) out.push(m.kind);
  }
  return out;
}

/** Split a lane at the largest speed gap (tanks vs runners), not by headcount. */
export function splitBySpeedGap(units: EnemyKind[]): { slow: EnemyKind[]; fast: EnemyKind[] } {
  if (units.length === 0) return { slow: [], fast: [] };
  const unique = [...new Set(units)].sort((a, b) => speedOf(a) - speedOf(b));
  if (unique.length < 2) return { slow: [...units], fast: [] };
  let gapI = 0;
  let gap = 0;
  for (let i = 0; i < unique.length - 1; i++) {
    const g = speedOf(unique[i + 1]) / speedOf(unique[i]);
    if (g > gap) {
      gap = g;
      gapI = i;
    }
  }
  if (gap < SPEED_GAP) return { slow: [...units], fast: [] };
  const slowSet = new Set(unique.slice(0, gapI + 1));
  return {
    slow: units.filter((k) => slowSet.has(k)),
    fast: units.filter((k) => !slowSet.has(k)),
  };
}

/** Bosses/champions sit in the middle of the slow queue so they are escorted, not last. */
function orderSlow(slow: EnemyKind[]): EnemyKind[] {
  const vip = slow.filter((k) => {
    const role = ENEMIES[k].role;
    return role === 'boss' || role === 'champion';
  });
  const rest = slow.filter((k) => {
    const role = ENEMIES[k].role;
    return role !== 'boss' && role !== 'champion';
  });
  if (!vip.length) return rest;
  const i = Math.floor(rest.length * 0.35);
  return [...rest.slice(0, i), ...vip, ...rest.slice(i)];
}

function formPackets(units: EnemyKind[], rng: () => number): { packets: Packet[]; stragglers: EnemyKind[] } {
  const { slow, fast } = splitBySpeedGap(units);
  const slowQ = orderSlow(slow);
  const fastQ = [...fast];
  const stragglers: EnemyKind[] = [];
  if (fastQ.length >= 5) stragglers.push(fastQ.pop()!);
  if (fastQ.length >= 8 && rng() > 0.45) stragglers.push(fastQ.pop()!);

  const packets: Packet[] = [];
  while (slowQ.length || fastQ.length) {
    const s = slowQ.splice(0, Math.min(2, slowQ.length));
    const f = fastQ.splice(0, s.length ? Math.min(4, fastQ.length) : Math.min(5, fastQ.length));
    if (!s.length && !f.length) break;
    packets.push({ slow: s, fast: f });
  }
  return { packets, stragglers };
}

function schedulePacket(packet: Packet, pathLength: number, rng: () => number): SpawnEvent[] {
  const events: SpawnEvent[] = [];
  const slowest = packet.slow.length
    ? packet.slow.reduce((a, b) => (speedOf(a) <= speedOf(b) ? a : b))
    : null;
  const fastest = packet.fast.length
    ? packet.fast.reduce((a, b) => (speedOf(a) >= speedOf(b) ? a : b))
    : null;
  const lead = slowest && fastest ? escortLead(slowest, fastest, pathLength) : 0;

  let ts = 0;
  for (const k of packet.slow) {
    events.push({ kind: k, at: ts });
    ts += spacing(k) * jitter(rng);
  }
  let tf = packet.slow.length ? lead : 0;
  for (const k of packet.fast) {
    events.push({ kind: k, at: tf });
    tf += spacing(k) * jitter(rng);
  }
  return events;
}

function spanOf(events: SpawnEvent[]): number {
  if (!events.length) return 0;
  return Math.max(...events.map((e) => e.at));
}

function offsetEvents(events: SpawnEvent[], dt: number): SpawnEvent[] {
  return events.map((e) => ({ kind: e.kind, at: e.at + dt }));
}

/**
 * Turn wave composition into spawn times. Path length is in world pixels
 * (same units as enemy speed). Seeded so retrying a map is learnable.
 */
export function scheduleWave(members: WaveSpawn[], pathLength: number, seed: ScheduleSeed): SpawnEvent[] {
  const rng = mulberry32(waveSeed(seed.worldIndex, seed.stage, seed.wave));
  const bag = expand(members);
  const ground = bag.filter((k) => !ENEMIES[k].flying);
  const air = bag.filter((k) => ENEMIES[k].flying);

  const gLane = formPackets(ground, rng);
  const aLane = formPackets(air, rng);
  const beats = Math.max(gLane.packets.length, aLane.packets.length, 1);

  const events: SpawnEvent[] = [];
  let t = 0;
  for (let i = 0; i < beats; i++) {
    const g = gLane.packets[i] ? schedulePacket(gLane.packets[i], pathLength, rng) : [];
    const a = aLane.packets[i] ? schedulePacket(aLane.packets[i], pathLength, rng) : [];
    events.push(...offsetEvents(g, t), ...offsetEvents(a, t));
    t += Math.max(spanOf(g), spanOf(a), 0.4) + PACKET_GAP * jitter(rng);
  }

  const extras = [...gLane.stragglers, ...aLane.stragglers];
  const waveSpan = Math.max(spanOf(events), 1);
  for (const k of extras) {
    const at = waveSpan * (0.22 + rng() * 0.55) + 1.2 * rng();
    events.push({ kind: k, at });
  }

  events.sort((a, b) => a.at - b.at || a.kind.localeCompare(b.kind));
  return events;
}
