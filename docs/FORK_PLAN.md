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

Unforked Fire / Ice / Lightning / Poison / Void stay the live Lv1–3 building until a path is paid. After pay, the keep’s name **is** the path (title “Flamethrower”, not “Fire Flamethrower”), it swaps to `{kind}-a.png` / `{kind}-b.png` if those stills exist, and that named keep then upgrades three ranks: Flamethrower 1 → 2 → 3. Same Upgrade button, same gold curve (`upgradeCostFor` / `upgradeMul`). Arrow / Cannon / Longshot stay 3-then-fork-and-done. Halls still fork from inspect with no number ladder.

---

## Not locked — Keeps

Arrow, Longshot, Muster, and Chapter still say Faster / Heavier until we name them. Cannon already has **Rapid-fire** / **Mortar** — keep those unless play says they do not sing.

---

## How it plays

- **Flamethrower / Hail / Arc / Venom / Flicker** = today’s Faster muls (more shots, lighter splash / status).
- **Furnace / Blizzard / Thunder / Miasma / Abyss** = today’s Heavier muls (slower, fatter). **Abyss** opens the hole every **3rd** orb. Flicker / unforked Void stay every 4th. Everyday shot stays an orb.
- Cone, ground pool, and real miasma fog are **feel**, not new hit rules, unless we ask for those systems.

---

## Still need to draw

Both variants for each locked element. A paid path must **look like a different building**, not a cousin of the same keep.

| Keep | Fast still | Slow still |
| --- | --- | --- |
| Fire | Flamethrower — `fire-a.png` | Furnace — `fire-b.png` |
| Ice | Hail — `ice-a.png` | Blizzard — `ice-b.png` |
| Lightning | Arc — `lightning-a.png` | Thunder — `lightning-b.png` |
| Poison | Venom — `poison-a.png` | Miasma — `poison-b.png` |
| Void | Flicker — `void-a.png` | Abyss — `void-b.png` |

Do **not** generate these until they explicitly ask. Raw sheets go in `public/preview/` if we gen; live files are `public/sprites/towers/{kind}-a.png` and `{kind}-b.png`. Log in `docs/ASSETS.md`. Halls only if their paths need new yard/house art. Image-gen is not default.

### Next window (asked Aug 25): they wanted pictures first — generate all ten stills, then copy winners onto the live forked keeps.

Older `{kind}-a` / `{kind}-b` stills may already exist from the Faster/Heavier pass — replace them when we paint so the names match the building.
