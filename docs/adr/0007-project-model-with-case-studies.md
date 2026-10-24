# 0007. Project model with case studies

- Status: Accepted
- Date: 2026-10-21
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [PROJ-001 story](../stories/proj-001-project-content-model.md), [PROJ-001 brief](../briefs/proj-001-project-content-model.md), https://github.com/eng-rodriguez/personal-website/issues/10, [ADR 0003](0003-core-section-routes-and-shell.md), [ADR 0006](0006-mdx-content-pipeline.md). Resolves the case-study part of the "Content model" item of "Unresolved architecture" in `CLAUDE.md` and the ADR 0003 follow-up on the case study type.

## Context
ADR 0003 reaches case studies through `/projects` and left open whether a case study is a kind of Project or a separate content type. ADR 0006 fixed the MDX pipeline (local files, strict Zod Frontmatter, safe compile, draft rule, one collected error) and named Project as its second type. PROJ-002, PROJ-003, PROJ-004 and HOME-003 need a typed, validated Project source, and PROJ-003 needs to know where case-study sections come from. `docs/domain.md` defines a case study as a write-up with problem, approach, decisions and outcome. The owner approved the story decisions on 2026-10-21.

## Decision
We will:
- Model a case study as a kind of Project, not a separate content type. A Project is a case study when its Frontmatter has `caseStudy: true` (default `false`). Case studies live in `content/projects` and are reached through `/projects/<slug>`.
- Represent the case-study sections as level-2 Markdown headings in the body, `## Problem`, `## Approach`, `## Decisions`, `## Outcome`, each exactly once and in that order. An introduction before the first one and extra `##` sections between or after them are allowed. Headings inside code fences do not count. When `caseStudy` is `false` the body has no section constraint.
- Check those headings at load time, so an invalid case study fails `next build` like invalid Frontmatter. The check is a per-type hook in the shared loader of ADR 0006, which reports into the same single error, runs on drafts too, and leaves Articles unchanged. It uses a code-fence-aware line scan of the body and adds no dependency.
- Add Project on the ADR 0006 pipeline unchanged: `content/projects/<slug>.mdx`, `src/lib/projects.ts`, a strict `projectFrontmatterSchema` (title, slug, summary, role, stack, startedAt, endedAt, status, featured, draft, links, cover, caseStudy), the same slug, draft, cache and compile rules, and an empty component allowlist. `stack` entries are display strings (such as `Next.js` or `C#`), unique case-insensitively, not kebab-case tags. `endedAt` is optional and forbidden while `status` is `active`. Links are absolute `https://` URLs with at most one `repo` and one `live` link.

## Consequences
- Positive: one schema, one directory and one route set for all portfolio work. A Project becomes a case study by adding a flag and four headings. PROJ-003 can render the body as is and rely on the sections existing. The build rejects an incomplete case study.
- Negative: section names are fixed English headings, compared exactly, so renaming one needs a schema change and content edits. Only ATX headings (`## Problem`) count; a setext heading or one with inline formatting is reported as missing. The section check runs only when the Frontmatter is valid, so an author may fix Frontmatter first and then see heading errors. The shared loader gains an optional hook that future types may also use.
- Follow-ups: PROJ-002 lists Projects, PROJ-003 adds `/projects/<slug>` and compiles bodies in `next build`, PROJ-004 checks covers and renders links, HOME-003 reads `featured`. The resume question stays open.

## Alternatives
- A separate `case-studies` collection: duplicates most of the Project schema and needs a second route set, which ADR 0003 excludes. Rejected.
- A Frontmatter `sections` list describing the case study: duplicates the body and can drift from it. Rejected.
- Running the heading check in `getProjects()` after the loader: drafts are already removed in production at that point, and the errors would not be collected with Frontmatter errors from other files. Rejected in favor of the loader hook.
