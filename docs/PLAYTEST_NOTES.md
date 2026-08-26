# Playtest notes

## This session — shooter keep names (Aug 26)

Arrow is Repeater / Ballista. Cannon is Gatling / Mortar. Longshot is Marksman / Puncture. Inspect title is the path name. Still fork-and-done after Lv3. Halls still Faster / Heavier.

Check 1x: Forest 1 Arrow to Lv3 → two buttons Repeater vs Ballista → pay one → other gone → Max.

## This session — Element identity + second ladder (Aug 26)

Wired Flamethrower / Furnace, Hail / Blizzard, Arc / Thunder, Venom / Miasma, Flicker / Abyss on the two fork buttons. After pay, inspect title is the path plus rank (“Flamethrower 1”), not “Fire Flamethrower”. That keep upgrades three more ranks on the same Upgrade button and gold curve. Arrow / Cannon / Longshot still max after the path. Halls still fork from inspect. Abyss pulls every 3rd orb; Flicker / unforked stay every 4th. Muster/Chapter + how-to-play now say three troops, three fights; extra walkers keep going. HP / Rally / cap 3 unchanged. Did not generate art.

Check 1x: Forest 1 smoke, then an Element 1→2→3 → pay Flamethrower (or Hail) → other button gone → two more Upgrades to rank 3. Void Abyss should pull on the 3rd orb.

## This session — element fork plan (Aug 25)

Locked names + jobs in `docs/FORK_PLAN.md`. Fire Flamethrower/Furnace, Ice Hail/Blizzard, Lightning Arc/Thunder, Poison Venom/Miasma, Void Flicker/Abyss. Fast = more shots / lighter status. Slow = heavier damage / fatter status. Art for both variants still needs drawing. Buttons not wired yet.

## This session — sharper read (Aug 25)

Keeps, troops, enemies, trees, and portals crop empty PNG padding so the painted body fills the billboard, then sit a little taller with a hard dark sticker rim (no blur shadow). Path tiles got a stronger ink edge. Combat radius, range, HP, and gold unchanged. No tower/hall regen.

Check 1x after a reload: Forest 1 Arrow should read taller on one grass tile; wave 1 Raiders bigger with a dark edge; path still blocks buildings.

## This session — sound bus (Aug 25)

The match was too quiet. Place, fire, impact, leak, and wave-start now have real body; prepare is a slow drone, battle a lower pulse that ducks under shots. Wind/water beds are louder. Mute is a full-size HUD button (Sound on / Sound off). Not a licensed score. Combat numbers unchanged.

Check 1x after a reload: Sound on, click grass → Build (wood thud), Start wave (horn + bed), Arrow shots, a leak if one slips. Path still blocks buildings.

## This session — real walk and flap (Aug 24)

Every unique body got a 2×2 sheet: walkers plant / pass / plant / pass, flyers wing up / mid / down / mid. Stamped onto live `{n,e,s,w}` files so the old frozen 4-dir poses do not win. East is a flip so right-bound Raiders still face right. Combat numbers unchanged. Unique back/front faces parked.

Check 1x after a reload: Forest 1 wave 1 Raiders should stride, not bounce in place. Wave 4 Imps should flap. Path still blocks buildings.

## This session — daily 624 hotfixes (Aug 24)

Forest 10 notes from `docs/DAILY_FEEDBACK_624.md`. **Fixed:** clicking a keep (hall footprint or painted art) inspects instead of opening Build; Forest-cleared card is **Desert** / **Main menu**. **Parked:** named fork titles + new jobs (item 2). Forest save not wiped. Sticky place stayed dead.

Desert play: range rings get a dark ink rim so they read on sand (Ice too). Unique world tracks already live in `src/game/worldPaths.ts` — layout-curve regen (fewer loops = harder) is penciled for later, not this window. Keep clicks follow the highlighted **tile** — empty grass above a keep opens Build, not inspect.

Muster / Chapter: after you pick one, the ghost still lights two tiles. **Left / Right / Turn left / Turn right** on the Build card slide or stand the hall (vertical 1×2). Buttons hide when that seat is blocked. One-tile keeps unchanged.

New agents start Vite and open Cursor’s in-editor Browser beside the chat (not Chrome) without being asked.

## This session — they go play (Aug 24)

Live play notes (log only): `docs/DAILY_FEEDBACK_624.md`. Formal post-kit plan: `docs/GAME_ROADMAP.md`. They finish Forest and start the next world. Next **build** (when they say start): sound, then sharper/slightly bigger read. Named forks + new upgrade art + walk regen wait. Endless = later congrats card after a stage-10 boss.

## This session — Forest walk clocks (Aug 24)

Raider / Imp / Goblin 4-dir sheets are almost the same pose four times (pixel-diff is tiny). This window did **not** regen. Slowed the visual clock only: Raider `1.05`, Goblin `1.5`, Imp flap `2.0`. Painted bodies get a light step/hover bob again so they do not sit frozen. Travel speed, HP, and range unchanged.

Check 1x after a reload: Forest 1 wave 1 Raiders should bounce with a slower cycle (still not a real left-right stride). Wave 4 Imps should flap slower, less jitter. Path still blocks buildings. Next art beat if they want it: paint real plant/pass/plant/pass + wing up/down for those cards.

## This session — Void vortex (Aug 23)

Everyday Void still shoots the small splash orb. Heavy fork stays a fatter orb. Every **4th** orb impact opens a black-hole pull that slides nearby foes along the painted road (flyers included). Troops holding a walker keep that stall — the hole does not yank a melee lock.

**Play (Aug 24):** they called it awesome. Every 4th hit slows a bit and sucks them in — keep that feel. Everyday orb stays. Live check after Vite restart.

Parked Void growth (not built): pull gets more aggressive on number upgrades. Faster keeps every 4th. Heavier stays slower / fatter / harder, and opens the hole every **3rd** orb. Still a pull-on-the-road, not a new keep.

## This session — 1×2 halls (Aug 23)

## This session — 1×2 halls (Aug 23)

Muster and Chapter are two tiles wide. Click one grass tile; the pair prefers the neighbor to the right. Inspect either tile. Sell frees both. Troop HP / Rally / cap-3 unchanged. Six new landscape stills (base + Faster/Heavier) replace the old circular yards.

`npm test` 146 passed. Isolated one-tile grass refuses a hall. Forest 1 still has a 1×2 seat beside the road.

Check 1x after a reload: grass → Keeps → Muster. The clicked tile plus its neighbor should light at once (ghost yard on both). Build. Inspect outlines both tiles. Path still blocks buildings. Rally still works. Sell the old one-tile Muster if it is still sitting from before the reload.

## This session — forks (Aug 23)

All ten keeps now split Faster vs Heavier (Cannon stays Rapid-fire / Mortar). Shooters still climb Lv1–3, then two big path buttons, two-click to pay. Halls skip the empty number ladder and show Faster / Heavier on inspect next to Rally. Base warrior/knight HP and Rally math are unchanged — a hall fork only multiplies train time / troop HP. Void heavy is a fatter dark splash, not a black hole.

Twenty fork stills are live (`public/sprites/towers/{kind}-a.png` and `-b.png`). Unforked buildings keep their old pictures (Arrow/Cannon still rotate). After a path is paid, the keep swaps to the fork still.

Headless Forest 1: Arrow damages Raiders, path still blocks buildings, Muster troops stall, heavier fork restats living warriors. `npm test` 143 passed. `npm run build` clean. Cursor browser tools did not connect this window — check 1x after a reload (right-click the page → Reload). Forest save not wiped (may still be 9/10). Sticky place stayed dead.

Check 1x: Forest 1 smoke, then Muster → Faster/Heavier preview → pay if you want. Or Ice to Lv3 → two path buttons. Say if a fork picture looks like a cousin.

## This session — tile-fit / play (Aug 23)

Halls and troops now sit against one tile. Muster/Chapter crop the empty PNG padding so the yard/house fills the grass square (height can grow up; width stays in-tile). Troop paint is a fixed height now (warrior `u(48)`, knight `u(56)`), not combat radius — same people, easier to read on the path. HP / Rally / travel speed unchanged.

Forest 1: Arrow + Muster + Chapter on grass. Path still refuses buildings. Wave 1 Raiders took damage (100 → 24 / 40 / 47) and melee-held at the flag. Warriors and knights read as people next to Raiders, not ants. Sticky place stayed dead. Forest save not wiped (9/10). Walk-v2 left as-is.

Next: they check 1x after a reload (halls fill the tile; troops look like people). Forks only if they say continue. Do not retune troop HP unless a later map feels wrong.

## This session — troop walk fix (Aug 23)

Wired warrior + knight walk-v2 (four stride phases). Slowed the leg cycle only (`TROOP_WALK_HZ` warrior 1.0 / knight 0.75; idle 0.55). Travel speed unchanged (warrior `u(95)`, knight `u(48)`). Gallery: http://127.0.0.1:5173/preview/troop-walk-fix.html. Forest 1: title → grass → Keeps → Arrow → Build → wave → Raider 100 → 89. Path still toasts blocked. Muster placed; Rally on a path tile; three warriors walked. Sticky place stayed dead. Forest save not wiped (9/10).

Next: they check 1x after a reload if the stride reads. Then tile-fit / play if they say continue.

## This session — hall + troop art pass (Aug 22)

Replaced Muster/Chapter stills and warrior/knight idle+walk. Tray chips now show those pictures (halls use a closer crop). They liked the halls and idle. **Walk looks like one leg swinging** — missing a full left-right-left-right stride (two-pose ping-pong or too fast). Gallery: http://127.0.0.1:5173/preview/hall-troop-art-pass.html. Vite restarted. Forest 1: title → grass → Keeps → Arrow → Build → wave → Raider 100 → 43. Path still toasts blocked. Muster placed; Rally on a path tile; three painted warriors walked to the flag. Sticky place stayed dead. Forest save not wiped (showed 9/10).

Next: redo warrior + knight walk (4 distinct stride frames). Show the photos in a browser first. Then tile-fit / play.

## This session — paint Muster + Chapter (Aug 22)

Building stills and troop idle/walk are live. Forest 1: title → grass → Keeps → Arrow → Build → wave → Raider 100 → 97 (stall hold). Path still toasts blocked. Muster placed; three painted warriors walked to the default path flag. Vite needed a restart before the new PNGs served (stale 5173 was handing back HTML). Sticky place stayed dead. Forest save not wiped (showed 9/10).

Check 1x: right-click the page → Reload if a hall still looks like a crate. Then Muster or Chapter → inspect → Rally → path tile → three bodies walk. Tray swatches for the halls are still flat chips — map stills are the painted ones.

## This session — Muster + Chapter (Aug 22)

Hall left the tray. Keeps is Arrow, Cannon, Longshot, Muster, Chapter + one empty. Forest 1: grass → Keeps → Arrow → Build → wave → Raider 100 → 89. Path still toasts blocked. Muster placed mid-wave; Rally on a path tile; three cream warriors walked out (HP 28). Chapter not placed live this smoke — tests cover slower/tankier knights. Procedural crate + dots. Sticky place stayed dead. Forest save not wiped (showed 9/10).

Check 1x: Forest 1 smoke again after a reload. Then Muster or Chapter → inspect → Rally → path tile → three bodies walk. Say **paint** when you want building stills + idle/walk.

## This session — troop engine (Aug 22)

Invisible Hall on Keeps (Arrow, Cannon, Longshot, Hall, two empty). Place on grass only. Inspect → Rally → click a path tile in the circle. Three dots walk to the flag, grab a Raider, stall, die, respawn. Flyers walk through. Path still blocks buildings. Sticky place stayed dead. Forest save not wiped.

Check 1x: Forest 1 smoke (Keeps → Arrow → Build → wave → Raider damage). Then Hall → Rally on the path → three dots melee.

## This session — tray + Longshot + Void (Aug 22)

Two-tab tray landed. Opening grass starts on **Keeps**. Empty slots stay empty (Keeps has three holes; Elements has one after Void). Forest 1: grass → Keeps → Arrow → Build → wave → Raider took damage. Path click still toasts blocked. Sticky place stayed dead. Forest save not wiped (showed 9/10).

Longshot placed beside the Meadow Gate path and fired; Raider 100 → 61. Void on Elements placed and fired a dark splash; Raider took damage. No vortex. No barracks.

Leftover copy: title still “Six towers”; How to play still only names Arrow and Lightning for air.

Check 1x next session: Forest 1 smoke, then Keeps → Longshot and Elements → Void still shoot after a page reload.

## This session — play after art (Aug 21)

Vite had been running since before the art pass, so the first glance still said **click grass** on Fire/Hollow and showed leftover intro blurbs. Restarted the dev server (your Forest save was not wiped). After a refresh, HUD words are **click grass / sand / ice / ash / rune**.

Forest 1 smoke: title → Meadow Gate → grass opens the 2×3 tray → Arrow → Build → done. Second grass opens the tray again, not inspect. Path click blocked. Opening stretch Raiders face **right** and take damage. Sticky place stayed dead.

Every world 1 still feels like a place: Forest grass/trees, Desert sand/cacti, Ice snow/crystals, Fire cracked ash + lava path + ember portals (not Forest blue stone), Hollow rune-stone + vein path + hex gates. Magma Hound is a lava-rock dog, not a Warg. Shade flies. Hex Warden walks on the ground with a ward-disk; Cannon can still shoot him.

Verbs still fire (not wallpaper): Desert burrow / dash / sandstorm / caravan; Ice phase / slide / freeze; Fire smolder / crust / haze / erupt (two Magma Hound pups, no gold); Hollow hex / plate / seal / warp. Intros now match those verbs.

Headless sim (isolated storage): Ice 10 still holds. Bot still dies on rim maps (Forest 9, Desert 10, Fire 9–10, Hollow 9–10). Hollow 8 still holds without a late gold bump. Forest 10 still 320g. Did not retune gold. Did not regen any keeper.

## This session — world art pass (Aug 21)

Fire and Hollow got Forest-parity painted land and unique 4-dir keepers. Desert/Ice already held the bar — left them. East filenames face right. Magma Hound is a lava-hound, not a recolored Warg. Hex Warden is a walking seal-keeper, not a wyvern. Forest gold unchanged. Sticky place stayed dead.

Check 1x: Forest 1 smoke (place → wave → damage, path blocked). Fire 1 ash/lava path + Magma Hound body. Hollow 1 rune/vein path + Shade flying. Raiders on Meadow Gate’s first east stretch still face **right**.

## This session — Hollow land + verbs (Aug 21)

Hollow HUD says **click rune**. Rune-etched stone, glowing vein path, four rune props, hex gates + spire keep. Shade hexes the nearest keep (not a Wisp flicker). Hex Knight plates from Twin Hex. Hex Warden seals a tight bubble and stays on the ground. The Magician warps once — cover the landing. Hollow 8 held without a late gold bump. Forest gold unchanged. Sticky place stayed dead.

Check 1x: Forest 1 smoke (place → wave → damage, path blocked). Hollow 1 rune/vein path. Shade makes one keep cough. Knight shell melts under Poison. Warden hushes keeps beside him; Cannon can still shoot him. Magician yells Warp.

## This session — Fire land + verbs (Aug 21)

Fire HUD says **click ash**. Fire no longer stamps Forest portals. Magma Hound smolders, Cinder Brute crusts from Twin Caldera, Cinder King heat-haze, Ash Titan erupts (no gold). Late Fire 8–10 openings got the Desert-style gold bump. Forest gold unchanged. Sticky place stayed dead.

Check 1x: Forest 1 smoke (place → wave → damage, path blocked). Fire 1 ash/lava path. Hound knits unless burning. Brute shell melts under Fire. King makes Arrow hits feel weak; a Fire keep still punches. Titan yells Erupt.

## This session — Desert + forks landed (Aug 20/21)

Committed `1ac322c`, not pushed. Next window is **play**, then retune if it feels wrong.

Check 1x: Forest 1 smoke (place → wave → damage, path blocked). Desert 1 sand/portals. Scorpion ducks underground. Dune Runner zips. Tyrant makes nearby towers cough sand. Khan yells Caravan. Arrow Lv3 → two path buttons, click once to preview, again to pay. Sell refunds the path.

## Prior session — audit fix pass (Aug 20)

Walk east/west files were backwards (Meadow Gate’s opening stretch moonwalked). Swapped e/w walk + face frames for all ten keepers; raider-e now faces right. Re-keyed magenta halos on the 160 dir-walk frames (`tools/defringeWalks.py`). Dir-walk no longer gets the old bob/squash/sway on top — the four frames carry the gait.

Sticky place was tried and reverted — it was extra clicks in practice. Click grass → tray → Build, done. Inspect is on demand (click an existing keep). **Upgrade** is two clicks on the same button: first shows current → next stats (and the gold range ring); second pays. No third “are you sure?” card.

Arrow/Cannon fill more of the tile (wider base, bigger turret/barrel). Arrow bolts draw smaller so they read as arrows, not spears. Forest campaign thumbs stamp live grass/path tiles instead of a checkerboard; other worlds use hashed theme colors. HUD copy is `Wave running` (no trailing dash).

Still parked: unique Ice/Fire/Hollow bodies, a real music score, 14-arrow Forest 10 start gold, 7th tower, splash retune, Ice/lightning/fire/poison forks.

Check 1x: Forest 1 — place Arrow, click more grass, it should drop another without opening inspect. Right-click grass for the tray. Raiders on the first east stretch face **right**. Forest level cards should look painted, not checkerboard.

### Hard 0-life rule

Hard still hits 80% kill gold, 88% damage, 112% HP, 14 lives. Starting gold is no longer cut, so Forest 1 still opens with four Arrows. Start gold and kill bounties scale with world HP (Forest 1× … Hollow 1.68×), then Hard’s 80% income applies. Stage HP climb is unpaid — that’s the skill check. Early maps should 0-life with smart placement; later maps stay possible if you place and upgrade well, not a 14-arrow opening farm.

### Kill gold HUD was lying

Gold was already added in `collectBounties` on death. The HUD chip only refreshed on pause / place / sell / start wave / wave end, so the number sat still until the wave cleared. `onHud` now fires when a kill pays (and when a leak costs a life). `+Ng` floats are bigger with a dark stroke so they read at 1x. Amounts not retuned.

### Four-way walk / flap is in

Generated 4×4 sheets for all ten keepers and wired `public/sprites/enemies/walk/{creature}-{n,e,s,w}-1..4.png`. Down/up now cycle, not just face. Imp and hellbat flap; the rest walk. Check 1x: Forest 9 south stretch, then a left/right corner. Identity can drift a bit vs the still portraits — say if one creature looks like a cousin.

### Trays still eat a big chunk of the map

Aug 20 stronger pass: pin prefers a far edge / corner that misses the path and the range-ring box; card is more see-through (no blur, lighter center). Buttons stayed the same size. Still do not promise “never covers path.”

Aug 19 batch did the two levers we wrote down: pin tries right/left/below/above to miss path tiles, and `.map-panel` fades at the edges so the range ring can peek. It did **not** get the menu off the Forest. The 2×3 build card is still 196px wide, mostly-solid in the middle (~90% dark) plus a 5px blur, so it still sits on the meadow as a big dark rectangle. Inspect is smaller but the same language.

Forest 9 (Siege March): entrance is the top-left of the canvas, so the HUD bar sits right against the blue portal — that is the chrome above the map, not the tray. Do not mix those two.

Next pass if we pick it (do not shrink BCI buttons): stronger see-through (lower center opacity, less blur so the ring actually reads through more of the card), and/or pin farther away (empty grass / toward a screen edge, not 8px beside the tile). `clampPanel` can also slide a “left” pick back onto the path to stay on screen — fix that if we retouch pin. Still do not promise “never covers path.”

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
