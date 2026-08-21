# Future features

## Last window — world art pass (Aug 21)

Fire and Hollow now have Forest-parity painted land and unique 4-dir bodies. Desert/Ice keepers already held the bar — no regen. East filenames face right (no Forest e/w swap). Verbs and gold untouched. Sticky place stayed dead. Forest save not wiped.

### What the art pass did
- Fire: ash tiles, lava-path, lava-rock / ember-stump / fumarole / slag, Fire portals, Magma Hound / Cinder Brute / Cinder King / Ash Titan walks.
- Hollow: rune-stone tiles, rune-vein path, menhir / tablet / obelisk / ward-post, Hollow portals, Shade (flying) / Hex Knight / Hex Warden (ground seal-keeper) / The Magician walks.
- Logged keepers in `docs/ASSETS.md`. Raw sheets stay in `public/preview/` — do not commit unless asked.

### Next
Play-after-art if the new sprites change feel. Do not retune gold unless a wave dies because of art, not numbers. Parked: 7th tower, endless, forks, music, Forest Boar still using the troll sprite unless asked.

### Parked
7th tower, endless, splash retune, 14-arrow Forest 10 start gold, Ice/lightning/fire/poison forks.

### Watch-outs
- Fixed-path TD; towers never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Leftover untracked preview folders — do not commit unless asked.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage. Then glance Fire 1 ash and Hollow 1 runes.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only, on-screen cursor, no drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is PLAY AFTER ART. Art pass already shipped: Fire and Hollow have unique 4-dir bodies + Forest-parity land. Desert/Ice were left (they held the Forest bar). East filenames face right. Read docs/WORLD_ROADMAP.md and docs/ASSETS.md. Do not start parked forks, music, endless, or a 7th tower. Do not bring sticky place back. Do not wipe localStorage (Forest save may be 8/10). Do not commit public/preview/ unless asked. Do not regen Forest/Desert/Ice keepers unless play shows a clearly broken sprite.

Place: click a tile beside the path → 2×3 tray → pick → Build → done. Upgrade two-click. Sell at the bottom; Keep / confirm.

Smoke Forest 1 first (place → wave → damage, path blocked). Then glance Fire 1 (ash, lava path, Magma Hound body) and Hollow 1 (runes, Shade flying, Warden is ground). Retune gold only if a wave dies because of the new art, not for symmetry.

Parked: 7th tower, endless, forks, music, Forest Boar still using the troll sprite unless they ask.
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
