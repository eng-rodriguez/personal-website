# The home page now opens with a short introduction and two clear next steps

**Status:** Shipped
**Date:** 2026-10-21 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [HOME-002](https://github.com/eng-rodriguez/personal-website/issues/7) · [Story](../stories/home-002-homepage-hero.md) · [Brief](../briefs/home-002-homepage-hero.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/47)

## What we delivered
The home page now starts with an introduction: the owner's name, role, a one-paragraph positioning statement and two buttons, "View projects" and "Read writing". All of this text is kept in one settings file, so the owner can change it without touching the page design. The site refuses to build if the text is empty or a button points somewhere other than an existing section.

## Why it matters
Visitors learn who the owner is right away and can reach the main sections with one click, on phones and with a keyboard.

## How we know it works
- All 389 automated unit tests and all 18 browser tests passed, and the full style, type and build check passed.
- The browser tests confirm both buttons open the right pages, keyboard users reach them in order with a visible focus ring in light and dark themes, nothing overflows a narrow phone screen, and the page works without JavaScript.
- Three independent reviews (requirements, design and security) found no critical or important issues. Seven minor notes were left open.
- Hands-on checks passed for keyboard use, phone and landscape widths, large screens, zoom-equivalent widths, high-contrast mode, print, pages without JavaScript and a long-text-with-photo test. Real browser zoom and a screen reader were not checked.

## Not included / deferred
- The real name, role and statement: placeholder text ships, and the owner replaces it before launch.
- A portrait photo: the page can show one, but no photo is included yet.
- Contact or resume-download buttons, because no contact method has been decided.

## Risks and decisions
- Until the owner edits the settings, the home page shows "Your Name" as its heading.
- No leadership input needed.

## What's next
- Owner replaces the placeholder text before launch.
