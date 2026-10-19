# Set up engineering quality gates
Source: FOUND-005, https://github.com/eng-rodriguez/personal-website/issues/5 (labels: area:foundation, priority:p0, type:feature)

As the site owner, I want every pull request to run lint, format check, typecheck, unit tests, the production build and browser smoke tests, so that a change that breaks the site, its core routes or the theme toggle cannot be merged unnoticed.

Assumptions (approved by @eng-rodriguez):
- A1. ESLint 10, Prettier, Vitest, Testing Library and the CI jobs for lint, format check, typecheck, unit tests and build are already configured and passing (`npm run check`, `ci` workflow). This story verifies and documents them and adds only what is missing: Playwright and the smoke tests.
- A2. Playwright is added as `@playwright/test` pinned to 1.63.0 (the newest release at least 2 weeks old; 1.64.x is too new). Chromium only.
- A3. The smoke target is a local production build (`next build` then `next start`) started by Playwright. No Vercel preview is used, since no deployment exists.
- A4. An `e2e` npm script runs the smoke tests. A separate `e2e` CI job runs them, rebuilding the site itself rather than sharing the `web` job's build, and is added to the `ci-ok` gate. `npm run check` stays unchanged as the fast local gate. A new ADR supersedes the deferred part of ADR 0001.
- A5. Smoke tests live in `e2e/` at the repository root, outside the Vitest include pattern, and are typed and linted by the existing configuration.
- A6. The CI job keeps the existing devsecops rules: SHA-pinned actions, `persist-credentials: false`, least-privilege permissions, `pull_request` trigger, no secrets, and a timeout.
- A7. Testing documentation lives in `docs/testing.md`, alongside updates to `CLAUDE.md` and the new ADR.

## Acceptance criteria
1. Given a pull request, when the `ci` workflow runs, then it runs typecheck, ESLint with `--max-warnings=0`, the Prettier check, the unit tests and the production build (through `npm run check`), and the smoke tests (through `npm run e2e`), and the `ci-ok` gate fails if any of them fails.
2. Given a clean checkout with `npm ci`, when I run `npm run e2e`, then the Playwright smoke tests start the site from a production build, run in Chromium and pass, and the web server is stopped when they finish.
3. Given each of the five core routes (`/`, `/writing`, `/projects`, `/experience`, `/resume`), when the smoke tests load it, then the response succeeds, the page has exactly one `main` and one `h1`, the document title follows the `%s · <site name>` template, and the primary navigation is present with the current route marked.
4. Given the header on a core route with JavaScript enabled, when the smoke test chooses Dark in the "Theme" radio group, then the `html` element has `data-theme="dark"`, `localStorage` key `site-theme` holds the choice, and after a reload the choice and theme are still applied.
5. Given JavaScript is disabled, when the smoke test loads a core route, then the navigation is visible and no theme control is shown.
6. Given a smoke test fails in CI, when the job ends, then the Playwright report and traces are uploaded as a workflow artifact (with a pinned `actions/upload-artifact`), and nothing is uploaded when all tests pass.
7. Given the Playwright output folders (`playwright-report/`, `test-results/`, `blob-report/`), when I run the smoke tests locally, then they do not appear in `git status`, and ESLint and Prettier ignore them.
8. Given the change is applied, when I run `npm run check`, then typecheck, ESLint, the Prettier check, the unit tests (including `src/scaffold.test.ts`, updated if it asserts the script list) and the production build pass, and `npm audit --audit-level=high --omit=dev` passes.
9. Given the workflow change, when actionlint and zizmor run on `.github/`, then both report no findings, and the new job uses only SHA-pinned actions, `persist-credentials: false` and read-only permissions.
10. Given a `feat/` or `fix/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed in `docs/briefs/found-005-engineering-quality-gates.md`.
11. Given the change is applied, when I read the new ADR, `CLAUDE.md` (Current state, Existing commands, Testing) and `docs/testing.md`, then they describe: which gates run locally and in CI, the `e2e` script and why it is outside `check`, how to install the Chromium browser and run the smoke tests locally, how to read a failure artifact, and how to add a smoke test.
12. Given a deliberately broken change (for example a missing `h1` on a route), when the smoke tests run, then they fail with a message that names the route and the broken expectation. This is verified once and recorded in the closing notes, not committed.

## Edge cases
- Port already in use locally: the smoke run either reuses an existing server only outside CI, or fails with a clear message. In CI it always starts its own server.
- Server slow to start: Playwright waits for a readiness URL with a bounded timeout. The job has a timeout and does not hang.
- Flaky test: retries are allowed in CI only (at most 1), and a retried pass is visible in the report, not hidden. No `test.skip` or `.only` is merged (ESLint or `forbidOnly` enforces it).
- Browser install in CI: browsers are installed with `npx playwright install --with-deps chromium` (or the equivalent) from the pinned version. Any Playwright browser cache key includes the Playwright version.
- Hydration: the toggle is hidden until hydration, so tests wait for it to appear instead of using fixed sleeps.
- `npm ci --ignore-scripts` is used in CI, so browser download must not depend on a postinstall script.
- The `build` step in the `e2e` job duplicates the one in `web`; this cost is accepted.
- Fork pull requests and Dependabot pull requests: the job needs no secrets, so it runs the same way.
- Docs-only or `.github/`-only changes: the `changes` job filters (existing behavior) still apply, and `ci-ok` accepts a skipped `e2e` job.
- Pre-existing, unchanged: `npm audit` reports dev-only high advisories (the `--omit=dev` run passes), and the 3 ESLint 10 `ERESOLVE overriding peer dependency` warnings are accepted. Do not use `--force` or `--legacy-peer-deps`.
- `AGENTS.md` is untracked and must not be committed with this story.
- Playwright traces and screenshots may contain page content only; no secrets or personal data exist in the smoke target.

## Out of scope
- Testing against a Vercel preview or production URL (depends on the unresolved deployment ownership decision).
- A cross-browser or device matrix (Firefox, WebKit, mobile emulation).
- Visual regression testing and screenshot baselines.
- Accessibility scanning (axe or similar). A separate story can add it.
- Print, forced-colors and 320px verification in the browser (they stay with the existing unit tests and manual steps).
- Adding `e2e` to `npm run check`.
- Sharing the production build between the `web` and `e2e` jobs.
- Branch protection or required-status-check settings in GitHub (they live outside the repository). The owner must mark the new `ci-ok` result as required manually.
- Replacing or upgrading ESLint, Prettier, Vitest or Testing Library, or changing lint rules.
- Coverage thresholds and coverage reporting.
- Content tests (MDX, Zod schemas), since no content exists yet.
- A contributor README.
- Vercel deployment, and any new backend service, authentication, CMS or database.

## Decisions
- `e2e` stays outside `npm run check` and runs in its own CI job (approved).
- The `e2e` CI job rebuilds the site instead of sharing the `web` build (approved).
- Testing documentation lives in `docs/testing.md` (approved).
- Chromium only, with at most 1 retry in CI (approved with the story).
