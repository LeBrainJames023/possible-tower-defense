# Future features

## Last window — Hollow world (Aug 21)

Hollow is a place now: rune-etched stone, glowing vein path, menhir/tablet/obelisk/ward-post, hex rune gates + spire keep. HUD says **click rune**. Verbs: Shade hexes the nearest keep, Hex Knight plates from Twin Hex, Hex Warden seals a tight bubble (ground), The Magician warps once. Hollow 8 held without the Desert/Ice/Fire late gold bump. Forest gold unchanged. Unique Hollow bodies still costume-swap (Imp / Raider / Wyvern / Drake) until image-gen is asked.

### What play showed
- Headless sim, normal: Forest 1 leak 0. Hollow 1–4 leak 0. Hollow 5–8 bite on wave 1 and still win. Hollow 9–10 die on the rim — first keeps at the gate, not a gold bump.
- Shade hex is not Wisp phase. Warden stays on the ground so Cannon is not trash. Knight plate wants Poison + Cannon. Magician warp is a placement decision, not a bigger Drake.
- Sticky place stayed dead. Upgrade two-click stayed.

### Next
**Dedicated art pass** — new chat. Brief: `docs/WORLD_ROADMAP.md`. Fire + Hollow unique bodies for sure. Desert/Ice already have 4-dir sheets — compare to Forest keepers before regenerating.

### Parked
7th tower, endless, splash retune, 14-arrow Forest 10 start gold, Ice/lightning/fire/poison forks. Unique monster stills + 4-dir walks for Fire/Hollow (quality look at Desert/Ice vs Forest keepers) — **this is the next chat**.

### Watch-outs
- Fixed-path TD; towers never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Fire and Hollow still costume-swap. Desert and Ice already have unique 4-dir bodies.
- Leftover untracked preview folders (`public/preview/enemy-quality/`, old `walk4` keepers, Ice `preview/sprite-forge/`) — do not commit unless asked.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only, on-screen cursor, no drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is WORLD ART PASS — monsters + land, Forest quality bar. Read docs/WORLD_ROADMAP.md (Lessons from Hollow) and docs/ASSETS.md. Five lands already have place + verbs + play. Do not start parked forks, music, endless, or a 7th tower. Do not bring sticky place back. Do not retune gold unless play after new art says so. Do not re-do Hollow as a world-pass (verbs/land-logic already shipped). Image-gen is the job of this window — still log every keeper in docs/ASSETS.md. Do not commit public/preview/ unless asked. Do not wipe localStorage (Forest save may be 8/10).

Place: click a tile beside the path → 2×3 tray → pick → Build → done. Upgrade two-click. Sell at the bottom; Keep / confirm.

Bar = Forest. Painted grass/path tiles, trees, both portals, and unique 4-dir walk keepers (goblin, raider, imp, troll, warlord, warg, ogre, hellbat, wyvern, drake). New art must feel that finished — not a tint, not a costume-swap, not a weaker cousin. Walks are n/e/s/w × 4 frames. Skill: generate2dsprite. Magenta #FF00FF sheets, local processor for cleanup. East filename must face right (Forest had to swap e/w once — do not repeat that bug). Log live copies; keep raw in public/preview/.

Verified on disk at Hollow ship (Aug 21):

FOREST — the bar. public/sprites/terrain/grass-*.png + path-*.png, trees, portal-in/out, unique 4-dir keepers. Leave them unless a keeper is clearly broken.

DESERT — unique 4-dir bodies ALREADY EXIST. Do not regen blindly. Compare to Forest keepers first: scorpion, dunerunner, dunetyrant, sandkhan walks at public/sprites/enemies/walk/{name}-{n,e,s,w}-1..4.png plus stills. Land already painted: sand-*.png, sand-path-*.png, desert/{cactus,dead-tree,boulder,agave}.png, portal-desert-in/out.png. If a Desert body or tile looks cheaper than Forest, regen that piece only.

ICE — unique 4-dir bodies ALREADY EXIST. Same rule: compare to Forest before regenerating. frostwisp, icewolf, packlord, frostjarl. Land already painted: ice-*.png, ice-path-*.png, ice/{crystal,pine,boulder,shrub}.png, portal-ice-in/out.png.

FIRE — must generate. Land is still procedural Canvas (assets.ts wires fire-*.png / fire-path / portal-fire-in/out / public/sprites/fire/* but those files are missing). Bodies still costume-swap: Magma Hound=warg, Cinder Brute=ogre, Cinder King=ogre, Ash Titan=drake. Need four unique creatures + 4-dir walks, plus Forest-parity land: 4 ash tiles, 4 lava-path tiles, 4 props (lava-rock / ember-stump / fumarole / slag), two Fire portals. Wire new sprite names in enemies.ts CreatureSprite + assets.ts CREATURES.

HOLLOW — must generate. Land is procedural runes (glyphs, vein path, four canvas props, hex gates). Bodies still costume-swap: Shade=imp (flying), Hex Knight=raider (ground plate), Hex Warden=wyvern costume but GROUND not flying, The Magician=drake (ground, warps). Need four unique creatures + 4-dir walks that match those identities — Warden must read as a walking seal/warden, not a flyer. Forest-parity land: 4 rune-stone tiles, 4 rune-path tiles, 4 props (menhir / tablet / obelisk / ward-post), two Hollow portals. Shade stays flying; Warden/Knight/Magician stay ground.

Order: (1) smoke Forest 1. (2) Side-by-side quality read of Forest vs Desert vs Ice keepers — regen only losers. (3) Fire land + four Fire bodies. (4) Hollow land + four Hollow bodies. (5) Wire live sprites, tests for file existence, log ASSETS.md. Ask once if a Desert/Ice regen is needed after the compare; then generate. One world of bodies at a time if the sheet work is heavy.

Parked: 7th tower, endless, forks, music, Forest Boar still using the troll sprite unless they ask.
```

## Last window — Fire world (Aug 21)

Fire is a place now: cracked ash, lava-vein path, lava-rock props, Fire portals no longer steal Forest’s painted rifts. Verbs: Hound smolders, Brute crusts, King heat-haze, Titan erupts Magma Hounds (no gold). Late Fire 8–10 openings got the Desert-style gold bump. Forest gold unchanged. HUD says **click ash**. Unique Fire bodies still costume-swap (Warg / Ogre / Drake) until image-gen is asked.

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
