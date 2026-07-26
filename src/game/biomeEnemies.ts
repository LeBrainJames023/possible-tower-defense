import type { BiomeTheme, EnemyKind } from './constants';

export interface WaveSpawnLike {
  kind: EnemyKind;
  count: number;
  interval: number;
  delay?: number;
}

export interface BiomeSkin {
  /** Multiplies / replaces body colors for this theme. */
  color: string;
  colorDark: string;
  /** Accent (hats, eyes, crystals) */
  accent: string;
}

/** Role-neutral palette shifts so the same orc reads as frost / slag / moss / etc. */
const THEME_SKIN: Record<BiomeTheme, { body: string; dark: string; accent: string }> = {
  meadow: { body: '#6a9a5b', dark: '#2d4a28', accent: '#e85d4c' },
  river: { body: '#5a8f7b', dark: '#1e3f38', accent: '#4cc9f0' },
  forest: { body: '#3d7a45', dark: '#143824', accent: '#c45c26' },
  mist: { body: '#7a8f8a', dark: '#2a3836', accent: '#a8d8ea' },
  swamp: { body: '#6b7a3a', dark: '#2a3018', accent: '#8fa37a' },
  haunted: { body: '#7a5a8a', dark: '#2a1830', accent: '#c4b5fd' },
  ice: { body: '#9ec5d8', dark: '#2a4a5c', accent: '#e8f4ff' },
  alpine: { body: '#8aa4b5', dark: '#2a3848', accent: '#d0e4f0' },
  volcanic: { body: '#a85a3a', dark: '#3a1810', accent: '#ff6b35' },
  bastion: { body: '#8a7060', dark: '#2a2018', accent: '#c9a227' },
};

/** Prefer these kinds when biasing waves toward the biome. */
const THEME_BIAS: Record<BiomeTheme, EnemyKind[]> = {
  meadow: ['orc', 'gnome', 'troll'],
  river: ['gnome', 'orc', 'wisp'],
  forest: ['gnome', 'orc', 'troll'],
  mist: ['ghost', 'wisp', 'gnome'],
  swamp: ['ghoul', 'zombie', 'skeletonSnake'],
  haunted: ['ghoul', 'ghost', 'necromancer', 'skeletonSnake'],
  ice: ['ghost', 'wisp', 'gnome', 'lich'],
  alpine: ['orc', 'troll', 'wisp', 'ghost'],
  volcanic: ['orc', 'troll', 'gargoyle', 'wyrm'],
  bastion: ['troll', 'necromancer', 'gargoyle', 'lich'],
};

function blendHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255;
  const ag = (pa >> 8) & 255;
  const ab = pa & 255;
  const br = (pb >> 16) & 255;
  const bg = (pb >> 8) & 255;
  const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

export function biomeSkinFor(kind: EnemyKind, theme: BiomeTheme, baseColor: string, baseDark: string): BiomeSkin {
  const t = THEME_SKIN[theme];
  // Undead / ethereal keep more of their identity; fodder takes stronger biome wash
  const wash =
    kind === 'ghost' || kind === 'wisp' || kind === 'lich' || kind === 'necromancer'
      ? 0.45
      : kind === 'gargoyle' || kind === 'wyrm'
        ? 0.55
        : 0.7;
  return {
    color: blendHex(baseColor, t.body, wash),
    colorDark: blendHex(baseDark, t.dark, wash),
    accent: t.accent,
  };
}

/**
 * Nudge wave composition toward biome-favored kinds without inventing new enemy types.
 * Keeps total pressure roughly the same.
 */
export function biasWaveForTheme(groups: WaveSpawnLike[], theme: BiomeTheme): WaveSpawnLike[] {
  const favored = THEME_BIAS[theme];
  if (!favored.length) return groups;

  const out = groups.map((g) => ({ ...g }));
  // Boost first matching favored group slightly; inject a small favored pack if missing
  let boosted = false;
  for (const g of out) {
    if (favored.includes(g.kind)) {
      g.count = Math.max(1, Math.round(g.count * 1.25));
      boosted = true;
      break;
    }
  }
  if (!boosted && out.length) {
    const kind = favored[0];
    const base = out[0];
    out.push({
      kind,
      count: Math.max(2, Math.round(base.count * 0.35)),
      interval: base.interval,
      delay: (base.delay ?? 0) + 1.2,
    });
  }

  // On ice / volcanic / forest, recolor a chunk of plain orcs conceptually by swapping kind
  if (theme === 'ice' || theme === 'alpine') {
    for (const g of out) {
      if (g.kind === 'orc' && g.count >= 4) {
        const n = Math.floor(g.count * 0.35);
        g.count -= n;
        out.push({ kind: 'ghost', count: n, interval: Math.max(0.35, g.interval * 0.9), delay: g.delay });
        break;
      }
    }
  }
  if (theme === 'volcanic' || theme === 'bastion') {
    for (const g of out) {
      if (g.kind === 'orc' && g.count >= 4) {
        const n = Math.floor(g.count * 0.3);
        g.count -= n;
        out.push({ kind: 'troll', count: Math.max(1, n - 1), interval: 1.0, delay: (g.delay ?? 0) + 0.8 });
        break;
      }
    }
  }
  if (theme === 'forest' || theme === 'meadow') {
    for (const g of out) {
      if (g.kind === 'orc' && g.count >= 4) {
        const n = Math.floor(g.count * 0.4);
        g.count -= n;
        out.push({ kind: 'gnome', count: n, interval: 0.4, delay: g.delay });
        break;
      }
    }
  }
  if (theme === 'haunted' || theme === 'swamp') {
    for (const g of out) {
      if (g.kind === 'orc' && g.count >= 4) {
        const n = Math.floor(g.count * 0.4);
        g.count -= n;
        out.push({ kind: 'ghoul', count: n + 2, interval: 0.25, delay: g.delay });
        break;
      }
    }
  }

  return out.filter((g) => g.count > 0);
}
