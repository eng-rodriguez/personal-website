# Projects and case studies can now be written as files and are checked before the site is built

**Status:** Shipped
**Date:** 2026-10-24 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [PROJ-001](https://github.com/eng-rodriguez/personal-website/issues/10) · [Story](../stories/proj-001-project-content-model.md) · [Brief](../briefs/proj-001-project-content-model.md) · [Decision record](../adr/0007-project-model-with-case-studies.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/53)

## What we delivered
Projects are now written as files in the website's repository, using the same approach as articles. Each one has a short header with its title, summary, role, technologies, start and end dates, status, links, an optional cover image and featured, draft and case-study flags. Every header is checked against fixed rules. A missing title, an end date before the start, a link that is not secure, or two projects with the same address name stops the site from building, and the error names the file and the field. A case study is a project marked as one. It must contain the sections Problem, Approach, Decisions and Outcome, in that order. Draft projects never appear on the live site.

## Why it matters
The upcoming projects list, project pages and homepage previews can rely on project content that is valid, instead of each checking it again. This also settles an open question: case studies are a kind of project, not a separate kind of content.

## How we know it works
- All 609 automated unit tests and all 40 browser tests passed, and the full style, type and build check passed.
- A deliberately broken project file stopped the site build and named the file and each problem.
- Three independent reviews (requirements, design and security) found no critical or important issues. Nine minor notes were left open as optional improvements.
- All checks also passed on GitHub's servers. A newly published security notice for a validation library stopped those checks at first; it was fixed separately by moving to the patched version before this change was merged.
- After the merge, the hands-on checks were repeated on the merged code and the new documentation was reviewed against the plan: no gaps, five minor notes. This was done by the development tooling, not the owner, whose own review is not recorded.

## Not included / deferred
- The projects list, project pages, image and link display, and homepage previews (separate tickets).
- No project is published yet. The example project lives only in the tests.

## Risks and decisions
- Case studies are a kind of project ([decision record](../adr/0007-project-model-with-case-studies.md)).
- No new open-source building blocks were added.
- Drafts are hidden from the site but visible in the public repository.

## What's next
- Homepage content previews (HOME-003), then the projects list (PROJ-002).
