# Design guide — Possible Tower Defense

## Visual direction

- Biome-themed maps (meadow → river → forest → mist → swamp → haunted → ice → alpine → volcanic → bastion)
- Deep atmosphere: textured ground, water/lava, mountains, themed trees and rocks
- Towers read as structures with matching projectiles; enemies have distinct mythical silhouettes
- Amber gold, teal/coral accents; Syne titles / DM Sans UI

## Interaction (BCI)

- Minimum control height ~48–56px
- Slim tower icon bar + pop-out detail sheet (not a permanent fat dock)
- Inspect / upgrade / sell as a floating card over the map — only when something is selected
- Click tower type → click grass to place; click again on the same icon to cancel
- Maximize canvas; chrome stays thin
- No drag-and-drop; no hover-only actions

## Placement philosophy

- Grass = buildable; path / water / decor (trees & rocks) = blocked
- Later levels intentionally remove more “perfect” pads near the lane
- When placing, buildable grass glows; blocked tiles show a red X

## Difficulty philosophy

- HP grows a bit faster than income across waves/levels
- Introduce mythical roles gradually (orc → gnome → ghoul → troll → ghost → lich)
- Distinct tower niches; avoid one tower winning every level
