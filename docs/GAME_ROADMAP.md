# Game roadmap — after the kit

Worlds (Forest → Hollow) and the ten-keep tray are laid out. This file is the live plan for making the game feel finished **before** we reopen every keep’s fork names, shots, and upgrade art.

Pickup paste: `docs/FUTURE_FEATURES.md`. Fork names + jobs: `docs/FORK_PLAN.md`. Ten-keep history: `docs/TOWER_ROADMAP.md`. Worlds history: `docs/WORLD_ROADMAP.md`.

They are **playing** first (finish Forest, start the next world). Do not wipe `localStorage`. Do not start the fork/art era until they say so.

---

## Locked

- Fixed-path TD. **Buildings** never sit on the path. Troops may stand on it and stall (Kingdom Rush). Enemies follow the painted road.
- BCI-first: large buttons, click-to-place, no drag, no hover-only, no hotkey instructions.
- Ten keeps. No 11th. No Wind. No gold-farm keep. Void owns pull-to-a-point.
- Everyday Void is a small splash orb. Every **4th** orb opens a path-pull. **Abyss** (Void heavier) opens the hole every **3rd**.
- Place UX: grass → 2×3 Keeps / Elements tray → pick → Build.
- Halls are 1×2. Rally stays. Base troop HP / Rally math stay until play says otherwise.
- Do not regen world keepers or halls unless they ask. Walk/flap sheets shipped Aug 24. Do not commit `public/preview/` unless asked.

---

## They play (now)

Finish Forest. Start Desert (or whichever world opens). Write notes only if something feels wrong (gold, splash, quiet maps, tiny keeps, skate-walks). Retune numbers only from those notes — not in the dark.

**Play note in (Aug 24):** Desert range rings needed a dark rim to read on sand. Ice gets the same ink (snow is light too). Combat range numbers did not change.

**Walk/flap (Aug 24):** they asked for real plant/pass and wing flaps. Every unique body now has a 2×2 cycle stamped onto the live 4-dir files. Unique north/south faces stay parked.

---

## Next build era (in order)

Do these **before** named forks and new upgrade art.

### 1. Sound — in (Aug 25)

Filled the existing bus: louder place / fire / impact / leak / wave-start horn, wind+water up, prepare/battle drone (not a licensed score). SFX no longer skip if the context is still unlocking. Mute is a full HUD button. Next in this era is sharper-read.

### 2. Sharper, slightly bigger read — in (Aug 25)

Cropped keep/troop/enemy stills to the painted body (padding was eating height), grew a little, hard dark sticker rim, medium smoothing instead of blurry-high. Path ink a bit stronger. Combat radius / range / HP / gold unchanged. No tower/hall regen.

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

Element names, the second 3-rank ladder, and Abyss every-3rd are **in** (Aug 26). Fork muls stayed the live Faster/Heavier numbers. Paid keeps swap to `{kind}-a.png` / `{kind}-b.png` when those files exist.

Keeps (Arrow, Longshot) named Repeater / Ballista and Marksman / Puncture. Cannon is Gatling / Mortar. Halls: Muster Scout / Veteran, Chapter Lance / Paladin.

1. **Names** — Elements, shooter keeps, and halls done.
2. **What the shot does** — Element jobs live. Abyss = every 3rd hole.
3. **New stills.** Draw `{kind}-a.png` / `{kind}-b.png` per `docs/FORK_PLAN.md` when they ask, so a paid path looks like a different building.
4. **Motion art in the same era.** Attack frames if we still want them. 4-dir troops only if they ask. Walk/flap already shipped.

Do not generate fork art until they explicitly ask.

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
