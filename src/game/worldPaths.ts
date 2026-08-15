import { COLS, ROWS } from './constants';
import type { WorldId } from './worlds';

type Cell = { c: number; r: number };

export interface PathOverride {
  name?: string;
  blurb?: string;
  corners: Array<{ c: number; r: number }>;
  blocked?: Array<{ c: number; r: number }>;
}

/** Hand-authored tracks for worlds 2–5. Forest stays in levels.ts. */
export const PATH_OVERRIDES: Partial<Record<WorldId, Partial<Record<number, PathOverride>>>> = {
  desert: {
    1: {
      name: 'Dune Gate',
      blurb: 'A low caravan road, then a cut through the dunes.',
      corners: [
        { c: 0, r: 9 },
        { c: 8, r: 9 },
        { c: 8, r: 3 },
        { c: 15, r: 3 },
        { c: 15, r: 10 },
        { c: 19, r: 10 },
      ],
      blocked: [
        { c: 4, r: 6 },
        { c: 11, r: 6 },
        { c: 17, r: 5 },
      ],
    },
    2: {
      name: 'Oasis Bend',
      blurb: 'Dip to the water, then the high dune home.',
      corners: [
        { c: 0, r: 3 },
        { c: 7, r: 3 },
        { c: 7, r: 8 },
        { c: 13, r: 8 },
        { c: 13, r: 2 },
        { c: 19, r: 2 },
      ],
      blocked: [
        { c: 3, r: 6 },
        { c: 10, r: 5 },
        { c: 16, r: 5 },
      ],
    },
    3: {
      name: 'Twin Dunes',
      blurb: 'Two ridges. Cover both or get flanked.',
      corners: [
        { c: 0, r: 10 },
        { c: 5, r: 10 },
        { c: 5, r: 2 },
        { c: 10, r: 2 },
        { c: 10, r: 9 },
        { c: 16, r: 9 },
        { c: 16, r: 4 },
        { c: 19, r: 4 },
      ],
      blocked: [
        { c: 2, r: 6 },
        { c: 8, r: 6 },
        { c: 13, r: 5 },
      ],
    },
    4: {
      name: 'Sand Spiral',
      blurb: 'Around the mesa, then a cut to the gate.',
      corners: [
        { c: 0, r: 1 },
        { c: 16, r: 1 },
        { c: 16, r: 10 },
        { c: 3, r: 10 },
        { c: 3, r: 4 },
        { c: 12, r: 4 },
        { c: 12, r: 7 },
        { c: 19, r: 7 },
      ],
      blocked: [
        { c: 6, r: 6 },
        { c: 9, r: 2 },
        { c: 14, r: 6 },
      ],
    },
    5: {
      name: 'Crosswinds',
      blurb: 'Long sightlines. Splash has room to work.',
      corners: [
        { c: 0, r: 2 },
        { c: 14, r: 2 },
        { c: 14, r: 8 },
        { c: 4, r: 8 },
        { c: 4, r: 11 },
        { c: 19, r: 11 },
      ],
      blocked: [
        { c: 7, r: 5 },
        { c: 10, r: 5 },
        { c: 17, r: 7 },
      ],
    },
    6: {
      name: 'Ridge Dunes',
      blurb: 'Along the basin, then up the ridge.',
      corners: [
        { c: 0, r: 11 },
        { c: 11, r: 11 },
        { c: 11, r: 2 },
        { c: 4, r: 2 },
        { c: 4, r: 6 },
        { c: 19, r: 6 },
      ],
      blocked: [
        { c: 7, r: 8 },
        { c: 14, r: 4 },
        { c: 16, r: 9 },
      ],
    },
    7: {
      name: 'Broken Mesa',
      blurb: 'Jogs force awkward pockets. Plan the corners.',
      corners: [
        { c: 0, r: 4 },
        { c: 6, r: 4 },
        { c: 6, r: 8 },
        { c: 2, r: 8 },
        { c: 2, r: 11 },
        { c: 14, r: 11 },
        { c: 14, r: 1 },
        { c: 19, r: 1 },
      ],
      blocked: [
        { c: 4, r: 6 },
        { c: 9, r: 6 },
        { c: 11, r: 3 },
        { c: 16, r: 5 },
      ],
    },
    8: {
      name: 'Dry Canal',
      blurb: 'A long dry wash, then the hook to the keep.',
      corners: [
        { c: 0, r: 7 },
        { c: 18, r: 7 },
        { c: 18, r: 2 },
        { c: 5, r: 2 },
        { c: 5, r: 10 },
        { c: 19, r: 10 },
      ],
      blocked: [
        { c: 8, r: 4 },
        { c: 11, r: 4 },
        { c: 14, r: 9 },
      ],
    },
    9: {
      name: 'Siege Caravan',
      blurb: 'They march the old road. Armor comes early.',
      corners: [
        { c: 0, r: 0 },
        { c: 0, r: 7 },
        { c: 8, r: 7 },
        { c: 8, r: 3 },
        { c: 15, r: 3 },
        { c: 15, r: 10 },
        { c: 19, r: 10 },
      ],
      blocked: [
        { c: 3, r: 3 },
        { c: 11, r: 6 },
        { c: 17, r: 6 },
      ],
    },
    10: {
      name: 'Last Oasis',
      blurb: 'Canyon switchbacks. Every niche matters.',
      corners: [
        { c: 0, r: 0 },
        { c: 6, r: 0 },
        { c: 6, r: 7 },
        { c: 12, r: 7 },
        { c: 12, r: 1 },
        { c: 18, r: 1 },
        { c: 18, r: 9 },
        { c: 19, r: 9 },
      ],
      blocked: [
        { c: 3, r: 3 },
        { c: 9, r: 4 },
        { c: 15, r: 5 },
      ],
    },
  },
  ice: {
    1: {
      name: 'Frost Gate',
      blurb: 'A tight fjord. Range management from the first wave.',
      corners: [
        { c: 0, r: 1 },
        { c: 3, r: 1 },
        { c: 3, r: 10 },
        { c: 9, r: 10 },
        { c: 9, r: 2 },
        { c: 16, r: 2 },
        { c: 16, r: 8 },
        { c: 19, r: 8 },
      ],
      blocked: [
        { c: 6, r: 5 },
        { c: 12, r: 6 },
      ],
    },
    2: {
      name: 'Glacier Bend',
      blurb: 'Pinched entry, then the long white lane.',
      corners: [
        { c: 0, r: 4 },
        { c: 2, r: 4 },
        { c: 2, r: 11 },
        { c: 11, r: 11 },
        { c: 11, r: 1 },
        { c: 17, r: 1 },
        { c: 17, r: 6 },
        { c: 19, r: 6 },
      ],
      blocked: [
        { c: 5, r: 7 },
        { c: 8, r: 4 },
        { c: 14, r: 4 },
      ],
    },
    3: {
      name: 'Twin Floes',
      blurb: 'Two ice shelves. Split your coverage.',
      corners: [
        { c: 0, r: 8 },
        { c: 4, r: 8 },
        { c: 4, r: 0 },
        { c: 10, r: 0 },
        { c: 10, r: 9 },
        { c: 15, r: 9 },
        { c: 15, r: 3 },
        { c: 19, r: 3 },
      ],
      blocked: [
        { c: 7, r: 4 },
        { c: 12, r: 5 },
        { c: 17, r: 6 },
      ],
    },
    4: {
      name: 'Ice Spiral',
      blurb: 'Around the floe, then the inner cut.',
      corners: [
        { c: 0, r: 2 },
        { c: 17, r: 2 },
        { c: 17, r: 10 },
        { c: 2, r: 10 },
        { c: 2, r: 5 },
        { c: 13, r: 5 },
        { c: 13, r: 8 },
        { c: 19, r: 8 },
      ],
      blocked: [
        { c: 6, r: 6 },
        { c: 9, r: 3 },
        { c: 15, r: 6 },
      ],
    },
    5: {
      name: 'Crossfrost',
      blurb: 'Top shelf, then a drop to the ice.',
      corners: [
        { c: 0, r: 5 },
        { c: 5, r: 5 },
        { c: 5, r: 0 },
        { c: 12, r: 0 },
        { c: 12, r: 11 },
        { c: 18, r: 11 },
        { c: 18, r: 4 },
        { c: 19, r: 4 },
      ],
      blocked: [
        { c: 8, r: 3 },
        { c: 15, r: 6 },
      ],
    },
    6: {
      name: 'Ridge Ice',
      blurb: 'Up the cliff, along the shelf, down again.',
      corners: [
        { c: 0, r: 11 },
        { c: 2, r: 11 },
        { c: 2, r: 1 },
        { c: 8, r: 1 },
        { c: 8, r: 8 },
        { c: 14, r: 8 },
        { c: 14, r: 2 },
        { c: 19, r: 2 },
      ],
      blocked: [
        { c: 5, r: 5 },
        { c: 11, r: 4 },
        { c: 16, r: 5 },
      ],
    },
    7: {
      name: 'Broken Shelf',
      blurb: 'The ice gave out. Awkward pockets remain.',
      corners: [
        { c: 0, r: 3 },
        { c: 7, r: 3 },
        { c: 7, r: 7 },
        { c: 3, r: 7 },
        { c: 3, r: 11 },
        { c: 13, r: 11 },
        { c: 13, r: 0 },
        { c: 19, r: 0 },
      ],
      blocked: [
        { c: 5, r: 5 },
        { c: 10, r: 6 },
        { c: 16, r: 4 },
      ],
    },
    8: {
      name: 'Night Fjord',
      blurb: 'A long fjord, then the night return.',
      corners: [
        { c: 0, r: 6 },
        { c: 19, r: 6 },
        { c: 19, r: 1 },
        { c: 6, r: 1 },
        { c: 6, r: 10 },
        { c: 17, r: 10 },
        { c: 17, r: 8 },
        { c: 19, r: 8 },
      ],
      blocked: [
        { c: 3, r: 3 },
        { c: 10, r: 3 },
        { c: 12, r: 8 },
      ],
    },
    9: {
      name: 'Siege Drift',
      blurb: 'Down the glacier wall, then the siege road.',
      corners: [
        { c: 0, r: 0 },
        { c: 0, r: 9 },
        { c: 6, r: 9 },
        { c: 6, r: 2 },
        { c: 12, r: 2 },
        { c: 12, r: 10 },
        { c: 19, r: 10 },
      ],
      blocked: [
        { c: 3, r: 4 },
        { c: 9, r: 6 },
        { c: 15, r: 6 },
      ],
    },
    10: {
      name: 'Last Glacier',
      blurb: 'Across the rim, then the long shelf home.',
      corners: [
        { c: 0, r: 0 },
        { c: 19, r: 0 },
        { c: 19, r: 4 },
        { c: 3, r: 4 },
        { c: 3, r: 9 },
        { c: 19, r: 9 },
      ],
      blocked: [
        { c: 8, r: 2 },
        { c: 10, r: 6 },
        { c: 14, r: 6 },
      ],
    },
  },
  fire: {
    1: {
      name: 'Ember Gate',
      blurb: 'Up from the ash flats into the glow.',
      corners: [
        { c: 0, r: 11 },
        { c: 5, r: 11 },
        { c: 5, r: 4 },
        { c: 11, r: 4 },
        { c: 11, r: 9 },
        { c: 19, r: 9 },
      ],
      blocked: [
        { c: 2, r: 7 },
        { c: 8, r: 7 },
        { c: 15, r: 6 },
      ],
    },
    2: {
      name: 'Magma Bend',
      blurb: 'A low river of heat, then the rise.',
      corners: [
        { c: 0, r: 8 },
        { c: 6, r: 8 },
        { c: 6, r: 2 },
        { c: 12, r: 2 },
        { c: 12, r: 9 },
        { c: 19, r: 9 },
      ],
      blocked: [
        { c: 3, r: 4 },
        { c: 9, r: 5 },
        { c: 15, r: 5 },
      ],
    },
    3: {
      name: 'Twin Caldera',
      blurb: 'Two rims. Miss one and they walk it.',
      corners: [
        { c: 0, r: 1 },
        { c: 5, r: 1 },
        { c: 5, r: 10 },
        { c: 11, r: 10 },
        { c: 11, r: 2 },
        { c: 17, r: 2 },
        { c: 17, r: 7 },
        { c: 19, r: 7 },
      ],
      blocked: [
        { c: 2, r: 5 },
        { c: 8, r: 5 },
        { c: 14, r: 6 },
      ],
    },
    4: {
      name: 'Fire Spiral',
      blurb: 'Around the crust, then the inner burn.',
      corners: [
        { c: 0, r: 10 },
        { c: 17, r: 10 },
        { c: 17, r: 1 },
        { c: 3, r: 1 },
        { c: 3, r: 6 },
        { c: 12, r: 6 },
        { c: 12, r: 3 },
        { c: 19, r: 3 },
      ],
      blocked: [
        { c: 6, r: 4 },
        { c: 9, r: 8 },
        { c: 14, r: 4 },
      ],
    },
    5: {
      name: 'Crossflame',
      blurb: 'Heat zigzag. Cover both shelves.',
      corners: [
        { c: 0, r: 3 },
        { c: 7, r: 3 },
        { c: 7, r: 10 },
        { c: 13, r: 10 },
        { c: 13, r: 1 },
        { c: 19, r: 1 },
      ],
      blocked: [
        { c: 4, r: 6 },
        { c: 10, r: 5 },
        { c: 16, r: 5 },
      ],
    },
    6: {
      name: 'Ridge Ash',
      blurb: 'Down from the cinder ridge into the glow.',
      corners: [
        { c: 0, r: 0 },
        { c: 3, r: 0 },
        { c: 3, r: 9 },
        { c: 9, r: 9 },
        { c: 9, r: 2 },
        { c: 15, r: 2 },
        { c: 15, r: 8 },
        { c: 19, r: 8 },
      ],
      blocked: [
        { c: 6, r: 5 },
        { c: 12, r: 5 },
        { c: 17, r: 4 },
      ],
    },
    7: {
      name: 'Broken Crust',
      blurb: 'The ground split. Towers want the cracks.',
      corners: [
        { c: 0, r: 5 },
        { c: 6, r: 5 },
        { c: 6, r: 9 },
        { c: 1, r: 9 },
        { c: 1, r: 11 },
        { c: 12, r: 11 },
        { c: 12, r: 0 },
        { c: 19, r: 0 },
      ],
      blocked: [
        { c: 3, r: 7 },
        { c: 8, r: 3 },
        { c: 15, r: 4 },
      ],
    },
    8: {
      name: 'Lava Canal',
      blurb: 'A canal of glow, then the return burn.',
      corners: [
        { c: 0, r: 4 },
        { c: 19, r: 4 },
        { c: 19, r: 9 },
        { c: 4, r: 9 },
        { c: 4, r: 1 },
        { c: 16, r: 1 },
        { c: 16, r: 6 },
        { c: 19, r: 6 },
      ],
      blocked: [
        { c: 7, r: 6 },
        { c: 10, r: 6 },
        { c: 13, r: 3 },
      ],
    },
    9: {
      name: 'Siege Cinder',
      blurb: 'Up from the pits. The siege is already here.',
      corners: [
        { c: 0, r: 11 },
        { c: 0, r: 4 },
        { c: 7, r: 4 },
        { c: 7, r: 1 },
        { c: 13, r: 1 },
        { c: 13, r: 8 },
        { c: 19, r: 8 },
      ],
      blocked: [
        { c: 3, r: 7 },
        { c: 10, r: 5 },
        { c: 16, r: 4 },
      ],
    },
    10: {
      name: 'Last Crucible',
      blurb: 'A crawl through the crust. No wasted towers.',
      corners: [
        { c: 0, r: 6 },
        { c: 4, r: 6 },
        { c: 4, r: 1 },
        { c: 10, r: 1 },
        { c: 10, r: 10 },
        { c: 16, r: 10 },
        { c: 16, r: 3 },
        { c: 19, r: 3 },
      ],
      blocked: [
        { c: 7, r: 4 },
        { c: 13, r: 6 },
        { c: 17, r: 7 },
      ],
    },
  },
  hollow: {
    1: {
      name: 'Rune Gate',
      blurb: 'They come from the dark above. Watch the drop.',
      corners: [
        { c: 9, r: 0 },
        { c: 9, r: 4 },
        { c: 2, r: 4 },
        { c: 2, r: 9 },
        { c: 16, r: 9 },
        { c: 16, r: 2 },
        { c: 19, r: 2 },
      ],
      blocked: [
        { c: 5, r: 6 },
        { c: 12, r: 6 },
        { c: 12, r: 3 },
      ],
    },
    2: {
      name: 'Shadow Bend',
      blurb: 'A high lane, then the pit, then the door.',
      corners: [
        { c: 0, r: 2 },
        { c: 8, r: 2 },
        { c: 8, r: 8 },
        { c: 3, r: 8 },
        { c: 3, r: 11 },
        { c: 17, r: 11 },
        { c: 17, r: 4 },
        { c: 19, r: 4 },
      ],
      blocked: [
        { c: 5, r: 5 },
        { c: 11, r: 6 },
        { c: 14, r: 3 },
      ],
    },
    3: {
      name: 'Twin Hex',
      blurb: 'They drop from the rune, then split the ward.',
      corners: [
        { c: 11, r: 0 },
        { c: 11, r: 5 },
        { c: 4, r: 5 },
        { c: 4, r: 10 },
        { c: 15, r: 10 },
        { c: 15, r: 3 },
        { c: 19, r: 3 },
      ],
      blocked: [
        { c: 7, r: 2 },
        { c: 8, r: 7 },
        { c: 17, r: 6 },
      ],
    },
    4: {
      name: 'Void Spiral',
      blurb: 'Around the hex, then the inner cut.',
      corners: [
        { c: 0, r: 11 },
        { c: 18, r: 11 },
        { c: 18, r: 1 },
        { c: 2, r: 1 },
        { c: 2, r: 7 },
        { c: 14, r: 7 },
        { c: 14, r: 4 },
        { c: 19, r: 4 },
      ],
      blocked: [
        { c: 6, r: 4 },
        { c: 9, r: 9 },
        { c: 16, r: 6 },
      ],
    },
    5: {
      name: 'Crosscurse',
      blurb: 'A hex of long lanes. Lightning earns its keep.',
      corners: [
        { c: 0, r: 8 },
        { c: 6, r: 8 },
        { c: 6, r: 1 },
        { c: 13, r: 1 },
        { c: 13, r: 10 },
        { c: 19, r: 10 },
      ],
      blocked: [
        { c: 3, r: 4 },
        { c: 9, r: 5 },
        { c: 16, r: 6 },
      ],
    },
    6: {
      name: 'Ridge Bone',
      blurb: 'Along the spine, then the drop to the door.',
      corners: [
        { c: 0, r: 6 },
        { c: 3, r: 6 },
        { c: 3, r: 0 },
        { c: 10, r: 0 },
        { c: 10, r: 10 },
        { c: 16, r: 10 },
        { c: 16, r: 3 },
        { c: 19, r: 3 },
      ],
      blocked: [
        { c: 6, r: 4 },
        { c: 13, r: 5 },
        { c: 13, r: 2 },
      ],
    },
    7: {
      name: 'Broken Ward',
      blurb: 'The seal cracked. Corners lie in the wrong places.',
      corners: [
        { c: 0, r: 4 },
        { c: 5, r: 4 },
        { c: 5, r: 8 },
        { c: 1, r: 8 },
        { c: 1, r: 11 },
        { c: 11, r: 11 },
        { c: 11, r: 0 },
        { c: 19, r: 0 },
      ],
      blocked: [
        { c: 3, r: 6 },
        { c: 8, r: 3 },
        { c: 14, r: 5 },
      ],
    },
    8: {
      name: 'Night Vein',
      blurb: 'A vein of dark, then the night return.',
      corners: [
        { c: 0, r: 5 },
        { c: 19, r: 5 },
        { c: 19, r: 10 },
        { c: 5, r: 10 },
        { c: 5, r: 1 },
        { c: 14, r: 1 },
        { c: 14, r: 7 },
        { c: 19, r: 7 },
      ],
      blocked: [
        { c: 8, r: 3 },
        { c: 11, r: 8 },
        { c: 16, r: 3 },
      ],
    },
    9: {
      name: 'Siege Cult',
      blurb: 'They walk the old rite. The door is close.',
      corners: [
        { c: 0, r: 1 },
        { c: 0, r: 8 },
        { c: 7, r: 8 },
        { c: 7, r: 2 },
        { c: 14, r: 2 },
        { c: 14, r: 10 },
        { c: 19, r: 10 },
      ],
      blocked: [
        { c: 3, r: 4 },
        { c: 10, r: 5 },
        { c: 16, r: 6 },
      ],
    },
    10: {
      name: 'Last Spire',
      blurb: 'The magician’s door. Climb, then the last turn.',
      corners: [
        { c: 0, r: 11 },
        { c: 0, r: 3 },
        { c: 8, r: 3 },
        { c: 8, r: 9 },
        { c: 14, r: 9 },
        { c: 14, r: 1 },
        { c: 19, r: 1 },
      ],
      blocked: [
        { c: 4, r: 6 },
        { c: 11, r: 5 },
        { c: 17, r: 5 },
      ],
    },
  },
};

/** Extra rocks/cacti/crystals so later worlds are not three lonely props. Forest stays authored. */
export function scatterWorldDecor(world: WorldId, path: Cell[], blocked: Cell[]): Cell[] {
  if (world === 'forest') return blocked;
  const taken = new Set([...path, ...blocked].map((p) => `${p.c},${p.r}`));
  const extra: Cell[] = [];
  let salt = 1;
  while (extra.length < 7 && salt < 220) {
    const n = Math.sin(salt * 12.9898 + world.length * 78.233) * 43758.5453;
    const u = n - Math.floor(n);
    const c = Math.floor(u * COLS);
    const n2 = Math.sin(salt * 4.12 + 19.19) * 23421.17;
    const r = Math.floor((n2 - Math.floor(n2)) * ROWS);
    const key = `${c},${r}`;
    salt++;
    if (taken.has(key)) continue;
    taken.add(key);
    extra.push({ c, r });
  }
  return [...blocked, ...extra];
}
