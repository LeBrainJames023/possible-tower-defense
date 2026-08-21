# World roadmap — Ice, then Fire, then Hollow

One land per agent. Finish, play, write lessons, then open a **new chat** for the next land. Do not start Fire while Ice is mid-paint.

Forest is home. Desert is a place (sand, four bodies, four verbs). Ice is a place (snow, four bodies, four verbs). Fire / Hollow still wear a palette: **unique paths exist**, **names exist**, **art and verbs do not**.

This file is the pickup brief. `docs/FUTURE_FEATURES.md` points here. Campaign shape lives in `docs/CAMPAIGN.md`.

---

## What “done” means for a world

Same bar Desert had to clear:

1. **The land is a place** — ground tiles, blocked-tile props, entrance/exit portals, campaign thumbs that match. HUD toast uses the right word (`click sand`, not `click grass`).
2. **Four locals with one verb each** — two specials, wave-7 champion, wave-10 boss. Special 2 shows from **stage 3** (same roster gate as Desert). Boss summons (if any) pay **no gold**.
3. **Play the whole world** — smoke Forest 1 first (don’t break home), then this world’s 1 → 2 → all ten. Watch waves 3, 7, and 10.
4. **Retune only if play says so** — splash / HP / start gold. Openings that die on wave 1 are a purse or a **rim spawn** (first keeps at the gate). Wallpaper verbs are a design miss, not an HP bump.
5. **UX stays locked** — click a tile beside the path → 2×3 tray → Build → done. No sticky place. Upgrade two-click. Sell at the bottom; Keep / confirm. BCI: large buttons, no drag, no hover-only.

Parked for every world pass: 7th tower, endless, Ice/lightning/fire/poison forks, Forest 10 14-arrow start gold, leftover `public/preview/` folders.

---

## Lessons already in the bag

Copy these forward. Add a short “Lessons from Ice” block here when Ice ships, before Fire starts.

### Forest
- Tutorial home. Stage 1 has no locals and no champion.
- Painted trees, mixed grass/path, Forest portals, 4-dir keepers.
- Sticky place stayed dead. Don’t bring it back.

### Desert (Aug 21)
- **Land before numbers.** Sand tiles + props + portals made the world feel like a world. HP came after play.
- **One verb per body.** Scorpion burrow, Runner dash, Tyrant sandstorm (chokes nearby towers), Khan caravan (summons Runners, no gold).
- **Second local waits until stage 3.** Dash was almost invisible on Desert 1. Twin Dunes (3) is where it showed.
- **Late maps leak on wave 1** when world-pressure adds extra bodies that start gold didn’t buy. Desert 7+ openings got a bump. **Forest start gold was left alone.**
- **Rim spawns** (Desert 9–10, path hugs the edge): first keeps belong at the golden gate, not the pretty middle. Ice 9–10 do this too (`Siege Drift` down the left wall, `Last Glacier` across the top rim).
- Image-gen **only when asked**. Log keepers in `docs/ASSETS.md`. Don’t commit `public/preview/` unless asked.
- Don’t wipe `localStorage` (Forest save may be 8/10).

### Ice (Aug 21)
- Land first: snow tiles, packed-ice path, crystal/pine/boulder/shrub, glacier portals. HUD says **click ice**.
- **One verb per body.** Wisp **phases** (flying + untargetable flicker — not a ground burrow). Wolf **slides** from stage 3 (Ice tower counters, like Desert dash). Pack Lord **rally** speeds nearby wolves (helps the pack, does not choke towers). Jarl **freezes** nearby towers for a beat (pulse, not a constant sandstorm).
- Do not copy Khan summons onto the Jarl. Freeze is the Ice finale lesson: don’t clump keeps on him.
- Late Ice 8–10 needed the same opening-gold bump as Desert. Forest 10 still 320g. Bot still leaks wave 1 on Ice 9–10 (rim) and then holds — placement, not a second gold bump.
- Ice 1–4 leaked 0 in the headless sim. Twin Floes (3) is where slide/rally show.
- Fire should steal: land + four verbs + play all ten + late-opening bump only if wave 1 dies. Do not start Hollow in the Fire window.

### Ceiling (read before pouring Fire)
Two more worlds of unique 4-dir walk sheets is the expensive part (4 bodies × 4 dirs × 4 frames, plus tiles, props, two portals). **One world per agent.** New chat for Fire — don’t start Hollow in that thread.

Verbs live in `src/game/verbs.ts`. Combat asks “may I shoot this?” from there. Do not put timers in `combat.ts`. Bodies and names in `src/game/enemies.ts` / `worldRoster.ts`. Paths already authored in `src/game/worldPaths.ts`. Balance in `constants.ts` / `levels.ts` / `worlds.ts`.

---

## Ice (done Aug 21)

Land, four unique bodies, four verbs, whole-world sim, late-opening gold bump. Lessons are above.

| Role | Kind | Verb (shipped) |
| --- | --- | --- |
| Special 1 (stage 1+) | Frost Wisp | **Phase** — flying + untargetable flicker. Cannon cannot lock. |
| Special 2 (stage 3+) | Ice Wolf | **Slide** — Ice tower counters. |
| Wave 7 | Pack Lord | **Rally** — speeds nearby Ice Wolves. Does not choke towers. |
| Wave 10 | Frost Jarl | **Freeze** — nearby towers cannot fire for a beat. |

HUD: `click ice`. Late Ice 8–10 openings use the Desert-style gold bump. Forest 10 gold unchanged.

**Do not start Fire in this thread.** New chat tomorrow.

---

## Fire (next — new chat)

**Roster:** Magma Hound, Cinder Brute (stage 3+), Cinder King (wave 7), Ash Titan (wave 10). Today: Warg / Ogre / Drake palettes.

**Land today:** procedural lava-rock props, fire palette, unique paths (`Ember Gate` … `Last Crucible`). No painted ash tiles, no fire portals.

**Carry from Ice:** land + one verb each + play all ten. Late-opening gold bump only if wave 1 dies. Rim maps: first keeps at the gate. Do not copy Jarl freeze or Wisp phase onto Fire. Fire `hpMul` is 1.5 — stage 1 already buys more arrows than Forest; still **play** before buffing gold.

**Verb direction (bets, not locked):** Hound (burn trail or sprint), Brute (armor / magma pop on death — on-death tricks were parked; only if play wants it), King (heat aura, not a freeze clone), Titan (erupt / summons, no gold on pups). Fire tower and Cannon pierce should feel like the intended answers.

**Ask before image-gen.** Don’t open Hollow in the Fire thread.

### Fire continue prompt (paste into a new chat)

```
Continue Possible Tower Defense from Desktop repo ~/Desktop/possible-tower-defense (Vite http://127.0.0.1:5173/). BCI user (Neuralink Prime Study, Patient-23): three clicks only, on-screen cursor, no drag-and-drop, no hover-only, no keyboard shortcuts in instructions. Beginner — explain meaningful changes in plain English. Commit/push only when they say yes.

This window is FIRE ONLY. Read docs/WORLD_ROADMAP.md first — especially Lessons from Ice. Forest, Desert, and Ice are the bar: land is a place, four bodies, one verb each, play the whole world, retune only if it feels wrong. Do not start Hollow. Do not bring sticky place back.

Place: click a tile beside the path → 2×3 tray → pick → Build → done. Upgrade two-click. Sell at the bottom; Keep / confirm. Fire HUD should say click ash, not grass.

Fire roster: Magma Hound, Cinder Brute from stage 3, Cinder King wave 7, Ash Titan wave 10. Verbs in verbs.ts. Paths already in worldPaths.ts. Ask before any image-gen. Log assets in docs/ASSETS.md.

Job: (1) Smoke Forest 1. (2) Make Fire a place + verbs. (3) Play Fire 1 → 2 → 3, then the whole Fire world. (4) Write “Lessons from Fire” into WORLD_ROADMAP.md before you stop.

Do not wipe localStorage (Forest save may be 8/10). Do not commit public/preview/ unless asked.
```

---

## Hollow (after Fire lessons)

**Roster:** Shade (flying), Hex Knight (stage 3+), Hex Warden (wave 7), The Magician (wave 10). Today: Imp / Raider / Wyvern / Drake palettes.

**Land today:** procedural rune stones, purple palette, unique paths (`Rune Gate` drops from above — watch the first keep). Finale world. Magician should feel like a **decision**, not a bigger Drake.

**Carry from Fire:** don’t let flying Shade + Hex Warden (wyvern body) turn the world into “Cannon is trash.” Arrow / Lightning must remain the air answer; give ground a reason to exist (Knight plate).

**Verb direction (bets):** Shade (not a carbon-copy of Wisp phase — Ice already taught flicker; maybe a hex that muffles one nearby tower, or a slower untargetable beat). Knight (plate — Poison and Cannon). Warden (seal / silence). Magician (the last door — one signature trick, not four). **One verb each.**

**Ask before image-gen.** New chat. After Hollow play, campaign art+verbs are complete; then parked forks / music / endless are allowed to come back.

---

## After each world ships

The agent writes 5–10 lines under **Lessons from {Ice,Fire,Hollow}** in this file: what changed the decision vs wallpaper, gold, rim maps, which verb to steal or never copy. Then stop. Next land is a new chat.

Quality gates stay: `npm test`, `npm run build`, smoke title → Forest 1 → place → wave → damage. Path placement blocked. UI large-click.
