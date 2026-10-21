# The phone menu now closes predictably and keeps keyboard users on track

**Status:** Ready for review
**Date:** 2026-10-20 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [HOME-004](https://github.com/eng-rodriguez/personal-website/issues/9) · [Story](../stories/home-004-mobile-navigation.md) · [Brief](../briefs/home-004-mobile-navigation.md) · PR: not opened yet

## What we delivered
On phones and narrow windows, the site menu now closes when a visitor taps outside it or presses Escape, and keyboard focus always lands somewhere sensible: back on the menu button, or on the new page after choosing a link. Scrolling a page never closes the menu by accident, and the page is never locked from scrolling. Visitors without JavaScript now see the links directly instead of a menu button that does nothing, and the menu button no longer appears in printouts.

## Why it matters
Every visitor on a phone reaches the site's pages through this menu, so it has to work by touch and keyboard without trapping or losing anyone.

## How we know it works
- All 384 automated unit tests and all 32 browser tests passed, including new phone-sized and desktop browser tests; the full style, type and build check passed.
- Hands-on checks were run by automation in a desktop browser imitating a phone (touch, print, high-contrast and narrow zoomed screens): all passed. A real phone, a real screen reader and a real print dialog were not tried.
- Those checks found that pressing Back with a menu link focused lost the visitor's place. It was fixed, and a follow-up fix stopped the change from affecting the desktop menu. Both are covered by new tests.
- Three independent reviews (requirements, design and security) found no critical issues. One important design note (the menu code could be organised more compactly) and several minor notes were left open, including that older Safari versions skip the Back focus fix.

## Not included / deferred
- A full-screen pop-over menu, which would need its own story.

## Risks and decisions
- Touch taps close the menu, but touch scrolling does not (owner decision).
- Built alongside the homepage hero work; whichever merges second resolves two shared documentation files by hand.

## What's next
- Owner runs the hands-on checks, then reviews and merges the PR.
