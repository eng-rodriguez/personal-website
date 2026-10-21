# Implement homepage hero
Source: HOME-002, https://github.com/eng-rodriguez/personal-website/issues/7 (labels: type:feature, priority:p0, area:design). Dependency: FOUND-001. Slug: home-002-homepage-hero.

As a visitor, I want the home page to open with a concise hero (the owner's name, role, positioning statement and primary calls to action), so that I understand who the owner is and can reach the main sections at once. As the site owner, I want that copy to be configurable in one place.

Approved by @eng-rodriguez on 2026-10-20. Decisions: generic placeholder copy ships; the positioning statement is a separate field and `site.description` stays the metadata default; CTAs are "View projects" to `/projects` (primary) and "Read writing" to `/writing` (outline).

Assumptions (approved):
- A1. Copy source: the hero copy lives in a typed config in `src/lib`, as a `hero` object added to the existing `site` config (`src/lib/site.ts`). It holds name, role, positioning statement and the CTAs as `{ label, href }`. The owner edits this config, not the component. Placeholder copy is acceptable in this story.
- A2. Validation: the config is checked by unit tests (and by types where possible). Strings are non-empty after trimming. Every internal CTA href is a core route from `primaryNav` in `src/lib/navigation.ts`. Invalid copy fails `npm run check`.
- A3. Heading: the hero's `h1` is the person's name and stays the only `h1` on `/`. It is rendered through PageHeading (inside `div[data-slot=page-heading]`). The document title stays `site.name`.
- A4. Role and positioning statement: the role is a short line below the name. The positioning statement is one paragraph. Both are plain text, with no markup in the config.
- A5. CTAs: two primary CTAs to existing internal routes (default: "View projects" to `/projects`, "Read writing" to `/writing`). The first uses the primary Button style and the second the outline or secondary style, both through the existing `Link` primitive with `variant`. Labels are short, because `Link` with a variant does not wrap. No `mailto:`, `tel:` or external contact CTA, because no contact mechanism is approved. There are no resume CTA or PDF, because no resume PDF exists.
- A6. Portrait: optional and off by default. The hero accepts an optional portrait (`src`, `alt`, `width`, `height`). No asset and no `public/` directory ship in this story. When no portrait is configured, the layout has no empty slot or placeholder.
- A7. Component: a new `Hero` component in `src/components/site`. It is a Server Component, with no `"use client"`, state or effects. It works without JavaScript and uses existing tokens only.
- A8. Layout: the hero sits inside the single `main` owned by the root layout. It uses the documented breakpoints. CTAs stack or wrap on small screens.
- A9. Existing tests: `src/app/page.test.tsx`, `src/app/core-pages.test.tsx`, `e2e/core-routes.spec.ts`, `e2e/no-js.spec.ts` and `e2e/theme.spec.ts` still pass. If the description paragraph on `/` changes, the tests are updated in a way that keeps their intent (h1 text, one `main`, one `h1`, title).
- A10. Documentation: `docs/design-system.md` gets a "Hero" section (props, config shape, portrait rule, accessibility). CLAUDE.md "Current state" is updated.
- A11. New text and background color pairs, if any, are added to `TEXT_PAIRS` in `src/app/globals.test.ts`. Existing tokens are preferred.
- A12. No new dependency, no `next/image` use unless a portrait asset is added later, no new backend, authentication, CMS or database.

## Acceptance criteria
1. Given the hero config with a name, role, positioning statement and two CTAs, when `/` renders, then the hero shows the name as the only `h1`, the role, the positioning statement and both CTAs, inside the single `main`, and the document title is still `site.name`.
2. Given I change a string in the hero config (name, role, positioning statement or a CTA label or href), when the page renders, then the page shows the changed value without any edit to a component file (unit test with a config passed in).
3. Given the hero config, when the unit tests run, then they fail for an empty or whitespace-only name, role, positioning statement or CTA label, for a CTA with no href, and for an internal CTA href that is not a core route in `primaryNav`.
4. Given each CTA on `/`, when I activate it, then it is a link that navigates to its target route (`/projects`, `/writing` by default), the target returns a successful page with its own `h1`, and no CTA is a `mailto:`, `tel:` or external link (Playwright).
5. Given a keyboard user on `/`, when they press Tab from the page start, then focus passes the skip link, the header navigation and the theme toggle, then reaches the first CTA and then the second, in reading order, and each CTA shows the global outline focus indicator in Light and Dark; Enter on a focused CTA navigates (Playwright and manual).
6. Given a viewport of 320px width, when `/` loads, then there is no horizontal scrolling, the CTAs are fully visible (stacked or wrapped) and each CTA has a hit area of at least 24 by 24 CSS pixels (Playwright for scroll width and CTA box size; manual check at 320px and 1280px at 200% zoom as listed in "Breakpoints").
7. Given JavaScript is disabled, when `/` loads, then the name, role, positioning statement and both CTAs render and the CTAs navigate (extend the no-JavaScript e2e test, or add a case to it).
8. Given no portrait is configured, when `/` renders, then there is no `img`, no empty container and no reserved space for it. Given a portrait with `src`, `alt`, `width` and `height`, then one `img` renders with that alt text and dimensions, and it does not cause horizontal scrolling at 320px (unit test).
9. Given each theme (Light and Dark) and print, when the contrast test runs, then every text and background pair used by the hero is in `TEXT_PAIRS` and meets the existing thresholds, and print stays light.
10. Given `docs/design-system.md`, when I read the "Hero" section, then it describes the config shape, how to edit the copy, how to add a portrait, the CTA rules (internal core routes only, short labels, one primary style) and the keyboard and mobile checks, and the docs tests still pass.
11. Given the change is applied, when I run `npm run check`, then typecheck, ESLint with zero warnings, the Prettier check, the unit tests (with tests for the hero component and for the config) and the production build pass, and `npm run e2e` passes.
12. Given a `feat/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed in `docs/briefs/home-002-homepage-hero.md`.

## Edge cases
- Very long name, role, positioning statement or CTA label: text wraps without horizontal scroll at 320px and at 200% zoom. CTA labels do not wrap with `variant`, so the limit on label length is documented, and a long label is a known layout risk.
- Empty or whitespace-only copy: rejected by the config tests (AC3); the component never renders an empty element for the role or the statement.
- Zero CTAs, or more than two: the config type requires two CTAs.
- Two CTAs with the same href, or a CTA pointing to `/` (the current page): rejected by the config test.
- Placeholder target pages: `/writing`, `/projects`, `/experience` and `/resume` are placeholders with an EmptyState. CTAs resolve, but the visitor lands on a "coming soon" page. This is accepted for now.
- Resume CTA: no resume PDF exists, so none is added.
- Portrait: missing or empty `alt` is rejected by types or tests; very tall or wide images are limited by the `width` and `height` given; no `next/image` remote hosts are configured.
- Heading structure: PageHeading remains the only `h1`; any hero sub-headings would need `h2` and are not planned.
- Forced-colors, print and dark theme: existing tokens only, no hard-coded colors, no `dark:` variants; CTAs keep a visible border or outline in forced colors; print stays light.
- Tailwind scanning: class names stay literal strings.
- Hydration: nothing depends on the browser, so the no-JavaScript page renders identically.
- Reduced motion: no animation is added.
- Pre-existing, unchanged: the 3 ESLint 10 `ERESOLVE overriding peer dependency` warnings and dev-only `npm audit` advisories. Do not use `--force` or `--legacy-peer-deps`.
- `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` are untracked and must not be committed with this story.

## Out of scope
- Real, final copy: the owner supplies it by editing the config (placeholder copy ships).
- A portrait asset, a `public/` directory, `next/image` configuration, image optimization settings.
- Contact CTAs, contact forms, `mailto:`, social links or any new contact mechanism; resume download or PDF.
- Other home page sections (featured projects, latest writing, skills).
- MDX, content schemas or Zod schemas for content; the hero config is not a content type.
- Changes to tokens, themes, breakpoints, the global shell or the header navigation (except new contrast pairs if needed).
- Animation, motion, background graphics, icons or an icon library.
- Analytics, SEO or Open Graph work, and metadata changes beyond keeping the current title.
- A new dependency, new backend service, authentication, CMS or database.
- Vercel deployment.
