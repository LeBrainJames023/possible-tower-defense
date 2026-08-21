import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { ENEMIES, leakLives, facingCardinal, spriteFlip, walkFrameIndex, type CreatureSprite } from '../src/game/enemies';
import { championAt, rosterFor, specialAt } from '../src/game/worldRoster';
import { LEVELS, pathWaypoints } from '../src/game/levels';
import { firstAppearanceKinds, shouldIntro } from '../src/game/intros';
import { Enemy } from '../src/game/entities';

describe('world roster', () => {
  it('keeps Forest stage 1 as the tutorial', () => {
    expect(specialAt(1, 1, 1)).toBeNull();
    expect(championAt(1, 1)).toBeNull();
    expect(rosterFor(1).boss).toBe('boss');
  });

  it('unlocks Forest locals and the Alpha Warg after stage 1', () => {
    expect(specialAt(1, 2, 1)).toBe('warg');
    expect(specialAt(1, 4, 2)).toBe('boar');
    expect(championAt(1, 2)).toBe('alphaWarg');
  });

  it('gives later worlds locals from stage 1 and a unique boss', () => {
    expect(specialAt(2, 1, 1)).toBe('scorpion');
    expect(rosterFor(2).boss).toBe('sandKhan');
    expect(rosterFor(5).boss).toBe('magician');
    expect(ENEMIES.sandKhan.role).toBe('boss');
    expect(leakLives('duneTyrant')).toBe(3);
    expect(leakLives('sandKhan')).toBe(5);
    expect(leakLives('grunt')).toBe(1);
  });
});

describe('flyers and intros', () => {
  it('marks imps, wisps, and shades as flying', () => {
    expect(ENEMIES.swarm.flying).toBe(true);
    expect(ENEMIES.frostWisp.flying).toBe(true);
    expect(ENEMIES.shade.flying).toBe(true);
    expect(ENEMIES.grunt.flying).toBe(false);
    expect(ENEMIES.brute.flying).toBe(false);
  });

  it('intros Forest 1 flyers and the boss, not the starting raiders', () => {
    const kinds = firstAppearanceKinds(LEVELS[0]);
    expect(kinds).toContain('swarm');
    expect(kinds).toContain('boss');
    expect(kinds).not.toContain('grunt');
    expect(shouldIntro('grunt')).toBe(false);
  });

  it('intros Forest 2 locals without repeating Forest 1 flyers', () => {
    const kinds = firstAppearanceKinds(LEVELS[1]);
    expect(kinds).toContain('warg');
    expect(kinds).toContain('alphaWarg');
    expect(kinds).not.toContain('swarm');
    expect(kinds).not.toContain('boss');
  });
});

describe('sprite facing', () => {
  it('mirrors authored-left billboards when traveling right', () => {
    expect(spriteFlip(1, 1)).toBe(-1);
    expect(spriteFlip(-1, -1)).toBe(1);
    expect(spriteFlip(0, -1)).toBe(-1);
    expect(spriteFlip(0.1, -1)).toBe(-1);
    expect(spriteFlip(-0.1, 1)).toBe(1);
  });

  it('picks the dominant cardinal from path heading', () => {
    expect(facingCardinal(0)).toBe('e');
    expect(facingCardinal(Math.PI / 2)).toBe('s');
    expect(facingCardinal(Math.PI)).toBe('w');
    expect(facingCardinal(-Math.PI / 2)).toBe('n');
  });

  it('spawns Meadow Gate enemies already facing the first rightward stretch', () => {
    const wps = pathWaypoints(LEVELS[0]);
    const grunt = new Enemy('grunt', 1, wps);
    expect(grunt.cardinal).toBe('e');
    expect(grunt.flip).toBe(-1);
    expect(Math.cos(grunt.facing)).toBeGreaterThan(0.5);
  });

  it('spawns Siege March enemies facing the first southward stretch', () => {
    const siege = LEVELS.find((l) => l.world === 'forest' && l.stage === 9);
    expect(siege?.name).toBe('Siege March');
    const wps = pathWaypoints(siege!);
    const grunt = new Enemy('grunt', 1, wps);
    expect(grunt.cardinal).toBe('s');
    expect(Math.sin(grunt.facing)).toBeGreaterThan(0.5);
  });
});

describe('walk frames', () => {
  it('loops four frames across one gait cycle', () => {
    expect(walkFrameIndex(0, 4)).toBe(0);
    expect(walkFrameIndex(Math.PI * 0.5, 4)).toBe(1);
    expect(walkFrameIndex(Math.PI, 4)).toBe(2);
    expect(walkFrameIndex(Math.PI * 1.5, 4)).toBe(3);
    expect(walkFrameIndex(Math.PI * 2, 4)).toBe(0);
  });

  it('has four-direction walk loops for every live keeper', () => {
    const creatures: CreatureSprite[] = [
      'goblin',
      'raider',
      'imp',
      'troll',
      'warlord',
      'warg',
      'ogre',
      'hellbat',
      'wyvern',
      'drake',
      'scorpion',
      'dunerunner',
      'dunetyrant',
      'sandkhan',
    ];
    for (const name of creatures) {
      for (const dir of ['n', 'e', 's', 'w'] as const) {
        for (const frame of [1, 2, 3, 4]) {
          expect(existsSync(`public/sprites/enemies/walk/${name}-${dir}-${frame}.png`)).toBe(true);
        }
      }
    }
  });

  it('has painted Desert tiles, props, portals, and four new bodies', () => {
    for (const n of [1, 2, 3, 4]) {
      expect(existsSync(`public/sprites/terrain/sand-${n}.png`)).toBe(true);
      expect(existsSync(`public/sprites/terrain/sand-path-${n}.png`)).toBe(true);
    }
    expect(existsSync('public/sprites/desert/cactus.png')).toBe(true);
    expect(existsSync('public/sprites/landmarks/portal-desert-in.png')).toBe(true);
    expect(existsSync('public/sprites/landmarks/portal-desert-out.png')).toBe(true);
    expect(ENEMIES.scorpion.sprite).toBe('scorpion');
    expect(ENEMIES.duneRunner.sprite).toBe('dunerunner');
    expect(ENEMIES.duneTyrant.sprite).toBe('dunetyrant');
    expect(ENEMIES.sandKhan.sprite).toBe('sandkhan');
  });
});
