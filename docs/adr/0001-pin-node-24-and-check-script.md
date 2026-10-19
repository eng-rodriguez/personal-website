# 0001. Pin Node 24 and check script

- Status: Accepted; the deferred Playwright part (where `e2e` runs) is superseded by [ADR 0005](0005-playwright-smoke-tests-outside-check.md)
- Date: 2026-10-18
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [FOUND-001 story](../stories/found-001-initialize-nextjs-app.md), [FOUND-001 brief](../briefs/found-001-initialize-nextjs-app.md), https://github.com/eng-rodriguez/personal-website/issues/1

## Context
CLAUDE.md left two items unresolved that the first scaffold depends on: the Node.js version and how it is pinned locally, in CI and on Vercel, and the complete local check command with its npm script names. Without a pinned runtime, `npm ci` and `next build` can behave differently on a laptop and in GitHub Actions. Without one command that runs every check, the factory quality gate (`commands.check`), the CI web job and contributors would each assemble their own list of checks, and those lists would drift. Next.js 16 needs Node.js 20.9 or later. Node.js 24 is the current LTS line; under the Node.js release schedule it moves from Active to Maintenance LTS around 2026-10-20 and stays supported until April 2028. Playwright is not installed yet, so it cannot be part of the check today.

## Decision
We will pin Node.js 24 in three places that read the same value:
- `.nvmrc` contains `24`, used by nvm/fnm locally and by `actions/setup-node` through `node-version-file: .nvmrc` in CI.
- `package.json` sets `"engines": { "node": "24.x" }`, so npm reports `EBADENGINE` on a mismatched runtime. Vercel also reads this field when it chooses the build runtime.
- The Vercel project's Node.js setting is not changed here. The deployment story confirms it matches `24.x`.

We will expose these npm scripts. `npm run check` is the single complete local verification command, run from the repository root:

| Script | Runs |
| --- | --- |
| `typecheck` | `next typegen && tsc --noEmit` |
| `lint` | `eslint . --max-warnings=0` |
| `format:check` | `prettier --check .` |
| `test` | `vitest run` |
| `build` | `next build` |
| `check` | `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` |

The steps are joined with `&&`, so the first failure stops the run and returns a non-zero exit code. `.factory.yml` sets `commands.check: npm run check`, and the CI `web` job runs the same command. Playwright is still deferred. When it is added, an `e2e` script joins `check` (or a separate CI step is added) through its own decision.

## Consequences
- Positive: one runtime and one command are shared by local development, the factory quality gate and CI. A wrong Node.js version shows up as a visible npm warning instead of an obscure failure.
- Negative: `check` includes a production build, so every factory stop and CI run pays the cost of a build. Node.js 24 enters Maintenance LTS almost immediately, so a move to Node.js 26 has to be planned.
- Follow-ups: the Vercel deployment story confirms the project's Node.js setting matches `24.x`. Evaluate Node.js 26 once it reaches Active LTS. The Playwright story extends `check` or CI and updates this ADR's script table through a superseding ADR.

## Alternatives
- None recorded.
