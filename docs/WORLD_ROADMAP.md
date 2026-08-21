# World roadmap — five lands done, art pass shipped

One land per agent. Finish, play, write lessons. Hollow was the last land. The **dedicated art pass** (Aug 21) painted Fire + Hollow land and unique 4-dir bodies. Desert/Ice already held Forest quality — no regen. Worlds are done. Next thread they asked for is **tower revamp** (looks + remaining forks + talk a 7th). Paste lives in `docs/FUTURE_FEATURES.md`. Do not start endless or music. Do not regen world keepers.

Forest is home. Desert is a place (sand, four bodies, four verbs). Ice is a place (snow, four bodies, four verbs). Fire is a place (ash, four verbs, unique painted bodies). Hollow is a place (runes, four verbs, unique painted bodies).

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

Copy these forward. Hollow shipped — lessons are below.

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

### Fire (Aug 21)
- Land first: cracked ash, lava-vein path, lava-rock / ember-stump / fumarole / slag props. Fire no longer borrows the Forest painted portals — jagged ember arches until painted rifts exist. HUD says **click ash**.
- **One verb per body.** Hound **smolders** (knits HP unless Fire has it burning). Brute **crust** from stage 3 (Fire melts the shell; Cannon pierce ignores it). King **heat haze** (nearby towers still shoot, hits come in at half — not a freeze pulse and not a sandstorm choke; Fire keeps ignore the haze). Titan **erupts** Magma Hounds (no gold on pups).
- Do not copy Jarl freeze or Wisp phase onto Fire. Heat is softer shots, not skipped shots.
- Fire 1–4 leaked 0. Twin Caldera (3) is where crust shows. Fire 5–7 bite wave 1 and still win. Late Fire 8–10 got the Desert/Ice gold bump; Fire 8 then leaked 0. Bot still dies on Fire 9–10 rim (`Siege Cinder` up the left wall, `Last Crucible`) — placement, not a second gold bump. Forest 10 still 320g.
- Fire `hpMul` is 1.5 — stage 1 already buys six arrows. Unique 4-dir bodies shipped in the art pass (Magma Hound / Cinder Brute / Cinder King / Ash Titan).
- Hollow should steal: land + four verbs + play all ten + late-opening bump only if wave 1 dies. Do not start anything past Hollow in that window.

### Hollow (Aug 21)
- Land first: rune-etched stone, glowing vein path, menhir / broken tablet / obelisk / ward-post. Hex rune gates and a spire keep — Hollow no longer looks like purple Forest. HUD says **click rune**.
- **One verb per body.** Shade **hexes** the nearest keep (it fires slower). Flying; not a Wisp flicker. Knight **plate** from Twin Hex (Poison melts it; Cannon pierces it). Warden **seals** a tight bubble (keeps inside cannot fire — constant, small, not a Jarl pulse). Magician **warps** once down the path (cover the landing). No gold summons.
- Warden stays **ground** so Cannon is not trash; Arrow/Lightning stay the air answer; Knight plate gives ground a reason. Unique painted bodies shipped in the art pass (Shade flying / Hex Knight / Hex Warden walking seal-keeper / The Magician).
- Hollow 1–4 leaked 0. Twin Hex (3) is where plate shows. Hollow 5–8 bite wave 1 and still win. **Hollow 8 held without the Desert/Ice/Fire late gold bump** — do not copy it for symmetry. Bot dies on Hollow 9–10 rim (`Siege Cult` left-wall rite, `Last Spire` climb) — first keeps at the gate, not a purse. Forest 10 still 320g.

### Ceiling (art pass shipped Aug 21)
Unique 4-dir walk sheets were the expensive part. Fire and Hollow now have them, plus Forest-parity land (tiles, props, two portals each). Desert and Ice already held the Forest bar — no regen. East filenames face right (no Forest e/w swap this pass). Play-after-art checked out — not more worlds. Tower revamp (looks + remaining forks + a possible 7th) is the next window.

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

---

## Fire (done Aug 21)

Land, four verbs, whole-world sim, late-opening gold bump. Unique 4-dir painted bodies shipped in the art pass. Lessons are above.

| Role | Kind | Verb (shipped) |
| --- | --- | --- |
| Special 1 (stage 1+) | Magma Hound | **Smolder** — knits HP unless Fire burn is on it. |
| Special 2 (stage 3+) | Cinder Brute | **Crust** — extra armor. Fire melts it; Cannon pierces it. |
| Wave 7 | Cinder King | **Heat haze** — nearby non-Fire towers hit at half. They still shoot. |
| Wave 10 | Ash Titan | **Erupt** — Magma Hound pups. No gold on the summons. |

HUD: `click ash`. Late Fire 8–10 openings use the Desert-style gold bump. Forest 10 gold unchanged. Unique painted bodies (Magma Hound / Cinder Brute / Cinder King / Ash Titan).

---

## Hollow (done Aug 21)

Land, four verbs, whole-world sim. No late gold bump — Hollow 8 held without it. Unique 4-dir painted bodies shipped in the art pass. Lessons are above.

| Role | Kind | Verb (shipped) |
| --- | --- | --- |
| Special 1 (stage 1+) | Shade | **Hex** — nearest keep fires slower. Flying. Not a Wisp phase. Cannon cannot lock. |
| Special 2 (stage 3+) | Hex Knight | **Plate** — extra armor. Poison melts it; Cannon pierces it. |
| Wave 7 | Hex Warden | **Seal** — nearby keeps cannot fire while he walks past. Ground (walking seal-keeper, not a flyer). |
| Wave 10 | The Magician | **Warp** — one skip down the path. Cover the landing. |

HUD: `click rune`. Hollow 8–10 openings stay on world HP (no Desert bump). Forest 10 gold unchanged. Unique painted bodies (Shade flying / Hex Knight / Hex Warden / The Magician). `Rune Gate` drops from above — first keeps at the gate.

Art pass shipped. Play-after-art (Aug 21) checked out — unique bodies show, verbs still fire, gold untouched. Next window is tower revamp; paste lives in `docs/FUTURE_FEATURES.md`. Still parked: endless, music, world-themed fodder until they look at those lands.

---

## After each world ships

The agent writes 5–10 lines under **Lessons from {Ice,Fire,Hollow}** in this file: what changed the decision vs wallpaper, gold, rim maps, which verb to steal or never copy. Then stop. Hollow was the last land. The art pass shipped Aug 21.

Quality gates stay: `npm test`, `npm run build`, smoke title → Forest 1 → place → wave → damage. Path placement blocked. UI large-click.
