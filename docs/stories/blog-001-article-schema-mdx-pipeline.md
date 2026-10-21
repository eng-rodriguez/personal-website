# Define the Article schema and MDX pipeline
Source: BLOG-001, https://github.com/eng-rodriguez/personal-website/issues/14 (labels: area:blog, priority:p0, type:feature). Dependency: FOUND-001.

As the site owner, I want every Article authored as a local MDX file whose Frontmatter is validated by a Zod schema and whose body is compiled safely at build time, with drafts kept out of production, so that invalid or duplicate content fails the build and later pages (HOME-003, BLOG-002, BLOG-003) can rely on a trusted, typed Article source.

Assumptions (approved by @eng-rodriguez):
- A1. Library: `next-mdx-remote` 6.0.0 (`compileMDX` from `next-mdx-remote/rsc`, Server Components only, compiled at build time for static routes) compiles the MDX. Its defaults `blockJS: true` and `blockDangerousJS: true` stay on. In addition, a body that contains a JavaScript expression, an `import` or an `export` is rejected with an error naming the file, so the build fails instead of silently dropping text. The only components available to MDX are those in an explicit allowlist map passed from code (an empty map in this story). Frontmatter is parsed with the `yaml` package (2.x) from a `---` fenced block, then validated with Zod 4 (`zod` becomes a direct dependency). The new runtime dependencies are `zod`, `next-mdx-remote` and `yaml`, with exact versions pinned in the brief, each at least 2 weeks old. Alternatives considered for the ADR: `@next/mdx` (bundler-imported modules, needs remark frontmatter plugins and dynamic imports to list articles), velite or content-collections (extra build step and tooling), raw `@mdx-js/mdx` `evaluate`.
- A2. Layout: `content/articles/<slug>.mdx` at the repository root, outside `src`. One file per Article, no nested folders. Files that are not `.mdx` are ignored.
- A3. Schema (strict, unknown keys rejected):
  - `title`: non-empty string.
  - `slug`: required, lowercase kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), and equal to the filename without `.mdx`.
  - `description`: non-empty string.
  - `publishedAt`: ISO calendar date `YYYY-MM-DD`, and a real date.
  - `updatedAt`: optional, same format, not before `publishedAt`.
  - `tags`: array of lowercase kebab-case strings, default `[]`, no duplicates.
  - `draft`: boolean, default `false`.
  - `featured`: boolean, default `false`.
  - `cover`: optional object `{ src, alt }`. `src` is a string starting with `/` (a file under `public/`) and `alt` is a non-empty string. Whether the file exists under `public/` is left to BLOG-003.
  - Dates stay strings, with no timezone conversion.
  - Tags are free kebab-case strings, not a closed list.
- A4. Drafts are excluded whenever `process.env.NODE_ENV === "production"` (`next build` and `next start`, so Vercel previews too). They are included in `next dev`, and tests can inject the mode. Drafts are still validated. Publication is controlled only by `draft`: a future `publishedAt` is not hidden.
- A5. API in `src/lib/articles.ts` (server-side, `node:fs`):
  - `getArticles()` returns the metadata of all published Articles (non-draft in production), sorted by `publishedAt` descending then `slug` ascending. It returns `[]` when the directory is empty or missing.
  - `getArticleBySlug(slug)` returns the metadata or `undefined`.
  - `compileArticle(slug)` (or similar) returns the metadata plus the compiled React content.
  - The types `Article` and `ArticleFrontmatter` are exported and inferred from the Zod schema.
  - Loader functions accept an optional content directory for tests. Results are cached per process in production only, so `next dev` picks up content edits without a restart.
- A6. Build failure: any loader call throws a single error that names the file and the failing fields. It covers invalid Frontmatter, a filename/slug mismatch and duplicate slugs, with all errors collected. To make `next build` validate content now, `/writing` calls `getArticles()` at build time. It keeps the existing EmptyState when the list is empty (BLOG-002 renders the list). No sample Article is published. Test fixtures under `src/lib/__fixtures__/articles` (or similar) cover valid, draft, invalid and duplicate cases. `content/articles` is created with a `.gitkeep` or README so the layout exists.
- A7. Docs: ADR 0006 records the pipeline. In `CLAUDE.md`, the MDX item in "Unresolved architecture" is marked decided and moved to "Approved decisions", and "Current state" is updated. The Article and Frontmatter terms in `docs/domain.md` are updated (code names, invariants confirmed). A short authoring guide, `docs/content.md`, covers where to put files, the fields and the draft behavior.
- A8. No change to e2e tests; the existing ones stay green. The route stays `/writing` (BLOG-002's "/blog" naming is out of scope here).

## Acceptance criteria
1. Given a valid MDX file `content/articles/<slug>.mdx` with all fields, when `getArticles()` runs, then it returns that Article's metadata with `title`, `slug`, `description`, `publishedAt`, `updatedAt`, `tags`, `draft`, `cover` and `featured`, and omitted optional fields take their defaults (`tags` `[]`, `draft` `false`, `featured` `false`, no `updatedAt`, no `cover`).
2. Given an Article whose Frontmatter breaks the schema (missing or empty required field, bad date, unknown key, `updatedAt` before `publishedAt`, duplicate tags, `cover` without `alt`), when content is loaded or `next build` runs, then it fails with one error that names the file and each failing field.
3. Given a file whose `slug` differs from its filename, or two files that resolve to the same slug, when content is loaded or `next build` runs, then it fails with an error that names the files involved.
4. Given a draft Article and `NODE_ENV` set to `production`, when `getArticles()`, `getArticleBySlug()` or `compileArticle()` runs, then the draft is not returned. Given development mode, then the draft is returned.
5. Given several published Articles, when `getArticles()` runs, then they are ordered by `publishedAt` descending and, for equal dates, by `slug` ascending, and given a missing or empty `content/articles` directory, or only drafts in production, then it returns `[]` without error.
6. Given a trusted local MDX body with Markdown, when `compileArticle(slug)` runs, then it returns the metadata and renderable React content generated at build time, with no runtime compilation in the browser.
7. Given an MDX body with a JavaScript expression (for example `{process.env.SECRET}`), an `import` or an `export`, or a component not in the allowlist, when it is compiled, then no code is executed and compilation fails with an error naming the file (and, through `/writing` or any later page, `next build` fails).
8. Given the `/writing` route, when `npm run build` runs with an empty `content/articles`, then the build passes and the page still shows its PageHeading and the "No articles yet" EmptyState, with the existing e2e tests unchanged.
9. Given the change is applied, when I read `docs/adr/0006-*`, `CLAUDE.md`, `docs/domain.md` and the authoring guide, then the pipeline decision, the layout, the fields, the draft rule and the "invalid content does not build" rule are documented, and the existing docs tests still pass.
10. Given the change is applied, when I run `npm run check`, then typecheck, ESLint with zero warnings, the Prettier check, the unit tests (loader, schema and compile tests, using fixtures) and the production build pass, and `npm run e2e` passes.
11. Given the new runtime dependencies, when CI runs `npm audit --audit-level=high --omit=dev`, then it passes, and `npm ci` needs no `--force` or `--legacy-peer-deps`.
12. Given a `feat/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed in the brief.

## Edge cases
- `content/articles` is missing or empty: returns `[]`, no error.
- File without a Frontmatter block, or an unterminated `---` block: fails naming the file.
- YAML syntax error: fails naming the file and the parse error.
- Unknown key in Frontmatter: rejected (strict schema).
- Invalid calendar date such as `2026-02-30`, or a date with a time or timezone: rejected.
- `updatedAt` equal to `publishedAt` is allowed; before it is rejected.
- Uppercase, spaces or underscores in `slug` or a tag: rejected. Duplicate tags: rejected.
- Slug/filename mismatch is the main way two files could share a slug. The mismatch rule catches it, and an explicit duplicate check is kept anyway.
- All Articles are drafts in production: `[]`, and a draft with invalid Frontmatter still fails the build.
- `cover.src` not starting with `/`, or `cover` without `alt`: rejected. The file's existence under `public/` is not checked here.
- MDX syntax error in the body: fails naming the file.
- MDX body with JS expressions, `import` or `export`: rejected, no code is executed (see AC 7).
- A component not in the allowlist: MDX's missing-component error, naming the file.
- Non-`.mdx` files (`.gitkeep`, README, `.md`) and nested folders are ignored.
- Concurrency: in production, results are cached per process, so repeated calls during one build read and validate the files once.
- Permissions: the loader only reads files under the content directory and rejects a `slug` argument that is not kebab-case (no path traversal).
- Prettier checks `.mdx` files, so fixtures and content must be formatted. ESLint does not lint `.mdx`.
- Vitest runs in jsdom by default; node-only loader tests need `// @vitest-environment node`.
- Pre-existing, unchanged: the 3 ESLint 10 `ERESOLVE overriding peer dependency` warnings and dev-only `npm audit` advisories.

## Out of scope
- Blog index UI, date ordering display, tag filtering, pagination (BLOG-002).
- Article pages and route, typography, code highlighting, image and cover rendering, SEO (BLOG-003).
- Homepage previews of recent and featured Articles (HOME-003).
- RSS, tag pages, search, reading time.
- Project, Case study and Professional experience content models (PROJ-001 reuses this pipeline).
- Publishing a real or sample Article.
- Renaming `/writing` to `/blog`.
- Backend services, authentication, CMS, database.
- Vercel deployment.
