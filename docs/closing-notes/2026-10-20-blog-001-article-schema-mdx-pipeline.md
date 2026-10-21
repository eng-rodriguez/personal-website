# Articles can now be written as files and are checked before the site is built

**Status:** Shipped
**Date:** 2026-10-21 · **Milestone:** none · **Risk:** Medium
**Links:** Ticket [BLOG-001](https://github.com/eng-rodriguez/personal-website/issues/14) · [Story](../stories/blog-001-article-schema-mdx-pipeline.md) · [Brief](../briefs/blog-001-article-schema-mdx-pipeline.md) · [Decision record](../adr/0006-mdx-content-pipeline.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/48)

## What we delivered
Articles are now written as files in the website's repository, each with a short header for its title, address name, summary, dates, tags, draft and featured flags, and an optional cover image. Every header is checked against fixed rules. A missing title, an impossible date or two articles with the same address name stops the site from building, and the error names the file and the field. Draft articles never appear on the live site. Article text is limited to plain formatting, so it cannot run code. The pages that come next can ask for the list of articles in a single call, and get an empty list when there are none.

## Why it matters
The upcoming blog index, article pages and homepage previews can rely on content that is valid and safe, instead of each checking it again.

## How we know it works
- All 449 automated unit tests and all 11 browser tests passed, and the full style, type and build check passed.
- Three independent reviews (requirements, design and security) found no critical or important issues. Five minor notes were fixed. Five more were left open as intended behavior or deferred.
- All checks also passed on GitHub's servers.
- The automated hands-on checks (a broken article, a duplicate, unsafe text and a draft-only folder) behaved as expected. The owner's hands-on checks on a fresh copy, including reading the new authoring guide and decision record, also passed.

## Not included / deferred
- The blog index, article pages, image display and homepage previews (separate tickets).
- No article is published yet. Unsafe article text is caught by the automated checks now, and will also stop the site build once article pages exist.

## Risks and decisions
- Three new open-source building blocks were added, pinned to exact versions, with no known security issues.
- Drafts are hidden from the site but visible in the public repository.

## What's next
- The project content model (PROJ-001) reuses this pipeline, then homepage previews (HOME-003).
