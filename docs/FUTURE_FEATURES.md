# Future features

## Last window — play after art (Aug 21)

Playtest after the Fire/Hollow art pass. Vite had gone stale (started before the pass); restarted it. Forest save not wiped. HUD words and unique bodies check out. Verbs still fire. No gold retune. No regen. Sticky place stayed dead.

### What play showed
- Forest 1 smoke: grass tray → Arrow → Build; second grass is a new tray, not inspect; path blocked; Raiders face right and take damage.
- Fire 1 is ash + lava path + ember portals; Magma Hound is a lava dog. Hollow 1 is rune-stone + vein path + hex gates; Shade flies; Hex Warden walks (Cannon can hit him).
- Headless sim still dies on rim maps (Forest 9, Desert 10, Fire 9–10, Hollow 9–10). Hollow 8 holds without a late gold bump. Forest 10 still 320g.

### Next
They asked for a **new window**: revamp tower looks, forks for the four keeps that don’t have them yet, and talk through a 7th tower. Paste prompt below. Do not start that work in an enemy/world window.

### Parked
Endless, splash retune, 14-arrow Forest 10 start gold, music, Forest Boar still using the troll sprite, world-themed fodder (Raider/Goblin/Troll/Imp on Desert–Hollow) until they look at those lands, committing `public/preview/`.

### Watch-outs
- Fixed-path TD; towers never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Leftover untracked preview folders — do not commit unless asked.
- If the game tab looks like old Fire/Hollow, right-click the page → Reload. Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only — left/index, right/middle, middle/ring. On-screen cursor. No drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is TOWER REVAMP. Worlds and enemy art are done (play-after-art checked Fire/Hollow land + unique bodies; 4-dir walks/flaps toward/away/side look correct). Do not regen Forest/Desert/Ice/Fire/Hollow keepers. Do not start world-themed fodder (other lands still use Forest Raider/Goblin/Troll/Imp on wave 1) unless they ask after looking. Do not start endless or music. Do not bring sticky place back. Do not wipe localStorage (Forest save may be 8/10). Do not commit public/preview/ unless asked. Read docs/FUTURE_FEATURES.md, docs/PLAYTEST_NOTES.md, docs/ASSETS.md.

Place UX (locked): click a tile beside the path → 2×3 tray → pick → Build → done. Upgrade is two-click on the same button (preview, then pay). After Lv3, Arrow and Cannon already pick a path (two large buttons, same two-click pay): Faster vs Heavier, Rapid-fire vs Mortar. Sell sits at the bottom; click once, then Keep or confirm Sell. Path tiles refuse towers.

Live kit today: Arrow, Cannon, Ice, Lightning, Fire, Poison (TOWER_ORDER fills a 2×3 tray). Arrow = empty base + rotating ballista. Cannon = still carriage + rotating barrel. Ice/lightning/fire/poison are still stills. Forks live in src/game/forks.ts — only arrow + cannon. Combat stays in combat.ts.

CEILING — three jobs, do not dump them in one pile:
1) Looks: refresh Ice / Lightning / Fire / Poison (and Arrow/Cannon if they still look cheap next to painted land). Use generate2dsprite; log keepers in docs/ASSETS.md; raw sheets stay untracked in public/preview/. Image-gen only for towers they asked to paint.
2) Forks: same two-path idea for Ice, Lightning, Fire, Poison. Two large buttons after Lv3, preview then pay, sell refunds the path. One verb difference per path (not a 4th upgrade number). Ask them the pair before generating art for fork looks.
3) 7th tower: the 2×3 tray is full. Adding a seventh keep is a layout decision first (bigger card vs second page vs replacing a slot) — BCI buttons must stay large. Pick the niche WITH them (do not clone splash/slow/burn/chain). Then art. Do not silently add a 7th.

Suggested order: agree 7th-tower tray plan (or park it), then Ice/Lightning/Fire/Poison forks in data + UI, then paint looks. Play Forest 1 smoke after any tray/combat change: title → grass → Arrow → Build → Start wave → Raider takes damage. Path blocked. Sticky place stays dead.

Quality gates: npm test, npm run build, that Forest 1 smoke. Last commit on main: 820625d (Fire/Hollow unique bodies). Branch may be ahead of origin; not pushed unless they ask.
```

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
