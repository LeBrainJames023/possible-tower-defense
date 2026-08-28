# Future features

## Next session plan (saved Aug 27, evening)

Pickup after a **Desert play-log** window. They are coming back tonight or tomorrow. Do not start a fix until they name it — a code save reloads the match. Full notes: `docs/PLAYTEST_NOTES.md` (This session — Desert play, Aug 27).

### Done (this window)
Play only. Logged notes. No game code. Commits: `116b62c` (notes) + this handoff. Tests 184 / build passed at session start (no code after that). Did not commit `public/preview/`. Sticky place stayed dead. Campaign save not wiped. They played Desert 1–4 on Normal.

### Do first (do not skip)
Ask: **keep playing** (log only) or **peel one parked item**. Do not assume.

If they keep playing: append `docs/PLAYTEST_NOTES.md` only. No `src/`. No Vite restart.

### Then they peel one (ask; do not assume)
From the Aug 27 log, in no implied order:

- **Hall footprint paint** — Muster + Chapter sit entirely on two tiles; 90° Turn is long-ways inside that seat; no spill north. `drawHallBillboard` ignores axis today.
- **Hall ladder** — Scout/Veteran both show on a fresh hall. Their simple read: start Scouts, 1→2→3, then Veteran. Conflicts with locked fork-on-inspect.
- **Troop art** — starter vs upgraded people (Scout/Veteran, later Lance/Paladin).
- **Tower feel + aim** — Cannon/Arrow should read as a pad with a weapon; weapon rotates; shot leaves the muzzle. Flamethrower torch from the nozzle, not a laser above the pad. Ice is fine.
- **Projectile pass** — Gatling arcing cannonballs (faster, not a spray); Ballista a visible slower fat bolt; Elements out the top OK until forks split.
- **N/S walk faces** — already parked; Desert play confirmed sidestep on vertical path.
- **Portals** — stand up, even at both ends, thinner rim, shiny swirl.
- **Build range ring** — must show while placing; must read on sand (standard color or element tint).
- **Tray 6+6** — brainstorm one more physical + one more Element later. Locked plan was ten / no 11th / no Wind; this ask is fill both empties. Not Wind unless they name it.
- **Normal late waves** — upgraded keeps feel pretty strong on Desert 8–10. Remember for a later gold/HP pass. Do not retune in the dark.

### Parked (do not start)
Attack frames, 4-dir troops, unique N/S walk faces (confirmed live), layout-curve regen, endless extras, splash/gold retune until they peel it, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked. No Wind, no gold farm, sticky place stays dead. Do not add a 12th keep until they peel the 6+6 brainstorm.

### Watch-outs
- Campaign save is live — do not wipe `localStorage` (Forest 10/10, Desert in progress; last seen Desert 4 prepare).
- Local `main` is ahead of origin; push only if they ask.
- Agent in-editor browser rAF can sit still; if the match looks frozen, they play it, or tick via `game.step` — do not assume the canvas is dead.
- Mid-match: do not edit `src/` unless they say the match can reload.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

Read docs/FUTURE_FEATURES.md first (Next session plan, saved Aug 27 evening), then docs/PLAYTEST_NOTES.md (Desert play Aug 27), docs/FORK_PLAN.md, docs/GAME_ROADMAP.md. On session start: if Vite is not on http://127.0.0.1:5173/, start it, then open Cursor’s in-editor Browser beside the chat (position: side). Do not launch Chrome unless they ask. Do not wipe localStorage. Do not commit public/preview/. Do not bring sticky place back. No Wind or gold farm. Do not add a keep until they peel the 6+6 brainstorm. Local main is ahead of origin; push only if they ask.

Last window: Desert play-log only. No src/ edits. Notes cover hall footprint/Turn, Scout-then-Veteran ladder ask, troop art, Cannon/Arrow/Flamethrower aim, projectile pass, N/S sidestep, standing portals, build range ring, 6+6 tray, Normal late-wave strength. Commit 116b62c + handoff.

THIS WINDOW: ask keep-playing vs peel one note. If they play, log only — no code (reloads the match). If they peel, do that one item. Do not retune gold/splash unless they peel the Normal-feel note. Do not image-gen unless they ask.

Quality gates: npm test, npm run build, Forest 1 smoke if you touch src/ (title → grass → place → Start wave → enemy takes damage; path still blocks). Push only if they ask.
```

## Last window — Desert play log (Aug 27)

They played Desert 1–4 on Normal. Agent logged only; no `src/` edits so the match did not reload. Full list in `docs/PLAYTEST_NOTES.md`. Handoff is the **Next session plan** at the top of this file.

### Next window
Follow **Next session plan** at the top of this file.

## Last window — named-path shot feel (Aug 26)

Paid forks now draw a different in-flight shot and impact. Unforked Lv1–3 keep today’s orb. Flamethrower = short stream; Furnace = fat boom. Hail shards / Blizzard frost burst. Arc thin bolt / Thunder fat bolt. Venom dart / Miasma cloud splash. Flicker small orb / Abyss fatter orb (every-3rd hole unchanged). Shooters: Repeater tiny / Ballista huge, Gatling pebble / Mortar boulder, Marksman thin / Puncture fat. Halls skipped. Combat splash, fire rate, and DPS tables stayed. No extra projectiles. Canvas only — did not image-gen shots.

### Next window
Follow **Next session plan** at the top of this file.

## Last window — Keep playing after The Hollow (Aug 26)

World-clear cards stay two buttons. Lands 1–4: **Next world** + **Main menu**. Hollow 10: **Keep playing** + **Main menu**. Keep playing stays on the last map; extra waves reuse packs 7–10 and climb HP a little. Same ten keeps. Maps 1–9 still Next map. Did not add an 11th keep, Wind, or gold farm.

### Next window
Landed in the named-path shot feel window above.

### Parked
Attack frames, 4-dir troops, unique north/south walk faces, layout-curve regen, endless extras (new toys), splash retune, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked.

### Watch-outs
- Fixed-path TD; **buildings** never on path. Troops may stand on the path. BCI: large buttons, no drag, no hover-only.
- Campaign save is live — do not wipe localStorage.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → wave → damage. Path blocked.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

Read docs/FORK_PLAN.md, docs/GAME_ROADMAP.md, docs/FUTURE_FEATURES.md. On session start: if Vite is not on http://127.0.0.1:5173/, start it, then open Cursor’s in-editor Browser beside the chat (position: side). Do not launch Chrome unless they ask. Do not wipe localStorage. Do not commit public/preview/. Do not bring sticky place back. No 11th keep, Wind, or gold farm. Local main is ahead of origin; push only if they ask.

Last window: named-path stills are live for all ten keeps. World 1–4 stage 10 is Next world + Main menu. Hollow 10 is Keep playing (extra waves on the same map) + Main menu.

THIS WINDOW IS NAMED-PATH SHOT FEEL. They asked to keep building. Paid forks still fire the same family of orbs — the building looks different, the shot does not. Make the in-flight shot and impact look like the locked job in docs/FORK_PLAN.md. Combat.ts hit rules, splash numbers, fire rate, and DPS tables stay. Do not fake extra hits with extra projectiles.

Order, do not skip:
1) Elements first (unforked Lv1–3 can keep today’s orb; after a path is paid the shot must read as that path). Fire Flamethrower = short cone/stream look; Furnace = fat slow boom. Ice Hail = shards; Blizzard = wide frost burst. Lightning Arc = snappy thin bolt; Thunder = fatter bolt. Poison Venom = tight dart; Miasma = cloud-ish splash. Void Flicker = small rapid orb; Abyss = fatter orb + the existing every-3rd hole (do not retune pull math).
2) Shooters if time: Repeater vs Ballista, Gatling vs Mortar, Marksman vs Puncture — visual only (Repeater many small bolts look, Ballista one huge bolt look). Halls skip — troops already differ.
3) Prefer drawProjectiles.ts + fx.ts. Image-gen a projectile still only if canvas drawing cannot read at postage-stamp size, and only after they see a Forest 1 live shot. Magenta #FF00FF, log docs/ASSETS.md, do not commit public/preview/.

Do not add attack-frame sheets, 4-dir troops, unique N/S faces, layout-curve regen, world-themed fodder, Forest Boar art, endless toys, Wind, or an 11th keep. Do not retune gold or splash radii. Sticky place stays dead.

Quality gates: npm test, npm run build, Forest 1 smoke (title → grass → place → Start wave → enemy takes damage; path still blocks). Then pay Fire to Flamethrower and confirm the shot reads as a stream, not a cousin of Furnace. Push only if they ask.
```

## Last window — hall names (Aug 26)

Wired Muster **Scout / Veteran** and Chapter **Lance / Paladin**. Same two-click pay from inspect, fork-and-done (no second ladder). Inspect title is the path (“Scout”, not “Muster Scout”). Combat / troop HP / Rally / cap 3 / train muls unchanged. How-to-play has one hall-path line; shooter and Element lines stayed. Did not generate art. Sticky place stayed dead. Did not commit `public/preview/`.

### Next window
Play the named hall paths (Muster → Scout vs Veteran, Chapter → Lance vs Paladin), or new stills if a paid path still looks like a cousin. Do not add an 11th keep, Wind, gold farm, attack frames, or sticky place.

### Parked
New Element/Keep/hall stills if they want a redraw, attack frames, 4-dir troops, unique north/south walk faces, endless extras, splash retune, 14-arrow Forest 10 start gold, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked.

**Layout curve (later):** worlds 2–5 already have unique tracks in `worldPaths.ts`. A later pass can reshape them so early maps have fewer loops (harder) and later maps snake for stacking. Not Forest color-flips. Do not regen all 40 until they peel that pass off.

### Watch-outs
- Fixed-path TD; **buildings** never on path. Troops may stand on it. BCI: large buttons, no drag, no hover-only.
- Campaign save is live — do not wipe localStorage (Forest may be 9/10 or finished; Desert may be started).
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → wave → damage. Path blocked.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

Read docs/FORK_PLAN.md, docs/GAME_ROADMAP.md, docs/FUTURE_FEATURES.md. On session start: if Vite is not on http://127.0.0.1:5173/, start it, then open Cursor’s in-editor Browser beside the chat (position: side). Do not launch Chrome unless they ask. Do not wipe localStorage. Do not commit public/preview/. Do not bring sticky place back. No 11th keep, Wind, or gold farm. Local main is ahead of origin; push only if they ask.

Last window named halls: Muster Scout/Veteran, Chapter Lance/Paladin. Shooters: Arrow Repeater/Ballista, Cannon Gatling/Mortar, Longshot Marksman/Puncture. Elements already have Flamethrower 1→2→3. Abyss every 3rd. Halls stay fork-and-done from inspect (no number ladder). Title is the path (“Scout”, not “Muster Scout”).

THIS WINDOW WAITS unless they peel one off: play notes, or new stills if a paid path looks like a cousin. Do not retune DPS tables, do not add attack frames, do not add Wind or an 11th keep.

Quality gates: npm test, npm run build, Forest 1 smoke (title → grass → place → Start wave → enemy takes damage; path still blocks). Push only if they ask.
```

## Last window — shooter keep names (Aug 26)

Wired Arrow **Repeater / Ballista**, Cannon **Gatling / Mortar**, Longshot **Marksman / Puncture**. Same two-click pay, fork-and-done (no second ladder). Inspect title is the path (“Repeater”, not “Arrow Repeater”). Combat muls unchanged. Muster / Chapter still Faster / Heavier.

## Last window — Element identity + second ladder (Aug 26)

Wired locked Element names on the two fork buttons. After Lv3, pay one path (same two-click); the other is gone; the keep’s name **is** that path (“Flamethrower 1”, not “Fire Flamethrower”). That named keep then upgrades three ranks on the same Upgrade button and gold curve (`upgradeCostFor` / `upgradeMul`). Fork muls stayed the live Faster/Heavier numbers. Arrow / Cannon / Longshot stay 3-then-fork-and-done. Halls still fork from inspect with no number ladder. **Abyss** pulls every 3rd orb; Flicker / unforked Void stay every 4th. Everyday shot stays an orb. Rally melee-hold still wins. How-to-play + Muster/Chapter blurbs: three troops, three fights; extra walkers keep going. HP / Rally / cap 3 unchanged. Did not generate art; paid keeps already swap to `{kind}-a.png` / `{kind}-b.png`. Sticky place stayed dead. Did not commit `public/preview/`.

### Next window
Play the named shooter paths (Arrow to Lv3 → Repeater vs Ballista). Then **Muster / Chapter names**, or new stills if a paid path still looks like a cousin. Do not add an 11th keep, Wind, gold farm, attack frames, or sticky place.

### Parked
Named hall forks (Muster, Chapter), new Element/Keep stills if they want a redraw, attack frames, 4-dir troops, unique north/south walk faces, endless extras, splash retune, 14-arrow Forest 10 start gold, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked.

**Layout curve (later):** worlds 2–5 already have unique tracks in `worldPaths.ts`. A later pass can reshape them so early maps have fewer loops (harder) and later maps snake for stacking. Not Forest color-flips. Do not regen all 40 until they peel that pass off.

### Watch-outs
- Fixed-path TD; **buildings** never on path. Troops may stand on it. BCI: large buttons, no drag, no hover-only.
- Campaign save is live — do not wipe localStorage (Forest may be 9/10 or finished; Desert may be started).
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → wave → damage. Path blocked.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

Read docs/FORK_PLAN.md, docs/GAME_ROADMAP.md, docs/FUTURE_FEATURES.md. On session start: if Vite is not on http://127.0.0.1:5173/, start it, then open Cursor’s in-editor Browser beside the chat (position: side). Do not launch Chrome unless they ask. Do not wipe localStorage. Do not commit public/preview/. Do not bring sticky place back. No 11th keep, Wind, or gold farm. Local main is ahead of origin; push only if they ask.

Last window named shooter keeps: Arrow Repeater/Ballista, Cannon Gatling/Mortar, Longshot Marksman/Puncture. Elements already have Flamethrower 1→2→3. Abyss every 3rd. Halls still Faster/Heavier from inspect with no number ladder.

THIS WINDOW WAITS unless they peel one off: play notes, Muster/Chapter names, or new stills if a paid path looks like a cousin. Do not retune DPS tables, do not add attack frames, do not add Wind or an 11th keep.

Quality gates: npm test, npm run build, Forest 1 smoke (title → grass → place → Start wave → enemy takes damage; path still blocks). Push only if they ask.
```

## Last window — element fork plan (Aug 25)

Names + jobs locked in `docs/FORK_PLAN.md`: Fire Flamethrower/Furnace, Ice Hail/Blizzard, Lightning Arc/Thunder, Poison Venom/Miasma, Void Flicker/Abyss. Buttons in the match still say Faster/Heavier until we wire names. **Art for both variants still needs to be drawn.** Keep names (Arrow, Longshot, halls) not locked. Cannon stays Rapid-fire / Mortar.

### Next window
**Pictures first, then wire the keeps, combat later.** Draw both stills for each locked Element (`{kind}-a` fast, `{kind}-b` slow) with generate2dsprite (magenta `#FF00FF`, log `docs/ASSETS.md`). Show them, copy winners into `public/sprites/towers/`. Then the live forked building uses those pictures. Do **not** retune shots, Abyss every-3rd, attack frames, or Keep names in that window unless they peel one off. Do not wipe localStorage.

### Parked
**Void growth (locked idea, not built):** number upgrades make the hole stronger (pull / life / radius). Faster stays every 4th until the named-fork era. Heavier stays slower + more damage/splash, and will open the hole every 3rd in that era. Everyday shot stays an orb. Rally melee-hold still wins.

Named Keep forks (Arrow, Longshot, Muster, Chapter), new fork stills (element art not drawn yet — see `docs/FORK_PLAN.md`), attack frames, 4-dir troops, unique north/south walk faces, endless extras, splash retune, 14-arrow Forest 10 start gold, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked.

**Layout curve (later):** worlds 2–5 already have unique tracks in `worldPaths.ts`. A later pass can reshape them so early maps have fewer loops (harder) and later maps snake for stacking. Not Forest color-flips. Do not regen all 40 until they peel that pass off.

### Watch-outs
- Fixed-path TD; **buildings** never on path. Troops may stand on it. BCI: large buttons, no drag, no hover-only.
- Campaign save is live — do not wipe localStorage (Forest may be 9/10 or finished; Desert may be started).
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → wave → damage. Path blocked.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

Read docs/FORK_PLAN.md first (locked element names + jobs), then docs/GAME_ROADMAP.md, docs/FUTURE_FEATURES.md, docs/ASSETS.md, docs/PLAYTEST_NOTES.md. On session start: if Vite is not on http://127.0.0.1:5173/, start it, then open Cursor’s in-editor Browser beside the chat (position: side). Do not launch Chrome/system browser unless they explicitly ask. Do not wait to be asked for the in-editor preview. Do not wipe localStorage. Do not commit public/preview/ unless asked. Do not bring sticky place back. Do not add an 11th keep, Wind, or a gold farm. Local main is several commits ahead of origin; push only if they ask. Cursor browser MCP often failed — View → Browser or Ports → 5173, not Chrome.

THIS WINDOW IS PICTURES FIRST, THEN WIRE THE KEEPS. Combat / attack feel waits. They asked to generate the art.

Locked Elements (fast a / slow-heavy b):
- Fire: Flamethrower / Furnace
- Ice: Hail / Blizzard
- Lightning: Arc / Thunder
- Poison: Venom / Miasma
- Void: Flicker / Abyss

Jobs and status live in docs/FORK_PLAN.md. A paid path must LOOK like a different building, not a cousin. Match the live tower stills’ 3/4 painted style. One still per variant (not a walk sheet). Magenta #FF00FF background. Use the generate2dsprite skill (built-in image_gen + local chroma-key). Raw in public/preview/sprite-forge/towers-v2/{kind}-a/ and {kind}-b/. Log docs/ASSETS.md. Older Faster/Heavier stills in public/sprites/towers/{kind}-a.png and -b.png may exist — replace them with the new named looks.

Order, do not skip:
1) Draw all ten stills (show in the in-editor preview as you go; they pick or say continue). Fire a/b, Ice a/b, Lightning a/b, Poison a/b, Void a/b.
2) Copy accepted winners into public/sprites/towers/{kind}-a.png and {kind}-b.png so a forked keep in the live match uses that picture.
3) Stop. Do not retune combat, do not wire Flamethrower names onto buttons, do not change Void to every-3rd, do not add attack frames, projectiles, or Keep (Arrow/Longshot/Muster/Chapter) names unless they peel one off after the pictures are in.

Place UX (locked): grass → 2×3 Keeps/Elements tray → pick → Build. Upgrade two-click. Halls 1×2; Rally stays. Path tiles refuse BUILDINGS. Troops may stand on the path. Unforked buildings keep the live unforked still. Width one grass tile; halls stay 1×2. Image-gen is asked for this window.

Quality gates: npm test, npm run build, Forest 1 smoke (title → grass → place → Start wave → enemy takes damage; path still blocks buildings). After art: fork an Element (Ice to Lv3 → pick a path) and confirm the keep swaps to the new still. Push only if they ask.
```

## Last window — tile-fit / play (Aug 23)

Halls fill one grass tile (crop the empty PNG padding, do not regen). Troops use a paint height so they read as people on the path (warrior `u(48)`, knight `u(56)`). Combat radius, HP, and Rally math unchanged. Forest 1: Arrow + Muster + Chapter; path blocked; Raiders damaged and stalled. Walk-v2 left as-is. Forest save not wiped (9/10).

### Next window
**Forks** if they say continue — Faster vs Heavier for all ten, then fork art. Full plan: `docs/TOWER_ROADMAP.md`. Do not start forks unless they ask.

### Parked
Attack frames, 4-dir troops, forks + fork art, Void vortex, endless, splash retune, 14-arrow Forest 10 start gold, music, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked. Leftover enemy walk-frame PNG edits on disk are not the next window.

### Watch-outs
- Fixed-path TD; **buildings** never on path. Troops may stand on it. BCI: large buttons, no drag, no hover-only.
- Forest save may be 9/10 — do not wipe localStorage.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → Keeps → Arrow → Build → wave → damage. Path blocked. Rally smoke on Muster or Chapter.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is FORKS if they say continue — otherwise wait. Read docs/TOWER_ROADMAP.md, docs/FUTURE_FEATURES.md, docs/ASSETS.md, docs/PLAYTEST_NOTES.md first. Worlds and unique bodies are done — do not regen keepers, do not start endless/music/fodder, do not bring sticky place back, do not wipe localStorage (Forest save may be 9/10). Do not commit public/preview/ unless asked. Leftover enemy walk-frame PNG edits on disk are not this window. Do not regen Muster/Chapter halls, idle, or walk sheets unless they ask.

Place UX (locked): click grass beside the path → 2×3 tray with Keeps / Elements tabs → pick → Build → done. Upgrade is two-click on the same button. Arrow/Cannon already fork after Lv3. Sell at the bottom. Path tiles refuse BUILDINGS. Troops may stand on the path and fight (Kingdom Rush stall). Enemies follow the painted road: stop, melee, then walk on.

Live kit: Keeps = Arrow, Cannon, Longshot, Muster, Chapter + one empty. Elements = Ice, Lightning, Fire, Poison, Void + one empty. Muster = wooden training yard + lean warriors. Chapter = stone chapter house + plated knights. Same Rally UX. Art pass + walk-v2 + tile-fit are in. Halls fill one grass tile. Troop paint is warrior u(48) / knight u(56) — visual only, HP and Rally unchanged. If PNGs look stale, right-click the page → Reload (or restart 5173). First check: Forest 1 halls sit on one tile; Rally troops look like people.

Do not add attack frames, 4-dir, or an 11th keep. Do not retune troop HP or Rally math unless play says it is wrong. Forks (Faster vs Heavier for all ten, then fork pictures) only if they say continue.

Quality gates: npm test, npm run build, Forest 1 smoke (title → grass → Keeps → Arrow → Build → Start wave → Raider takes damage; path still blocks buildings), plus Rally smoke. Push only if they ask.
```



## Last window — tray + Longshot + Void (Aug 22)

Chunks 1–3 landed. Tray is two tabs, same 2×3. Keeps: Arrow, Cannon, Longshot + three empty. Elements: Ice, Lightning, Fire, Poison, Void + one empty. Empty cells stay empty. Forest 1 smoke still works. Longshot and Void shoot and hit flyers. Sticky place stayed dead. Forest save not wiped (showed 9/10). Did not commit `public/preview/`.

## Last window — ten-keep plan (Aug 21)

Tower looks and unique-world bodies are live. Next era is **ten keeps**: five Keeps (Arrow, Cannon, Longshot, Muster, Chapter) and five Elements (Ice, Lightning, Fire, Poison, Void). Full plan: `docs/TOWER_ROADMAP.md`.

Locked: Longshot and Void **hit flyers**. Void’s everyday shot is a **small splash orb** (black-hole pile-up later). Tray tabs **Keeps / Elements**. Buildings stay off the path; Muster/Chapter troops may stand on it. Forks (Faster vs Heavier for all ten, plus fork art) wait until all ten play.

### Next window
Chunks **1–3 only**: tabbed tray, then Longshot (draw + shoot), then Void (draw + shoot). Do not start barracks, rally, melee, or forks. Paste prompt below.

### Parked
Muster / Chapter, troop engine, forks + fork art, Void vortex, endless, splash retune, 14-arrow Forest 10 start gold, music, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked.

### Watch-outs
- Fixed-path TD; **buildings** never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is TOWER CHUNKS 1–3. Read docs/TOWER_ROADMAP.md, docs/FUTURE_FEATURES.md, docs/ASSETS.md, docs/PLAYTEST_NOTES.md first. Worlds and unique bodies are done — do not regen keepers, do not start endless/music/fodder, do not bring sticky place back, do not wipe localStorage (Forest save may be 8/10). Do not commit public/preview/ unless asked.

Place UX (locked): click grass beside the path → 2×3 tray → pick → Build → done. Upgrade is two-click on the same button. Arrow/Cannon already fork after Lv3; do not add forks this window. Sell at the bottom. Path tiles refuse buildings.

Live kit today: Arrow, Cannon, Ice, Lightning, Fire, Poison in one 2×3. After this window it should be two tabs, same 2×3 size: Keeps (Arrow, Cannon, Longshot + two empty) and Elements (Ice, Lightning, Fire, Poison, Void + one empty).

Do these three chunks, in order. Stop after 3 unless they say continue.

1) Two-tab tray — labels Keeps / Elements. Big tab targets. Empty slots stay empty (do not shrink buttons to fill). Forest 1 still: title → grass → Keeps → Arrow → Build → Start wave → Raider takes damage. Path blocked.

2) Longshot — add kind longshot. Long, slow, fat single-target poke. Hits flyers (Cannon cannot). Stats in constants.ts. Hits in combat.ts (do not reimplement fire/splash/chain in tests). Draw one building still with generate2dsprite (magenta #FF00FF, log docs/ASSETS.md), wire public/sprites/towers/longshot.png. It must shoot in the live match.

3) Void — add kind void on the Elements page. Everyday shot: small splash dark orb (not Fire napalm, not Poison long melt). Hits flyers. No black-hole vortex this window. Same pipeline: constants + combat + one building still + public/sprites/towers/void.png.

Do not start Muster, Chapter, rally flags, melee troops, or Faster/Heavier forks.

Quality gates after each chunk: npm test, npm run build, that Forest 1 smoke. Last related commits on main: 803dadd (live picks), 97e5d57 (preview sheets). Branch may be ahead of origin; not pushed unless they ask.
```

## Last window — play after art (Aug 21)

Playtest after the Fire/Hollow art pass. Vite had gone stale (started before the pass); restarted it. Forest save not wiped. HUD words and unique bodies check out. Verbs still fire. No gold retune. No regen. Sticky place stayed dead.

### What play showed
- Forest 1 smoke: grass tray → Arrow → Build; second grass is a new tray, not inspect; path blocked; Raiders face right and take damage.
- Fire 1 is ash + lava path + ember portals; Magma Hound is a lava dog. Hollow 1 is rune-stone + vein path + hex gates; Shade flies; Hex Warden walks (Cannon can hit him).
- Headless sim still dies on rim maps (Forest 9, Desert 10, Fire 9–10, Hollow 9–10). Hollow 8 holds without a late gold bump. Forest 10 still 320g.

### Next
Ten-keep plan is in `docs/TOWER_ROADMAP.md`. Next window is chunks 1–3 — paste the continue prompt at the top of this file.

### Parked
Endless, splash retune, 14-arrow Forest 10 start gold, music, Forest Boar still using the troll sprite, world-themed fodder (Raider/Goblin/Troll/Imp on Desert–Hollow) until they look at those lands, committing `public/preview/`.

### Watch-outs
- Fixed-path TD; towers never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Leftover untracked preview folders — do not commit unless asked.
- If the game tab looks like old Fire/Hollow, right-click the page → Reload. Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage.

## Last window — Fire world (Aug 21)

Fire is a place now: cracked ash, lava-vein path, lava-rock props, Fire portals no longer steal Forest’s painted rifts. Verbs: Hound smolders, Brute crusts, King heat-haze, Titan erupts Magma Hounds (no gold). Late Fire 8–10 openings got the Desert-style gold bump. Forest gold unchanged. HUD says **click ash**. Unique Fire bodies shipped in the art pass.

### What play showed
- Headless sim, normal: Fire 1–4 leak 0. Fire 5–7 bite on wave 1 and still win. Fire 8 holds after the gold bump. Fire 9–10 die on the rim — first keeps at the gate, not a second gold bump.
- Heat haze is softer shots (Fire keeps ignore it), not a copy of Jarl freeze or Tyrant choke. Smolder makes Fire the hound answer. Crust makes Fire + Cannon the brute answer.
- Sticky place stayed dead. Upgrade two-click stayed.

## Last window — play pass (Aug 21) — Desert landed


Played Forest 1 (smoke) → Forest 2 → **the whole Desert world**. Sticky place stayed dead. Upgrade two-click stayed. Late Desert openings were too thin (maps 9–10 died on wave 1); start gold on Desert 7+ went up. Forest 8/10 gold is unchanged. Desert HUD now says click **sand**, not grass.

### What play showed
- Smoke: grass → 2×3 tray → Arrow → Build → done. Path click blocked. Wave 1 Raider took damage. Large-click HUD intact.
- Desert 1–4: classroom. Verbs fire; a real kit leaks 0. Twin Dunes (3) is where Dune Runner **dash** shows.
- Desert 5–7: the land starts to bite (wave-1 leaks, Broken Mesa corners). Still winnable.
- Desert 8: Dry Canal holds after the opening-gold bump (Khan summons included).
- Desert 9–10: spawn runs the **rim**. First keeps want the gate, not the pretty middle. Still a hard finale — not a wave-1 purse problem alone.
- Copy: locked maps say previous map, not previous world. Desert toast says click sand.

## Last window — locked long build (Aug 20) — landed

Sticky place stayed dead. Upgrade is two clicks. Desert is a place (sand tiles, props, portals). Four Desert bodies are painted and wired, each with one verb. Prepare/battle pad is still a quiet loop (battle a bit louder). Arrow + Cannon fork after Lv3.

### Parked
7th tower, endless, splash/economy retune, 14-arrow Forest 10 start gold, Ice/lightning/fire/poison forks, unique art for Ice/Fire/Hollow.

### Watch-outs
- Fixed-path TD; towers never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Ice/Fire/Hollow still Forest-path flipped + palette (no unique tiles yet).
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage.

## Before new ideas

Campaign shape is in (50 maps, roster names, shared `combat.ts`). Do not open a 7th tower or endless yet.

1. **Play** Forest 1 → Forest 2 → Look at Desert waves 3 and 7. Did the land change the decision, or only the wallpaper?
2. **Then retune** splash / economy / HP. Roster + Desert verbs have landed; tune after a few maps feel wrong.
3. Ice / Fire / Hollow still need verbs and unique art, same two-path tower idea later.

Captured for later — not in this pass:

- Music — richer campaign loops (we have a quiet procedural prepare/battle pad; still no real score)
- Enemy attributes / speed variety — gait is visual only; projectile feel should stay readable when scouts and brutes differ more
- Splash / economy retune — after play + verbs, not before (cannon ~1.5 tiles, ice/fire mid, poison tiny, arrow single, lightning chain)
- Unique art for Ice / Fire / Hollow (Forest keepers + Desert four bodies are in)
- Ice / lightning / fire / poison forks (same two-path idea as Arrow/Cannon)
- Hand-painted Krita/GIMP tile variants
- Tiled as a visual map editor that exports into `levels.ts` (single source of truth must stay TypeScript)
- MagicaVoxel / Blender sprite sheets for extra props
- On-death tricks (magma pop, wisp chill) once the roster feels right
- Split menus/HUD out of `src/main.ts` (it is the next file split, not a combat rewrite)
- Enemy sprite polish — per-creature cleanup, or image-gen if we explicitly choose
- Other CC0 creature packs if we find a meaner free set (no paid packs)
- More targeting modes (closest, strongest)
- Endless mode after campaign
- Mobile layout polish beyond basic stacking
- Tower preview ghosts with DPS estimate
- Cloud save / multiple profiles

Done since MVP:

- Speed control (1x / 2x / 3x)
- Particle bursts on kills / impacts
- Easy / Normal / Hard (green / gold / red on the title). Hard keeps a full opening kit; kill gold is 80%. Start gold and kill bounties scale with world HP so a new world’s gate is not secretly a Forest-10 opening. Stage HP climb stays a placement/upgrade check.
- Procedural combat SFX + mute
- Prepare/battle pad, path landmarks, wave-start sting, enemy gaits
- Painted enemies + towers + shots in the live match; Forest entrance and exit portals
- Forest tree set + mixed grass/path tiles; cannon carriage stays, barrel turns
- On-map 2×3 build tray, compact upgrade/sell, HUD chips, match vignette
- Forest path/grass split, bigger towers + shots, y-sort, spinning portal halos, HUD hearts/gold/wave, trays that sit toward empty grass, 4-frame enemy walks
- Click-to-place: grass → tray → Build, then done. Upgrade: once to preview next stats, again to pay (no third confirm).
- 4-dir walk/fly sheets (e/w files match the path; magenta fringe keyed off)
- Painted Forest campaign thumbs; hashed (not checker) thumbs on later worlds
- Flying vs ground targeting (cannon cannot lock air; Arrow and Lightning can)
- Desert as a place: sand tiles, desert props, Desert portals, painted campaign thumbs
- Four Desert bodies (Scorpion, Dune Runner, Dune Tyrant, Sand Khan) with one verb each
- Arrow/Cannon Lv3 forks (Faster/Heavier, Rapid-fire/Mortar). Sell refunds the path.
