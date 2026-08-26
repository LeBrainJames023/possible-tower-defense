# Cursor Rules — Possible Tower Defense

## Three layers

| Layer | Where |
| --- | --- |
| Universal you | Cursor Settings → User Rules |
| This repo | `.cursor/rules/*.mdc` |
| Deep specs | `docs/` |

## Routing table

| Topic | Where |
| --- | --- |
| Core game behavior | `project-core.mdc` |
| Done checklist | `quality-gates.mdc` |
| Assets log | `docs/ASSETS.md` |
| Future ideas / continue prompt | `docs/FUTURE_FEATURES.md` |
| Daily play log (Aug 24) | `docs/DAILY_FEEDBACK_624.md` |
| Session start (open game in browser) | `session-start.mdc` |
| Post-kit plan (sound, sharpness, forks, endless) | `docs/GAME_ROADMAP.md` |
| Element fork names + jobs | `docs/FORK_PLAN.md` |
| Ten-keep / tray plan | `docs/TOWER_ROADMAP.md` |
| Ice / Fire / Hollow world passes | `docs/WORLD_ROADMAP.md` (worlds done) |
| Campaign / worlds | `docs/CAMPAIGN.md`, `src/game/worlds.ts` |
| Levels / waves / balance | `src/game/levels.ts`, `src/game/constants.ts`, `src/game/worlds.ts` |
| Enemy roster / kinds | `src/game/enemies.ts`, `src/game/worldRoster.ts` |
| Combat / hit rules | `src/game/combat.ts` (Game and tests share this) |
| Rendering / art | `src/game/renderer.ts` |
| Universal modes, handoffs | **User Rules** |
