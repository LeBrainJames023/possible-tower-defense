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
5. **World look** — each land has its own ground marks and blocked-tile props (tree / cactus / crystal / lava rock / rune). Same five enemies.
6. **Unique paths** — all ten stages in Desert / Ice / Fire / Hollow are hand-authored. Forest stays the original ten. Look mode lets you walk a locked land without unlocking the campaign.
7. **Fix-up** — world cards show a path thumb and 0/10 progress. Later worlds get extra props so they are not empty. Play always opens the campaign map.
8. **Later** — enemy color tinge. Do not image-gen.

Transforms were the scaffold. Custom paths replaced them world by world without breaking saves.
