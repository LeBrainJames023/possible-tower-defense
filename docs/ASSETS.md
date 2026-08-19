# Assets

Art is still mostly **procedural Canvas 2D** (`src/game/renderer.ts`, `src/game/sprites.ts`, `src/game/fx.ts`). This pass adds a thin layer of baked files so grass, dirt, trees, wind, and water read as a place — not a screenshot of a 3D engine.

Regenerate with `./tools/build-env-assets.sh`.

| Asset | Tool | What it changed |
| --- | --- | --- |
| `public/textures/grass.jpg` | **Poly Haven** (`aerial_grass_rock`, CC0) + **ImageMagick** | Real ground grain, resized/color-graded, then multiply-tinted per level so palettes stay |
| `public/textures/dirt.jpg` | **Poly Haven** (`dirt`, CC0) + **ImageMagick** | Path grit on top of the painted dirt tiles |
| `public/textures/water.jpg` | **ImageMagick** `plasma:` caustic | Soft wet light that scrolls on the path (stronger on levels 2 and 8) |
| `public/sfx/wind.mp3` | **sox** brown-noise bed → **ffmpeg** mp3 | Quiet looping wind under combat SFX |
| `public/sfx/water.mp3` | **sox** beating tones + pink noise → **ffmpeg** mp3 | Stream bed; louder on the two “wet” maps |
| `public/icons/*.png` | **Inkscape** (SVG in `tools/icons/`) | Tower dock swatches instead of flat CSS gradients |
| `public/sprites/tree.png` | **Blender** headless (`tools/blender_tree.py`) | Low-poly tree billboard on decor tiles |
| `public/sprites/enemies/*.png` | **Blender** headless (`tools/blender_enemies.py`) importing **Quaternius** CC0 glTF | Billboards for the base five plus leftover bodies (warg, ogre, hellbat, wyvern, drake) reused as world specials / champions / bosses. Unique art later. |
| `public/sprites/enemy-bodies/{slot}/*.png` | **Blender** (`tools/blender_enemy_bodies.py`) from extra Quaternius packs (Easy Enemy, Animated Monster, unused Ultimate Monsters) | Three new-body options per job for the picker. Not wired into the match until you pick. |
| `public/preview/sprite-forge/raider/{a,b,c}/` | **Cursor image gen** + **Agent Sprite Forge** (`generate2dsprite.py` magenta key) | Human raider stills. Parked — quality was good, species was wrong. |
| `public/preview/sprite-forge/monsters/{goblin,orc,troll,ghoul,gnome,wyvern,imp,warg}/` | Same pipeline | Mythic enemy identity stills. Not wired into the match until keepers are locked. |
| Combat beeps / shots | Web Audio in `src/game/audio.ts` | Per-tower hits, plus a quiet prepare/battle pad that ducks under shots |

Fonts: Syne + DM Sans (Google Fonts, SIL OFL). Favicon: inline SVG.

Poly Haven textures are CC0. We downloaded files at bake time (not the live API in-game). Credit: [aerial_grass_rock](https://polyhaven.com/a/aerial_grass_rock), [dirt](https://polyhaven.com/a/dirt).

Enemy meshes are CC0 from [Quaternius](https://quaternius.com/): Ultimate Monsters, Ultimate Animated Animals (Wolf). Credit is not required; we log it anyway.

## Tools on this machine we did **not** use this pass

| Tool | Why not (yet) |
| --- | --- |
| **Godot** | Would mean rewriting the whole Vite + Canvas game. Wrong ceiling for a polish patch. |
| **Tiled** | Maps already live in `src/game/levels.ts`. A second map source would drift out of sync. |
| **MagicaVoxel** | Great for 3D voxel props; this game is 2D billboards. Blender covered the one 3D bake. |
| **Krita / GIMP / LibreSprite / Audacity** | Hand-paint / hand-edit tools. The batch cousins (ImageMagick, sox, ffmpeg) did the repeatable work. |

Enemy stills in `public/preview/sprite-forge/` are Cursor-generated (not Grok Imagine API). Live match sprites are still the Quaternius bakes until a keeper is locked. No paid packs.
