# Tools & stack (for the Cursor experiment)

## Runtime / frontend

| Piece | What it is |
| --- | --- |
| **Vite** | Dev server + production bundler |
| **TypeScript** | Typed game code |
| **Canvas 2D** | All map/tower/enemy drawing (no Phaser/Unity) |
| **HTML/CSS** | Menus, HUD, shop (not a React app) |
| **Google Fonts** | Syne + DM Sans |

No backend. No database. Progress is `localStorage` only.

## Dev tooling (npm packages)

| Package | Why |
| --- | --- |
| `vite` | Run/build the game |
| `typescript` | Typecheck |
| `vitest` | Unit/combat tests |
| `eslint` + `typescript-eslint` | Lint |
| `prettier` | Format |
| `husky` + `lint-staged` | Pre-commit checks |

## Not used

- No React/Vue
- No Phaser/Pixi
- No server/API
- No paid asset packs (art is drawn in `renderer.ts`)
