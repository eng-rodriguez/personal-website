# personal-website
Personal engineering website featuring technical writing, projects, professional experience and resume. Context: personal.

## Current state
The Next.js App Router application is scaffolded at the repository root (`src/app`, the `@/*` alias and the scaffold configuration, Vitest unit tests). Tailwind CSS v4 and shadcn/ui are installed (Button only): tokens, themes and base styles are in `src/app/globals.css`, documented in `docs/design-system.md`. Installed versions: tailwindcss 4.3.3, @tailwindcss/postcss 4.3.3, radix-ui 1.6.7, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.0. The global shell (skip link, header with site name and primary navigation, one `main`, footer) wraps every route from the root layout; the five core routes (`/`, `/writing`, `/projects`, `/experience`, `/resume`) exist, the last four as placeholder pages, with metadata defaults and the `%s · <site name>` title template (see "Global shell" in `docs/design-system.md`). The visitor can choose System, Light or Dark in a header toggle; the choice is stored in `localStorage` and applied by an inline pre-paint script (ADR 0004), and the breakpoints are documented in `docs/design-system.md`. No content, MDX or e2e tests yet. Installed versions from `package-lock.json`: next 16.4.2, react 19.3.1, typescript 6.0.3, eslint 10.13.0, prettier 3.9.10, vitest 5.0.5.
TypeScript is pinned with `~6.0.3` and stays below 7: the TypeScript 7 native port does not provide the compiler API that Next.js type checking and typescript-eslint load, and typescript-eslint 8.71 accepts `<6.1.0`. Move to 7 only through a story.
ESLint stays on 10 although `npm ci` prints 3 `ERESOLVE overriding peer dependency` warnings: the latest `eslint-plugin-import`, `eslint-plugin-jsx-a11y` and `eslint-plugin-react` used by `eslint-config-next` declare peers up to `^9` only, and ESLint 9 is end-of-life. Lint works; do not downgrade to silence the warnings. This supersedes FOUND-001 brief D4 (see `docs/reviews/eslint-10-peer-warnings.md`).

## Approved decisions (to implement)
These are decided. Implement them through approved stories; do not reopen them without a new decision recorded in `docs/adr/`.
- Framework: Next.js App Router with React.
- Core routes and shell: five core routes and a root layout that owns the single `main` and the metadata defaults (ADR 0003, `docs/adr/0003-core-section-routes-and-shell.md`).
- Language: TypeScript in strict mode.
- Styling and UI: Tailwind CSS and shadcn/ui. Tailwind v4 CSS-first tokens, outline focus and a contrast test (ADR 0002, `docs/adr/0002-tailwind-v4-tokens-os-only-theming.md`). Theming: a three-option choice (System, Light, Dark) stored in `localStorage`, applied by an inline pre-paint script, with print always light (ADR 0004, `docs/adr/0004-theme-choice-with-pre-paint-script.md`, which supersedes the OS-only theming of ADR 0002).
- Content: local MDX files in the repository, with frontmatter validated by Zod schemas.
- Package manager: npm (`package-lock.json` is the lockfile).
- Node.js 24, pinned in `.nvmrc` and `package.json` `engines` (`24.x`); CI reads `.nvmrc` (ADR 0001, `docs/adr/0001-pin-node-24-and-check-script.md`).
- Scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format`, `format:check`, `test`, `check`. `npm run check` is the complete local verification (ADR 0001).
- Testing: Vitest and React Testing Library for unit and component tests (installed); Playwright for end-to-end tests (approved, not installed yet).
- Code quality: ESLint and Prettier.
- CI: GitHub Actions.
- Hosting: Vercel.
- Architecture: static-first. No database, separate backend, authentication or CMS.
- Location: the Next.js application lives at the repository root unless a later approved decision changes it.

## Unresolved architecture
Decide these in stories or ADRs before implementing the parts they affect.
- Vercel deployment ownership: the Vercel Git integration or a GitHub Actions deploy, not both. Includes preview deployments and production branch.
- Rendering details: whether every route is fully static, and the use of revalidation or dynamic routes.
- MDX pipeline: the loader/compiler library, the content directory layout and the Zod schema per content type.
- Content model: the route set is decided in ADR 0003; still open: whether case studies are a kind of project or a separate type, and whether the resume is generated from professional experience or maintained separately (web page, PDF or both).
- Vercel Node.js setting must match `24.x` (decide in the deployment story).
- Playwright (not installed yet) and its place in `check`; target in CI: a local production build or a Vercel preview URL.
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
- Content contract: the Zod schemas for MDX frontmatter, once written.

## Existing commands
- Complete verification from Git root: `npm run check` (typecheck, ESLint, Prettier check, Vitest, production build, stopping at the first failure). Playwright is not part of it yet.
- Install: `npm ci`. Run: `npm run dev` (http://localhost:3000). Build: `npm run build`.
- CI on pull requests: `ci` (gitleaks, actionlint and zizmor on `.github/` changes, brief scope check on `feat/`/`fix/` branches, `web` job running `npm ci --ignore-scripts`, `npm audit --audit-level=high --omit=dev` and `npm run check`, `ci-ok` gate) and `pr-format`.
Never deploy from the development workflow. Unknown commands are not verification.

## Paths
- Application: repository root; routes and components in `src/app`, shadcn primitives in `src/components/ui`, shell components in `src/components/site`, core routes in `src/lib/navigation.ts`, shared modules in `src/lib`, the theme choice in `src/lib/theme.ts`, imported through the `@/*` alias. Styling configuration: `components.json`, `postcss.config.mjs`.
- Planning artifacts: `docs/domain.md`, `docs/adr/`, `docs/briefs/`, `docs/stories/`, `docs/closing-notes/`, `docs/reviews/` (lite change records).
- CI: `.github/workflows/ci.yml`, `.github/workflows/pr-format.yml`, `.github/dependabot.yml`.

## Verification and recovery
- Run `npm run check` locally; CI runs the same command. For workflow changes also run local actionlint and zizmor.
- No deployment exists yet. Release and recovery owner: @eng-rodriguez. Record the Vercel rollback procedure once deployment ownership is decided.

## Don't
- Add a database, separate backend, authentication or CMS without a new approved decision.
- Add a second deploy path to Vercel alongside the one chosen.
- Log credentials or sensitive personal data, or publish contact details beyond what is intended for the public site.
- Change framework, package manager or dependencies outside approved scope.
- Use `--force` or `--legacy-peer-deps` to install; fix the peer conflict instead.

## Lessons
