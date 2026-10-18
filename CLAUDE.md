# personal-website
Personal engineering website featuring technical writing, projects, professional experience and resume. Context: personal.

## Current state
The Next.js App Router application is scaffolded at the repository root (`src/app`, placeholder home page, Vitest unit tests for the home page, the `@/*` alias and the scaffold configuration). No content, styling system, MDX or e2e tests yet. Installed versions from `package-lock.json`: next 16.4.2, react 19.3.1, typescript 6.0.3, eslint 10.13.0, prettier 3.9.10, vitest 5.0.5.
TypeScript is pinned with `~6.0.3` and stays below 7: the TypeScript 7 native port does not provide the compiler API that Next.js type checking and typescript-eslint load, and typescript-eslint 8.71 accepts `<6.1.0`. Move to 7 only through a story.
ESLint stays on 10 although `npm ci` prints 3 `ERESOLVE overriding peer dependency` warnings: the latest `eslint-plugin-import`, `eslint-plugin-jsx-a11y` and `eslint-plugin-react` used by `eslint-config-next` declare peers up to `^9` only, and ESLint 9 is end-of-life. Lint works; do not downgrade to silence the warnings (see `docs/reviews/eslint-10-peer-warnings.md`).

## Approved decisions (to implement)
These are decided. Implement them through approved stories; do not reopen them without a new decision recorded in `docs/adr/`.
- Framework: Next.js App Router with React.
- Language: TypeScript in strict mode.
- Styling and UI: Tailwind CSS and shadcn/ui.
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
- Content model: whether case studies are a kind of project or a separate type, and whether the resume is generated from professional experience or maintained separately (web page, PDF or both).
- Vercel Node.js setting must match `24.x` (decide in the deployment story).
- Playwright (not installed yet) and its place in `check`; target in CI: a local production build or a Vercel preview URL.
- Domain, analytics and any contact mechanism (none may add a backend without a new decision).

## Factory routing
- Application code: factory:react-builder with stack-react for components and hooks. Next.js App Router routing, rendering and data loading follow the framework's documentation for the installed version.
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
- Application: repository root; routes and components in `src/app`, shared modules in `src/lib`, imported through the `@/*` alias.
- Planning artifacts: `docs/domain.md`, `docs/adr/`, `docs/briefs/`, `docs/stories/`, `docs/closing-notes/`.
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
