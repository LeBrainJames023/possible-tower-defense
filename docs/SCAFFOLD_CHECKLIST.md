# Greenfield scaffold checklist

Default: **include everything** unless we agree to skip.

## Interview (agent asks first)

- Project type: game / app / tool / module
- Current MVP scope
- Future growth (files that may need splitting later)
- Solo or multiplayer (games)
- Public GitHub or private

## Day-one files (this template includes)

- [ ] Git + `.gitignore`
- [ ] README
- [ ] GitHub remote (user creates repo)
- [ ] ESLint + Prettier
- [ ] Husky + lint-staged
- [ ] Vitest + sample unit test
- [ ] `.env.example`
- [ ] `.cursor/README.md` + `.cursor/rules/` (include `impact-check.mdc` from template)
- [ ] User Rules snippet: paste from `docs/USER_RULES_COLLATERAL_IMPACT.md` if not already in Cursor Settings
- [ ] Dependabot
- [ ] GitHub Actions CI (lint + unit)
- [ ] `.editorconfig`
- [ ] `.nvmrc` (Node 20)
- [ ] `LICENSE`

## Add when project type needs it

| Type | Often add |
| --- | --- |
| Game / web UI | Playwright e2e, `ASSETS.md`, `DESIGN_GUIDE.md` |
| App with API | `docs/API.md`, staging env vars |
| Library / module | publish config, API docs |
| Media-heavy | asset log, approval before integrate |

## Post-v1 (circle back)

- CI e2e, axe accessibility, screenshot snapshots
- `.vscode/` recommended extensions
- Feature-branch policy
