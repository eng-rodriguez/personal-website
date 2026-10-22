# The phone menu now closes predictably and keeps keyboard users on track

**Status:** Shipped
**Date:** 2026-10-20 · **Milestone:** none · **Risk:** Standard
**Links:** Ticket [HOME-004](https://github.com/eng-rodriguez/personal-website/issues/9) · [Story](../stories/home-004-mobile-navigation.md) · [Brief](../briefs/home-004-mobile-navigation.md) · [PR](https://github.com/eng-rodriguez/personal-website/pull/49)

## What we delivered
On phones and narrow windows, the site menu now closes when a visitor taps outside it or presses Escape, and keyboard focus always lands somewhere sensible: back on the menu button, or on the new page after choosing a link. Scrolling a page never closes the menu by accident, and the page is never locked from scrolling. Visitors without JavaScript now see the links directly instead of a menu button that does nothing, and the menu button no longer appears in printouts.

## Why it matters
Every visitor on a phone reaches the site's pages through this menu, so it has to work by touch and keyboard without trapping or losing anyone.

## How we know it works
- All 525 automated unit tests and all 40 browser tests passed after the homepage hero and article work were merged in; the full style, type and build check passed.
- All checks also passed on GitHub's servers.
- Hands-on checks were run by automation in a desktop browser imitating a phone (touch, print, high-contrast and narrow zoomed screens): all passed. A real phone, a real screen reader and a real print dialog were not tried.
- Those checks found that pressing Back with a menu link focused lost the visitor's place. It was fixed, and a follow-up fix stopped the change from affecting the desktop menu. Both are covered by new tests.
- After the homepage hero landed, a tap on an empty part of the page with the menu open could open the hero's "View projects" link. The menu now waits for the tap to finish before closing, and a new test covers it.
- Three independent reviews (requirements, design and security) found no critical issues. One important design note (the menu code could be organised more compactly) and several minor notes were left open, including that older Safari versions skip the Back focus fix and a rare long-press case that can close the menu early.

## Not included / deferred
- A full-screen pop-over menu, which would need its own story.

## Risks and decisions
- Touch taps close the menu, but touch scrolling does not (owner decision).
- Built alongside the homepage hero work; the two shared documentation files were combined by hand when the hero merged first.

## What's next
- Optional: try the menu on a real phone and with a screen reader, which were not covered.
