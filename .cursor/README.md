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
| Future ideas | `docs/FUTURE_FEATURES.md` |
| Ice / Fire / Hollow world passes | `docs/WORLD_ROADMAP.md` (one land per agent) |
| Campaign / worlds | `docs/CAMPAIGN.md`, `src/game/worlds.ts` |
| Levels / waves / balance | `src/game/levels.ts`, `src/game/constants.ts`, `src/game/worlds.ts` |
| Enemy roster / kinds | `src/game/enemies.ts`, `src/game/worldRoster.ts` |
| Combat / hit rules | `src/game/combat.ts` (Game and tests share this) |
| Rendering / art | `src/game/renderer.ts` |
| Universal modes, handoffs | **User Rules** |
