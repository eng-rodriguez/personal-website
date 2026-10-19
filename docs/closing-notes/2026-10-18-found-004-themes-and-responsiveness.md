# Visitors can choose a light or dark look, and the site remembers it

**Status:** Ready for review
**Date:** 2026-10-18 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [FOUND-004](https://github.com/eng-rodriguez/personal-website/issues/4) · [Story](../stories/found-004-themes-and-responsiveness.md) · [Brief](../briefs/found-004-themes-and-responsiveness.md) · PR: not opened yet

## What we delivered
The site still follows the visitor's device setting for light or dark by default. A new Theme control in the header now lets visitors pick System, Light or Dark. The choice is remembered on that browser, applied before the page first appears so it does not flash the wrong look, and shared between open tabs. Printed pages always use the light look. The supported screen widths, from 320 pixels upward, are now written down.

## Why it matters
Readers can pick the look that is most comfortable for them, and the site stays readable on small phones as content is added.

## How we know it works
- All 235 automated tests passed, and the full check (type checks, code style, tests and a production build) passed. The dependency security audit passed.
- Every acceptance criterion has an automated test or check. Color contrast is tested for light, device-driven dark and chosen dark.
- Three independent reviews (requirements, design and security) found one important issue: with JavaScript off, the hidden Theme control still left an empty gap in the header. It was fixed and re-reviewed. Four minor notes were left open.
- Not yet checked by hand: how the site really looks on first load, narrow screens and zoom, keyboard and screen-reader use, high-contrast mode and printing. These steps are in the brief for the owner to run.

## Not included / deferred
- Automated browser testing, a security policy for page scripts, and any new colors.

## Risks and decisions
- Decision recorded: a small script picks the theme before the page shows ([ADR 0004](../adr/0004-theme-choice-with-pre-paint-script.md)), replacing the earlier follow-the-device-only rule. A future script security policy must allow it.
- The Theme control appears a moment after the page on slow devices; the owner accepted this.
- No leadership input needed.

## What's next
- Owner runs the manual checks, then the pull request is reviewed and merged.
