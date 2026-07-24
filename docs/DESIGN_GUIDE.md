# Design guide — Possible Tower Defense

## Visual direction

- Biome-themed maps (meadow → river → forest → mist → swamp → haunted → ice → alpine → volcanic → bastion)
- Deep atmosphere: textured ground, water/lava, mountains, themed trees
- Towers read as structures (keep, bastion, crystal, coil, brazier, cauldron) with matching projectiles
- Mythical enemy silhouettes (orc, ghoul, troll, ghost, lich, …)
- Amber gold, teal/coral accents; Syne titles / DM Sans UI

## Interaction (BCI)

- Minimum control height ~48–52px (tower dock cards stay large)
- Click to select tower type → click grass to place
- Click owned tower → upgrade / sell
- Maximize canvas: tight HUD/dock padding, thin pause/leave strips — no extra chrome that shrinks the map
- No drag-and-drop; no hover-only actions

## Difficulty philosophy

- HP grows a bit faster than income across waves/levels
- Introduce mythical roles gradually (orc → gnome → ghoul → troll → ghost → lich)
- Distinct tower niches; avoid one tower winning every level
