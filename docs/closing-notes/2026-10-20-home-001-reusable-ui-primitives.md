# Pages are now built from a shared set of building blocks

**Status:** Ready for review
**Date:** 2026-10-20 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [HOME-001](https://github.com/eng-rodriguez/personal-website/issues/6) · [Story](../stories/home-001-reusable-ui-primitives.md) · [Brief](../briefs/home-001-reusable-ui-primitives.md) · PR: not yet opened

## What we delivered
The site now has seven shared building blocks for its pages: a page heading, a section, a card, a tag, a link, an "empty" message and a grid that adapts to screen width. The five main pages now use the shared page heading, and the four pages without content yet show a clear "nothing here yet" message. Each block is described, with examples, in the design guide.

## Why it matters
Upcoming articles, projects and experience pages can be assembled from tested parts instead of copied markup, so they look consistent and stay accessible.

## How we know it works
- All 350 automated unit tests and all 11 browser tests passed; the full style, type and build check passed.
- Three independent reviews (requirements, design and security) found no critical issues. Security found two important gaps in how links guard against misleading or unsafe addresses; both were fixed and confirmed on a second review. Minor notes were left open.
- The hands-on checks (keyboard focus, narrow screens and zoom, high-contrast mode, print, no JavaScript) have not been run yet.

## Not included / deferred
- Cards and lists for real articles and projects, which wait for the content work. The card, section, tag and grid are ready but not yet shown on a page.

## Risks and decisions
- Links reject unusual or unsafe addresses and fail the build instead of shipping them.
- No leadership input needed.

## What's next
- The owner runs the hands-on checks, then the PR is opened.
- Next story: the content pipeline for articles and projects.
