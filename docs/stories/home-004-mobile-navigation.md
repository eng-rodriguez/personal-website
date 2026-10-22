# Implement mobile navigation
Source: HOME-004, https://github.com/eng-rodriguez/personal-website/issues/9 (labels: type:feature, priority:p0, area:design). Dependency: FOUND-001.

As a visitor on a phone or narrow window, I want a mobile menu that works by keyboard and touch, closes when I press Escape or tap outside it, and puts my focus somewhere sensible afterwards, so that I can reach every core route without getting stuck or losing my place.

Ticket acceptance criteria kept as written: "Menu works by keyboard and touch; focus is restored; no background scroll trapping issues. Relevant tests and documentation updated. Lint, typecheck, unit tests, and production build pass." They are rewritten as criteria 1-12 below.

Assumptions (approved by @eng-rodriguez):
- A1. Keep the existing non-modal disclosure in `src/components/site/site-nav.tsx` (a Menu button with `aria-expanded` and `aria-controls`, plus an in-flow `nav`) and extend it. No new dependency, no Radix Dialog or Sheet, no focus trap, no `inert` on the page, and no body scroll lock. This is consistent with FOUND-003 A3 and the FOUND-004 A7 note that the menu pattern is kept. The menu is in-flow, not an overlay, so "no background scroll trapping issues" is met because the page always scrolls normally and nothing can leave a stuck lock.
- A2. Primary navigation below `md` (48rem) keeps its current behavior: the Menu button toggles the `nav`, the `nav` closes when the pathname changes, and the menu closes when the viewport reaches `md`.
- A3. Escape closes the open menu from anywhere on the page and returns focus to the Menu button (already implemented). Escape does nothing when the menu is closed.
- A4. Outside dismissal: a press outside the header closes the menu. Mouse and pen close on `pointerdown`; touch closes on the `click` that a tap produces, so the click lands on what was really under the finger, and a touch scroll that the browser cancels with `pointercancel` leaves the menu open (amended at brief approval, O1, and in repair round 3 after a ghost click on the home hero). Presses inside the header (the Menu button, the `nav`, the theme toggle and the site name area) do not count as outside presses; the Menu button keeps its own click handler, so it toggles once and never closes then reopens. Focus is not moved when the press lands on another focusable element, because that press already moves focus. If focus was inside the `nav` when it closed, focus returns to the Menu button, so it is never lost on `body`.
- A5. Choosing a link in the menu closes it and navigates. Focus then follows the normal Next.js route focus behavior, and must land in the new page's main content (the `main` region or its heading), never on `body` or on the now hidden link. This must be verified in a browser.
- A6. Focus is not moved into the menu on open. DOM order is the Menu button, then the `nav`, so the next Tab reaches the first link. This must be verified in `site-shell.test.tsx` (tab order). Shift+Tab from the first link returns to the Menu button, and Tab past the last link continues as normal. No trap.
- A7. Without JavaScript below `md`, the Menu button is hidden and the five primary links are visible, stacked, using a no-JS selector in `globals.css` like the one that hides `[data-theme-toggle]` (the Menu button and `nav` get data attributes). With JavaScript, the first render stays collapsed and matches the server HTML, so there is no layout shift and no hydration warning. This meets FOUND-004 A5 (no dead control).
- A8. Print hides the Menu button. The primary links print as they do today, and the page prints in light mode per the existing print rules.
- A9. Reduced motion is respected. The menu opens and closes with no animation, or only one disabled under `prefers-reduced-motion: reduce` (transitions keep `motion-reduce:transition-none`).
- A10. Tests. Unit tests (Vitest, React Testing Library, `test_acN_` naming, `matchMedia` stubs) cover Escape, outside pointerdown, presses inside the header, the toggle press, route change, resize to `md`, the focus return rules and the unchanged attributes. A new Playwright smoke test at a mobile viewport (375x667, `hasTouch`, set with `test.use`, Chromium only, as `docs/testing.md` allows) covers tap to open, outside tap to close, Escape with focus return, link navigation closing the menu with focus in the new page, the body staying scrollable, and the narrow no-JS page. `playwright.config.ts` keeps Desktop Chrome as the default project. JSDOM applies no media queries, so unit tests assert classes, attributes and state, and the e2e test checks real layout. The 320px width at 200% zoom is a manual verification step, as in FOUND-004 A9.
- A11. Documentation: update the "Global shell" section of `docs/design-system.md` (menu behavior, dismissal rules, focus rules, no scroll lock, no-JS and print behavior), update `docs/testing.md` for the mobile smoke test, update `shell-docs.test.ts` assertions, and update the CLAUDE.md Current state.
- A12. No new colors, dependencies, routes, backend, authentication, CMS or database. The existing 3:1 focus and `min-h-10` target rules apply to the Menu button and the links.

## Acceptance criteria
1. Given a viewport narrower than `md` on any core route, when I tap or click the Menu button, then the five primary links appear, the button reports `aria-expanded="true"`, and the links are in the page flow with no horizontal scroll.
2. Given the menu is closed and the Menu button has focus, when I press Enter or Space, then the menu opens and focus stays on the button, and when I press Tab, then focus moves to the first link ("Home") in the menu, and Tab then moves through the links in order.
3. Given the menu is open, when I press Escape from anywhere on the page, then the menu closes, `aria-expanded` is `"false"`, and focus is on the Menu button. Given the menu is closed, when I press Escape, then nothing changes.
4. Given the menu is open, when I tap or click anywhere outside the header, then the menu closes. If focus was inside the menu, it moves to the Menu button, and otherwise focus stays where my press put it.
5. Given the menu is open, when I tap or click the Menu button, then the menu closes once (it does not close and reopen), and focus remains on the button.
6. Given the menu is open, when I choose a link, then the menu closes, the browser goes to that route, `aria-current="page"` is on the new route's link, and focus is in the new page's main content, not on `body` or a hidden element.
7. Given the menu is open, when I scroll the page by touch, wheel or keyboard, then the page scrolls, the body has no `overflow: hidden` and no scroll-lock style, and after the menu closes the page still scrolls.
8. Given the menu is open, when I use the theme toggle, then the theme choice changes, the menu stays open, and both controls stay operable.
9. Given the menu is open, when the viewport grows to `md` or wider, then the menu state resets, the inline navigation is shown, the Menu button is hidden, and no control is left expanded.
10. Given JavaScript is disabled on a viewport narrower than `md`, when I load any core route, then all five primary links are visible and usable and no Menu button is shown, and the theme toggle is still hidden as in FOUND-004.
11. Given print, when I print a core route narrower or wider than `md`, then the Menu button is not printed.
12. Given the change is applied, when I run `npm run check` and `npm run e2e`, then typecheck, ESLint (zero warnings), the Prettier check, the unit tests (updated and new) and the production build pass, the new mobile smoke test and the existing e2e tests pass, and `docs/design-system.md`, `docs/testing.md` and the CLAUDE.md Current state describe the menu behavior.

## Edge cases
- Rapid toggling (double tap, repeated Enter): the final state matches the number of presses, `aria-expanded` always matches the visible state, and no listener is left registered (listeners attach only while open).
- Open, then browser back or forward: the pathname change closes the menu and focus is not lost on `body`.
- Open, then resize across `md` and back: the menu is closed after the round trip, not reopened.
- Press on the Menu button while open: counts as one toggle only (criterion 5), including a touch pointerdown followed by click.
- Press inside the `nav` but not on a link (padding or gap): the menu stays open.
- Tapping a link in `main` or the footer while open: dismisses without stealing focus from the pressed control (A4).
- 320px width at 200% zoom with the site name, the theme toggle and the Menu button: the header wraps without clipping, overlap or horizontal scroll, and targets stay at least `min-h-10` (manual check).
- Long page behind the menu: no scroll lock, no jump to top when the menu opens or closes.
- Escape pressed while focus is in the theme toggle or a link in `main`: closes the menu and moves focus to the Menu button.
- Pointer events: mouse and pen dismiss on press, touch on tap; a touch scroll does not dismiss. Touch-only devices that send `click` without `pointerdown` are not supported.
- Forced-colors and high-contrast modes: the Menu button border and focus outline stay visible.
- Screen readers: `aria-expanded` and `aria-controls` stay correct, the `nav` keeps its "Primary" name, and the closed `nav` is `display: none`, not just visually hidden.
- Hydration: the first client render matches the server HTML (no hydration warning) and is closed on first render, including the A7 no-JS state.
- The CI brief scope check requires every new non-exempt file to appear in the brief.

## Out of scope
- A full-screen overlay, drawer or sheet menu, Radix Dialog, focus trap, `inert` background or body scroll lock. A modal menu would need its own story.
- Submenus, nested navigation, a search field or new items in `primaryNav`, and any change to the five core routes.
- Redesign of the header, the site name, the theme toggle or its behavior.
- Animated open and close transitions beyond what is already there.
- Running Playwright on more than Chromium, a Firefox, WebKit or real-device matrix, and automated accessibility or visual testing.
- Vercel deployment, CSP, analytics.
- Backend, authentication, CMS, database.
