# Writing content

How to add an Article. The pipeline is described in ADR 0006 (`docs/adr/0006-mdx-content-pipeline.md`).

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
| `featured` | `true` or `false` | `false` |
| `cover` | `src` (a path under `public/`, starting with a single `/`, with no spaces, control characters or backslashes) and a non-empty `alt` | none |

Unknown keys are rejected. The existence of the `cover` file is not checked yet.

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

## Workflow
Format with `npm run format`, because Prettier checks `.mdx`. Preview with `npm run dev`.
