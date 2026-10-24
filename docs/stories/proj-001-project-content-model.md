# Define the Project content model
Source: PROJ-001, https://github.com/eng-rodriguez/personal-website/issues/10 (labels: none shown). Dependency: FOUND-001.

As the site owner, I want every Project authored as a local MDX file whose Frontmatter is validated by a Zod schema, optionally carrying Case study sections, so that malformed or duplicate Projects fail the build and later pages (PROJ-002, PROJ-003, PROJ-004, HOME-003) can rely on a trusted, typed Project source.

Assumptions (approved by @eng-rodriguez):
- A1. Case study is a kind of Project, not a separate content type. A Project optionally carries Case study sections. This is consistent with ADR 0003, which places case studies under Projects (`/projects/<slug>` detail routes). It resolves the open item in `CLAUDE.md` "Unresolved architecture" and `docs/domain.md`. Alternative: a separate `case-studies` collection (rejected, because it would duplicate the schema and need a second route set).
- A2. Reuse of the pipeline (ADR 0006): `src/lib/projects.ts` is built on the shared loader in `src/lib/content` (`loadCollection`, `splitFrontmatter`, `compileContent`, and the reusable `slugSchema`, `isoDateSchema`, `nonEmptyText`). No new dependency. Layout: `content/projects/<slug>.mdx` at the repository root. One file per Project, no nested folders, non-`.mdx` files ignored. Slug rules, duplicate detection, the single collected `ContentError` naming the file, ENOENT returning `[]`, frozen results and production-only caching are inherited unchanged.
- A3. Schema (`projectFrontmatterSchema`, strict, unknown keys rejected):
  - `title`: non-empty string.
  - `slug`: required, lowercase kebab-case, equal to the filename without `.mdx`.
  - `summary`: non-empty string.
  - `role`: non-empty string (for example "Lead engineer").
  - `stack`: non-empty array of display strings (for example `TypeScript`, `Next.js`), no duplicates compared case-insensitively. Display strings are chosen over kebab-case tags because a stack entry is shown as written and names such as "Next.js" or "C#" are not valid kebab-case. Unlike Article tags, stack entries are not slugs.
  - `startedAt`: required ISO calendar date `YYYY-MM-DD`, and a real date.
  - `endedAt`: optional, same format, not before `startedAt`. It is rejected when `status` is `active` (an active Project has not ended).
  - `status`: enum `active`, `completed`, `archived`; required.
  - `featured`: boolean, default `false`.
  - `draft`: boolean, default `false`. The ticket's field list does not name `draft`, but the loader contract requires `{ slug, draft }` in the schema output, so it is included, with the Article rule: drafts are excluded when `NODE_ENV` is `production`, still validated, and included in development.
  - `links`: optional array of `{ label, url, kind }`, default `[]`. `kind` is an enum `repo`, `live`, `other`. `url` must be an absolute `https://` URL. At most one `repo` and one `live` link. Whether links resolve is not checked.
  - `cover`: optional `{ src, alt }`, same rules as the Article cover (`src` starts with `/`, `alt` non-empty). Existence under `public/` is not checked, and is left to PROJ-004.
  - `caseStudy`: boolean, default `false` (see A4).
  - Dates stay strings, with no timezone conversion.
- A4. Case study sections are modelled by the `caseStudy: true` frontmatter flag plus fixed `##` headings in the MDX body, in this order: `Problem`, `Approach`, `Decisions`, `Outcome` (the sections named in `docs/domain.md`). The loader checks the body when `caseStudy` is `true`: all four headings must be present exactly once, at level 2, in that order, content before the first heading is allowed as an introduction, and other `##` headings are allowed between or after the four. When `caseStudy` is `false`, the body has no such constraint. Chosen as the simplest option the build can validate, with no per-section frontmatter and no new MDX components. Alternative: a frontmatter `sections` list (rejected: duplicates the body and drifts from it). The heading check needs the MDX body to be parsed at load time. If the shared loader cannot do this in the schema stage, the check runs in `getProjects()` over the raw body with a code-fence-aware heading scan, and the brief must say which.
- A5. Allowlist: `projectComponents = {}`, the same empty allowlist as Articles. Expressions, `import`/`export` and unlisted components fail compilation naming the file.
- A6. API in `src/lib/projects.ts` (server-side): `getProjects()` returns published Projects' metadata sorted by `startedAt` descending then `slug` ascending, `[]` when the directory is empty or missing. `getProjectBySlug(slug)` returns the metadata or `undefined`. `compileProject(slug)` returns the metadata plus compiled React content. The types `Project` and `ProjectFrontmatter` are exported and inferred from the schema. `ContentMode` and `ContentOptions` are re-exported. Loader functions accept an optional content directory for tests. A `slug` argument that is not kebab-case is rejected.
- A7. Sample project: a fixture set, not published content. Fixtures under `src/lib/__fixtures__/projects/{valid,invalid,duplicate,drafts-only}` cover the cases, and the valid fixture includes a full case study. In addition, `content/projects/` is created with a `.gitkeep` so the layout exists, and no real Project is published (consistent with BLOG-001). Approved: fixtures only, no draft file in `content/projects`. A test validates the real `content/projects` directory in development mode, like `articles-content.test.ts`.
- A8. Build validation: `/projects` calls `getProjects()` at build time so `next build` fails on malformed content, and keeps its existing PageHeading and EmptyState when the list is empty (PROJ-002 renders the list). The assertion in `core-pages.test.tsx` that reads the real directory stays valid.
- A9. Docs: a new ADR 0007 records the Project model and the case-study decision (it does not amend ADR 0006, which stays the pipeline decision). `CLAUDE.md` marks the case-study item of "Unresolved architecture" as decided, adds ADR 0007 to "Approved decisions", and updates "Current state" and "Paths". `docs/domain.md` sets the code name `Project` (`src/lib/projects.ts`), redefines Case study as a Project with `caseStudy: true`, removes the case-study part of the unresolved note (the resume question stays), and extends Invariants to Projects. `docs/content.md` gains a Projects section (location, fields, case-study headings, draft rule). `content-source.test.ts` adds `projects.ts` to its module list, and `content-docs.test.ts` asserts the new terms.
- A10. No change to e2e tests. The route stays `/projects`.

## Acceptance criteria
1. Given a valid MDX file `content/projects/<slug>.mdx` with all fields, when `getProjects()` runs, then it returns that Project's metadata with `title`, `slug`, `summary`, `role`, `stack`, `startedAt`, `endedAt`, `status`, `featured`, `draft`, `links`, `cover` and `caseStudy`, and omitted optional fields take their defaults (`featured` `false`, `draft` `false`, `links` `[]`, `caseStudy` `false`, no `endedAt`, no `cover`).
2. Given a Project whose Frontmatter breaks the schema (missing or empty required field, empty `stack`, unknown `status`, bad date, `endedAt` before `startedAt`, `endedAt` on an `active` Project, non-`https` link URL, `cover` without `alt`, unknown key), when content is loaded or `next build` runs, then it fails with one error that names the file and each failing field.
3. Given two files that resolve to the same slug, or a file whose `slug` differs from its filename, when content is loaded or `next build` runs, then it fails with an error that names the files involved.
4. Given a Project with `caseStudy: true`, when its body lacks, repeats or reorders any of the headings `Problem`, `Approach`, `Decisions`, `Outcome`, then loading fails with an error naming the file and the heading. Given `caseStudy: true` with all four headings in order, then it is valid and `compileProject(slug)` returns the metadata plus renderable content.
5. Given a draft Project and `NODE_ENV` set to `production`, when `getProjects()`, `getProjectBySlug()` or `compileProject()` runs, then the draft is not returned. Given development mode, then it is returned, and a draft with invalid Frontmatter still fails.
6. Given several published Projects, when `getProjects()` runs, then they are ordered by `startedAt` descending and, for equal dates, by `slug` ascending, and given a missing or empty `content/projects` directory, or only drafts in production, then it returns `[]` without error. Featured Projects are identifiable through `featured` for HOME-003, without a separate ordering rule.
7. Given an MDX body with a JavaScript expression, an `import`, an `export` or a component not in the allowlist, when it is compiled, then no code is executed and compilation fails with an error naming the file.
8. Given the `/projects` route, when `npm run build` runs with an empty `content/projects`, then the build passes and the page still shows its PageHeading and its EmptyState, with the existing e2e tests unchanged. Given a malformed Project file in `content/projects`, then `npm run build` fails naming the file.
9. Given the fixtures (valid with a full case study, invalid, duplicate, drafts-only), when the unit tests run, then the sample Project validates and each invalid case is rejected with the expected file and field.
10. Given the change is applied, when I read ADR 0007, `CLAUDE.md`, `docs/domain.md` and `docs/content.md`, then the case-study-as-Project decision, the layout, the fields, the section headings, the draft rule and the "invalid content does not build" rule are documented, and the docs tests still pass.
11. Given the change is applied, when I run `npm run check`, then typecheck, ESLint with zero warnings, the Prettier check, the unit tests and the production build pass, and `npm run e2e` passes.
12. Given a `feat/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed literally in the brief (including `src/lib/projects.ts`, `src/app/projects/page.tsx`, `src/lib/__fixtures__/projects/**`, `content/projects/.gitkeep`, `CLAUDE.md`).

## Edge cases
- `content/projects` is missing or empty: returns `[]`, no error.
- File without a Frontmatter block, an unterminated `---` block, or a YAML syntax error: fails naming the file.
- Unknown key in Frontmatter: rejected (strict schema).
- Invalid calendar date such as `2026-02-30`, or a date with a time or timezone: rejected. `endedAt` equal to `startedAt` is allowed.
- `status: active` with an `endedAt`: rejected. `status: completed` or `archived` without `endedAt`: allowed.
- Duplicate `stack` entries (case-insensitive), an empty `stack`, or an empty string entry: rejected.
- Link with `http://`, a relative URL, a missing label, an unknown `kind`, or a second `repo` or `live` link: rejected. Reachability of a link is not checked.
- `cover.src` not starting with `/`, or `cover` without `alt`: rejected. File existence under `public/` is not checked.
- `caseStudy: true` with a missing, duplicated, misordered or level-3 section heading: rejected. A heading inside a code fence is not counted. `caseStudy: false` with those headings: allowed, no constraint.
- Uppercase, spaces or underscores in `slug`: rejected. A `slug` argument that is not kebab-case is rejected (no path traversal).
- `caseStudy: true` with an extra `##` section between or after the four headings: allowed.
- All Projects are drafts in production: `[]`, and a draft with invalid Frontmatter still fails the build.
- MDX syntax error, JS expression, `import`/`export` or non-allowlisted component in the body: fails naming the file, no code executed.
- Non-`.mdx` files (`.gitkeep`, README) and nested folders are ignored.
- Concurrency: in production, results are cached per process, so repeated calls during one build read and validate the files once.
- Prettier checks `.mdx` files, so fixtures and content must be formatted. ESLint does not lint `.mdx`.
- Vitest runs in jsdom by default; node-only loader tests need `// @vitest-environment node`.
- Pre-existing, unchanged: the 3 ESLint 10 `ERESOLVE overriding peer dependency` warnings and dev-only `npm audit` advisories.

## Out of scope
- Projects index UI, cards, filtering, ordering display (PROJ-002).
- Project detail pages and routes `/projects/<slug>`, case-study rendering and typography (PROJ-003).
- Media and link rendering, cover existence checks, image optimization (PROJ-004).
- Homepage previews of featured Projects (HOME-003).
- A separate case-study content type or collection.
- Professional experience and Resume content models.
- Publishing a real Project.
- Changes to the shared loader contract beyond what the case-study heading check needs.
- Backend services, authentication, CMS, database.
- Vercel deployment.
