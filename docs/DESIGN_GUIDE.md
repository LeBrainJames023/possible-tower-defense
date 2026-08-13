# Design guide — Possible Tower Defense

## Visual direction

- Deep slate night map, teal/blue accents, amber gold, coral danger
- Geometric procedural sprites, plus light CC0 texture overlays (multiply-tinted so levels keep their palettes)
- Towers: Ballista, Field gun, Crystal spire, Rune pylons, Brazier, Alchemy vat — fantasy gold/runes, not toy icons
- Wind motes drift across the map; path tiles get a faint scrolling water caustic
- Readable HUD: Syne for titles, DM Sans for UI

## Interaction (BCI)

- Minimum control height ~48–52px
- Click to select tower type → click grass to place
- Click owned tower → upgrade / sell
- No drag-and-drop; no hover-only actions

## Difficulty philosophy

- HP grows a bit faster than income across waves/levels
- Introduce enemy roles gradually (scout → swarm → brute → boss)
- Distinct tower niches; avoid one tower winning every level
