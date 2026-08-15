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
- Hand-painted Krita/GIMP tile variants
- Tiled as a visual map editor that exports into `levels.ts` (single source of truth must stay TypeScript)
- MagicaVoxel / Blender sprite sheets for extra props
- Flying vs ground targeting (Kingdom Rush style: cannon cannot lock air; arrows/lightning can)
- Unique art for world specials / champions / bosses (today they reuse Quaternius bodies as placeholders)
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

- Speed control (1x / 2x)
- Particle bursts on kills / impacts
- Easy / Normal / Hard
- Procedural combat SFX + mute
- Prepare/battle pad, path landmarks, wave-start sting, enemy gaits, wood/iron chrome
