# Every page now shares one header, menu and footer

**Status:** Ready for review
**Date:** 2026-10-18 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [FOUND-003](https://github.com/eng-rodriguez/personal-website/issues/3) · [Story](../stories/found-003-build-global-shell.md) · [Brief](../briefs/found-003-build-global-shell.md) · PR: not opened yet

## What we delivered
Every page of the site now has the same header, menu and footer, so visitors can move between the home page and the four main sections: Writing, Projects, Experience and Resume. On phones the menu folds behind a single button; on larger screens the links are always visible. The current page is marked in the menu, and keyboard users can skip straight to the content. The four sections are placeholders until their content is written.

## Why it matters
The upcoming articles, projects and resume pages can be added inside one consistent frame instead of each building its own, and the site is navigable on any screen size from the start.

## How we know it works
- All 152 automated tests passed, and the full check (type checks, code style, tests and a production build) passed.
- Every acceptance criterion has an automated test or check.
- Three independent reviews (requirements, design and security) found no critical or important issues. Three minor notes on the plan document were fixed; five minor suggestions were left open.
- Not yet done: the hands-on check on real phone and desktop sizes, keyboard use in both themes, high-contrast mode and zoom. The owner runs these before merge.

## Not included / deferred
- Real section content, search, a light/dark switch, social sharing images and a site address (the domain is not chosen yet).

## Risks and decisions
- Decision recorded: the five main section addresses and their labels ([ADR 0003](../adr/0003-core-section-routes-and-shell.md)). These become public links once the site goes live.
- The year in the footer updates each time the site is rebuilt.
- No leadership input needed.

## What's next
- Owner hands-on check, then review and merge.
- Next story: the content pipeline for articles and projects.
