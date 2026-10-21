# Testing and quality gates

Decision record: [ADR 0005](adr/0005-playwright-smoke-tests-outside-check.md).

## Gates

| Gate       | Command                                   | Local              | CI job |
| ---------- | ----------------------------------------- | ------------------ | ------ |
| Typecheck  | `npm run typecheck`                       | `npm run check`    | `web`  |
| ESLint     | `npm run lint` (`--max-warnings=0`)       | `npm run check`    | `web`  |
| Prettier   | `npm run format:check`                    | `npm run check`    | `web`  |
| Vitest     | `npm test`                                | `npm run check`    | `web`  |
| Build      | `npm run build`                           | `npm run check`    | `web`  |
| Audit      | `npm audit --audit-level=high --omit=dev` | not in `check`     | `web`  |
| Playwright | `npm run e2e`                             | `npm run e2e` only | `e2e`  |

The `ci-ok` job aggregates every CI job and is the single required result.

## Why e2e is outside check

`npm run check` is fast and needs no browser. Playwright needs a downloaded browser and a production build, so it runs through its own script and CI job (ADR 0005). Passing `check` does not prove the smoke tests pass: run `npm run e2e` too.

## Local setup

Run `npx playwright install chromium` once per Playwright version (add `--with-deps` on Linux). The error "Executable doesn't exist" means the browser is not installed.

## Running

- All tests: `npm run e2e`. It builds the site and serves it on `http://127.0.0.1:3100`, then stops the server.
- One file: `npm run e2e -- e2e/theme.spec.ts`. Also `--headed` and `--ui`.
- Report: `npx playwright show-report`.
- Port 3100 avoids reusing a `npm run dev` server on 3000, so local runs test a production build. Outside CI an existing server on 3100 is reused, for example one started with `npm run build && npx next start --port 3100`. In CI an occupied port fails the run.

## Reading a CI failure

Download the `playwright-report-<attempt>` artifact from the run summary and unzip it. Run `npx playwright show-report <dir>`, then open the trace of the retried test (`npx playwright show-trace`). CI retries once; a test that passes on retry is shown as flaky. The repository is public, so anyone signed in to GitHub can download the artifact for its 7-day retention; it holds page snapshots and test sources only.

## Adding a smoke test

- Put it in `e2e/<area>.spec.ts` and import constants from `src/lib` with relative imports.
- Use role locators and web-first assertions. No sleeps.
- Name the route in the test title and in `expect` messages.
- Use only built-in fixtures (no `test.extend`). `.only`, `.skip` and `.fixme` fail lint.
- Chromium only. A viewport-specific spec sets `viewport` and `hasTouch` with file-level `test.use` (example: `e2e/mobile-navigation.spec.ts` at 375 by 667); the default project stays Desktop Chrome.
- Logic that does not need a browser belongs in Vitest.

## Upgrading Playwright

Keep an exact pin in `package.json` and follow the 2-week rule for new releases. After the upgrade run `npx playwright install chromium` again.
