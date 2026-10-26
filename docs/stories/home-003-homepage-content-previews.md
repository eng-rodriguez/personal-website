# Implement homepage content previews
Source: HOME-003, https://github.com/eng-rodriguez/personal-website/issues/8. Dependencies: BLOG-001 and PROJ-001 (both shipped). Slug: home-003-homepage-content-previews.

As a visitor, I want the home page to show the owner's featured Projects and most recent Articles after the hero, so that I can see current work and writing and reach the full sections at once. As the site owner, I want these previews to come from the content collections, so that publishing a file updates the home page without editing a component.

## Ticket acceptance criteria (kept)
- Featured items derive from content.
- Empty collections render safely.
- Cards link correctly.
- Relevant tests and documentation are updated.
- Lint, typecheck, unit tests and the production build pass.

## Acceptance criteria
1. Given Projects exist, when `/` renders, then the "Featured projects" section lists the Projects with `featured: true`, in `getProjects()` order (`startedAt` descending, then slug), at most 3. Projects without `featured: true` do not appear (unit test with fixtures).
2. Given Articles exist, when `/` renders, then the "Recent writing" section lists the 3 most recent published Articles in `getArticles()` order (`publishedAt` descending, then slug). The `featured` flag on Articles is not used on the home page in this story (unit test with fixtures).
3. Given both sections have items, when `/` renders, then they appear after the hero in this order: Featured projects, then Recent writing. Each section has an `h2` title and each card an `h3` title. The hero's name stays the only `h1`, inside the single `main`.
4. Given a Project card, when it renders, then it shows the title, the summary and each `stack` entry as a Tag. Given an Article card, then it shows the title, the description and `publishedAt` as a human-readable date in a `<time dateTime="<ISO date>">` element.
5. Given any `publishedAt` value, when the date renders, then it uses one fixed format and locale (en-US, for example "Oct 25, 2026") and does not shift by a day in any time zone (unit test run under a non-UTC `TZ`).
6. Given a card on `/`, when I activate its title, then it navigates to its section page (`/projects` for Projects, `/writing` for Articles). Given each section, then it has a "View all" link to the same section page. No card links to a detail route (Playwright and unit test).
7. Given a section has nothing to show, when `/` renders, then that section is not rendered at all: no heading, no EmptyState and no empty container. Given one section is empty and the other is not, then only the non-empty one renders.
8. Given both collections are empty (today's real state), when `/` renders, then the page shows only the hero, unchanged: the main still has exactly two links (the hero CTAs), `core-pages.test.tsx` still asserts no empty-state on `/`, and the existing hero e2e tests pass.
9. Given Articles or Projects with `draft: true`, when the site is built in production (`NODE_ENV=production`), then no draft appears on `/`, including a draft Project with `featured: true`. A draft never takes a slot from a published item (unit test with the `mode` option).
10. Given `/` after `npm run build`, when I inspect the build output and the page without JavaScript, then the route is statically rendered, no client component or `"use client"` is added, and the cards and links render and navigate with JavaScript disabled (extend the no-JavaScript e2e test or add a case).
11. Given a viewport of 320px width with a long title, summary or description, when `/` loads, then there is no horizontal scrolling and every card link has a hit area of at least 24 by 24 CSS pixels (Playwright with fixture content, or unit test plus manual check at 320px and 1280px at 200% zoom).
12. Given a keyboard user on `/`, when they press Tab past the hero CTAs, then focus reaches each section's card title links and its "View all" link in reading order, each showing the global outline focus indicator in Light and Dark.
13. Given each theme (Light and Dark) and print, when the contrast test runs, then any new text and background pair is in `TEXT_PAIRS` in `src/app/globals.test.ts` and meets the existing thresholds. Existing tokens and primitives (Section, Card, Grid, Tag, Link) are used, with no new dependency.
14. Given the selection logic, when the unit tests run, then it is tested without real content, using fixtures through the `directory` and `mode` options, and the presentational component takes the data as props. The tests cover: no items, fewer than the limit, exactly the limit and more than the limit.
15. Given `docs/design-system.md` and `docs/content.md`, when I read them, then the design system documents the home sections (selection rules, limits, empty behavior, card links, date format) and the content guide states what `featured` does on the home page for Projects (selects, max 3, no ordering field) and that Article `featured` does not affect it. CLAUDE.md "Current state" is updated, and the docs tests still pass.
16. Given the change is applied, when I run `npm run check`, then typecheck, ESLint with zero warnings, the Prettier check, the unit tests and the production build pass, and `npm run e2e` passes.
17. Given a `feat/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed in `docs/briefs/home-003-homepage-content-previews.md`.

## Edge cases
- Only drafts in a collection: in production the section is not rendered (AC7, AC9). In development drafts follow the existing loader behavior.
- More than 3 featured Projects: only the first 3 in `getProjects()` order show. There is no featured ordering field, so the owner controls the choice through `startedAt`. This is documented.
- A featured Project that is a draft: excluded in production and does not consume one of the 3 slots.
- One collection empty and the other not: only the non-empty section renders, with no gap or stray spacing.
- Same `publishedAt` (or same `startedAt`): the order is the loader's tie-break by slug, so it is stable.
- Fewer than 3 items: the grid renders only the items that exist, with no placeholders.
- Very long titles, summaries, descriptions or many stack entries: text wraps and Tags wrap with no horizontal scroll at 320px and at 200% zoom. Long unbroken strings are a known layout risk.
- Date near midnight or a non-UTC build or browser time zone: the rendered day equals the ISO date (AC5).
- `publishedAt` in the future: shown, because publication depends only on `draft` (domain invariant).
- Invalid content file: the build fails, as it does today. No change.
- Optional `cover` images and Project `links`: not shown on the home cards.
- Section pages `/projects` and `/writing` stay placeholders with an EmptyState. A card title or "View all" lands there until detail pages exist. Accepted for now.
- Heading structure: `h1` (hero), `h2` (sections), `h3` (cards). No level is skipped.
- Tailwind scanning: class names stay literal strings. No hard-coded colors or `dark:` variants; print stays light.
- Pre-existing, unchanged: the 3 ESLint 10 `ERESOLVE` peer warnings. Do not use `--force` or `--legacy-peer-deps`.
- `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` are untracked and must not be committed with this story.

## Out of scope
- Professional highlights. Deferred to a future experience/career content story, because Professional experience has no content model or code yet. That story needs an ADR and also settles the open question of whether the resume is generated from Professional experience or maintained separately.
- Card links to detail routes. `/writing/<slug>` belongs to BLOG-003 and `/projects/<slug>` to PROJ-003; switching the links then is part of those stories.
- Using the Article `featured` flag, a featured ordering field, or tag filters on the home page.
- Configurable limits in `site` config (the limit of 3 is a constant in code).
- Showing cover images, Project links, status, role or dates on Project cards.
- An EmptyState or any placeholder on `/` when a collection is empty.
- Real content: `content/articles` and `content/projects` stay empty in this story. Fixtures are used in tests only.
- Changes to the hero, tokens, themes, breakpoints, the global shell or header navigation (except new contrast pairs if needed).
- Pagination, search, RSS, SEO or Open Graph work, analytics, animation or an icon library.
- A new dependency, new backend service, authentication, CMS, database or Vercel deployment.

## Decisions
- Professional highlights deferred, card links go to the section pages with a "View all" link per section, and empty sections are not rendered (human decisions before the story).
- Defaults stated as criteria: 3 items per section, Article `featured` unused on the home page, en-US "Oct 25, 2026" date format.

## Notes
- Suggested shape (for the brief, not binding): a selection helper in `src/lib` that takes the lists and returns at most 3 featured Projects and 3 recent Articles; a presentational server component in `src/components/site` that takes the data as props; `src/app/page.tsx` stays a server component and becomes async only if the loaders require it. Verify against the installed Next.js 16 documentation.
- Existing tests to keep passing: `src/app/page.test.tsx`, `src/app/core-pages.test.tsx`, `e2e/home-hero.spec.ts` (main has exactly 2 links; true while collections are empty), `e2e/no-js.spec.ts`.
- No date formatter exists today, so a small one is added with a unit test (AC5).
