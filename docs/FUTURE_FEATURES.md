# Future features

## Next window — play Desert, then retune (Aug 21)

The locked Desert/fork build is **committed** (`1ac322c`), not pushed (`main` ~28 ahead of origin). Sticky place stayed dead. Upgrade is two clicks. Do not bring sticky back.

### In this window
1. **Play** Forest 1 (smoke) → Forest 2 → Desert 1 / waves 3 and 7. Did sand + verbs change the decision, or only the wallpaper?
2. **Then retune** splash / economy / HP only if maps feel wrong. Roster + Desert verbs have landed.
3. Ice / Fire / Hollow verbs + unique art wait. Other tower forks wait.

### Parked
7th tower, endless, splash/economy retune (until play says so), 14-arrow Forest 10 start gold, Ice/lightning/fire/poison forks, unique art for Ice/Fire/Hollow.

### Watch-outs
- Fixed-path TD; towers never on path. BCI: large buttons, no drag, no hover-only.
- Forest save may be 8/10 — do not wipe localStorage.
- Ice/Fire/Hollow still Forest-path flipped + palette.
- Leftover untracked Forest preview folders (`public/preview/enemy-quality/`, old `walk4` keepers) — do not commit unless asked.
- Quality gates: `npm test`, `npm run build`, smoke title → Forest 1 → place → start wave → damage.

### Continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only, on-screen cursor, no drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

HEAD is 1ac322c on main (~28 ahead of origin, not pushed): Desert is a place, four Desert bodies + verbs, Arrow/Cannon Lv3 forks, sticky place gone, Upgrade two-click. Keep that UX. Do not bring sticky back.

Place: click grass → 2×3 tray → pick → Build → done. Want another? Click grass again. No cursor-ghost, no Done placing bar, no auto-drop.
Upgrade: click Upgrade once to preview current → next stats and the gold range ring. Click that same button again to pay. No third “are you sure?” card. After Lv3, Arrow and Cannon show two large path buttons (Faster/Heavier, Rapid-fire/Mortar), same two-click pay. Sell stays its own button and refunds the path.

Job this window: PLAY first, then retune only if it feels wrong.
1. Smoke: title → Forest 1 → place tower → start wave → enemy takes damage. Path placement still blocked; UI stays large-click.
2. Play Forest 2, then Desert 1 and look at Desert waves 3 and 7. Scorpion burrows (untargetable while under). Dune Runner dashes. Dune Tyrant sandstorm chokes nearby towers. Sand Khan summons Dune Runners (no gold on summons).
3. Take an Arrow to Lv3 and pick Faster vs Heavier; Cannon Rapid-fire vs Mortar. Ice/lightning/fire/poison still number-ups to 3.
4. Do not wipe localStorage (Forest save may be 8/10). Do not commit leftover Forest preview folders unless asked.

Parked: 7th tower, endless, splash/economy retune until play says so, 14-arrow Forest 10 start gold, other tower forks, unique art for Ice/Fire/Hollow.

Fixed-path TD; towers never on path. Balance in constants.ts / enemies.ts / levels.ts / worlds.ts. Combat in combat.ts. Verbs in verbs.ts. Forks in forks.ts. Log assets in docs/ASSETS.md.

Full brief also sits at the top of docs/FUTURE_FEATURES.md.
```

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
