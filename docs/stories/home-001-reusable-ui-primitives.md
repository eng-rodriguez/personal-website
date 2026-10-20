# Build reusable UI primitives
Source: HOME-001, https://github.com/eng-rodriguez/personal-website/issues/6 (labels: area:design, priority:p0, type:feature). Dependency: FOUND-001.

As the site owner, I want a small set of typed, accessible, documented UI primitives (page heading, section, card, tag, link, empty state and responsive grid) that the pages reuse, so that every route has consistent structure and later Article, Project and Professional experience pages are built from shared parts instead of copied markup.

Assumptions (approved by @eng-rodriguez):
- A1. Location: the primitives live in the new folder `src/components/primitives`, one file per component, imported through the `@/*` alias. `src/components/ui` stays shadcn-only and `src/components/site` stays for shell components.
- A2. All primitives are Server Components. None uses `"use client"`, state or effects.
- A3. PageHeading always renders the page `h1`, plus an optional description paragraph. It replaces the duplicated `h1` (`text-3xl font-semibold tracking-tight`) and intro paragraph (`mt-4 text-muted-foreground`) on `/`, `/writing`, `/projects`, `/experience` and `/resume`. No other primitive renders an `h1`, so each route keeps exactly one `h1` inside the single `main` owned by the root layout.
- A4. Section renders a `section` named by its own heading through `aria-labelledby`. It takes a `headingLevel` prop (`h2` default, up to `h4`) and an optional description.
- A5. Card is a static `article` with a required title, optional description and optional footer or metadata slot. The title may be a link (title-link pattern). The card as a whole is not clickable, and there are no nested interactive elements. It takes a `headingLevel` prop (`h3` default) and stays content-neutral: it knows nothing about Article or Project data.
- A6. Tag is a static, non-interactive `span`. Tag links wait for a taxonomy story.
- A7. Link and button: the existing shadcn `Button` is reused as is. A new typed `Link` primitive renders `next/link` for internal hrefs (starting with `/` or `#`) and a plain anchor with `rel="noopener noreferrer"` for external `http://` and `https://` hrefs. `mailto:` and `tel:` hrefs render a plain anchor without `rel`. Any other href is a TypeScript error (template-literal href type). An optional `variant` prop applies the Button styles through `buttonVariants`, so a link can look like a button. No new dependency.
- A8. EmptyState takes a title, a description and an optional action (rendered by the caller, usually a `Link`). The four placeholder pages (`/writing`, `/projects`, `/experience`, `/resume`) adopt it: PageHeading keeps a short description and the current placeholder ("coming soon") text moves into EmptyState, replacing the placeholder paragraph.
- A9. Grid is a component with a fixed set of column counts (1 to 3), responsive at the breakpoints documented in `docs/design-system.md`. Its class names are written as literal strings, because Tailwind scans `src` only.
- A10. "Reused across pages" means: `/` adopts PageHeading, and the four placeholder pages adopt PageHeading and EmptyState. Section, Card, Tag and Grid are documented and tested, and consumed by later content stories.
- A11. Documentation is a new "UI primitives" section in `docs/design-system.md`: when to use each primitive, its props, the accessibility behavior and a short usage example. Unit tests sit next to each component.
- A12. No new dependency, no icon library, no new Playwright test. The existing `e2e/` tests must stay green unchanged.
- A13. Any new text and background color pair is added to `TEXT_PAIRS` in `src/app/globals.test.ts` and passes in both themes. Tokens that already exist (foreground, muted-foreground, card, border) are preferred over new ones.

## Acceptance criteria
1. Given the folder `src/components/primitives`, when I read its exports, then PageHeading, Section, Card, Tag, Link, EmptyState and Grid exist with explicit TypeScript prop types, no `any`, and none uses `"use client"`.
2. Given PageHeading with a title and a description, when it renders, then it outputs one `h1` with the title and the description in a paragraph, and given no description, then no empty paragraph is rendered.
3. Given Section with a title, when it renders, then it outputs a `section` whose accessible name is the heading text (through `aria-labelledby`), the heading is `h2` by default, and given `headingLevel="h3"` the heading is an `h3`.
4. Given Card with a title and a link, when it renders, then it outputs an `article` whose heading (`h3` by default) contains a single link, the description and footer appear when provided, and the card contains no other interactive element.
5. Given Tag with text, when it renders, then it outputs a non-interactive element with that text that is not focusable and has no link or button role.
6. Given Link with an internal href, when it renders, then it is an anchor handled by `next/link` without `target` or `rel="noopener noreferrer"`. Given an external href (starting with `http://` or `https://`), then it is an anchor with `rel="noopener noreferrer"`. Given a `mailto:` or `tel:` href, then it is a plain anchor without `rel`, and any other scheme fails typecheck. Given a `variant`, then it carries the same classes as `buttonVariants` for that variant, including the focus-visible outline classes and no `dark:` classes.
7. Given EmptyState with a title and a description, when it renders, then both appear, and given an action, then the action is rendered after the description. Given no action, then no empty container is rendered for it.
8. Given Grid with 1, 2 or 3 columns and several children, when it renders, then the children are direct grid items, the class names for the matching column count are present as literal strings, and the layout is one column below the documented small breakpoint.
9. Given each of `/`, `/writing`, `/projects`, `/experience` and `/resume`, when the page renders, then it uses PageHeading for its single `h1` and description, the four placeholder pages show EmptyState, no page keeps the duplicated `h1` and paragraph class strings, and the existing Vitest and Playwright route tests (one `main`, one `h1`, the title template) still pass unchanged.
10. Given a keyboard user on a page that uses Link or a Card title link, when they tab to it, then the link shows the global outline focus indicator, and no primitive removes it.
11. Given each theme (Light and Dark) and print, when the contrast test runs, then every new text and background pair used by the primitives is in `TEXT_PAIRS` and meets the existing thresholds, and print stays light.
12. Given `docs/design-system.md`, when I read the "UI primitives" section, then it lists the seven primitives (including the reused shadcn Button), their props, a usage example, the heading-level rules (only PageHeading renders the `h1`) and the rule to add a new primitive, and `docs/design-system.md` tests (such as `shell-docs.test.ts`) still pass.
13. Given the change is applied, when I run `npm run check`, then typecheck, ESLint with zero warnings, the Prettier check, the unit tests (at least one test file per primitive) and the production build pass, and `npm run e2e` passes.
14. Given a `feat/` branch for this story, when the brief scope check runs, then every changed file is either exempt (`docs/*`, `*.test.ts(x)`, `e2e/*`) or listed in `docs/briefs/home-001-reusable-ui-primitives.md`.

## Edge cases
- Empty or whitespace-only title or description: PageHeading, Section and Card require a non-empty title in their types. An empty description renders nothing, not an empty element.
- Very long titles, long words and long URLs wrap without horizontal scroll at 320px and at 200% zoom. Card and Grid items can shrink (`min-w-0`).
- Heading levels: a Section or Card never renders `h1`, and the types do not allow it. Skipping a level (for example `h2` straight to `h4`) is the caller's responsibility and is documented.
- Link: only hrefs starting with `http://` or `https://` are external; `/` and `#` are internal; `mailto:` and `tel:` are plain anchors. Protocol-relative (`//`) and other schemes are rejected by the href type.
- External link opening in a new tab: not done by default (no `target="_blank"`), so no extra screen reader warning is needed.
- Grid with zero children renders an empty container. Callers should show EmptyState instead (documented). A single child still follows the column layout.
- Grid with an odd number of items leaves a partly empty last row and does not stretch the item.
- Forced-colors, print and dark theme: primitives use existing tokens only, with no hard-coded colors, no `dark:` variants and borders that stay visible in forced colors.
- Tailwind scanning: dynamic class names built by string concatenation would be dropped from the build. Classes must be literal and mapped from prop values.
- Hydration: no primitive depends on the browser, so the no-JavaScript page renders identically.
- Pre-existing, unchanged: the 3 ESLint 10 `ERESOLVE overriding peer dependency` warnings and dev-only `npm audit` advisories. Do not use `--force` or `--legacy-peer-deps`.
- `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` are untracked and must not be committed with this story.

## Out of scope
- Article, Project, Case study and Professional experience components or cards that read content data (no content or MDX exists yet).
- MDX rendering, typography for prose, and any content or Zod schema work.
- Tag links, tag filtering, taxonomy and search.
- Whole-card clickable cards, carousels, modals, menus, tabs, accordions, forms and any other shadcn components beyond the existing Button.
- Client-side behavior, animation and motion.
- Icons or an icon library, images and image components.
- Changing tokens, themes, breakpoints, the global shell or the header navigation, except adding new contrast pairs if needed.
- Writing real copy for the placeholder pages and the home page.
- Storybook or any component playground; new Playwright tests; visual regression testing; accessibility scanning (axe).
- A new dependency, new backend service, authentication, CMS or database.
- Vercel deployment.
