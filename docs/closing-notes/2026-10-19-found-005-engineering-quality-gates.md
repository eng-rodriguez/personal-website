# Every change is now checked in a real browser before it can merge

**Status:** Shipped
**Date:** 2026-10-19 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [FOUND-005](https://github.com/eng-rodriguez/personal-website/issues/5) · [Story](../stories/found-005-engineering-quality-gates.md) · [Brief](../briefs/found-005-engineering-quality-gates.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/43)

## What we delivered
Every proposed change already went through code style, type, unit test and build checks. It now also gets quick browser tests: a real browser opens the five main pages, checks that each one shows its heading, title and menu, switches the site to the dark look and confirms it is remembered, and checks the pages still work with JavaScript turned off. If a browser test fails, a report showing what went wrong is kept for a week. The checks and how to run them are now written down.

## Why it matters
A change that breaks a main page or the theme choice is now caught before it reaches the site, not by a visitor.

## How we know it works
- All 236 automated unit tests and all 11 browser tests passed. The full check and the security audit passed.
- We broke one page's heading on purpose. The browser tests failed, named the page and the missing heading, and saved a report. The change was then undone.
- Three independent reviews (requirements, design and security) found no critical or important issues. Three minor notes were fixed, the rest left open.
- The new browser check ran on GitHub's servers for this change and all 11 tests passed. The report upload after a real failure there was not tested, by choice.

## Not included / deferred
- Other browsers, mobile devices, visual comparison, accessibility scanning, and testing against a live preview site.

## Risks and decisions
- Decision recorded: browser tests run separately from the quick local check ([ADR 0005](../adr/0005-playwright-smoke-tests-outside-check.md)).
- GitHub requires the combined "ci-ok" result before merging (confirmed on the main branch rules).
- No leadership input needed.

## What's next
- Next story: the content pipeline for articles and projects.
