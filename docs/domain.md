# Domain

## Ubiquitous language
The site publishes the owner's professional work. Code names are recorded as each content type's schema is implemented (Article in BLOG-001, Project in PROJ-001).

| Term | Meaning | Context | Code name |
| --- | --- | --- | --- |
| Article | A piece of technical writing published on the site, authored as an MDX file | Writing | `Article` (`src/lib/articles.ts`) |
| Project | A piece of work the owner built or contributed to, with a summary, role, stack, dates, status and links | Portfolio | `Project` (`src/lib/projects.ts`) |
| Case study | A Project with `caseStudy: true` whose body has the sections Problem, Approach, Decisions and Outcome, in that order | Portfolio | `caseStudy` field of `Project` |
| Professional experience | A role held: organization, title, dates and accomplishments | Career | not yet implemented |
| Resume | The condensed summary of professional experience and skills offered to recruiters and employers | Career | not yet implemented |
| Frontmatter | The metadata block at the top of an MDX file, validated by that content type's Zod schema | All | `ArticleFrontmatter` / `articleFrontmatterSchema` for Articles, `ProjectFrontmatter` / `projectFrontmatterSchema` for Projects; other types added by their stories |

## Bounded contexts
| Context (owning modules/apps) | Type | Owns | Upstream of | Downstream of |
| --- | --- | --- | --- | --- |
| Writing | core | Articles | Site presentation | none |
| Portfolio | core | Projects, case studies | Site presentation | none |
| Career | supporting | Professional experience, resume | Site presentation | none |
| Site presentation | generic | Layout, navigation, pages | none | Writing, Portfolio, Career |

## Context map
All content is local MDX or data files in the repository. It is read and validated at build time, and pages are rendered from it. There are no runtime services, events or external content sources; the site is static-first, with no database, backend, authentication or CMS.

Unresolved: whether the resume is generated from professional experience or maintained separately.

## Invariants
Confirmed for Articles (ADR 0006) and Projects (ADR 0007); other content types confirm them in their own stories.
- Every Article's Frontmatter passes the schema; invalid Frontmatter fails `next build`, and an invalid body fails `npm run check` and, from BLOG-003, `next build`.
- A slug equals its filename, is lowercase kebab-case and is unique among Articles.
- Drafts never appear when `NODE_ENV` is `production`. Drafts are still validated. Publication depends only on `draft`: a future `publishedAt` is not hidden.
- Every Project's Frontmatter passes the schema, and a Project with `caseStudy: true` has the four sections in order; either failure fails `next build`. An unsafe or broken body fails `npm run check` and, from PROJ-003, `next build`.
- A slug equals its filename, is lowercase kebab-case and is unique among Projects.
- Drafts never appear when `NODE_ENV` is `production`, and are still validated, including the case-study rule.
- An `active` Project has no `endedAt`.
