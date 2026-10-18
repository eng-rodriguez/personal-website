# Build global shell
Source: FOUND-003, https://github.com/eng-rodriguez/personal-website/issues/3 (labels: area:foundation, priority:p0, type:feature)

As the site owner, I want a shared header, footer, navigation, metadata defaults and content container applied to every core route, so that visitors can move around the site on mobile and desktop and later stories can add Writing, Portfolio and Career pages inside one consistent Site presentation shell.

Assumptions:
- A1. The shell lives in `src/app/layout.tsx` and shared components under `src/components`. It owns the single `<main>` landmark, the content container, the header with navigation, and the footer. Pages render their content only and no longer render their own `<main>`.
- A2. The core routes are Home `/`, Writing `/writing`, Projects `/projects`, Experience `/experience` and Resume `/resume`. The route names are not yet decided in the domain or in an ADR. Each route except Home is a minimal placeholder page (heading and one short sentence, no content). No MDX, Zod schema or content loading is added.
- A3. The mobile navigation is a disclosure pattern: a toggle button with `aria-expanded` and `aria-controls` that shows or hides the navigation list below the `md` breakpoint. At `md` and wider the navigation list is always visible and the toggle is hidden. No new dependency is added; it uses React state in one small client component.
- A4. The active link is identified by `aria-current="page"` plus a visual style that does not rely on color alone. It is computed with `usePathname` from `next/navigation`. Home is active only on an exact match of `/`. Section links are active on an exact match or when the pathname starts with the link path followed by `/`.
- A5. A skip link ("Skip to main content") is the first focusable element. It is visually hidden until focused and targets the `<main>` element.
- A6. The footer shows a copyright line with the site name and the current year, and no contact details, email or social links.
- A7. Metadata defaults live in the root layout: `title.default` is the site name from `src/lib/site.ts`, `title.template` is `%s · <site name>`, and the description comes from `src/lib/site.ts`. `metadataBase` is not set because the domain is undecided. Placeholder pages export their own `title`.
- A8. The shell uses the existing design tokens and the `:focus-visible` outline rules from `docs/design-system.md`. No new color token is added. If a new token pair is added anyway, the pair is added to `TEXT_PAIRS` in `src/app/globals.test.ts`. There are no `dark:` overrides.
- A9. No shadcn component and no new dependency (such as `lucide-react` or `@testing-library/user-event`) is added. The menu toggle uses text or inline SVG. Tests use `fireEvent` from React Testing Library, and `next/navigation` is mocked in Vitest.
- A10. Playwright stays out of scope. Real mobile and desktop behavior is checked manually and recorded in the brief's Manual verification section. Unit tests cover markup, attributes, class names and state.
- A11. `docs/design-system.md` gets a short "Global shell" section (landmarks, container width, breakpoint, active link rule, skip link). The CLAUDE.md Current state is updated to describe the shell and the placeholder routes.

Decisions on the open questions (proposed, for the human to approve):
- Core route set and labels: Home, Writing, Projects, Experience, Resume, as in A2, with the four placeholder pages shipped in this story. Case studies are reached through Projects later, and no separate case study route is added now.
- Header brand: the left side of the header shows the site name from `src/lib/site.ts` as a link to `/`, in addition to the Home navigation link. The brand link is not marked with `aria-current`.
- Mobile menu: a JavaScript disclosure toggle (A3), not a `<details>` element.
- Breakpoint: `md` (768px) switches between the disclosure menu and the inline navigation.
- Menu behavior: it closes when a link is chosen (the pathname changes) and when Escape is pressed, and focus returns to the toggle after Escape.
- Content container: one shared container (centered, `max-w-prose`-style reading width with horizontal padding, matching the current home page) wraps the `<main>` content. Wider layouts are decided per page in later stories.
- Existing home test: `src/app/page.test.tsx` is updated to assert the Home content only, and a new layout/shell test asserts exactly one `main` landmark.
- Metadata: as in A7. Open Graph, icons, robots, sitemap and canonical URLs are not part of this story.

## Acceptance criteria
1. Given each core route (`/`, `/writing`, `/projects`, `/experience`, `/resume`), when it is rendered, then it shows the same header, navigation, footer and content container, and its page content appears inside exactly one `main` landmark.
2. Given a desktop viewport (`md` and wider), when a core route loads, then the navigation links to all five core routes are visible in the header without opening a menu, and the menu toggle is not shown.
3. Given a mobile viewport (narrower than `md`), when a core route loads, then the navigation links are hidden and a menu toggle button with an accessible name is shown, with `aria-expanded="false"`.
4. Given a mobile viewport with the menu closed, when I activate the toggle, then `aria-expanded` becomes `true` and all five links are visible. When I activate a link, press Escape, or activate the toggle again, then the menu closes. After Escape, focus is on the toggle.
5. Given I am on a core route, when I look at the navigation, then exactly one link has `aria-current="page"` and a visual style distinct from the others that does not rely on color alone. On `/` only Home is active. On `/writing` only Writing is active. A nested path such as `/writing/example` marks Writing active, and `/writingx` does not.
6. Given I use only the keyboard, when I press Tab on any core route, then the first focus stop is the skip link, and activating it moves focus to the `main` landmark. Every header, navigation and footer control shows the `:focus-visible` outline in both themes.
7. Given any core route, when I read the page head, then the default title is the site name and a page with its own title renders as `<page title> · <site name>`. The meta description is present. No `metadataBase` is set.
8. Given the footer, when I read it, then it shows a copyright line with the site name and the current year, and it contains no email address, phone number or social links.
9. Given the change is applied, when I run `npm run check`, then typecheck, ESLint (with `--max-warnings=0`), the Prettier check, the unit tests (including the updated home page test and the new shell tests) and the production build all pass. `npm audit --audit-level=high --omit=dev` also passes.
10. Given the change is applied, when I read `docs/design-system.md` and the CLAUDE.md Current state, then they describe the global shell, the core routes, the active link rule and the mobile menu pattern.

## Edge cases
- Unknown route: a path that matches no core route (for example the framework 404 page) still renders inside the shell, and no navigation link is marked active.
- Trailing slash or query string: `/writing/` and `/writing?x=1` still mark Writing active, because the comparison uses the pathname only.
- Duplicate landmarks: there is exactly one `main`, one `header` (banner) and one `footer` (contentinfo) per page, and the navigation has an accessible name such as "Primary" so it is distinguishable from any later navigation.
- Menu state on navigation: opening the menu and then navigating by link or by browser back and forward never leaves the menu open on the new page.
- Resize across the breakpoint: with the menu open on mobile, widening past `md` shows the inline navigation and does not leave a stuck open state or hide links. Narrowing again shows the menu closed.
- No JavaScript or before hydration: the links are in the server-rendered HTML, so the site remains navigable at `md` and wider.
- Forced-colors or high-contrast mode: the active link indicator and focus outline stay visible and do not depend on a custom color or box-shadow alone.
- Reduced motion: any menu open or close transition is disabled or minimized when `prefers-reduced-motion: reduce` is set.
- Touch target size: the toggle and navigation links are at least 24 by 24 CSS pixels, per WCAG 2.2 target size minimum.
- Zoom and long labels: at 200 percent zoom and 320px width, the header does not cause horizontal scrolling and no link is clipped.
- Contrast: any new color pair used by the shell (for example the active link) is added to `TEXT_PAIRS` in `src/app/globals.test.ts` and is at least 4.5:1 in both themes.
- Year in the footer: a test fixes the date, so the copyright year does not make the test fail in a new year.
- JSDOM does not apply media queries or Tailwind. Tests assert the responsive class names and the state attributes, and the real mobile and desktop behavior is verified manually.
- The `next/navigation` mock covers `usePathname` only, and the shell does not use any API that needs a running Next.js server in unit tests.
- The CI brief scope check compares changed files with the brief's file list, so all new components, pages and tests must appear in the brief.
- No network calls, fonts or analytics are added at build or run time, and no contact details are published.

## Out of scope
- Real content pages for Writing, Portfolio (projects and case studies) and Career (experience and resume), including detail routes and dynamic segments.
- MDX pipeline, Zod frontmatter schemas and content loading.
- Final route names beyond the placeholder set, redirects and a sitemap.
- Open Graph and social images, favicons and icons, robots, canonical URLs and `metadataBase` (waits for the domain decision).
- A theme toggle, search, breadcrumbs, a language switcher and a command palette.
- Contact mechanisms, social links and analytics.
- New dependencies, new shadcn components, Playwright and automated browser or visual accessibility testing.
- Branding, logo, custom typefaces and the visual design of the home page.
- Vercel deployment.
- New backend services, authentication, CMS and database.
