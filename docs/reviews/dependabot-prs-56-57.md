# Lite review: Dependabot actions and npm-minor groups (PRs 56 and 57)

Sources: eng-rodriguez/personal-website#56 `ci: Bump the actions group with 2 updates` (head `7ec9d9d`) and eng-rodriguez/personal-website#57 `build(deps): Bump the npm-minor group with 4 updates` (head `e8b04f3`).

## Change
PR 56 changes only `.github/workflows/ci.yml`. Both actions stay pinned to full SHAs.

| Action | From | To | SHA | Released |
| --- | --- | --- | --- | --- |
| astral-sh/setup-uv | v10.3.0 | v10.3.2 | `07a047e6` | 2026-10-22 |
| actions/upload-artifact | v7.0.1 | v7.0.2 | `cf430e03` | 2026-10-07 |

PR 57 changes `package.json` and `package-lock.json`.

| Package | From | To | Released | Age on 2026-10-26 |
| --- | --- | --- | --- | --- |
| @playwright/test (dev, exact) | 1.63.0 | 1.64.1 | 2026-10-14 | 12 days |
| radix-ui | ^1.6.7 | ^1.8.1 | 2026-10-12 | 14 days |
| zod (exact) | 4.6.6 | 4.6.7 | 2026-10-12 | 14 days |
| postcss (dev) | ^8.5.23 | ^8.5.31 | 2026-10-18 | 8 days |

PR 57 failed the `web` job: `test_found005_e2e_script_runs_playwright_outside_check` (`src/scaffold.test.ts`) asserts the exact ADR 0005 pin `1.63.0`. No other test failed (608 of 609 passed) and `npm audit` reported 0 vulnerabilities.

## Plan (approved)
- PR 56: comment `@dependabot rebase` (the PR is behind `main`), then squash-merge after the owner confirms. No file changes.
- PR 57: merge `main` into the Dependabot branch and add one commit that sets the test's exact pin to `1.64.1` and updates the installed versions in `CLAUDE.md`. Run `npm ci`, `npm run check` and `npm run e2e` with the 1.64.1 browser, then the validator and security reviewer. Merge on or after 2026-10-28, when Playwright 1.64.1 meets the ADR 0005 2-week rule.
- Scope boundary: no `dependabot.yml` cooldown, no other dependency changes, no ADR edits.

Risk: PR 56 **Low** (CI only, read-only token, nothing deploys). PR 57 **Standard** (radix-ui and zod are runtime dependencies covered by unit and smoke tests; nothing deploys). Recovery for both: revert the merge commit on `main`.

## Check results
- PR 56 SHA to tag: both match (lightweight tags, checked through the GitHub API). Release notes: setup-uv v10.3.2 updates known checksums and docs; upload-artifact v7.0.2 improves retries on HTTP 429.
- PR 56 CI on `7ec9d9d`: `changes`, `secrets`, `workflows`, `web`, `e2e` and `ci-ok` passed.
- PR 57, local on `49f15cb` (Node 24.19.0, clean worktree):
  - `npm ci --ignore-scripts`: exit 0, with the known 3 ESLint 10 `ERESOLVE` peer warnings.
  - `npm audit --audit-level=high --omit=dev`: exit 0, 0 vulnerabilities.
  - `npm run check`: exit 0. Vitest 48 files, 656 tests passed. Build generated 7 static pages.
  - `npx playwright install chromium`: exit 0. `npx playwright --version` prints 1.64.1.
  - `npm run e2e`: exit 0, 46 passed.

- PR 56 after the rebase, head `9828669`: same two SHA lines. CI passed (`changes`, `secrets`, `workflows`, `web`, `e2e`, `ci-ok`). Merge state is clean. Local `actionlint`: exit 0. `zizmor==1.28.0 --offline --min-severity medium`: exit 0, no findings.

## Review findings
- Validator: passed. Both diffs match the plan and stay in scope. Exact pins stay exact, and the lockfile root matches `package.json`.
- Security: nothing Critical or Important.
  - Lockfile: every `resolved` URL is on `registry.npmjs.org`, every non-bundled entry has an integrity hash, and install scripts are unchanged (`fsevents`, `unrs-resolver`).
  - New entries: 6 bundled wasm fallback entries under `@tailwindcss/oxide-wasm32-wasi`, and `next/node_modules/postcss@8.5.23`, because Next pins postcss exactly. Removed: `vite/node_modules/postcss@8.5.30`.
  - 51 `@radix-ui/*` packages changed. The passing check and e2e runs cover them.
- Minor (process, both reviewers): Playwright 1.64.1 is 12 days old. The plan holds the merge until 2026-10-28.

## How to verify
1. On PR 57, `ci-ok`, `web` and `e2e` pass on the pushed head. Expected: all green.
2. On the merged `main`, `npm ls zod radix-ui @playwright/test` shows `zod@4.6.7`, `radix-ui@1.8.1` and `@playwright/test@1.64.1`. Expected: one version of each at the top level.
3. `npm run dev`, open `/` and toggle the theme between System, Light and Dark. Expected: the Radix Slot based Button and theme toggle behave as before.
4. On PR 56 after the rebase, `git grep -n 'setup-uv\|upload-artifact' .github/workflows/ci.yml` shows the two new SHAs. Expected: `07a047e6…` and `cf430e03…`.

## Checkpoint
- Phase: PR 56 merged (squashed as `4573b54` on 2026-10-27, after the owner confirmed). PR 57 merged (squashed as `9be10a1` on 2026-10-28, after the owner confirmed). Playwright 1.64.1 was 14 days old at that point, and CI was green on head `c52dd96`.
- Baseline: `origin/main` `8169aa4`. User checkout on `docs/home-003-ship-notes` with untracked `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` left untouched; PR 57 work done in a separate worktree.
- PR 57 branch: `87893fa` (merge of `main`), `49f15cb` (test pin and `CLAUDE.md`), pushed to the Dependabot branch. Dependabot no longer rebases it automatically. CI passed on `49f15cb` (`changes`, `secrets`, `web`, `e2e`, `ci-ok`). After PR 56 merged, `main` was merged in again as `c52dd96`, which adds only the two `ci.yml` SHA lines.
- PR 56: rebased by Dependabot to `9828669`, CI green.
- Approvals: the owner approved the lite plan on 2026-10-26. The merges still need the owner's confirmation.
- Repairs used: 0.
- Next: none. Manual checks 2 and 3 under How to verify are left for the owner.
