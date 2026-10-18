# Domain

## Ubiquitous language
The site publishes the owner's professional work. Code names are recorded once the content schemas exist.

| Term | Meaning | Context | Code name |
| --- | --- | --- | --- |
| Article | A piece of technical writing published on the site, authored as an MDX file | Writing | not yet implemented |
| Project | A piece of work the owner built or contributed to, with a summary, technologies and links | Portfolio | not yet implemented |
| Case study | An in-depth write-up of a project: problem, approach, decisions and outcome | Portfolio | not yet implemented |
| Professional experience | A role held: organization, title, dates and accomplishments | Career | not yet implemented |
| Resume | The condensed summary of professional experience and skills offered to recruiters and employers | Career | not yet implemented |
| Frontmatter | The metadata block at the top of an MDX file, validated by that content type's Zod schema | All | not yet implemented |

## Bounded contexts
| Context (owning modules/apps) | Type | Owns | Upstream of | Downstream of |
| --- | --- | --- | --- | --- |
| Writing | core | Articles | Site presentation | none |
| Portfolio | core | Projects, case studies | Site presentation | none |
| Career | supporting | Professional experience, resume | Site presentation | none |
| Site presentation | generic | Layout, navigation, pages | none | Writing, Portfolio, Career |

## Context map
All content is local MDX or data files in the repository. It is read and validated at build time, and pages are rendered from it. There are no runtime services, events or external content sources; the site is static-first, with no database, backend, authentication or CMS.

Unresolved: whether a case study is a kind of project or a separate content type, and whether the resume is generated from professional experience or maintained separately.

## Invariants
Proposed; confirm them when the content schemas are designed.
- Every content file's frontmatter passes its Zod schema; invalid content does not build.
- A slug is unique within its content type and stable once published.
- Unpublished or draft content never appears on the production site.
