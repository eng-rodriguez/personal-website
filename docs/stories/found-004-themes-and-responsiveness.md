# Implement themes and responsiveness
Source: FOUND-004, https://github.com/eng-rodriguez/personal-website/issues/4 (labels: area:foundation, priority:p0, type:feature)

As a visitor, I want the site to follow my system light or dark setting, let me override it with a choice that is remembered, and stay usable from 320px wide upward, so that I can read it comfortably on any device without a flash of the wrong theme.

Assumptions (approved 2026-10-18 by @eng-rodriguez):
- A1. Three-option preference: System (default), Light, Dark. System follows the OS live, including OS changes while the page is open.
- A2. The preference is persisted per device and browser in `localStorage` only. No cookie, no server. Missing, invalid or blocked storage falls back to System without errors.
- A3. The correct theme is applied before first paint on every load, including a stored explicit choice that differs from the OS. This needs a class-based dark variant and a pre-paint step, so a new ADR supersedes the OS-only rule in ADR 0002. The mechanism is a small project-owned inline pre-paint script in the root layout; `next-themes` or another theme library is not added.
- A4. The toggle is a three-option segmented control (radio group: System, Light, Dark) with all choices visible, in the header next to the navigation. It is keyboard operable, has an accessible name, exposes the current choice to assistive technology, has visible focus, and meets the 3:1 contrast and `min-h-10` target rules.
- A5. Without JavaScript the site follows the OS and the toggle is hidden or inert (no dead control is shown).
- A6. Browser UI (form controls, scrollbars) follows the active theme through `color-scheme`.
- A7. Breakpoints: keep the Tailwind defaults and document them in `docs/design-system.md`. `md` (48rem) stays the shell's switch between the disclosure menu and the inline navigation. The supported minimum width is 320px.
- A8. No new colors or brand palette. The existing light and dark token values are reused, and the contrast tests keep covering both themes.
- A9. 320px verification uses unit-level checks (class names, attributes, state) plus documented manual verification. Playwright installation is a separate decision.
- A10. Documentation updated: `docs/design-system.md` (Themes, Global shell, breakpoints), the CLAUDE.md Current state, and `src/app/globals.test.ts` and `shell-docs.test.ts` structure assertions that currently assert the OS-only shape.

- A11. Printing always uses the light theme.

## Acceptance criteria
1. Given no stored preference, when the site loads, then the theme matches the OS (light or dark) and the toggle shows System as the current choice.
2. Given the OS is dark and I have stored Light (or the OS is light and I have stored Dark), when I load or reload any core route, then the first paint already uses the stored theme, with no flash of the other theme and no hydration warning in the browser console.
3. Given the choice is System, when the OS theme changes while the page is open, then the site switches theme without a reload. Given the choice is Light or Dark, when the OS theme changes, then the site does not change.
4. Given the header on any core route, when I use only the keyboard, then I can reach the toggle in a logical tab order, change the choice among System, Light and Dark, and see a visible focus outline in both themes.
5. Given the toggle, when I inspect it with assistive technology, then it has an accessible name (for example "Theme") and its current choice is exposed in text or state (for example `aria-pressed`, `aria-checked` or a selected option), not by color or icon alone.
6. Given I choose Light, Dark or System, when I reload the page or open another core route, then my choice is kept. Choosing System clears the stored explicit choice.
7. Given `localStorage` is unavailable, throws, or holds an invalid value, when the site loads or I change the choice, then the site works, uses System (or the in-session choice), and shows no error to the user or in the console.
8. Given either active theme, when I check the text and focus color pairs, then every pair in `TEXT_PAIRS` meets at least 4.5:1 (text) and 3:1 (focus and toggle indicators), in both the OS-driven and the explicit class-driven dark theme.
9. Given a viewport from 320px wide upward and at 200% zoom, when I load each of the five core routes with the toggle present, then there is no horizontal scrolling, no control is clipped or overlapped, and every link and the toggle is at least `min-h-10`.
10. Given a viewport narrower than `md` with the mobile menu open, when I use the toggle and the menu together, then both remain operable, the menu behavior from FOUND-003 is unchanged, and opening the menu does not cause horizontal scroll.
11. Given JavaScript is disabled, when I load any core route, then the page renders in the OS theme, navigation works at `md` and wider, and no non-functional theme control is shown.
12. Given the change is applied, when I run `npm run check`, then typecheck, ESLint (`--max-warnings=0`), the Prettier check, the unit tests (updated structure tests plus new theme and toggle tests) and the production build all pass. `npm audit --audit-level=high --omit=dev` also passes.
13. Given the change is applied, when I read `docs/design-system.md`, the new ADR and the CLAUDE.md Current state, then they describe the theme mechanism, the storage key and fallback, the toggle, the breakpoint set, and the manual 320px verification steps.
14. Given Dark is active (stored or from the OS), when I print a core route, then the printed output uses the light theme tokens.

## Edge cases
- Stored value is an unknown string, an empty string or a stale value from an older version: treated as System.
- Two tabs open: changing the choice in one tab updates the other (storage event), or the behavior is documented if not.
- Private browsing or storage quota errors on write: the in-session choice still applies and no exception surfaces.
- OS theme changes while an explicit choice is stored: no change. While System is chosen: live change.
- Hydration: the server-rendered toggle state must not differ from the first client render, so there is no mismatch warning and no wrong "selected" state flash.
- Forced-colors or high-contrast mode: the toggle, its current state and focus outline stay visible and do not rely on custom color alone.
- Reduced motion: any theme transition is disabled or minimal under `prefers-reduced-motion: reduce`. Prefer no animated color transition to avoid flash-like effects.
- Print: the printed page always uses the light theme, whatever the active choice.
- 320px with a long brand name, the toggle, the menu toggle and 200% zoom: the header wraps without clipping or horizontal scroll.
- Resize across `md` with the menu open (from FOUND-003) still works with the toggle present.
- Landscape phones and very wide screens: the container keeps its reading width and nothing stretches.
- JSDOM applies neither media queries nor Tailwind. Tests assert class names, attributes, `matchMedia` mocks and storage behavior. Real rendering is checked manually.
- The CI brief scope check compares changed files with the brief's file list, so all new files must appear in the brief.
- No network calls, cookies, analytics or new backend are added.

## Out of scope
- Installing Playwright or any automated browser, visual or accessibility testing.
- Content pages and content (MDX, Zod schemas).
- New colors, brand palette, typefaces or per-route themes.
- Cookie-based or server-side theme handling, and middleware or headers (including a CSP decision).
- Analytics on the toggle.
- More than the three options (no custom themes, no scheduled themes).
- Changing the core route set, the shell structure or the mobile menu pattern beyond fitting the toggle.
- Vercel deployment.
- New backend services, authentication, CMS and database.
