# Campaign — five worlds, fifty maps

Goal: a sit-down you cannot finish in ten minutes. Five shared foes, two locals per world, a wave-7 champion, and a wave-10 world boss.

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
5. **World look** — each land has its own ground marks and blocked-tile props (tree / cactus / crystal / lava rock / rune).
6. **Unique paths** — all ten stages in Desert / Ice / Fire / Hollow are hand-authored. Forest stays the original ten. Look mode lets you walk a locked land without unlocking the campaign.
7. **Fix-up** — world cards show a path thumb and 0/10 progress. Later worlds get extra props so they are not empty. Play always opens the campaign map.
8. **Roster** — five shared foes, two locals per world, a wave-7 champion, a wave-10 world boss. Forest stage 1 stays the tutorial (no locals/champion). Placeholder Quaternius bodies for now.
9. **Later** — unique enemy art, on-death tricks, flyers. Do not image-gen.

**World passes (Hollow):** Forest, Desert, Ice, and Fire already cleared the “place + verbs + play all ten” bar (Fire still costume-swaps bodies until painted). Hollow still has unique paths and names, but costume-swap bodies and no verbs. Do it **one land at a time**. Pickup brief: `docs/WORLD_ROADMAP.md`.

Transforms were the scaffold. Custom paths replaced them world by world without breaking saves.
