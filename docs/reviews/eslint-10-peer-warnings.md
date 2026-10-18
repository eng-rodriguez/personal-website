# Lite review: keep ESLint 10 and accept peer-dependency warnings

Source: Minor finding from FOUND-001 manual verification (docs/briefs/found-001-initialize-nextjs-app.md, Manual verification, step 2).

## Finding
`npm ci` prints 3 `ERESOLVE overriding peer dependency` warnings. `eslint-plugin-import` 2.32.0, `eslint-plugin-jsx-a11y` 6.10.2 and `eslint-plugin-react` 7.37.5, the latest releases and all pulled in by `eslint-config-next` 16.4.2, declare ESLint peers up to `^9` only. The project uses ESLint 10.13.0. Lint runs correctly and `npm ls` is clean.

## Option tried
The first approved plan moved `eslint` to `^9.39.5`. On a clean install that removed the `ERESOLVE` warnings, and `npm ls`, `npm run check` (3 files, 5 tests) and `npm audit --audit-level=high --omit=dev` all exited 0. But `npm ci` then printed `npm warn deprecated eslint@9.39.5: This version is no longer supported`. ESLint 9 is end-of-life, so it no longer receives bug or security fixes.

## Decision
The owner chose to stay on ESLint 10 and accept the 3 peer warnings. They are cosmetic, and an unsupported linter is the worse trade. The ESLint 9 change was not merged. The warnings go away once those plugins declare ESLint 10 support. If that arrives as minor or patch releases within the ranges `eslint-config-next` declares, Dependabot's grouped minor and patch updates can bring it in; a new plugin major or an `eslint-config-next` major is ignored by Dependabot and needs a story. `CLAUDE.md` records the decision so the warnings are not "fixed" by downgrading.

This supersedes FOUND-001 brief D4, which said to pin `eslint` to `^9` when ESLint 10 is outside the plugins' peer range, and changes the expected result of that brief's manual verification step 2 from "no peer warnings" to exactly these 3 `ERESOLVE` warnings. `npm ls` still exits 0 with no invalid or missing peers.

Scope: documentation only (`CLAUDE.md` and this record). No dependency, configuration or CI change.

Risk: **Low**. Documentation only.

## Checkpoint
- Phase: decision recorded; PR pending
- Baseline: `origin/main` 2dc0f18; branch `docs/eslint-10-peer-warnings`
- Approvals: owner approved the ESLint 9 plan, then reversed it after the deprecation result and chose to stay on ESLint 10
- Repairs used: 0
- How to verify:
  1. `npm ci` prints exactly 3 `ERESOLVE overriding peer dependency` warnings, for eslint-plugin-import, eslint-plugin-jsx-a11y and eslint-plugin-react, and exits 0.
  2. `npm ls` exits 0 and shows `eslint@10.13.0`.
  3. `npm run check` exits 0.
