# The website now has a shared visual foundation with light and dark themes

**Status:** Ready for review
**Date:** 2026-10-18 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [FOUND-002](https://github.com/eng-rodriguez/personal-website/issues/2) · [Story](../stories/found-002-establish-design-system.md) · [Brief](../briefs/found-002-establish-design-system.md) · PR: not opened yet

## What we delivered
The site now has one shared set of colors, text sizes and spacing that every future page will use, in both a light and a dark version. The site follows the visitor's device setting for light or dark. A first reusable button is in place, and keyboard users see a clear outline on whatever they are about to activate.

## Why it matters
Later pages (articles, projects, resume) can be built quickly and look consistent, and readability for people with low vision is checked automatically instead of by eye.

## How we know it works
- All 112 automated tests passed, and the full check passed on a clean install.
- An automated test confirms every text and background color pairing meets the accessibility contrast standard in both themes; we confirmed it fails when a color is made too faint.
- Three independent reviews (requirements, design and security) found no critical or important issues; six minor notes were left for later.
- Not yet done: the hands-on browser walkthrough (themes, keyboard outline, high-contrast mode, palette sign-off).

## Not included / deferred
- A light/dark switch on the page, custom fonts, components other than the button, and automated browser tests are planned separately.

## Risks and decisions
- Decision recorded: the site follows the device's theme setting and keeps all colors in one place ([ADR 0002](../adr/0002-tailwind-v4-tokens-os-only-theming.md)).
- Known issues in development-only tools remain; they existed before and do not affect the published site.
- No leadership input needed.

## What's next
- Owner runs the browser walkthrough and confirms the palette.
- Next story: the content pipeline.
