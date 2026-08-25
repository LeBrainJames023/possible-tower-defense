# Game roadmap — after the kit

Worlds (Forest → Hollow) and the ten-keep tray are laid out. This file is the live plan for making the game feel finished **before** we reopen every keep’s fork names, shots, and upgrade art.

Pickup paste: `docs/FUTURE_FEATURES.md`. Ten-keep history: `docs/TOWER_ROADMAP.md`. Worlds history: `docs/WORLD_ROADMAP.md`.

They are **playing** first (finish Forest, start the next world). Do not wipe `localStorage`. Do not start the fork/art era until they say so.

---

## Locked

- Fixed-path TD. **Buildings** never sit on the path. Troops may stand on it and stall (Kingdom Rush). Enemies follow the painted road.
- BCI-first: large buttons, click-to-place, no drag, no hover-only, no hotkey instructions.
- Ten keeps. No 11th. No Wind. No gold-farm keep. Void owns pull-to-a-point.
- Everyday Void is a small splash orb. Every **4th** orb opens a path-pull. Heavy fork stays a fatter orb (cadence change waits for the fork era).
- Place UX: grass → 2×3 Keeps / Elements tray → pick → Build.
- Halls are 1×2. Rally stays. Base troop HP / Rally math stay until play says otherwise.
- Do not regen world keepers, halls, or walk sheets unless they ask. Do not commit `public/preview/` unless asked.

---

## They play (now)

Finish Forest. Start Desert (or whichever world opens). Write notes only if something feels wrong (gold, splash, quiet maps, tiny keeps, skate-walks). Retune numbers only from those notes — not in the dark.

**Play note in (Aug 24):** Desert range rings needed a dark rim to read on sand. Ice gets the same ink (snow is light too). Combat range numbers did not change.

---

## Next build era (in order)

Do these **before** named forks and new upgrade art.

### 1. Sound

The match is too quiet. Fix / fill the existing audio bus first: place, fire, impact, leak, wave start, and a real battle/prepare bed (wind/water already exist). Not a licensed orchestral score unless they ask. Large mute control stays.

### 2. Sharper, slightly bigger read

Make **keeps, troops, enemies, and the map** read clearer on the same 1280×768 seat.

- Grow **up** a little (keeps taller; troops/enemies a bit larger). Width still respects one grass tile (halls stay 1×2).
- Dark rim / sticker edge so painted bodies pop off grass.
- Sharper draw of the files we already have (less mush). Do **not** chase 720p source files as the first lever — a huge PNG on a 64px tile does not look like HD.
- Combat radius, range, HP, and gold stay put unless play says a size change broke feel.
- Do **not** regen all towers, troops, or walk sheets in this era. Regen waits for the fork/art era so we do not paint twice.

### 3. Play notes

After their Forest → next-world run: only the retunes they actually felt (example leftovers: Forest 10 start gold, splash, mid-wave payouts). Skip what they did not mention.

---

## Later — unique layout curve (not Forest flips)

Desert / Ice / Fire / Hollow already have **their own tracks** in `src/game/worldPaths.ts` (not a color-swap of Forest). Do not treat them as Forest with a new wallpaper.

When we **regenerate** maps, the difficulty lever is **how much the road loops**, not a copy-paste shuffle:

- **Fewer loops / fewer passes** = harder. Keeps get one look. Desert 1 already plays this way.
- **More loops** = later-world easier stacking: the same keep hits the pack more than once.
- Early maps in a land can be the hard classroom. Later maps can snake so splash and halls earn their keep.
- Rim maps (stage 9–10) still want the first keep at the gate.

Pencil this as its own pass after sound / sharper-read, or when they peel it off. Do not regen all 40 tonight. Combat numbers stay unless a new shape breaks the opening.

---

## Circle-back era — named forks + new looks

One era, not three overlapping windows.

1. **Names, not Faster/Heavier.** Every keep gets two real path names (example only: Fire → something like Lava vs Flamethrower). Cannon can keep Rapid-fire / Mortar if those still sing. Talk all ten, then lock the list.
2. **What the shot does.** Each path’s projectile / attack look and combat identity (Void’s every-3rd hole lives here, with pull growing on number upgrades).
3. **New stills.** A paid path must **look like a different building**. New `{kind}-a.png` / `{kind}-b.png`. Halls only if their paths need new yard/house art.
4. **Motion art in the same era.** Real walk/fly sheets (today’s Forest cards are near-duplicate poses). Attack frames if we still want them. 4-dir troops only if they ask.

Do not start this era while they are still playing the campaign unless they say start.

---

## Later — endless after a world boss

After they beat a world’s **stage 10 boss**, a large two-button card:

- **Congratulations — you won.**
- **Main menu**
- **Keep playing**

Keep playing is the endless door. Extra upgrades / extra toys wait until that door exists. Not this week unless they peel it off on purpose.

---

## Parked

Forest Boar still using the troll sprite. World-themed fodder. Leftover `public/preview/` and leftover enemy walk-frame PNG edits on disk. Sticky place stays dead.

---

## Ceilings

- One-tile keeps cannot get much **wider** without eating the neighbor. Taller + rim first.
- HD files ≠ HD on a postage stamp.
- Regen-all walks/keeps now = paint twice when forks change looks.
- Ten keeps is the tray’s load.
- Image-gen only when they explicitly ask.

---

## Done for a build window

`npm test` and `npm run build` pass. Forest 1 smoke: title → grass → place → wave → damage; path still blocks buildings. UI stays large-click. Commit / push only when they say yes.
