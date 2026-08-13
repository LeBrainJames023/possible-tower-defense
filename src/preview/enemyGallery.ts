export type Lane = 'ground' | 'air';

export interface LookDef {
  id: string;
  name: string;
  blurb: string;
}

export interface KindDef {
  id: string;
  title: string;
  lane: Lane;
  role: string;
  looks: [LookDef, LookDef, LookDef];
}

/** 7 ground + 3 air. Roles map onto today's scout/grunt/swarm/brute/boss jobs. */
export const ENEMY_GALLERY: KindDef[] = [
  {
    id: 'goblin',
    title: 'Goblin — ground scout',
    lane: 'ground',
    role: 'Fast, fragile runner. Ice and arrows shine.',
    looks: [
      { id: 'sneak', name: 'Sneak', blurb: 'Ashen hide, hood, rusty shiv. Moria-scout energy.' },
      { id: 'stabber', name: 'Stabber', blurb: 'Hunched, spear, underbite. Built to rush the path.' },
      { id: 'trickster', name: 'Trickster', blurb: 'Satchel of nasty work, yellow slits, no bounce.' },
    ],
  },
  {
    id: 'raider',
    title: 'Raider — ground grunt',
    lane: 'ground',
    role: 'Standard orc infantry. Bread-and-butter fodder.',
    looks: [
      { id: 'shield', name: 'Shield-bearer', blurb: 'Round iron, short axe, tusked scowl.' },
      { id: 'berserk', name: 'Berserker', blurb: 'Dual choppers, warpaint, no helmet — just rage.' },
      { id: 'captain', name: 'Pack captain', blurb: 'Banner pole, leather harness, barking orders.' },
    ],
  },
  {
    id: 'imp',
    title: 'Imp — ground swarm',
    lane: 'ground',
    role: 'Tiny packs. Splash and lightning want these.',
    looks: [
      { id: 'ember', name: 'Ember imp', blurb: 'Horned vermin, hot gut, too many teeth.' },
      { id: 'mite', name: 'Cave mite', blurb: 'Pale cave thing. Skitters. Do not cuddle.' },
      { id: 'gremlin', name: 'Gremlin', blurb: 'Sickly green, needle fangs, pack hunter.' },
    ],
  },
  {
    id: 'warg',
    title: 'Warg — ground hunter',
    lane: 'ground',
    role: 'Fast medium beast. Punishes slow setups.',
    looks: [
      { id: 'dire', name: 'Dire wolf', blurb: 'Hyena-warg: sloped back, gold slits, hunting snarl.' },
      { id: 'plated', name: 'Plated warg', blurb: 'Iron collar. Still a killer, now armored.' },
      { id: 'mane', name: 'Ember mane', blurb: 'Russet war-beast, fire-tipped ruff, jaws first.' },
    ],
  },
  {
    id: 'troll',
    title: 'Troll — ground tank',
    lane: 'ground',
    role: 'Slow, fat HP. Cannon and poison.',
    looks: [
      { id: 'moss', name: 'Moss troll', blurb: 'River-stone hide, lichen patches, long arms.' },
      { id: 'club', name: 'Bridge clubber', blurb: 'Tree-trunk club, hunched back, ugly nose.' },
      { id: 'frost', name: 'Frost troll', blurb: 'Blue-grey skin, ice shards on the shoulders.' },
    ],
  },
  {
    id: 'ogre',
    title: 'Ogre — ground mini-boss',
    lane: 'ground',
    role: 'Later-level bruiser. One or two per tense wave.',
    looks: [
      { id: 'mauler', name: 'Mauler', blurb: 'Huge gut, tiny head, spiked maul.' },
      { id: 'brute', name: 'Belly brute', blurb: 'War-paint stripes, ham fists, no weapon needed.' },
      { id: 'hide', name: 'Hidebound', blurb: 'Bone trophies, leather straps, mean little eyes.' },
    ],
  },
  {
    id: 'warlord',
    title: 'Warlord — ground wave boss',
    lane: 'ground',
    role: 'Last-wave closer on most maps. Escort fodder around it.',
    looks: [
      { id: 'king', name: 'Troll king', blurb: 'Crooked crown, fur cloak, massive cleaver.' },
      { id: 'chief', name: 'Warchief', blurb: 'Tusks, iron pauldron, battle standard.' },
      { id: 'iron', name: 'Ironclad', blurb: 'Full plate brute, visor glow, tower shield.' },
    ],
  },
  {
    id: 'hellbat',
    title: 'Hellbat — air scout',
    lane: 'air',
    role: 'Fast flyer. Arrow / lightning food. Cannon cannot lock.',
    looks: [
      { id: 'cave', name: 'Cave bat', blurb: 'Leathery brown, gold eyes, tight flap.' },
      { id: 'ember', name: 'Ember bat', blurb: 'Char-red wings, coal belly, ember trail.' },
      { id: 'fang', name: 'Fang bat', blurb: 'Pale membrane, oversized canines, collar tuft.' },
    ],
  },
  {
    id: 'wyvern',
    title: 'Wyvern — air hunter',
    lane: 'air',
    role: 'Medium flyer. Needs dedicated anti-air along the path.',
    looks: [
      { id: 'forest', name: 'Forest wyvern', blurb: 'Two-leg dragon, leaf-green, hooked tail.' },
      { id: 'storm', name: 'Storm wyvern', blurb: 'Slate wings, spark wingtips, hunting scream.' },
      { id: 'venom', name: 'Venom wyvern', blurb: 'Olive-yellow, barbed tail, acid spit pose.' },
    ],
  },
  {
    id: 'drake',
    title: 'Drake — air wave boss',
    lane: 'air',
    role: 'Late / last-wave flyer. Fat HP in the sky.',
    looks: [
      { id: 'ember', name: 'Ember drake', blurb: 'Stocky fire-drake, bright belly, horned snout.' },
      { id: 'gilt', name: 'Gilt drake', blurb: 'Bronze scales, gold horns — raid-boss readable.' },
      { id: 'dusk', name: 'Dusk drake', blurb: 'Violet, not black. Bright eyes and wing lining.' },
    ],
  },
];
