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
| `public/sprites/tree.png` | **Blender** headless (`tools/blender_tree.py`) | Fallback tree if painted forest trees are missing. |
| `public/sprites/enemies/*.png` | **Cursor image gen** + Sprite Forge (copied from `preview/sprite-forge/monsters/`) | Live match now uses the painted keepers. Orc still → Raider. Ghoul/Gnome still extras. |
| `public/sprites/enemies/walk/{creature}-1..4.png` | Cursor image gen 2×2 walk/fly sheet + Sprite Forge process (`feet` walkers, `center` flyers) | Older single-facing 4-frame loops. Fallback if a 4-dir frame is missing. |
| `public/sprites/enemies/walk/{creature}-{n,e,s,w}-1..4.png` | Cursor image gen 4×4 directional sheet + Sprite Forge (`feet` walkers, `center` flyers). Raw in `preview/sprite-forge/walk4/`. Live copies: **east/west files swapped** so the east filename faces right; `tools/defringeWalks.py` knocks magenta chroma off the silhouette. | Live 4-dir walk/flap. Imp / hellbat flap; others walk. |
| `public/sprites/enemies/face/{creature}-{n,e,s,w}.png` | Copied from `preview/sprite-forge/facings/` (walk-1 down, walk-2 left, walk-3 right, walk-4 up). Orc folder → raider. East/west stills swapped to match the walk files. | Live north/south stills so the body turns on vertical path. East/west stills are fallback if the walk sheet is missing. |
| `public/sprites/enemy-bodies/{slot}/*.png` | **Blender** (`tools/blender_enemy_bodies.py`) from extra Quaternius packs (Easy Enemy, Animated Monster, unused Ultimate Monsters) | Three new-body options per job for the picker. Not wired into the match until you pick. |
| `public/preview/sprite-forge/raider/{a,b,c}/` | **Cursor image gen** + **Agent Sprite Forge** (`generate2dsprite.py` magenta key) | Human raider stills. Parked — quality was good, species was wrong. |
| `public/preview/sprite-forge/monsters/{goblin,orc,troll,ghoul,gnome,wyvern,imp,warg,warlord,ogre,hellbat,drake}/` | Same pipeline | Mythic enemy identity stills. Keepers are now the live sprites. |
| `public/preview/sprite-forge/facings/{creature}/` | Cursor image gen + Sprite Forge 2×2 split | Four path facings (down / left / right / up). Copied into live `public/sprites/enemies/face/` for north/south. |
| `public/preview/sprite-forge/towers/{kind}/{a,b}/` | Same pipeline | Two painted options per tower. Live match uses all **A**. |
| `public/preview/sprite-forge/projectiles/{kind}/{a,b}/` | Same pipeline | Shot options. Live match: Arrow A, Cannon B, Ice A, Lightning A, Fire A, Poison A. |
| `public/sprites/towers/*.png` | Cursor image gen + Sprite Forge | Live tower stills. Arrow = empty base + rotating ballista. Cannon = still carriage + rotating barrel. Ice/fire/lightning/poison stay still. |
| `public/sprites/projectiles/*.png` | Same pipeline | Live shots matching the picks above. |
| `public/sprites/landmarks/portal-in.png` | Cursor image gen + Sprite Forge | Forest entrance rift. |
| `public/sprites/landmarks/portal-out.png` | Same pipeline | Forest exit rift. |
| `public/sprites/trees/*.png` | Same pipeline | Oak, pine, apple, willow, dogwood on Forest decor tiles. |
| `public/sprites/terrain/*.png` | Same pipeline | Four grass + four worn path tiles, mixed per cell. |
| `public/sprites/terrain/sand-*.png` | Cursor image gen 2×2 sand pack | Desert grass-equivalent. Mixed per cell like Forest grass. |
| `public/sprites/terrain/sand-path-*.png` | Cursor image gen 2×2 packed-sand path pack | Desert path tiles. |
| `public/sprites/desert/{cactus,dead-tree,boulder,agave}.png` | Cursor image gen 2×2 prop pack + Sprite Forge | Desert blocked-tile props. |
| `public/sprites/landmarks/portal-desert-in.png` | Cursor image gen + Sprite Forge | Desert entrance rift (sandstone + gold vortex). |
| `public/sprites/landmarks/portal-desert-out.png` | Same | Desert exit rift. |
| `public/sprites/enemies/{scorpion,dunerunner,dunetyrant,sandkhan}.png` | Cursor image gen 4×4 walk sheet + Sprite Forge | Live Desert bodies. No longer costume-swap hellbat/goblin/wyvern/warlord. |
| `public/sprites/enemies/walk/{scorpion,dunerunner,dunetyrant,sandkhan}-{n,e,s,w}-1..4.png` | Same 4×4 sheets (`feet` align). Raw in `preview/sprite-forge/walk4/`. | Live 4-dir walks. |
| `public/sprites/terrain/ice-*.png` | Cursor image gen 2×2 snow pack | Ice grass-equivalent. Mixed per cell like Forest grass. |
| `public/sprites/terrain/ice-path-*.png` | Cursor image gen 2×2 packed-ice path pack | Ice path tiles. |
| `public/sprites/ice/{crystal,pine,boulder,shrub}.png` | Cursor image gen 2×2 prop pack + Sprite Forge | Ice blocked-tile props. |
| `public/sprites/landmarks/portal-ice-in.png` | Cursor image gen + Sprite Forge | Ice entrance rift (glacier stone + cyan vortex). |
| `public/sprites/landmarks/portal-ice-out.png` | Same | Ice exit rift. |
| `public/sprites/enemies/{frostwisp,icewolf,packlord,frostjarl}.png` | Cursor image gen 4×4 walk sheet + Sprite Forge | Live Ice bodies. No longer costume-swap imp/warg/ogre. |
| `public/sprites/enemies/walk/{frostwisp,icewolf,packlord,frostjarl}-{n,e,s,w}-1..4.png` | Same 4×4 sheets (`center` wisp, `feet` walkers). Raw in `preview/sprite-forge/walk4/`. | Live 4-dir flap/walks. |
| Combat beeps / shots | Web Audio in `src/game/audio.ts` | Per-tower hits, plus a quiet prepare/battle pad that ducks under shots |

Fire land is **procedural Canvas** until painted sheets are asked for: cracked ash + lava-vein path in `drawWorld.ts` / `renderer.ts`, lava-rock variants on blocked tiles, jagged ember portals (Fire no longer falls through to Forest `portal-in.png`). Wiring is ready for `public/sprites/terrain/fire-*.png`, `fire-path-*.png`, `public/sprites/fire/*.png`, and `portal-fire-in/out.png` when those files exist.

Hollow land is **procedural Canvas** the same way: rune glyphs + violet motes on the ground, glowing rune-vein path, four prop kinds (menhir / broken tablet / obelisk / ward-post), hex rune gates and a spire keep. HUD says `click rune`. No image-gen this window. Wiring can wait for `public/sprites/terrain/hollow-*.png` and `portal-hollow-in/out.png` when asked. Bodies still costume-swap Imp / Raider / Wyvern / Drake.

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

Enemy stills in `public/preview/sprite-forge/` are Cursor-generated (not Grok Imagine API). Live **tower**, **shot**, **enemy**, Forest / Desert / Ice **portals**, Forest **trees**, Desert **props**, Ice **props**, and **grass/path/sand/ice** tiles use the painted keepers. No paid packs.
