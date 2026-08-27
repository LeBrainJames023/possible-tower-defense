# Tower fork plan

Live pickup: `docs/GAME_ROADMAP.md`. History: `docs/TOWER_ROADMAP.md`.

This is the locked **element** fork plan (Aug 25). First variant is **faster** (more shots, lighter status). Second is **slower** and **heavier** (fatter hit, stronger / longer status). Names replace Faster / Heavier on the two buttons. Combat stays in `combat.ts` — splash size and status length carry the feel. No cone stream, sitting lava, or poison fog systems unless we peel those off later.

Everyday Void stays an **orb**. The hole is a pull along the painted road, not a new keep. Rally melee-hold still wins. No 11th keep. No Wind. No gold farm.

---

## Locked — Elements

| Keep | Fast (a) | Slow / heavy (b) | Fast job | Slow job | Status |
| --- | --- | --- | --- | --- | --- |
| Fire | **Flamethrower** | **Furnace** | Rapid small napalm. Tight splash, short hot burn. | Slow fat boom. Wide splash, long cook. | **Burn** short vs long / stronger |
| Ice | **Hail** | **Blizzard** | Rapid shards. Small splash, brief chill. | Slow wide frost. The pack gets held. | **Slow** light/short vs heavy/long (not freeze-in-place) |
| Lightning | **Arc** | **Thunder** | Snappy bolts, fewer hops. | Slower fatter bolt, more hops, punches armor. | **Chain** shorter vs longer + **armor pierce** on Thunder |
| Poison | **Venom** | **Miasma** | Rapid darts, weak short melt, almost single-target. | Slow cloud-ish splash, long melt. | **Poison** short vs long / stronger. Miasma keeps Poison’s tiny slow so the cloud feels sticky. |
| Void | **Flicker** | **Abyss** | Rapid small orbs, smaller splash. Pull every **4th** orb. | Slow fatter orbs, bigger splash. Pull every **3rd** orb, a bit greedier. | **Pull** on the hole. Everyday shot stays an orb. |

Unforked Fire / Ice / Lightning / Poison / Void stay the live Lv1–3 building until a path is paid. After pay, the keep’s name **is** the path (title “Flamethrower”, not “Fire Flamethrower”), it swaps to `{kind}-a.png` / `{kind}-b.png` if those stills exist, and that named keep then upgrades three ranks: Flamethrower 1 → 2 → 3. Same Upgrade button, same gold curve (`upgradeCostFor` / `upgradeMul`). Arrow / Cannon / Longshot stay 3-then-fork-and-done. Halls fork from inspect with no number ladder.

---

## Locked — Halls

| Keep | Fast (a) | Slow / heavy (b) | Fast job | Slow job |
| --- | --- | --- | --- | --- |
| Muster | **Scout** | **Veteran** | Warriors train quicker. A bit thinner. | Tankier warriors. Slower train. |
| Chapter | **Lance** | **Paladin** | Knights train quicker. A bit thinner. | Tankier knights. Slower train. |

After pay, the hall’s name **is** the path (title “Scout”, not “Muster Scout”). Same two-click pay, then the other path is gone. No second number ladder. Troop HP / Rally / cap 3 / train muls stay the live Faster/Heavier numbers.

## Locked — Shooter keeps

| Keep | Fast (a) | Slow / heavy (b) |
| --- | --- | --- |
| Arrow | **Repeater** | **Ballista** |
| Cannon | **Gatling** | **Mortar** |
| Longshot | **Marksman** | **Puncture** |

After pay, the keep’s name **is** the path (title “Repeater”, not “Arrow Repeater”). These stay 3-then-fork-and-done — no second number ladder.

---

## How it plays

- **Flamethrower / Hail / Arc / Venom / Flicker** = today’s Faster muls (more shots, lighter splash / status).
- **Furnace / Blizzard / Thunder / Miasma / Abyss** = today’s Heavier muls (slower, fatter). **Abyss** opens the hole every **3rd** orb. Flicker / unforked Void stay every 4th. Everyday shot stays an orb.
- Cone, ground pool, and real miasma fog are **feel**, not new hit rules, unless we ask for those systems.

**Shot feel (Aug 26):** after a path is paid, the in-flight shot and impact read as that job (Flamethrower stream vs Furnace boom, Hail shards vs Blizzard burst, and so on). Canvas in `drawForkShots.ts` + `fx.ts`. Unforked Lv1–3 keep today’s orb. Combat splash / fire rate / DPS unchanged. No extra projectiles.

---

## Drawn and kept (Aug 26)

A paid path uses `{kind}-a.png` / `{kind}-b.png`. Unforked Lv1–3 keeps still use the old building until a path is paid.

| Keep | Fast still | Slow still |
| --- | --- | --- |
| Fire | Flamethrower — `fire-a.png` | Furnace — `fire-b.png` |
| Ice | Hail — `ice-a.png` | Blizzard — `ice-b.png` |
| Lightning | Arc — `lightning-a.png` | Thunder — `lightning-b.png` |
| Poison | Venom — `poison-a.png` | Miasma — `poison-b.png` |
| Void | Flicker — `void-a.png` | Abyss — `void-b.png` |
| Arrow | Repeater — `arrow-a.png` | Ballista — `arrow-b.png` |
| Cannon | Gatling — `cannon-a.png` | Mortar — `cannon-b.png` |
| Longshot | Marksman — `longshot-a.png` | Puncture — `longshot-b.png` |
| Muster | Scout — `muster-a.png` | Veteran — `muster-b.png` |
| Chapter | Lance — `chapter-a.png` | Paladin — `chapter-b.png` |

Raw sheets stay in `public/preview/` (do not commit unless asked). Live files are `public/sprites/towers/{kind}-a.png` and `{kind}-b.png`. Logged in `docs/ASSETS.md`.
