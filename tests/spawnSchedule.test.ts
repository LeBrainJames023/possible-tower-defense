import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/game/enemies';
import { LEVELS, buildWave, pathWaypoints } from '../src/game/levels';
import { pathTotalLength } from '../src/shared/math';
import { STAGES_PER_WORLD, WAVES_PER_LEVEL, WORLD_COUNT } from '../src/game/constants';
import { MEET_FRAC, escortLead, scheduleWave, splitBySpeedGap } from '../src/game/spawnSchedule';

const forestPath = pathTotalLength(pathWaypoints(LEVELS[0]));
const seed = { worldIndex: 1, stage: 1, wave: 3 };

function total(stage: number, wave: number, world = 1): number {
  return buildWave(stage, wave, world).reduce((s, g) => s + g.count, 0);
}

describe('escort scheduler', () => {
  it('keeps every body — composition is not the clock', () => {
    for (let world = 1; world <= WORLD_COUNT; world++) {
      for (let stage = 1; stage <= STAGES_PER_WORLD; stage++) {
        for (let wave = 1; wave <= WAVES_PER_LEVEL; wave++) {
          const members = buildWave(stage, wave, world);
          const events = scheduleWave(members, forestPath, { worldIndex: world, stage, wave });
          expect(events.length).toBe(total(stage, wave, world));
        }
      }
    }
  });

  it('is identical on retry of the same map and wave', () => {
    const members = buildWave(1, 5, 1);
    const a = scheduleWave(members, forestPath, { worldIndex: 1, stage: 1, wave: 5 });
    const b = scheduleWave(members, forestPath, { worldIndex: 1, stage: 1, wave: 5 });
    expect(a).toEqual(b);
  });

  it('does not copy-paste the same clock onto every wave', () => {
    const a = scheduleWave(buildWave(1, 3, 1), forestPath, { worldIndex: 1, stage: 1, wave: 3 });
    const b = scheduleWave(buildWave(1, 5, 1), forestPath, { worldIndex: 1, stage: 1, wave: 5 });
    expect(a.map((e) => e.at)).not.toEqual(b.map((e) => e.at));
  });

  it('sends tanks out before runners, then they meet mid-path', () => {
    const events = scheduleWave(buildWave(1, 3, 1), forestPath, seed);
    const grunt = events.find((e) => e.kind === 'grunt');
    const scout = events.find((e) => e.kind === 'scout');
    expect(grunt).toBeTruthy();
    expect(scout).toBeTruthy();
    expect(grunt!.at).toBeLessThan(scout!.at);

    const meet = forestPath * MEET_FRAC;
    const gruntAt = grunt!.at + meet / ENEMIES.grunt.speed;
    const scoutAt = scout!.at + meet / ENEMIES.scout.speed;
    expect(Math.abs(gruntAt - scoutAt)).toBeLessThan(0.8);
  });

  it('overlaps flyers with ground on the same beat', () => {
    const events = scheduleWave(buildWave(1, 4, 1), forestPath, { worldIndex: 1, stage: 1, wave: 4 });
    const air = events.find((e) => ENEMIES[e.kind].flying);
    const ground = events.find((e) => !ENEMIES[e.kind].flying);
    expect(air).toBeTruthy();
    expect(ground).toBeTruthy();
    expect(Math.abs(air!.at - ground!.at)).toBeLessThan(0.55);
  });

  it('escorts the boss instead of parking him after the cleanup', () => {
    const events = scheduleWave(buildWave(1, 10, 1), forestPath, { worldIndex: 1, stage: 1, wave: 10 });
    const bossAt = events.find((e) => e.kind === 'boss')!.at;
    expect(events.some((e) => e.kind === 'grunt' && e.at >= bossAt - 0.05)).toBe(true);
  });

  it('splits mixed speeds at the gap, not by how many raiders there are', () => {
    const units: Array<'brute' | 'grunt'> = ['brute', 'grunt', 'grunt', 'grunt', 'grunt', 'grunt'];
    const split = splitBySpeedGap(units);
    expect(split.slow).toContain('brute');
    expect(split.fast.every((k) => k === 'grunt')).toBe(true);
    expect(split.slow.every((k) => k === 'brute')).toBe(true);
  });

  it('computes a real head start from speed, not a magic delay', () => {
    const lead = escortLead('brute', 'scout', forestPath);
    expect(lead).toBeGreaterThan(1);
    expect(lead).toBeLessThan(8);
  });
});
