# Content

How to add an Article or a Project. The pipeline is described in ADR 0006 (`docs/adr/0006-mdx-content-pipeline.md`) and the Project model in ADR 0007 (`docs/adr/0007-project-model-with-case-studies.md`).

# Articles

## Where files go
`content/articles/<slug>.mdx`. One file per Article, no folders, and the `slug` field equals the filename without `.mdx`. Other files in the directory are ignored.

## Frontmatter
```yaml
---
title: Building a static site
slug: building-a-static-site
description: One sentence that summarizes the article.
publishedAt: 2026-03-10
updatedAt: 2026-03-12
tags:
  - nextjs
  - mdx
draft: false
featured: false
cover:
  src: /images/building-a-static-site.png
  alt: Describe the image
---
```

| Field | Rule | Default |
| --- | --- | --- |
| `title` | Non-empty text | required |
| `slug` | Lowercase kebab-case, equal to the filename, unique | required |
| `description` | Non-empty text | required |
| `publishedAt` | `YYYY-MM-DD`, a real date, no time | required |
| `updatedAt` | `YYYY-MM-DD`, not before `publishedAt` | none |
| `tags` | Kebab-case words, no duplicates | `[]` |
| `draft` | `true` or `false` | `false` |
| `featured` | `true` or `false`; reserved, it does not affect the home page | `false` |
| `cover` | `src` (a path under `public/`, starting with a single `/`, with no spaces, control characters or backslashes) and a non-empty `alt` | none |

Unknown keys are rejected. The existence of the `cover` file is not checked yet.

The home page shows the 3 most recent published Articles, newest `publishedAt` first. The Article `featured` flag does not affect it.

## Drafts
A draft (`draft: true`) is hidden when `NODE_ENV` is `production` (`next build`, `next start` and Vercel previews) and shown in `npm run dev`. Drafts are still validated. They are still public in the GitHub repository, so put nothing private in one. `publishedAt` does not schedule: a future date is not hidden.

## What MDX allows
Write Markdown only. The following are rejected with an error naming the file:
- `{...}` expressions
- `import` and `export`
- HTML or JSX tags, including `<div>` and `<script>`, and HTML comments

Escape a literal `{` as `\{` and a literal `<` as `\<`. Components can be used only after a story adds them to the allowlist.

## Invalid content does not build
- Invalid Frontmatter, a slug that differs from the filename and duplicate slugs fail `npm run build`, because `/writing` loads every Article.
- An unsafe or broken body fails `npm run check` (and CI) through `src/lib/articles-content.test.ts`. From BLOG-003, `npm run build` fails too, because each Article page compiles its body.

The error lists every file and field that is wrong.

# Projects

## Where files go
`content/projects/<slug>.mdx`. One file per Project, no folders, and the `slug` field equals the filename without `.mdx`. Other files in the directory are ignored.

## Project Frontmatter
```yaml
---
title: Site rebuild
slug: site-rebuild
summary: One sentence that says what the project is.
role: Lead engineer
stack:
  - TypeScript
  - Next.js
startedAt: 2026-01-15
endedAt: 2026-03-01
status: completed
featured: false
draft: false
links:
  - label: Source code
    url: https://example.com/site-rebuild
    kind: repo
  - label: Live site
    url: https://example.com
    kind: live
cover:
  src: /images/site-rebuild.png
  alt: Describe the image
caseStudy: false
---
```

| Field | Rule | Default |
| --- | --- | --- |
| `title` | Non-empty text | required |
| `slug` | Lowercase kebab-case, equal to the filename, unique | required |
| `summary` | Non-empty text | required |
| `role` | Non-empty text | required |
| `stack` | At least one display string (such as `Next.js` or `C#`), unique when compared case-insensitively | required |
| `startedAt` | `YYYY-MM-DD`, a real date, no time | required |
| `endedAt` | `YYYY-MM-DD`, not before `startedAt`, omitted while `status` is `active` | none |
| `status` | `active`, `completed` or `archived` | required |
| `featured` | `true` or `false`; `true` selects the Project for the home page | `false` |
| `draft` | `true` or `false` | `false` |
| `links` | A list of `label`, `url` (absolute `https://` only) and `kind` (`repo`, `live` or `other`); at most one `repo` and one `live` | `[]` |
| `cover` | Same rules as the Article `cover` | none |
| `caseStudy` | `true` makes the Project a case study (below) | `false` |

Unknown keys are rejected, also inside `links` and `cover`. Reachability of the links and the existence of the `cover` file are not checked.

The home page shows the Projects with `featured: true`, at most 3, newest `startedAt` first (then by slug). There is no ordering field: to change the choice, change `startedAt` or unset `featured`. Drafts never show in production and do not take one of the 3 slots.

## Case studies
A case study is a Project with `caseStudy: true`. Its body must contain these level-2 headings, each exactly once and in this order:

1. `## Problem`
2. `## Approach`
3. `## Decisions`
4. `## Outcome`

The text is compared exactly, so `## problem` or `## **Problem**` counts as missing. Write them in ATX form (`##`): setext headings and headings inside lists or blockquotes are not recognized. An introduction before `## Problem` and other sections or subsections are allowed. Headings inside code fences are ignored. When `caseStudy` is `false` the body has no section rule. The section check runs only when the Frontmatter is valid, so fix Frontmatter first.

## Drafts, MDX and errors
The draft rule, the MDX restrictions and the error format are the same as for Articles. A draft Project is also checked for its case-study headings.
- Invalid Frontmatter, a slug that differs from the filename, duplicate slugs and missing, repeated or misordered case-study headings fail `npm run build`, because `/projects` loads every Project.
- An unsafe or broken body fails `npm run check` (and CI) through `src/lib/projects-content.test.ts`, until PROJ-003 compiles each body in `npm run build`.

# Workflow
Format with `npm run format`, because Prettier checks `.mdx`. Preview with `npm run dev`.
