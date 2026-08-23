# Future features

## Last window — hall + troop art pass (Aug 22)

Replaced Muster/Chapter stills and warrior/knight 2×2 idle+walk. Tray chips use the stills (closer crop on halls). Same Rally. Halls and idle look good. **Walk is a two-pose ping-pong** (one leg forward/back) — not a full left-right-left-right stride. They want the walk redone next, pictures shown in a **browser gallery** first. No HP/speed/billboard retune. No forks. No vortex. Forest save not wiped (9/10).

### Next window
**Fix warrior + knight walk sheets** (4 distinct stride phases). Open the pictures in a browser so they can see and pick. Then tile-fit / play if they say continue. Full plan: `docs/TOWER_ROADMAP.md`.

### Parked
Tile-fit after walk is accepted, attack frames, 4-dir troops, forks + fork art, Void vortex, endless, splash retune, 14-arrow Forest 10 start gold, music, Forest Boar troll-sprite, world-themed fodder, leftover `public/preview/` unless asked. Leftover enemy walk-frame PNG edits on disk are not the next window.

### Watch-outs
- Fixed-path TD; **buildings** never on path. Troops may stand on it. BCI: large buttons, no drag, no hover-only.
- Forest save may be 9/10 — do not wipe localStorage.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → Keeps → Arrow → Build → wave → damage. Path blocked. Rally smoke on Muster or Chapter.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is TROOP WALK FIX. Read docs/TOWER_ROADMAP.md, docs/FUTURE_FEATURES.md, docs/ASSETS.md, docs/PLAYTEST_NOTES.md first. Worlds and unique bodies are done — do not regen keepers, do not start endless/music/fodder, do not bring sticky place back, do not wipe localStorage (Forest save may be 9/10). Do not commit public/preview/ unless asked. Leftover enemy walk-frame PNG edits on disk are not this window. Do not regen Muster/Chapter halls or idle sheets unless they ask.

Place UX (locked): click grass beside the path → 2×3 tray with Keeps / Elements tabs → pick → Build → done. Upgrade is two-click on the same button. Arrow/Cannon already fork after Lv3; do not add forks this window. Sell at the bottom. Path tiles refuse BUILDINGS. Troops may stand on the path and fight (Kingdom Rush stall). Enemies follow the painted road: stop, melee, then walk on.

Live kit: Keeps = Arrow, Cannon, Longshot, Muster, Chapter + one empty. Elements = Ice, Lightning, Fire, Poison, Void + one empty. Muster = wooden training yard + lean warriors. Chapter = stone chapter house + plated knights. Same Rally UX. Art pass stills + idle are accepted. Walk is wrong: it looks like one leg swinging, not left-right-left-right. If old PNGs look stale, right-click the page → Reload (or restart 5173).

PICTURES FIRST. Image-gen is allowed. Use generate2dsprite (magenta #FF00FF). After generating, OPEN A BROWSER GALLERY with the actual photos (not chat filenames) and wait for them to pick. Do not wire a walk sheet until they say yes.

Replace warrior walk 2×2 and knight walk 2×2. Keep identity locked to the accepted idle (same person). Four DISTINCT stride phases: right foot planted, passing, left foot planted, passing return. Not two poses ping-ponged. Single facing, flip on heading. Wire over public/sprites/troops/{warrior,knight}/walk-1..4.png. Keep src/game/drawTroops.ts flip/idle/walk logic — do not rewrite scale this window unless the new loop needs a slower step.

Do not add attack frames, 4-dir, forks, or Void vortex. Do not retune troop HP or Rally math.

Quality gates: npm test, npm run build, Forest 1 smoke (title → grass → Keeps → Arrow → Build → Start wave → Raider takes damage; path still blocks buildings), plus Rally smoke: troops walk with a readable left-right stride. Push only if they ask.
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
