# personal-website
Personal engineering website featuring technical writing, projects, professional experience and resume. Context: personal.

## Current state
The Next.js App Router application is scaffolded at the repository root (`src/app`, the `@/*` alias and the scaffold configuration, Vitest unit tests). Tailwind CSS v4 and shadcn/ui are installed (Button only, plus the UI primitives in `src/components/primitives`): tokens, themes and base styles are in `src/app/globals.css`, documented in `docs/design-system.md`. Installed versions: tailwindcss 4.3.3, @tailwindcss/postcss 4.3.3, radix-ui 1.6.7, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.0. The global shell (skip link, header with site name and primary navigation, one `main`, footer) wraps every route from the root layout; the five core routes (`/`, `/writing`, `/projects`, `/experience`, `/resume`) exist, the last four as placeholder pages, with metadata defaults and the `%s · <site name>` title template (see "Global shell" in `docs/design-system.md`). The UI primitives (PageHeading, Section, Card, Tag, Link, EmptyState, Grid) exist in `src/components/primitives`, with PageHeading on all five routes and EmptyState on the four placeholder routes (see "UI primitives" in `docs/design-system.md`). The visitor can choose System, Light or Dark in a header toggle; the choice is stored in `localStorage` and applied by an inline pre-paint script (ADR 0004), and the breakpoints are documented in `docs/design-system.md`. The Article content pipeline exists (`src/lib/articles.ts` on the shared loader in `src/lib/content`, ADR 0006): `content/articles` is empty, and `/writing` validates Article Frontmatter at build. Playwright smoke tests in `e2e/` cover the core routes, the shell, the theme toggle and the no-JavaScript page (Chromium only, see `docs/testing.md`). Installed versions from `package-lock.json`: next-mdx-remote 6.0.0, yaml 2.9.1, zod 4.6.5, next 16.4.2, react 19.3.1, typescript 6.0.3, eslint 10.13.0, prettier 3.9.10, vitest 5.0.5, @playwright/test 1.63.0.
TypeScript is pinned with `~6.0.3` and stays below 7: the TypeScript 7 native port does not provide the compiler API that Next.js type checking and typescript-eslint load, and typescript-eslint 8.71 accepts `<6.1.0`. Move to 7 only through a story.
ESLint stays on 10 although `npm ci` prints 3 `ERESOLVE overriding peer dependency` warnings: the latest `eslint-plugin-import`, `eslint-plugin-jsx-a11y` and `eslint-plugin-react` used by `eslint-config-next` declare peers up to `^9` only, and ESLint 9 is end-of-life. Lint works; do not downgrade to silence the warnings. This supersedes FOUND-001 brief D4 (see `docs/reviews/eslint-10-peer-warnings.md`).

## Approved decisions (to implement)
These are decided. Implement them through approved stories; do not reopen them without a new decision recorded in `docs/adr/`.
- Framework: Next.js App Router with React.
- Core routes and shell: five core routes and a root layout that owns the single `main` and the metadata defaults (ADR 0003, `docs/adr/0003-core-section-routes-and-shell.md`).
- Language: TypeScript in strict mode.
- Styling and UI: Tailwind CSS and shadcn/ui. Tailwind v4 CSS-first tokens, outline focus and a contrast test (ADR 0002, `docs/adr/0002-tailwind-v4-tokens-os-only-theming.md`). Theming: a three-option choice (System, Light, Dark) stored in `localStorage`, applied by an inline pre-paint script, with print always light (ADR 0004, `docs/adr/0004-theme-choice-with-pre-paint-script.md`, which supersedes the OS-only theming of ADR 0002).
- Content: local MDX files in `content/<type>/<slug>.mdx`, compiled with `next-mdx-remote`, with frontmatter parsed by `yaml` and validated by strict Zod schemas; expressions, `import`/`export` and JSX outside an allowlist fail the build (ADR 0006, `docs/adr/0006-mdx-content-pipeline.md`, authoring guide `docs/content.md`).
- Package manager: npm (`package-lock.json` is the lockfile).
- Node.js 24, pinned in `.nvmrc` and `package.json` `engines` (`24.x`); CI reads `.nvmrc` (ADR 0001, `docs/adr/0001-pin-node-24-and-check-script.md`).
- Scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `format:check`, `test`, `e2e`, `check`. `npm run check` is the complete local verification (ADR 0001).
- Testing: Vitest and React Testing Library for unit and component tests (installed); Playwright for end-to-end smoke tests (installed, Chromium only), run through `npm run e2e` outside `check`, in the CI `e2e` job, against a local production build (ADR 0005, `docs/adr/0005-playwright-smoke-tests-outside-check.md`).
- Code quality: ESLint and Prettier.
- CI: GitHub Actions.
- Hosting: Vercel.
- Architecture: static-first. No database, separate backend, authentication or CMS.
- Location: the Next.js application lives at the repository root unless a later approved decision changes it.

## Unresolved architecture
Decide these in stories or ADRs before implementing the parts they affect.
- Vercel deployment ownership: the Vercel Git integration or a GitHub Actions deploy, not both. Includes preview deployments, production branch and whether smoke tests also run against a Vercel preview.
- Rendering details: whether every route is fully static, and the use of revalidation or dynamic routes.
- Content model: the route set is decided in ADR 0003 and the Article schema in ADR 0006 (a Project schema is PROJ-001); still open: whether case studies are a kind of project or a separate type, and whether the resume is generated from professional experience or maintained separately (web page, PDF or both).
- Vercel Node.js setting must match `24.x` (decide in the deployment story).
- Content Security Policy: any future CSP must allow the inline theme script by its hash (ADR 0004).
- Domain, analytics and any contact mechanism (none may add a backend without a new decision).

## Factory routing
- Application code: factory:react-builder with stack-react for components and hooks. Next.js App Router routing, rendering and data loading follow the framework's documentation for the installed version.
- shadcn CLI: run only a pinned version at least 2 weeks old (`npx --yes shadcn@<version>`), never `@latest`; follow `docs/design-system.md` afterwards.
- `.github/`: factory:pipeline-builder with devsecops-gha.
- `.factory.yml` registers `web: { path: ., stack: react }` and `commands.check: npm run check`.

## Ownership and contracts
- Single repository, single application. Domain terms are in `docs/domain.md`.
- API contract artifacts: none. Static-first, so no API schema or generated client is expected.
- Content contract: the Zod schemas in `src/lib/articles.ts` (ADR 0006).

## Existing commands
- Complete verification from Git root: `npm run check` (typecheck, ESLint, Prettier check, Vitest, production build, stopping at the first failure). Playwright runs separately through `npm run e2e` (needs `npx playwright install chromium` once; builds and serves the site on port 3100).
- Install: `npm ci`. Run: `npm run dev` (http://localhost:3000). Build: `npm run build`.
- CI on pull requests: `ci` (gitleaks, actionlint and zizmor on `.github/` changes, brief scope check on `feat/`/`fix/` branches, `web` job running `npm ci --ignore-scripts`, `npm audit --audit-level=high --omit=dev` and `npm run check`, `e2e` job running the Playwright install, `npm run e2e` and uploading the report only on failure, `ci-ok` gate aggregating `web` and `e2e` among the others) and `pr-format`.
Never deploy from the development workflow. Unknown commands are not verification.

## Paths
- Application: repository root; routes and components in `src/app`, shadcn primitives in `src/components/ui`, UI primitives in `src/components/primitives`, shell components in `src/components/site`, core routes in `src/lib/navigation.ts`, shared modules in `src/lib`, content in `content/articles`, the Article API in `src/lib/articles.ts`, the shared content loader in `src/lib/content`, content fixtures in `src/lib/__fixtures__`, the authoring guide `docs/content.md`, the theme choice in `src/lib/theme.ts`, imported through the `@/*` alias. Styling configuration: `components.json`, `postcss.config.mjs`. Smoke tests in `e2e/`, configured by `playwright.config.ts`, documented in `docs/testing.md`.
- Planning artifacts: `docs/domain.md`, `docs/adr/`, `docs/briefs/`, `docs/stories/`, `docs/closing-notes/`, `docs/reviews/` (lite change records).
- CI: `.github/workflows/ci.yml`, `.github/workflows/pr-format.yml`, `.github/dependabot.yml`.

## Verification and recovery
- Run `npm run check` and `npm run e2e` locally; CI runs `check` in `web` and `e2e` in its own job. For workflow changes also run local actionlint and zizmor.
- No deployment exists yet. Release and recovery owner: @eng-rodriguez. Record the Vercel rollback procedure once deployment ownership is decided.

## Don't
- Add a database, separate backend, authentication or CMS without a new approved decision.
- Add a second deploy path to Vercel alongside the one chosen.
- Log credentials or sensitive personal data, or publish contact details beyond what is intended for the public site.
- Change framework, package manager or dependencies outside approved scope.
- Use `--force` or `--legacy-peer-deps` to install; fix the peer conflict instead.

## Lessons
