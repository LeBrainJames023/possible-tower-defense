export type WorldId = 'forest' | 'desert' | 'ice' | 'fire' | 'hollow';

/** One palette per world — all ten stages in a world share it. */
export interface MapTheme {
  sky0: string;
  sky1: string;
  grassA: string;
  grassB: string;
  blade: string;
  pathEdge: string;
  pathMid: string;
  pathLight: string;
  pebble: string;
  trunk: string;
  canopy: string;
  canopyDark: string;
  glow: string;
  ui: string;
}

export interface WorldDef {
  id: WorldId;
  index: number;
  name: string;
  blurb: string;
  /** Path layout: same 10 shapes, different facing. */
  transform: 'id' | 'flipX' | 'flipY' | 'flipXY' | 'revX';
  hpMul: number;
  theme: MapTheme;
}

export const WORLDS: WorldDef[] = [
  {
    id: 'forest',
    index: 1,
    name: 'Forest',
    blurb: 'Home turf. Learn the path.',
    transform: 'id',
    hpMul: 1,
    theme: {
      sky0: '#14261c',
      sky1: '#0c1814',
      grassA: '#1e4a3c',
      grassB: '#173e34',
      blade: 'rgba(120, 190, 110, 0.35)',
      pathEdge: '#3a2a1c',
      pathMid: '#6a5340',
      pathLight: '#8a6e52',
      pebble: '#c4a882',
      trunk: '#5a3a28',
      canopy: '#3d8f4a',
      canopyDark: '#1a4a28',
      glow: 'rgba(244, 196, 100, 0.2)',
      ui: '#3d8f4a',
    },
  },
  {
    id: 'desert',
    index: 2,
    name: 'Desert',
    blurb: 'Heat, dust, long sightlines.',
    transform: 'flipX',
    hpMul: 1.18,
    theme: {
      sky0: '#2a2010',
      sky1: '#181208',
      grassA: '#c4a060',
      grassB: '#b08c4c',
      blade: 'rgba(220, 180, 80, 0.28)',
      pathEdge: '#5a3a18',
      pathMid: '#8a6a38',
      pathLight: '#b08a50',
      pebble: '#e0c080',
      trunk: '#6a4a20',
      canopy: '#c4a040',
      canopyDark: '#6a4810',
      glow: 'rgba(232, 180, 60, 0.22)',
      ui: '#e0b050',
    },
  },
  {
    id: 'ice',
    index: 3,
    name: 'Ice',
    blurb: 'Pale ground. Nothing hurries except the wind.',
    transform: 'flipY',
    hpMul: 1.34,
    theme: {
      sky0: '#142028',
      sky1: '#0a1218',
      grassA: '#8ab0c4',
      grassB: '#7a9eb0',
      blade: 'rgba(200, 230, 240, 0.3)',
      pathEdge: '#3a4a58',
      pathMid: '#6a8494',
      pathLight: '#90a8b4',
      pebble: '#d8e8f0',
      trunk: '#4a5a64',
      canopy: '#b8d4e0',
      canopyDark: '#4a6a78',
      glow: 'rgba(180, 230, 255, 0.24)',
      ui: '#9ae4f7',
    },
  },
  {
    id: 'fire',
    index: 4,
    name: 'Fire',
    blurb: 'Ash underfoot. The path glows.',
    transform: 'flipXY',
    hpMul: 1.5,
    theme: {
      sky0: '#2a1008',
      sky1: '#140804',
      grassA: '#5a2418',
      grassB: '#4a1c12',
      blade: 'rgba(255, 120, 60, 0.28)',
      pathEdge: '#3a140c',
      pathMid: '#8a3a18',
      pathLight: '#c45a20',
      pebble: '#f0a040',
      trunk: '#3a1810',
      canopy: '#e05020',
      canopyDark: '#6a1808',
      glow: 'rgba(255, 100, 40, 0.26)',
      ui: '#ff6b4a',
    },
  },
  {
    id: 'hollow',
    index: 5,
    name: 'The Hollow',
    blurb: 'A magician’s dark. The last door.',
    transform: 'revX',
    hpMul: 1.68,
    theme: {
      sky0: '#140818',
      sky1: '#080410',
      grassA: '#2a1838',
      grassB: '#221430',
      blade: 'rgba(180, 80, 220, 0.28)',
      pathEdge: '#1a1024',
      pathMid: '#3a2458',
      pathLight: '#5a3878',
      pebble: '#b070e0',
      trunk: '#1a1020',
      canopy: '#6a30a0',
      canopyDark: '#301050',
      glow: 'rgba(200, 100, 255, 0.26)',
      ui: '#c77dff',
    },
  },
];

export function worldById(id: WorldId): WorldDef {
  return WORLDS.find((w) => w.id === id) ?? WORLDS[0];
}

export function worldByIndex(index: number): WorldDef {
  return WORLDS.find((w) => w.index === index) ?? WORLDS[0];
}

export function themeFor(key: WorldId | { world: WorldId }): MapTheme {
  const id = typeof key === 'string' ? key : key.world;
  return worldById(id).theme;
}

/** River Bend plus the whole Ice world get the wet path wash. */
export function isWetLevel(level: { world: WorldId; stage: number }): boolean {
  return (level.world === 'forest' && level.stage === 2) || level.world === 'ice';
}

/** Toast word for the buildable tile. Forest grass, Desert sand, Ice ice. */
export function buildSurfaceWord(id: WorldId): string {
  if (id === 'desert') return 'sand';
  if (id === 'ice') return 'ice';
  return 'grass';
}
