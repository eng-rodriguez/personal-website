# 0006. MDX content pipeline

- Status: Accepted
- Date: 2026-10-20
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [BLOG-001 story](../stories/blog-001-article-schema-mdx-pipeline.md), [BLOG-001 brief](../briefs/blog-001-article-schema-mdx-pipeline.md), https://github.com/eng-rodriguez/personal-website/issues/14. Resolves the "MDX pipeline" item of "Unresolved architecture" in `CLAUDE.md`.

## Context
The approved decisions say content is local MDX in the repository with Frontmatter validated by Zod, and the site is static-first with no CMS or backend. The loader, the directory layout and the per-type schema were left open. BLOG-001 needs them for Articles, and HOME-003, BLOG-002, BLOG-003 and PROJ-001 build on the result. MDX is a JavaScript dialect: `{...}` expressions, `import`, `export` and JSX run as code when compiled and evaluated, so content must not be able to execute code during `next build`. Invalid content must fail the build instead of shipping. The owner approved the story decisions on 2026-10-20.

## Decision
We will:
- Compile MDX with `next-mdx-remote` 6.0.0, using `compileMDX` from `next-mdx-remote/rsc` in Server Components only, at build time for static routes. No MDX compiler or runtime reaches the browser.
- Keep its `blockJS` and `blockDangerousJS` defaults on, and also reject, with an error naming the file, any body containing a JavaScript expression, an `import`, an `export`, an attribute expression or a JSX element (including HTML-like tags) whose name is not in an explicit component allowlist passed from code. The rejection runs as a local remark plugin on the original tree, so content fails the build instead of being silently stripped. The Article allowlist is empty for now.
- Split the `---` Frontmatter block ourselves and parse it with `yaml` 2.9.1 (core schema, so dates stay strings), then validate it with a strict Zod 4 schema per content type (`zod` 4.6.5, unknown keys rejected). Article is the first type; PROJ-001 adds Project on the same loader with its own schema.
- Store content at the repository root as `content/<type>/<slug>.mdx`, one file per entry, no nested folders; other files are ignored. The `slug` field is required and must equal the filename; slugs are lowercase kebab-case and unique per type.
- Exclude drafts whenever `NODE_ENV` is `production` (`next build`, `next start`, Vercel previews), include them in development, and validate them in every mode. Publication depends only on `draft`, not on dates.
- Collect every invalid file and field into one error per load. Pages call the loader during prerendering (`/writing` calls `getArticles()`), so `next build` fails on invalid Frontmatter, slug mismatches and duplicates. Bodies fail when compiled: in `npm run check` through a test that compiles all real content, and in `next build` once each Article page compiles its body.
- Cache loaded content per process in production only, so `next dev` reflects edits without a restart.
- Pin the three packages exactly, each at least 2 weeks old, as runtime dependencies.

## Consequences
- Positive: content cannot run code during the build; invalid content is caught before merge with a message naming the file and fields; Articles are typed from the schema; the shared loader gives PROJ-001 the same rules; no extra build step or tool.
- Negative: three new runtime dependencies to keep updated. Authors must escape `{` and `<` in prose and cannot use HTML or components until a story adds one to the allowlist. Until BLOG-003, an unsafe body fails `npm run check` and CI but not `next build` alone. Drafts are hidden from the site but remain public in the repository. `next-mdx-remote`'s own `blockJS` behavior must be re-checked on upgrades, because the rejection depends on the plugin seeing the tree first.
- Follow-ups: BLOG-003 adds Article pages, reviews any allowlisted component and the link and image rendering, and checks that `cover.src` exists. PROJ-001 adds the Project schema. A future CSP (ADR 0004) is unaffected, since compiled content adds no inline scripts.

## Alternatives
- `@next/mdx`: imports each MDX file as a bundled module, needs remark Frontmatter plugins and dynamic imports to list and validate Articles, and makes `import`/`export` part of normal authoring. Rejected.
- velite or content-collections: add a separate build step, generated output and more tooling for a small site. Rejected.
- Raw `@mdx-js/mdx` `evaluate`: the same compiler without the RSC integration and safe defaults, leaving more to write and maintain. Rejected.
