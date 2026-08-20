# Future features

## Before new ideas

Campaign shape is in (50 maps, roster names, shared `combat.ts`). Do not open flying, a 7th tower, endless, or image-gen yet.

1. **Play** Forest 1 → Forest 2 → Look at Desert waves 3 and 7. Did the land change the decision, or only the wallpaper?
2. **Verbs** — one trait per local, one louder trick per champion, one “oh no” per boss. Not a zoo.
3. **Then retune** splash / economy / HP. Roster has landed; tune after a few maps feel wrong.
4. **Readability** — size / color / aura so champions and bosses read without unique art.

Captured for later — not in this pass:

- Music — richer campaign loops (we have a quiet procedural prepare/battle pad; still no real score)
- Enemy attributes / speed variety — gait is visual only; projectile feel should stay readable when scouts and brutes differ more
- Splash / economy retune — after play + verbs, not before (cannon ~1.5 tiles, ice/fire mid, poison tiny, arrow single, lightning chain)
- **Kill gold vs later worlds** — bounties are flat per kind today. World HP climbs (1.18x → 1.68x) but a Raider still pays 15g, which is why the campaign sim starved on wave 1–2 of late maps. When we retune: a small world/stage bounty mul so harder foes drop a little more, not a second economy.
- **Level-3 branch** — after Lv3, pick one of two directions and make that tower a little better (Kingdom Rush-style). Do this before inventing a 4th numeric level. Needs a path id on the tower, two upgrade cards, and sell that refunds the branch. Not in this pass.
- Hand-painted Krita/GIMP tile variants
- Tiled as a visual map editor that exports into `levels.ts` (single source of truth must stay TypeScript)
- MagicaVoxel / Blender sprite sheets for extra props
- Flying vs ground targeting (Kingdom Rush style: cannon cannot lock air; arrows/lightning can)
- Unique art for world specials / champions / bosses (painted keepers are in; four-way facing stills still preview-only)
- On-death tricks (magma pop, wisp chill) and flyers once the roster feels right
- Enemy sprite polish — per-creature cleanup, or image-gen if we explicitly choose. Placeholders are good enough to play.
- Image-gen enemy sprites — only if we explicitly choose. Style drift and license logging are the traps; not default.
- Other CC0 creature packs if we find a meaner free set (no paid packs)
- More targeting modes (closest, strongest)
- Enemy color tinge / unique meshes for locals (placeholder bodies for now)
- Endless mode after campaign
- Mobile layout polish beyond basic stacking
- Tower preview ghosts with DPS estimate
- Cloud save / multiple profiles

Done since MVP:

- Speed control (1x / 2x / 3x)
- Particle bursts on kills / impacts
- Easy / Normal / Hard (green / gold / red on the title)
- Procedural combat SFX + mute
- Prepare/battle pad, path landmarks, wave-start sting, enemy gaits
- Painted enemies + towers + shots in the live match; Forest entrance and exit portals
- Forest tree set + mixed grass/path tiles; cannon carriage stays, barrel turns
- On-map 2×3 build tray, compact upgrade/sell, HUD chips, match vignette
- Forest path/grass split, bigger towers + shots, y-sort, spinning portal halos, HUD hearts/gold/wave, path-aware frosted trays, 4-frame enemy walks
