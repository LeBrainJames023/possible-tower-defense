# Playtest notes

## Built this pass (Aug 19 batch)

Verified after a Vite restart (5173 had been serving yesterday’s files). Meadow Gate: path vs grass, HUD icons, taller keeps, portal halos, frosted tray + range ring, Raider walk, path placement blocked. Goblin/Imp/Warlord still need your eyes on Forest 9.

- Forest grass tinted greener, path warmer with a thin edge, so the road reads through the meadow. Trees unchanged.
- Four-frame walk / flap loops on the ten live keepers (`public/sprites/enemies/walk/`). Still is the fallback.
- Kill gold during the wave stayed as-is (not reverted). Amounts still parked.
- Towers taller (`TOWER_BILLBOARD` 70 → 96), width still clamped to one tile. Shots bigger. Units y-sorted by feet so a south keep can sit in front of a boss.
- Forest portals oversized, idle glow, spinning halos (stone frame stays still).
- HUD: hearts, gold bars, incoming-foe chevrons, Forest title in blended greens with a green orb. Buttons get a bit more bevel. Trays try to miss the path; edges are frosted so the range ring can show through.

## This session — logging only (Aug 19)

All items below were built in the batch above.

### Forest path vs grass — too close in color

Painted Forest grass and mud read as almost the same hue/value, so the road does not read as a path *through* the grass. Still want a worn trail in the meadow, not a cartoon trench or a fake new landscape.

Where it lives: Forest skips the theme palette and stamps `TEX.grassTiles` / `TEX.pathTiles` (`public/sprites/terrain/grass-1..4`, `path-1..4`) in `renderer.ts` `drawGrass` / `drawDirt`. Path tiles also bleed 5px over grass. Fallback theme (unused while those PNGs load): grass `#1e4a3c` / `#173e34`, path mid `#6a5340`.

Fix later (pick one, maybe both): slightly brighter / greener grass, or slightly brighter / warmer mud — whichever keeps “path through grass” without blending. Prefer a tint/overlay on the existing tiles so we do not regen art unless we ask. Trees stay as they are. Other worlds untouched unless the same blend shows up.

### Enemy walk / fly cycles — few frames, not a puppet slide

Painted keepers face the path (left/right flip) but the body is a still. Gait is only bob/sway/squash in `sprites.ts` `drawEnemy`, so they look dragged along the road. Want a short cycle so legs, arms, and wings actually move while they travel.

Scope: the ten live creature stills (`goblin`, `raider`, `imp`, `troll`, `warlord`, `warg`, `ogre`, `hellbat`, `wyvern`, `drake`) in `public/sprites/enemies/`. Walkers: legs + arms. Flyers (imp, hellbat, wyvern): wings. A few frames is enough (3–4), looped from existing `ENEMY_GAIT.stepHz`. Keep current 3/4 billboard + flip; do not wait on wiring the preview four-way stills in `public/preview/sprite-forge/facings/` (those are facing poses, not a walk cycle). Towers, trees, and path tiles stay still.

When we batch: this is new art (image-gen / Sprite Forge), not a tint. Cheap shape is one short sheet per creature on the current facing. Full 4-dir × cycle would be ~160 frames — flag before going there. Do not generate until we pick this in the batch.

### Gold during the wave — keep this, do not revert

You should get paid as you kill, so you can build or upgrade before the wave is over. Then a smaller bonus for clearing the wave. Most gold is kills; the clear stipend is extra, not the paycheck.

Already in: `Game.collectBounties` adds `e.reward` (difficulty gold mul) on death, `+Ng` float on the corpse, HUD gold chip pulses. Wave-clear is `waveClearBonus` (8g wave 1 → 26g wave 10) plus a toast. Place and upgrade already work in `prepare` and `wave`.

If mid-wave gold did not *feel* like it was landing, that is a readability check (floats / chip), not a retune tonight. Amounts stay parked: world/stage bounty mul for later-map HP is a different ticket. Do not go back to “only paid when the wave ends.”

### Towers bigger — more detail, still one tile

Forest 8 and Forest boss-wave shots (Warlord + Trolls + Raiders): big foes sit taller than the keeps. The Warlord pack hides the tower on the far side of the path. Ice is a thin crystal; fire/arrow/cannon read as props. Goal is **more readable detail** — base, shaft/middle, crown, then a clearer shot — not a tiny scale nudge.

Primary: **scale towers up** (wider in-tile, taller up). Enemies staying this size is fine. Do **not** shrink bosses as the main fix. Optional later: a flat ~10% shrink on *all* enemy billboards if the pile still eats the map — not bosses-only, and not tonight’s first lever.

Hard rule: the **base still occupies exactly one tile**, forever for now (overbuilding is a different talk). Footprint must not spill onto neighbor grass. Height can grow up; width can fill more of that same tile. Keep the `drawFeetBillboard` clamp to `TILE`.

Lives in `TOWER_BILLBOARD` (70) and `towerPaintHeight` in `constants.ts`; painted draw in `sprites.ts`. Ice/fire/lightning/poison are full stills; arrow/cannon are base + turret/barrel — scale both parts together so you can read the structure. `muzzlePoint` already follows paint height.

Shots too: more accentuated (ice bolt reads as a tiny star). `SHOT_SIZE` in `drawProjectiles.ts` (arrow 22 … cannon 34). Visual only — do not change splash or combat. Prefer scale/draw on existing PNGs unless a tower looks stretched.

Companion (if taller keeps still vanish in a boss pile): draw order is currently *all towers, then all enemies* (`Game` render), so a Warlord always paints over the keep behind him. Y-sort by feet would let a south tower sit in front. Mention at batch — do not treat as a separate art pass.

### Portals bigger, glowing, maybe spinning

Entrance (blue) and exit (red) already look like rifts, but they sit small and still. Want them a little oversized — landmarks, not postage stamps — with a real glow, and a slow rotate so they feel alive. “Looking real cool,” not a new mesh.

Where: `drawLandmarks.ts` `drawPortalBillboard`. Painted Forest uses `public/sprites/landmarks/portal-in.png` / `portal-out.png`. Height is `58 * PX` (~77px); a radial glow already pulses on wave-start heat (`spawnHeat`) and a little on the exit wound, but the PNG itself never rotates. Procedural arch/keep is the fallback if those files miss.

Fix later: bump billboard size (oversized is fine; they sit on path tiles, not buildable grass). Stronger idle glow, not only on spawn. Slow spin around the portal center (or a spinning halo behind a still frame if the art is a framed stone and spinning the whole PNG looks drunk). Prefer draw/FX on the existing PNGs — do not regen unless the rift looks stretched at the new size. Other worlds keep procedural until they get painted rifts.

### HUD + chrome — real icons, not colored dots; Forest title has depth

Forest 9 prepare bar: chips are still CSS balls (`.hud-ico` radial gradients in `style.css`). Lives is a red circle, gold a yellow circle, wave a gold circle, Forest a **blue** circle + plain white “Forest - 9”. Reads cheap next to the painted map.

Want:
- **Lives** — actual hearts (the class is already `ico-heart`; it is a red ball).
- **Gold** — tiny stack of coins or gold bars, not a yellow disc. Draw in CSS/SVG/canvas (user: “maybe we have you draw”).
- **Wave** — something that means “incoming foes,” **not water**. Banner, marching crest, or stacked chevrons. Keep `0 / 10`.
- **Forest title** — the orb goes **green**. The word Forest is 5–6 greens blended (lights and darks) so it reads as a small 3D forest word, not flat white. Stage number can stay readable. Other worlds later get their own title grade (sand / ice / ember / void) — Forest first.

Parent pass: menus, buttons, and HUD chrome should match the painted map — bevel, world tint, clearer icons — without shrinking BCI targets (chips already ~44px; design guide wants ~48–52px on controls). Do not rebuild layout or move click rules. Icons in `index.html` `#screen-game` HUD; button styles in `style.css`. Title/worlds/inspect later in the same chrome language. No image-gen unless a drawn icon looks worse than a tiny PNG we ask for.

### Build / inspect trays — try to miss the path; frost edges when you cannot

Forest 9 Ice **place** tray sat on the road. Follow-up **inspect** (Upgrade / Sell) is smaller and sometimes clears the dirt — but a snaking map will not always have a hole. Do not promise “never covers path.”

Rules, in order:
1. **Try** to pin off the path and off the placement/inspect tile (up / down / left / right). `pinRectBeside` today only flips left if it would fall off the screen (`src/shared/pinPanel.ts`, build + inspect in `main.ts`). Teach it path tiles; tests in `tests/pinPanel.test.ts`.
2. When there is no room, the menu can overlap grass or even a bit of path. **Must-keep: the range ring.** That circle is how you judge “does this hit the road?” Range is canvas under the HTML tray (`drawRangeRing` in `sprites.ts`), so a solid `.map-panel` (~94%) hides it. Soften **corners and edges** (see-through / frosted) so the map and the ring show through around the card. Center can stay more solid so Build / Upgrade / Sell stay readable. Do not shrink BCI buttons to win space.
3. A brief overlap of part of the ring is OK if the circle still reads on the path.

## Built this pass

- Kill gold during the wave (Hard still uses the difficulty gold mul on each bounty). Smaller end-of-wave bonus.
- Menus smaller, higher / toward the middle, see-through. Inspect tighter; upgrade button not huge.
- Inspect shows Lv + next-upgrade deltas (damage / range / rate). Click a tower: current range ring + outer next-range ring.
- Pause → Restart → confirm (“Are you sure you want to restart?”) → this level from scratch.
- Upgrade = build price + 25% (compounds for level 3). Sell = 65% of gold actually spent.
- +5% compounding enemy HP per wave inside a level (~1.55× by wave 10). Kill bounties bumped so mid-wave builds are possible.
- One star under the tower: bronze at build, silver at 2, gold at 3.
- Cannon cannot lock or splash flyers. Imps, Frost Wisps, and Shades fly. Arrow / Lightning / Ice / Fire / Poison still can.
- New-foe card at level start for first-time locals, champions, bosses, and flyers. “At some point during this level, this enemy will appear.” Got it to dismiss. Retry skips cards already seen.
- Escort scheduler on every map: tanks leave first, runners catch them mid-path, flyers share the same beat. Same counts. Same wave is identical on retry; stragglers keep it from being a metronome.

## Parked

- Immunities (slow / burn / lightning shrug; armored vs physical; magical vs elemental) — talk through before building.

## Already in progress this session (uncommitted UI from before this pass)

- Build tray on the map (not a side dock). Compact card + Build on tower click.
- Worlds / Title always at the top of lists. Locked lands = peek maps, cannot start until previous world is beaten.
- Game shell fits one screen (no scroll to trade HUD vs tray).
- Extra bottom padding so Cursor’s chat bar does not cover Play.
