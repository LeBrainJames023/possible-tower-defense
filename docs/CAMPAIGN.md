# Campaign — five worlds, fifty maps

Goal: a sit-down you cannot finish in ten minutes. Same five enemies for now.

## Worlds (in order)

1. **Forest** — current meadow. Tutorial home.
2. **Desert** — sand and long sightlines.
3. **Ice** — pale, tight, chill.
4. **Fire** — ash and pressure.
5. **The Hollow** — cursed magician land. Finale.

Each world has **10 stages × 10 waves**. Worlds get meaner. Stages inside a world get meaner.

## Build order

1. **Scaffold** — world model, save format, world-map screen, one palette per world.
2. **Forest** — the ten maps we already have. No rewrite.
3. **Bare-bones 40** — Desert / Ice / Fire / Hollow reuse those ten path *shapes*, flipped or reversed, plus the world palette and harder HP. Same towers, same enemies.
4. **Loop** — beat a world’s stage 10 → next world lights up on the map. Big click targets. No walking Mario man.
5. **Later (not this pass)** — hand-author unique paths, enemy color tinge, world props (cactus, ice spike, lava, rune). Do not image-gen.

## Why transforms first

Fifty unique hand-drawn paths in one sitting would be sloppy. Ten good layouts × five orientations is a real campaign you can play tonight. Replacing a transform with a custom path later does not break saves.
