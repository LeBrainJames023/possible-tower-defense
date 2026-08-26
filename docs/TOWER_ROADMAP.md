# Tower roadmap — ten keeps

Worlds, land, and unique bodies are done. This file is the **keep-kit history**. Live plan after the kit: `docs/GAME_ROADMAP.md`. Pickup paste lives in `docs/FUTURE_FEATURES.md`. Do not wipe `localStorage`.

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

Every keep splits **Faster vs Heavier** (elementals included; Cannon stays Rapid-fire / Mortar). Fork forms have their own stills. Void’s everyday shot and heavy fork stay orbs. Every **4th** orb opens a path-pull pile-up (not a new keep, not Wind).

---

## What “done” means for this era

1. **Tray first** — Keeps / Elements tabs work; Forest 1 still opens Arrow on grass; path still blocked.
2. **Longshot shoots** — slot, stats, one building still, live match. Hits flyers. Not a second Arrow (longer, slower, harder).
3. **Void shoots** — slot, small splash orbs, hits flyers, one building still. Every 4th orb pulls.
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

## Last window — Void vortex (Aug 23)

Everyday Void stays a small splash orb. Heavy fork stays a fatter orb. Every 4th orb impact opens a black-hole pull that slides nearby foes along the painted road (flyers included; melee-hold skipped so Rally still wins). No 11th keep. No Wind.

## Last window — forks (Aug 23)

Faster vs Heavier for all ten. Arrow/Cannon names stay Faster/Heavier and Rapid-fire/Mortar. Shooters fork after Lv3 (two-click). Halls skip the fake number ladder and fork from inspect (Rally stays). Void heavy is a fatter orb, not a vortex. Base troop HP / Rally math unchanged — hall forks only multiply. Optional `{kind}-a.png` / `{kind}-b.png` stills; missing files keep the live building.

## Last window — 1×2 halls (Aug 23)

Muster and Chapter sit on two grass tiles in one row (click one, pair prefers right). Arrow / Cannon / Elements stay one tile. Rally, troop HP, and cap-3 unchanged. Six wide stills replaced the old one-tile yards (base + Faster/Heavier). Isolated grass beside the path still refuses a hall.

## Last window — hall + troop art pass (Aug 22)

Replaced Muster/Chapter stills and warrior/knight idle+walk. Tray chips now use those stills (halls get a closer crop so they are not a flat color block). Same Rally. Halls and idle accepted. Walk-v2 (four stride phases) wired Aug 23; leg cycle slowed, travel speed unchanged. Tile-fit landed the window after.

---

## Last window — troop engine (Aug 22)

Invisible Hall on Keeps. Rally click, cap 3, 1:1 melee stall, die/respawn. `project-core.mdc` now says troops may stand on the path. Replaced by Muster + Chapter in the window above.

---

## Later

- Live plan moved to `docs/GAME_ROADMAP.md` (sound → sharper/bigger read → play notes; then named forks + new looks; then endless after stage 10).
- Void pull accepted (Aug 24). Element names + jobs: `docs/FORK_PLAN.md`. Art for both variants still needed. Keep names still open except Cannon Rapid-fire / Mortar.

---

## Ceiling

- Ten keeps is the tray’s load. An 11th needs another layout talk.
- Do not add Wind; Void already owns the pull-to-a-point family.
- Do not add a gold-farm keep. Do not put buildings on the path.
- Image-gen only for keeps they asked to paint. Raw sheets in `public/preview/`.
