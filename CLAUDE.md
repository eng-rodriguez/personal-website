# personal-website
Personal engineering website featuring technical writing, projects, professional experience and resume. Context: personal.

## Current state
The repository contains no application yet: no `package.json`, lockfile, source or tests. Only factory configuration, docs and the baseline GitHub Actions checks exist. Versions are recorded from the lockfile once the app is scaffolded; nothing below is a detected installed fact.

## Approved decisions (to implement)
These are decided. Implement them through approved stories; do not reopen them without a new decision recorded in `docs/adr/`.
- Framework: Next.js App Router with React.
- Language: TypeScript in strict mode.
- Styling and UI: Tailwind CSS and shadcn/ui.
- Content: local MDX files in the repository, with frontmatter validated by Zod schemas.
- Package manager: npm (`package-lock.json` is the lockfile).
- Testing: Vitest and React Testing Library for unit and component tests; Playwright for end-to-end tests.
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
- Node.js version, and how it is pinned locally, in CI and on Vercel.
- The complete local check command and npm script names.
- Playwright target in CI: a local production build or a Vercel preview URL.
- Domain, analytics and any contact mechanism (none may add a backend without a new decision).

## Factory routing
- Application code: factory:react-builder with stack-react for components and hooks. Next.js App Router routing, rendering and data loading follow the framework's documentation for the installed version.
- `.github/`: factory:pipeline-builder with devsecops-gha.
- `.factory.yml` registers no application area until the Next.js app exists. Then register `web: { path: . }` with the stack and `commands.check` in the same change.

## Ownership and contracts
- Single repository, single application. Domain terms are in `docs/domain.md`.
- API contract artifacts: none. Static-first, so no API schema or generated client is expected.
- Content contract: the Zod schemas for MDX frontmatter, once written.

## Existing commands
- Complete verification from Git root: none yet. It will combine type checking, ESLint, Prettier, Vitest and Playwright; the exact command is unresolved.
- Build/run: not applicable yet.
- CI on pull requests: `ci` (gitleaks, actionlint and zizmor on `.github/` changes, brief scope check on `feat/`/`fix/` branches, `ci-ok` gate) and `pr-format`.
Never deploy from the development workflow. Unknown commands are not verification.

## Paths
- Application: repository root (intended; not scaffolded).
- Planning artifacts: `docs/domain.md`, `docs/adr/`, `docs/briefs/`, `docs/stories/`, `docs/closing-notes/`.
- CI: `.github/workflows/ci.yml`, `.github/workflows/pr-format.yml`, `.github/dependabot.yml`.

## Verification and recovery
- Until the app exists, verification is the GitHub Actions checks above plus local actionlint and zizmor for workflow changes.
- No deployment exists yet. Release and recovery owner: @eng-rodriguez. Record the Vercel rollback procedure once deployment ownership is decided.

## Don't
- Add a database, separate backend, authentication or CMS without a new approved decision.
- Add a second deploy path to Vercel alongside the one chosen.
- Log credentials or sensitive personal data, or publish contact details beyond what is intended for the public site.
- Change framework, package manager or dependencies outside approved scope.

## Lessons
