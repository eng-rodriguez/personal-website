# The website now has a working, automatically checked foundation

**Status:** Shipped
**Date:** 2026-10-18 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [FOUND-001](https://github.com/eng-rodriguez/personal-website/issues/1) · [Story](../stories/found-001-initialize-nextjs-app.md) · [Brief](../briefs/found-001-initialize-nextjs-app.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/33)

## What we delivered
The personal website project now has a starting application with a placeholder home page. One command checks the code for errors, style problems and failing tests, then builds the site. The same check runs automatically on every proposed change, and dependency updates are now suggested automatically each week.

## Why it matters
Every later piece of the site, such as articles, projects and the resume, can now be built on a reliable base that catches mistakes before they are merged.

## How we know it works
- All 5 automated tests passed, and the full check passed on a clean install.
- Three independent reviews (requirements, design and security) found no critical or important issues.
- All automated checks on the pull request passed.
- A manual walkthrough after release passed 11 of 13 steps. One step passed with harmless tool warnings and one optional step was skipped.

## Not included / deferred
- Visual styling, real pages and content, end-to-end browser tests and hosting setup are planned as separate stories.

## Risks and decisions
- Decision recorded: the project uses Node.js version 24 and one standard check command ([ADR 0001](../adr/0001-pin-node-24-and-check-script.md)).
- Accepted risk: a few known issues in development-only tools, with no fix available yet. They do not affect the published site.
- No leadership input needed.

## What's next
- Optionally clear the harmless warnings from the code-checking tools.
- Next stories: styling setup, then the content pipeline.
