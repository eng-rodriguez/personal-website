# The website now has a shared visual foundation with light and dark themes

**Status:** Shipped
**Date:** 2026-10-18 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [FOUND-002](https://github.com/eng-rodriguez/personal-website/issues/2) · [Story](../stories/found-002-establish-design-system.md) · [Brief](../briefs/found-002-establish-design-system.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/37)

## What we delivered
The site now has one shared set of colors, text sizes and spacing that every future page will use, in both a light and a dark version. The site follows the visitor's device setting for light or dark. A first reusable button is in place, and keyboard users see a clear outline on whatever they are about to activate.

## Why it matters
Later pages (articles, projects, resume) can be built quickly and look consistent, and readability for people with low vision is checked automatically instead of by eye.

## How we know it works
- All 113 automated tests passed, and the full check passed on a clean install.
- An automated test confirms every text and background color pairing meets the accessibility contrast standard in both themes; we confirmed it fails when a color is made too faint.
- Three independent reviews (requirements, design and security) found no critical or important issues; six minor notes were left for later.
- A browser walkthrough confirmed both themes, the keyboard outline on every button, and that the site contacts no outside services. The owner then checked high-contrast mode and reduced motion and approved the palette.
- One minor issue found during the walkthrough (unused styles in the published stylesheet) was fixed before release.
- All automated checks on the pull request passed.

## Not included / deferred
- A light/dark switch on the page, custom fonts, components other than the button, and automated browser tests are planned separately.

## Risks and decisions
- Decision recorded: the site follows the device's theme setting and keeps all colors in one place ([ADR 0002](../adr/0002-tailwind-v4-tokens-os-only-theming.md)).
- Known issues in development-only tools remain; they existed before and do not affect the published site.
- No leadership input needed.

## What's next
- Optional cleanups from the reviews (six minor notes) can be picked up when the next component is added.
- Next story: the content pipeline.
