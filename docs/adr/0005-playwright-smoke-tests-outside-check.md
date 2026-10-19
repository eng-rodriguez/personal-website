# 0005. Playwright smoke tests outside check

- Status: Accepted
- Date: 2026-10-19
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [FOUND-005 story](../stories/found-005-engineering-quality-gates.md), [FOUND-005 brief](../briefs/found-005-engineering-quality-gates.md), https://github.com/eng-rodriguez/personal-website/issues/5. Supersedes the deferred Playwright part of [ADR 0001](0001-pin-node-24-and-check-script.md).

## Context
ADR 0001 made `npm run check` the single complete local verification command and deferred Playwright. It said that when Playwright arrives, an `e2e` script either joins `check` or runs as a separate CI step, through its own decision. FOUND-005 adds browser smoke tests for the five core routes, the shell and the theme toggle. Smoke tests need a downloaded browser and a production build. Adding them to `check` would make every factory stop and every local run pay for a browser install and a second server start. There is no deployment yet, so a Vercel preview URL cannot be the target. The owner approved the story decisions on 2026-10-19: `e2e` stays outside `check`, a separate CI job rebuilds the site, the target is a local production build, and only Chromium runs.

## Decision
We will:
- Add `@playwright/test` as a dev dependency pinned exactly (no range) to a release at least 2 weeks old, 1.63.0 at the time of writing. Upgrades follow the same 2-week rule and reinstall the browser.
- Add an `e2e` npm script (`playwright test`). `npm run check` stays as ADR 0001 defines it and does not run `e2e`.
- Keep smoke tests in `e2e/*.spec.ts` at the repository root, outside the Vitest include pattern, typechecked by `tsc` and linted by ESLint with the existing configuration.
- Have Playwright start its own server from a production build (`next build`, then `next start` on 127.0.0.1 port 3100). It reuses a server already on that port only outside CI, and in CI it always starts its own.
- Run only Chromium (desktop viewport), with at most 1 retry in CI and none locally, `forbidOnly` in CI, and traces on the first retry.
- Run the smoke tests in a separate `e2e` job in the `ci` workflow, in parallel with `web`. It installs the browser with `npx playwright install --with-deps chromium` after `npm ci --ignore-scripts`, does not cache browsers, uploads the report and traces only on failure, and is listed in `ci-ok`.

## Consequences
- Positive: `check` stays fast and needs no browser. Every pull request still gets a real-browser check of routes, shell and theme before `ci-ok` passes. The target is reproducible without deployment access or secrets.
- Negative: the production build runs twice per pull request (`web` and `e2e`), and the browser download adds time to each `e2e` run. Contributors must run `npm run e2e` separately, since `check` passing does not prove the smoke tests pass. A Vercel-specific failure (runtime settings, headers) is not caught.
- Follow-ups: the owner adds `ci-ok` as a required check if not already required (it already aggregates every job). The deployment story decides whether smoke tests also run against a Vercel preview. A later story can add accessibility scanning or more browsers.

## Alternatives
- Add `e2e` to `npm run check`: rejected by the owner to keep the local gate fast and browser-free.
- Share the `web` job's build with the `e2e` job through an artifact: rejected by the owner; the duplicated build is accepted for simpler, independent jobs.
- Test against a Vercel preview URL: not possible until deployment ownership is decided.
- Firefox, WebKit or mobile emulation: out of scope for this story.
