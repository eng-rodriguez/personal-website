# Build the Projects index with cards and filters
Source: PROJ-002, https://github.com/eng-rodriguez/personal-website/issues/11. Dependencies: PROJ-001 (shipped). Slug: proj-002-projects-index.

As a visitor, I want `/projects` to list the owner's Projects and let me narrow them by category and technology, so that I can find relevant work quickly. As the site owner, I want the index to come from the Project content, so that publishing a file updates it without editing a component.

## Ticket acceptance criteria (kept)
- Filtering works without server API.
- Accessible controls.
- Valid project links.
- Relevant tests and documentation are updated.
- Lint, typecheck, unit tests and the production build pass.

## Acceptance criteria
1. Given Projects exist, when `/projects` renders, then each Project appears as a Card in `getProjects()` order (`startedAt` descending, then slug), showing the title as an `h2` (the PageHeading stays the only `h1`), the summary, the status (Active, Completed or Archived) and each `stack` entry as a Tag (unit test with fixtures).
2. Given Projects exist, when the page renders, then a "Filters" group offers a "Category" control and a "Technology" control. Category options are "All" plus the statuses present among the listed Projects. Technology options are "All" plus the distinct `stack` entries across the listed Projects, de-duplicated case-insensitively (see decisions 1 to 3). Options with no Project are not offered.
3. Given a Category and/or Technology option is chosen, when the list updates, then only Projects matching both groups are shown (AND between groups), and their order is unchanged. Choosing "All" in a group removes that group's constraint. Filtering runs in the browser with no network request and no server API (unit test, plus Playwright asserting no request after load).
4. Given a filter is applied, when the list updates, then a polite live region announces the result count ("3 projects", "1 project", "No matching projects") and the visible count matches the cards shown.
5. Given a filter combination matches nothing, when the list updates, then the cards are replaced by an EmptyState "No matching projects" with a "Clear filters" button that resets both groups to "All", returns focus to a stable control and restores the full list.
6. Given the filter controls, when I use a keyboard or a screen reader, then each group is a native radio group (`fieldset` with `legend`) whose options have visible labels, are reachable with Tab and arrow keys, show the global outline focus indicator in Light and Dark, have a hit area of at least 24 by 24 CSS pixels, and expose the selected option without relying on color alone.
7. Given no Projects exist (today's real state), when `/projects` renders, then the page shows the PageHeading and the existing EmptyState "No projects yet", with no filter controls, no count and no "No matching projects" state.
8. Given a Project card, when it renders, then its title is not a link to a page that does not exist: it has no link (see decision 7). No card links to `/projects/<slug>`, and every `href` rendered on the page passes the `Link` safe-href check (unit test over fixtures with and without `links`).
9. Given JavaScript is disabled, when `/projects` loads, then all Projects are listed in default order, the filter controls and live region are not shown, and nothing implies filtering is available (extend `e2e/no-js.spec.ts`).
10. Given `/projects` after `npm run build`, when I inspect the build output, then the route is statically rendered. The list and the Tags are server-rendered HTML, only the filter wrapper is a client component, and `useSearchParams` is not used, so no Suspense boundary is needed. The existing UI primitives stay free of `"use client"`.
11. Given `NODE_ENV=production`, when `/projects` renders, then no draft Project appears in the list, in the options or in the count. A draft's `stack` entries never create a Technology option (unit test with the `mode` option).
12. Given a viewport of 320px width with a long title, summary or many `stack` entries, when `/projects` loads, then there is no horizontal scrolling at 320px and at 200% zoom, and Tags and filter options wrap (Playwright with fixture content, or a unit test plus manual check).
13. Given each theme (Light and Dark) and print, when the contrast test runs, then any new text and background pair (selected option, count, status) is in `TEXT_PAIRS` in `src/app/globals.test.ts` and meets the existing thresholds. Existing tokens and primitives are used, with no new dependency. Print shows the full list in light, without controls.
14. Given the filter logic, when the unit tests run, then it is a pure function in `src/lib`, tested without real content and without a DOM, and the component takes the Projects as props. Tests cover: no Projects, one Project, no filter, one group, both groups, no match, case-insensitive duplicate stack entries, and a Project with `stack` entries in different order.
15. Given the real site while `content/projects` is empty, when `npm run e2e` runs, then the filter checks are skipped with an annotation (as in `e2e/home-previews.spec.ts`) and the empty-state check runs. Given fixture content, the component tests cover filtering behavior.
16. Given `docs/design-system.md`, `docs/content.md` and `docs/testing.md`, when I read them, then they document the index (order, filters, option derivation, AND semantics, empty states, no-JavaScript behavior, link behavior) and that `status` and `stack` drive the filters and no new field exists. `src/app/core-pages.test.tsx` is updated for the new structure and CLAUDE.md "Current state" is updated. The docs tests still pass.
17. Given the change is applied, when I run `npm run check`, then typecheck, ESLint with zero warnings, the Prettier check, the unit tests and the production build pass, and `npm run e2e` passes.
18. Given a `feat/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed in `docs/briefs/proj-002-projects-index.md`.

## Edge cases
- Empty content: only the "No projects yet" EmptyState; no controls, count or live region (AC7).
- One Project, or all Projects sharing one status or one technology: a group with only "All" plus one option is still shown for consistency.
- Filter combination with no match: "No matching projects" with "Clear filters" (AC5). Clearing while focus was on a removed element must not drop focus to `body`.
- `stack` entries differing only by case ("TypeScript" and "typescript"): one option, one label (decision 2). Surrounding whitespace is already rejected by the schema, so only case differs.
- Options with a very long technology name: wrap, no horizontal scroll at 320px.
- Many distinct technologies (dozens): the group wraps; no scroll container, no dropdown in this story.
- `featured` is not used on the index; featured Projects are not pinned or highlighted.
- Case studies appear as normal Projects; they have no extra badge or filter unless decision 1 is changed.
- Drafts: excluded in production, shown in development per the loader (AC11).
- Two Projects with the same `startedAt`: the loader's slug tie-break keeps the order stable, also while filtered.
- Dates are not shown on cards in this story.
- Rapid selection changes: the live region announces only the final count and does not stack messages.
- Hydration: the server-rendered list must equal the initial client state (all Projects, "All" selected) to avoid a mismatch.
- Reload resets the filter state to "All" (no URL sync, decision 4). Browser back and forward may restore the last selection from the back-forward cache; the controls and the list always agree (accepted by the owner at brief approval).
- Invalid content file: the build fails, as it does today. No change.
- Tailwind scanning: class names stay literal strings; no hard-coded colors or `dark:` variants.
- Pre-existing, unchanged: the 3 ESLint 10 `ERESOLVE` peer warnings. Do not use `--force` or `--legacy-peer-deps`.
- `AGENTS.md`, `docs/reviews/dependabot-actions-pr-34.md` and `docs/reviews/dependabot-prs-56-57.md` are untracked and must not be committed with this story.

## Out of scope
- The detail route `/projects/<slug>` (PROJ-003) and rendering frontmatter `links` (repo, live, other) on cards (PROJ-004).
- A new `category` or `tags` field, or any schema change to `src/lib/projects.ts` (would need a new decision under ADR 0007).
- URL or query-string sync of filter state, shareable filtered links, and `useSearchParams`.
- Multi-select, text search, sorting controls, pagination, and a "featured" section or ordering on the index.
- Cover images, dates, role and case-study badges on cards.
- Real content: `content/projects` stays empty in this story. Fixtures are used in tests only.
- Changes to the home previews, hero, tokens, themes, breakpoints, global shell or navigation (except new contrast pairs if needed).
- Analytics, SEO or Open Graph work, an icon library, animation, a new dependency.
- A new backend service, authentication, CMS, database or Vercel deployment.

## Decisions (recommended defaults)
1. Category maps to the existing `status` field (Active, Completed, Archived), not to a new field. Alternative: add a `category` (or `tags`) field, which requires a new ADR or an amendment to ADR 0007.
2. Technology options come from `stack`, grouped case-insensitively; the label is the spelling used by the first Project in `getProjects()` order that contains it. Options are sorted alphabetically (case-insensitive, en-US).
3. Each group is single-select ("All" plus options), shown as native radios. Groups combine with AND; a Project matches a technology if its `stack` contains it.
4. Filter state is local client state, with no URL sync. The route stays fully static and needs no Suspense boundary.
5. Without JavaScript, all Projects are listed and the controls are hidden (progressive enhancement, like the theme toggle).
6. Two empty states: "No projects yet" (no content, no filters shown) and "No matching projects" with "Clear filters". The result count is announced in a polite live region (`role="status"`).
7. Cards are not links until `/projects/<slug>` exists in PROJ-003. "Valid project links" is met by having no broken or unsafe links; external `links` are deferred to PROJ-004.
8. Tests use fixtures through the loader's `directory` and `mode` options. Playwright filter checks skip with an annotation while real content is empty; the empty-state check always runs.

## Notes
- Suggested shape (for the brief, not binding): a pure `src/lib/project-filters.ts` (derive options, filter, label) with unit tests; a client component in `src/components/site` that takes `Project` data as props; `src/app/projects/page.tsx` stays a server component. Card must render without an `href`; if it cannot, that is a small primitive change that stays free of `"use client"`.
- Dependents: PROJ-003 (detail route, will switch card titles to links) and PROJ-004 (external links).
- Risk level: medium. UI-only and static, with no new dependency, but it introduces the first client component with form-like controls and a state that cannot be verified in production while content is empty.
