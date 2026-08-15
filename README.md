# Possible Tower Defense

Indie tower defense experiment — Cursor workflow playground.

**Naming note:** The folder and GitHub repo can stay `possible-tower-defense` even if we later rename the *in-game* title. Treat this repo as the home for the experiment; the displayed game name is free to change.

## Play

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## What’s in the game

- **5 worlds × 10 maps** (50 stages), each with **10 waves**. Forest is home; then Desert, Ice, Fire, The Hollow.
- **6 towers** in a bottom dock: Arrow, Cannon, Ice, Lightning, Fire, Poison
- Towers **cannot** be placed on the path (or tree decoration tiles)
- Click enemies/towers to inspect; pause keeps the map visible
- Lives, gold economy, upgrades (to level 3), sell, speed 1x/2x, level unlock progress
- Clean procedural canvas art (drawn in code)

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local game server |
| `npm run build` | Typecheck + production build |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |

## Stack

Vite · TypeScript · Canvas 2D · Vitest · ESLint · Prettier · Husky

## BCI / input notes

Large click targets, click-to-place (no drag-and-drop), no hover-only actions.
