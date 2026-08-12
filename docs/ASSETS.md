# Assets

All in-game art is **procedurally drawn** in `src/game/renderer.ts`, `src/game/sprites.ts`, and `src/game/fx.ts` (Canvas 2D shapes/gradients/particles).

SFX are generated in `src/game/audio.ts` with the Web Audio API (no sample files).

| Asset | Source | Notes |
| --- | --- | --- |
| Map tiles, towers, enemies, VFX | Hand-coded canvas rendering | No third-party pack |
| Combat SFX | Web Audio oscillators/noise in `src/game/audio.ts` | Mute in HUD |
| Fonts: Syne + DM Sans | Google Fonts | SIL Open Font License |
| Favicon | Inline SVG in `index.html` | Original |

No AI-generated image files and no paid asset packs were used for this build.
