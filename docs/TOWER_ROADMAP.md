# Tower roadmap — ten keeps

Worlds, land, and unique bodies are done. This file is the live plan for the keep kit. Pickup paste lives in `docs/FUTURE_FEATURES.md`. Do not start endless or music. Do not regen world keepers. Do not wipe `localStorage` (Forest save may be 9/10).

---

## Locked (Aug 21)

| Keep | Role | Everyday job | Air |
| --- | --- | --- | --- |
| Arrow | Keep | Fast single-target | Yes |
| Cannon | Keep | Ground splash + armor pierce | No |
| **Longshot** | Keep | Long, slow, fat single hit | **Yes** |
| **Muster** | Keep | Spawns up to 3 warriors (faster, thinner) | Troops are ground |
| **Chapter** | Keep | Spawns up to 3 knights (slower, tankier) | Troops are ground |
| Ice | Element | Slow the pack | — |
| Lightning | Element | Chain | Yes |
| Fire | Element | Splash + short burn | — |
| Poison | Element | Long melt, tiny splash | — |
| **Void** | Element | **Small splash dark orb** | **Yes** |

Tray tabs: **Keeps / Elements**. Two pages of the same 2×3. Buttons stay large. Keeps page uses 5 slots (one empty). Elements page uses 5 slots (one empty).

Buildings never sit on the path. Muster / Chapter **troops** may stand on the path and fight (Kingdom Rush stall, not maze-building). Enemies still follow the painted road: they stop, melee, then walk on. `project-core.mdc` already says that.

Rally: click the built hall → inspect → large **Rally** → click a tile inside the circle (path allowed). No drag, no hover.

Forks wait until all ten play. Then every keep splits **Faster vs Heavier** (elementals included). Fork forms get new pictures in that pass. Void’s **black-hole pile-up** is a later beat (upgrade pulse or the heavy fork), not the everyday shot.

---

## What “done” means for this era

1. **Tray first** — Keeps / Elements tabs work; Forest 1 still opens Arrow on grass; path still blocked.
2. **Longshot shoots** — slot, stats, one building still, live match. Hits flyers. Not a second Arrow (longer, slower, harder).
3. **Void shoots** — slot, small splash orbs, hits flyers, one building still. No vortex yet.
4. **Troops engine** — rally click, cap 3, melee on the path, die and respawn. Invisible test hall OK.
5. **Muster** — building + warrior body.
6. **Chapter** — building + knight body.
7. **Play** — Forest 1 smoke, then one later map with Rally. Retune numbers only if it feels wrong.
8. **Forks** — Faster vs Heavier for all ten, then fork art.

---

## Last window (chunks 1–3) — landed Aug 22

Tray tabs, Longshot, and Void shoot. Next window is the troop engine — plan first, then build. Do **not** start Muster/Chapter art, forks, or vortex until the invisible hall works.

### 1. Two-tab tray
Add Keeps / Elements tabs on the 2×3 build card. Same button size. Empty slots stay empty (do not shrink to fill). Forest 1: grass → Keeps tab → Arrow → Build → wave → Raider takes damage.

### 2. Longshot
Add `longshot` to `TowerKind`, `TOWERS`, `TOWER_ORDER` (Keeps page). Balance in `constants.ts`. Combat stays in `combat.ts`. Hits air. Draw one building still (`generate2dsprite`, magenta key, log in `docs/ASSETS.md`). Wire `public/sprites/towers/longshot.png`.

### 3. Void
Add `void` the same way on the Elements page. Small splash orb (not Fire’s napalm, not Poison’s long melt — a dark boom). Hits air. Draw one building still. Wire `public/sprites/towers/void.png`. No black hole yet.

Quality gates after each chunk: `npm test`, `npm run build`, Forest 1 smoke. Sticky place stays dead. Commit/push only when they say yes. Do not commit `public/preview/` unless asked.

---

## Last window — hall + troop art pass (Aug 22)

Replaced Muster/Chapter stills and warrior/knight idle+walk. Tray chips now use those stills (halls get a closer crop so they are not a flat color block). Same Rally. Halls and idle accepted. Walk-v2 (four stride phases) wired Aug 23; leg cycle slowed, travel speed unchanged. No billboard/HP retune. No forks. No vortex.

Next: **tile-fit / play** if they say continue. Forks only if they say continue.

---

## Last window — troop engine (Aug 22)

Invisible Hall on Keeps. Rally click, cap 3, 1:1 melee stall, die/respawn. `project-core.mdc` now says troops may stand on the path. Replaced by Muster + Chapter in the window above.

---

## Later

- Tile-fit / play after the walk-v2 check.
- Forks for all ten, then fork looks (two pictures per keep).
- Parked from before: endless, music, splash/economy retune, Forest 10 14-arrow gold, world-themed fodder, Forest Boar still using the troll sprite.

---

## Ceiling

- Ten keeps is the tray’s load. An 11th needs another layout talk.
- Do not add Wind; Void owns the “pull to a point” family later.
- Do not add a gold-farm keep. Do not put buildings on the path.
- Image-gen only for keeps they asked to paint. Raw sheets in `public/preview/`.
