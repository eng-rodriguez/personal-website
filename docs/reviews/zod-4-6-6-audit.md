# Lite review: pin zod 4.6.6 for GHSA-mrhx-c7xc-m3w5

Source: the CI `web` job on eng-rodriguez/personal-website#53 (PROJ-001) failed at `npm audit --audit-level=high --omit=dev`.

## Finding
`npm audit` reports a high-severity advisory against `zod <4.6.6`: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), "Zod can exhaust memory while validating oversized constrained collections". The project pinned `zod` to `4.6.5` (ADR 0006). `package.json` and `package-lock.json` on PR #53 are identical to `main`, and the same audit fails locally on the `main` lockfile, so the failure is not caused by PROJ-001 and also affects `main`. Typecheck, lint, tests and build did not run in that job because the audit step failed first.

Exposure is low: Zod only validates Frontmatter written by the site owner, at build time. The CI audit gate still has to pass.

## Change
- `zod` is pinned to `4.6.6`, the first patched release (`npm install --save-exact zod@4.6.6`, no `--force` or `--legacy-peer-deps`). The transitive copy used by `eslint-plugin-react-hooks` dedupes to the same version (`npm ls zod`).
- `CLAUDE.md` "Current state" lists `zod 4.6.6`. ADR 0006 keeps `4.6.5` as the version chosen at the time of that decision.

## Exception to the 2-week rule
ADR 0006 pins the content packages to releases at least 2 weeks old. `zod` 4.6.6 was published on 2026-10-11 16:18 UTC, so on 2026-10-24 it is 13 days old, one day short. The owner approved pinning it now instead of waiting, because the high-severity advisory blocks every PR's required `web` check. 4.6.7 (2026-10-12) is not used, because it is newer and not needed to clear the advisory.

Scope: `package.json`, `package-lock.json`, `CLAUDE.md` and this record. No code, configuration or CI change.

Risk: **Low**. A patch release of a validation library, with no API change used by the project, verified by the full check.

## Checkpoint
- Phase: change made; PR pending
- Baseline: `origin/main` 1b5c7f5; branch `fix/zod-4-6-6-audit`
- Approvals: owner chose a separate fix PR now, with the one-day exception to the 2-week rule
- Repairs used: 0
- How to verify:
  1. `npm ci` exits 0 with only the 3 known `ERESOLVE` notices.
  2. `npm ls zod` shows `zod@4.6.6` only.
  3. `npm audit --audit-level=high --omit=dev` exits 0.
  4. `npm run check` and `npm run e2e` exit 0.
- After merge: update eng-rodriguez/personal-website#53 from `main` so its `web` job reruns.
