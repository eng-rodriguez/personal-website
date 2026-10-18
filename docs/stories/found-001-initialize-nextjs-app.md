# Initialize Next.js application
Source: FOUND-001, https://github.com/eng-rodriguez/personal-website/issues/1

As the site owner, I want a Next.js App Router application scaffolded at the repository root with strict TypeScript, a lockfile and a single verification command, so that later stories can build the website on a checked, reproducible foundation.

## Acceptance criteria
1. Given a fresh clone with the pinned Node.js version, when I run `npm ci` and then `npm run build`, then the production build completes with exit code 0.
2. Given the scaffolded application, when I run `npm run typecheck`, then it passes with TypeScript `strict` mode enabled in `tsconfig.json`.
3. Given the scaffolded application, when I run `npm run lint` and `npm run format:check`, then both pass with no errors.
4. Given the scaffolded application, when I run `npm test`, then the unit tests pass, including at least one Vitest and React Testing Library smoke test that renders the home page.
5. Given a fresh clone, when I run `npm run check`, then it runs type check, ESLint, Prettier check, unit tests and production build in sequence, and exits non-zero if any of them fails.
6. Given the source tree, when a module under `src/` is imported through the `@/*` path alias, then it resolves in the type check, the build and the unit tests.
7. Given a fresh clone, when I follow the README local setup section, then I can install dependencies, run the dev server, open the home page, and run `npm run check`. The README states the required Node.js version, the npm script names and how to copy `.env.example`.
8. Given the repository, when I inspect it, then `package-lock.json` is committed, `.gitignore` excludes `node_modules`, `.next` and local env files, and `.env.example` documents its purpose with comments only and no secret values.
9. Given the repository, when I inspect it, then Node.js 24 is pinned in `.nvmrc` and in `package.json` `engines`.
10. Given the change is applied, when I read `.factory.yml`, then the `web` area is registered with `path: .`, its stack, and `commands.check` set to `npm run check`.
11. Given a pull request, when the `ci` workflow runs, then a web job installs dependencies with `npm ci` on the pinned Node.js version using SHA-pinned actions, runs `npm run check`, and `ci-ok` fails if that job fails.
12. Given the change is applied, when I read `.github/dependabot.yml`, then an `npm` ecosystem entry for `/` exists alongside the existing `github-actions` entry.
13. Given the change is applied, when I read `CLAUDE.md`, then Current state, Existing commands and the Node.js decision reflect the scaffolded application and the installed versions from the lockfile.

## Edge cases
- Wrong Node.js version: `.nvmrc` and `package.json` `engines` make the mismatch visible instead of failing obscurely.
- Lockfile drift: `npm ci` fails if `package-lock.json` does not match `package.json`, so both are committed together.
- `.env.example` has no variables yet, so the build and tests pass with no `.env` file present.
- A failing step inside `npm run check` stops the command and returns a non-zero exit code; it is not masked.
- The `@/*` alias resolves the same way in the build and in Vitest.
- Prettier and ESLint do not conflict, so a formatted file never fails lint.
- Existing files (README, `.github/`, `docs/`) are preserved. The scaffold adds no network calls, secrets or analytics.
- The home page may be a placeholder. The smoke test does not depend on final copy.
- The CI web job uses read-only permissions and does not persist checkout credentials.

## Out of scope
- Tailwind CSS and shadcn/ui setup (separate story). The scaffold is created without them.
- MDX pipeline, content directory layout and Zod frontmatter schemas.
- Playwright and end-to-end tests. Only Vitest and React Testing Library are installed now.
- Vercel deployment, preview deployments and the production branch.
- Real page design, navigation, resume, projects or writing pages.
- Domain, analytics and contact mechanism.
- New backend services, authentication, CMS and database.
