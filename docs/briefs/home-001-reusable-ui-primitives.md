# Brief: Build reusable UI primitives (HOME-001)

- Story: [docs/stories/home-001-reusable-ui-primitives.md](../stories/home-001-reusable-ui-primitives.md), https://github.com/eng-rodriguez/personal-website/issues/6
- Branch: `feat/home-001-reusable-ui-primitives`, baseline 722c0d1
- ADR: none (section 13 explains why)

Add seven typed, accessible Server Component primitives in `src/components/primitives`: PageHeading, Section, Card, Tag, Link, EmptyState and Grid, plus one small text-check helper. The shadcn `Button` is reused unchanged. `/` adopts PageHeading. The four placeholder routes adopt PageHeading (with a short description) and EmptyState (with the current placeholder text). Section, Card, Tag and Grid are documented and tested only. No new dependency, token, icon library, Playwright test or `next.config.ts` change.

## 1. Layers touched

| Order | Layer | Builder | Paths | Depends on |
| --- | --- | --- | --- | --- |
| 1 | frontend (`web` area, repository root) | factory:react-builder with stack-react | `src/components/primitives`, `src/app` (five pages, `globals.test.ts`, one new page test), `docs/design-system.md`, `CLAUDE.md` | none (FOUND-001 to FOUND-005 are merged) |

- One builder and one PR. Implementation order inside the PR:
  1. D1 text helper and its test.
  2. D6 Link, because Card uses it.
  3. D2 PageHeading, D3 Section, D5 Tag, D7 EmptyState, D8 Grid, then D4 Card.
  4. D10 contrast pairs in `globals.test.ts`.
  5. D9 page adoption with `core-pages.test.tsx`.
  6. Docs, with the docs and source tests.
- Merge order: a single merge. No rollout, because nothing is deployed.
- Pipeline: no change. `web`, `e2e`, `scope` and `ci-ok` must pass unchanged. The existing `e2e/` specs are not edited (story A12).
- Infra, backend, ml: not touched.
- Stack: Next.js 16.4.2 App Router (Turbopack build), React 19.3.1, TypeScript ~6.0.3 strict, Tailwind CSS 4.3.3, class-variance-authority 0.7.1, Vitest 5 with jsdom and React Testing Library, npm, Node.js 24. `typecheck` is `next typegen && tsc --noEmit` and covers test files (`tsconfig.json` includes `**/*.tsx`). `package.json`, `package-lock.json`, `next.config.ts` and `tsconfig.json` do not change.

## 2. Ownership
This is the Site presentation context (`docs/domain.md`), which owns layout and pages. Writing, Portfolio and Career are not touched. The primitives are content-neutral: no prop names or types refer to Article, Project or Professional experience data. Boundaries:
- `src/components/primitives/*` holds reusable page building blocks, one component per file. Nothing in it imports from `src/components/site`, and nothing in it is a Client Component.
- `src/components/ui/*` stays shadcn-only. `button.tsx` is imported (for `buttonVariants`) and not modified.
- `src/components/site/*` stays the shell. It is not changed, and `site-nav.tsx` keeps using `next/link` directly. The shell's nav links have their own active-state styling and are not migrated to the Link primitive.
- The pages under `src/app` own their copy and the spacing between the primitives they compose, through `className`.
- The root layout keeps owning the single `main` (ADR 0003). Only PageHeading renders an `h1`.

## 3. Domain model
Not applicable. No content schemas, aggregates or migrations.

## 4. API contract
None. No route handlers, server actions or API artifacts.

## 5. Data and consistency
Not applicable. Every primitive is a pure function of its props. There is no state, storage, fetching or browser dependency.

## 6. Frontend

### Design decisions
Rules that apply to every primitive:
- A Server Component: no `"use client"` and no state or effect hooks. Section uses only `useId`, which React allows in Server Components.
- A named function export with an explicit exported props type, for example `export type PageHeadingProps` and `export function PageHeading(props: PageHeadingProps)`. No `any`, no default export and no barrel `index.ts`. Callers import from `@/components/primitives/<file>`.
- A `data-slot="<kebab-name>"` attribute on the root element, as the shadcn Button does. Tests and the page adoption test use it.
- An optional `className` merged last through `cn` from `@/lib/utils`, so callers can set outer spacing. Primitives have no outer margin of their own.
- Class names are literal strings, or come from literal lookup maps keyed by prop values. No string building, because Tailwind scans only `src` (story A9). Only existing token utilities are used. No `dark:`, no hard-coded colors, no `outline-none`, no plain `focus:` and no `transition-*`.
- Long text wraps. Text elements carry `wrap-break-word` (`overflow-wrap: break-word`, Tailwind 4.1 and later). Card and Grid items carry `min-w-0`.
- Heading-level props accept `"h2" | "h3" | "h4"`, so `h1` is a type error. The visual size belongs to the component, not the level: changing the level changes only the semantics.

Decisions:
- **D1. Text helper (`src/components/primitives/text.ts`, new, not a component).**
  - `export function requireText(value: string, label: string): string` returns the value unchanged when `value.trim() !== ""`. Otherwise it throws `new Error(\`${label} must not be empty\`)`, for example `"PageHeading title must not be empty"`.
  - `export function hasText(value: string | undefined): value is string` is true only for a string with non-whitespace content.
  - Required titles (PageHeading, Section, Card, EmptyState) and Tag text go through `requireText`. The pages are prerendered at build time, so an empty title fails `npm run build` instead of shipping an empty heading. This follows the domain rule "invalid content does not build". Optional descriptions go through `hasText`: empty or whitespace-only renders nothing (edge cases).
- **D2. PageHeading (`page-heading.tsx`).**
  - Props: `title: string`, `description?: string`, `className?: string`.
  - Markup: `<div data-slot="page-heading" className={cn(className)}>`, containing `<h1 className="text-3xl font-semibold tracking-tight wrap-break-word">` and, only when `hasText(description)`, `<p className="mt-4 text-muted-foreground wrap-break-word">`. These are the class strings the pages use today, so nothing changes visually.
  - It uses a `div`, not a `header`, so it never competes with the shell's banner landmark.
- **D3. Section (`section.tsx`).**
  - Props: `title: string`, `headingLevel?: "h2" | "h3" | "h4"` (default `"h2"`), `description?: string`, `children: ReactNode`, `className?: string`.
  - `const headingId = useId();` gives `<section data-slot="section" aria-labelledby={headingId}>` containing `<Heading id={headingId} className="text-xl font-semibold tracking-tight wrap-break-word">`, then the optional `<p className="mt-2 text-muted-foreground wrap-break-word">`, then `<div className="mt-6">{children}</div>`.
  - `Heading` is the `headingLevel` string used as a JSX tag. Skipping levels is the caller's responsibility, and the docs say so.
- **D4. Card (`card.tsx`).**
  - Props: generic `<H extends string>`. `title: string`, `href?: LinkHref<H>` (the D6 type), `headingLevel?: "h2" | "h3" | "h4"` (default `"h3"`), `description?: string`, `footer?: ReactNode`, `className?: string`.
  - Markup: `<article data-slot="card" className="min-w-0 rounded-lg border bg-card p-6 text-card-foreground">` containing:
    - `<Heading className="text-base font-semibold wrap-break-word">`. With `href`, the heading holds exactly one `<Link<H> href={href}>{title}</Link>` (title-link pattern, default link style). Without `href`, it holds the plain title (static card).
    - The optional `<p className="mt-2 text-sm text-muted-foreground wrap-break-word">`.
    - The optional `<div data-slot="card-footer" className="mt-4">{footer}</div>`, rendered only when `footer` is not `null`, `undefined` or `false`.
  - The card has no `onClick`, no `tabIndex`, no `role` and no stretched-link overlay. The footer slot is for non-interactive metadata such as Tags and dates. The type cannot enforce this, so the docs state it and the test covers the Tag case.
  - The border uses the decorative `border` token. The card is not a control, so the border is not its only cue. It stays visible in forced colors because a solid border is kept and its color is forced to a system color.
  - If TSX does not accept the explicit `<Link<H> ...>` type argument, use `LinkHref` inference through a local variable typed `LinkHref<H>`. Do not use `as` casts to `string`.
- **D5. Tag (`tag.tsx`).**
  - Props: `children: string`, `className?: string`.
  - Markup: `<span data-slot="tag" className="inline-flex max-w-full items-center rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground wrap-break-word">`.
  - It has no `href`, `tabIndex`, `role` or handlers. `border-transparent` takes no space visually but gets a system color in forced-colors mode, so the tag boundary stays visible where the background is removed.
- **D6. Link (`link.tsx`).** The href policy is a template-literal type checked by `tsc`, plus a runtime guard for values cast past it.
  - Types:
    ```ts
    type HrefPattern =
      | `/${string}` | `#${string}`
      | `http://${string}` | `https://${string}`
      | `mailto:${string}` | `tel:${string}`;
    export type LinkHref<H extends string> =
      H extends `//${string}` ? never : H extends HrefPattern ? H : never;
    export type LinkProps<H extends string> =
      Omit<React.ComponentProps<"a">, "href" | "rel" | "target"> &
      VariantProps<typeof buttonVariants> & { href: LinkHref<H> };
    export function Link<H extends string>(props: LinkProps<H>)
    ```
    - TypeScript infers `H` from a literal (`"/writing"`) or a typed template (`` `/writing/${slug}` ``). A plain `string`, `""`, `"//host"`, `"javascript:..."`, `"ftp://..."` and `"example.com"` resolve to `never` and fail typecheck. Callers with computed strings type them as one of the patterns.
    - If inference through the conditional does not work under TypeScript 6.0, use `href: H & LinkHref<H>`. Record which form was used.
    - `rel` and `target` are removed from the props, so a caller cannot weaken the external-link `rel` or open a new tab. The story says no new tab by default, and no case needs one.
  - Classification at runtime, in a module-private `hrefKind(href: string)`:
    - `"external"` when the href starts with `http://` or `https://`.
    - `"plain"` when it starts with `mailto:` or `tel:`.
    - `"internal"` when it starts with `#`, or with `/` but not `//`.
    - Anything else throws `new Error("Link href is not allowed: " + href)`. This catches values cast past the type, which would otherwise reach `next/link` as same-origin and navigate off-site without `rel`.
  - Rendering:
    - Internal: `<NextLink href={href} ...>` from `next/link`.
    - External: `<a href={href} rel="noopener noreferrer" ...>`.
    - Plain: `<a href={href} ...>` with no `rel`.
    - No `target` in any case. Every case also gets `data-slot="link"`.
  - Styling:
    - No `variant`: `"text-primary underline underline-offset-4 decoration-1 hover:decoration-2 wrap-break-word"`. The underline means a link is never marked by color alone. There is no transition.
    - With `variant` (and optional `size`): `cn(buttonVariants({ variant, size }), className)` plus `data-variant={variant}`. This gives the Button's focus-visible outline classes, no `dark:` classes, and `motion-reduce:transition-none` on the Button's `transition-all`.
    - `className` is merged last in both cases.
  - Focus: no focus classes are added in the default style, so the global `:focus-visible` outline in `globals.css` applies. Nothing removes it (AC10).
  - `typedRoutes` is not enabled. The installed docs (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`, "Statically Typed Links") describe it as an opt-in `next.config.ts` flag. It types `next/link` against generated route lists and needs `as Route` casts for non-literal strings. It would change `next.config.ts`, it covers internal paths only, and it would not express the external, `mailto:` and `tel:` policy. With it off, `next/link` accepts `string | UrlObject`, so `LinkHref<H>` is passed through without a cast. If a later story enables `typedRoutes`, the internal branch will need `href as Route` and that story owns the change (section 13).
- **D7. EmptyState (`empty-state.tsx`).**
  - Props: `title: string`, `description: string`, `action?: ReactNode`, `headingLevel?: "h2" | "h3" | "h4"` (default `"h2"`), `className?: string`.
  - Markup: `<div data-slot="empty-state" className="rounded-lg border border-dashed p-6">` containing `<Heading className="text-lg font-semibold wrap-break-word">`, then `<p className="mt-2 text-muted-foreground wrap-break-word">` (description required and checked with `requireText`), then `<div data-slot="empty-state-action" className="mt-4">{action}</div>` only when `action` is not `null`, `undefined` or `false`.
  - It has no `role="status"` or live region, because it is static page content, not an update.
- **D8. Grid (`grid.tsx`).**
  - Props: `columns?: 1 | 2 | 3` (default `1`), `children: ReactNode`, `className?: string`.
  - A literal map:
    ```ts
    const columnClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    } as const satisfies Record<1 | 2 | 3, string>;
    ```
  - Markup: `<div data-slot="grid" data-columns={columns} className={cn("grid gap-6 *:min-w-0", columnClasses[columns], className)}>{children}</div>`. Children are rendered as they are, so they are the direct grid items.
  - The layout is one column below `sm` (40rem), two from `sm`, and three from `lg` (64rem). These are the documented Tailwind defaults (`docs/design-system.md`, Breakpoints). Each item takes one cell, so an odd last row is left partly empty and the item is not widened. Items in a row share the row height (default `stretch`).
  - Zero children renders an empty grid `div`. The docs tell callers to render EmptyState instead.
  - It uses a `div`, not a list. Callers that need list semantics wrap items in their own list markup in a later story.
- **D9. Page adoption (story A3, A8, A10).**
  - Home (`src/app/page.tsx`): `<PageHeading title={site.name} description={site.description} />`. Same text as today.
  - Each placeholder page: `<PageHeading title="<Label>" description="<short description>" />` followed by `<EmptyState className="mt-8" title="<empty title>" description="<current placeholder text>" />`, with no action. `metadata` exports are unchanged. The copy is placeholder text (real copy is out of scope), and the owner can adjust it in review without a brief revision:

    | Route | PageHeading description | EmptyState title | EmptyState description (moved from today's paragraph) |
    | --- | --- | --- | --- |
    | `/writing` | Technical articles and notes. | No articles yet | Articles will appear here. |
    | `/projects` | Work I have built or contributed to. | No projects yet | Projects and case studies will appear here. |
    | `/experience` | Roles I have held and what I did in them. | No experience listed yet | Professional experience will appear here. |
    | `/resume` | A condensed summary of experience and skills. | Resume coming soon | The resume will appear here. |

  - Each route keeps exactly one `h1` inside the single `main`. The EmptyState `h2` sits under it.
- **D10. Tokens and contrast.** No new token. The primitives use these pairs:
  - Already tested: `foreground`/`background`, `muted-foreground`/`background`, `card-foreground`/`card`, `secondary-foreground`/`secondary`, `primary`/`background` and `ring`/`background`.
  - New, added to `TEXT_PAIRS`: `["muted-foreground", "card"]` (Card description) and `["primary", "card"]` (Card title link).
  - Both run in the `light`, `dark (OS)` and `dark (explicit)` themes. In light, `card` equals `background`. In dark, `card` is lighter than `background`, so the check matters there. Print stays light through the unchanged FOUND-004 structure.
- States: loading, error and denied do not apply (static content). Empty is EmptyState (D7).
- No icons, images, `next/font`, client code or network calls.

The diagram shows how Link chooses what to render for an href.

```mermaid
flowchart LR
  href["href (LinkHref type, checked by tsc)"] --> kind{"hrefKind at render"}
  kind -- "/ (not //) or #" --> next["next/link anchor, no rel, no target"]
  kind -- "http:// or https://" --> ext["plain a, rel=noopener noreferrer"]
  kind -- "mailto: or tel:" --> plain["plain a, no rel"]
  kind -- "anything else (cast past the type)" --> err["throws: build fails"]
  next & ext & plain --> style{"variant?"}
  style -- none --> text["text-primary + underline"]
  style -- set --> btn["buttonVariants classes"]
```

### Test design
Tests use `test_acN_` names and sit next to each component. jsdom applies no Tailwind and no layout, so tests check elements, roles, attributes and literal class names. Layout and focus visibility are left to Manual verification.

- **`src/components/primitives/text.test.ts`** (new, AC1, edge cases):
  - `requireText` returns `"x"` and `" x "` unchanged. It throws the labelled message for `""` and `"   "`.
  - `hasText` is false for `undefined`, `""` and `" \n"`, and true for `"a"`.
- **`page-heading.test.tsx`** (new, AC2):
  - With a title and description: exactly one `heading` with level 1 and the title name, and a `p` with the description after it, inside `[data-slot="page-heading"]`.
  - Without a description, and with `""` or `"  "`: no `p` element.
  - An empty title throws.
  - The `h1` carries `text-3xl font-semibold tracking-tight`.
- **`section.test.tsx`** (new, AC3):
  - `getByRole("region", { name: title })` resolves to the `section`, whose `aria-labelledby` equals the heading `id`.
  - The default level is 2. `headingLevel="h3"` gives level 3, and `"h4"` gives level 4.
  - The description renders only when it has text, and children render inside.
  - Two Sections in one render have different heading ids.
  - Type-only: `// @ts-expect-error h1 is reserved for PageHeading` on `headingLevel="h1"`.
- **`card.test.tsx`** (new, AC4, AC10):
  - With `href="/projects"`: one `article` whose level-3 heading contains exactly one link named by the title. The description and footer render.
  - `within(article).getAllByRole("link")` has length 1, and the article has no `button`, no `[tabindex]`, no `onclick` and no `role`, with a `<Tag>` in the footer.
  - Without `href`: the heading has no link, and the card has no interactive element.
  - `headingLevel="h2"` gives level 2. Without description or footer, no empty `p` and no `[data-slot="card-footer"]`.
  - The title link has no `outline-none` and no `focus:` class. The article has `min-w-0` and no `dark:` class.
  - Type-only: `@ts-expect-error` on `headingLevel="h1"` and on `href="//example.com"`.
- **`tag.test.tsx`** (new, AC5):
  - It renders a `span` with the text. `queryByRole("link")` and `queryByRole("button")` are null, the element has no `tabindex`, and calling `.focus()` leaves `document.activeElement` unchanged.
  - Classes include `border-transparent`, `bg-secondary` and `text-secondary-foreground`. There is no `dark:` class.
  - An empty text throws.
- **`link.test.tsx`** (new, AC6, AC10):
  - `vi.mock("next/link", ...)` with a spy that renders `<a data-next-link {...props}>` while keeping the props observable.
  - `"/writing"`, `"/"` and `"#main-content"`: the spy is called with that `href`, and the anchor has no `rel` and no `target`.
  - `"https://example.com/a"` and `"http://example.com"`: the spy is not called, and the anchor has `rel="noopener noreferrer"` and no `target`.
  - `"mailto:someone@example.com"` and `"tel:+15550100"`: the spy is not called, and the anchor has no `rel` and no `target`. Test values only, no real contact details.
  - Runtime guard: rendering with `"//evil.example" as never` and `"javascript:alert(1)" as never` throws.
  - Default style: `text-primary` and `underline`, with no `outline-none`, no `focus:` class and no `dark:` class.
  - `describe.each` over the six Button variants: every class in `buttonVariants({ variant }).split(" ")` is on the anchor, including `focus-visible:outline-2`, `focus-visible:outline-offset-2` and `focus-visible:outline-ring`. `data-variant` matches, and there is no `dark:`, `outline-none` or `focus:` class. A `size="lg"` case carries `h-10`.
  - Type-only (checked by `npm run typecheck`, one `// @ts-expect-error <reason>` each, as ESLint's `ban-ts-comment` requires a description): `href=""`, `href="//example.com"`, `href="javascript:alert(1)"`, `href="ftp://example.com"`, `href="example.com"`, `href={someString}` where `const someString: string`, `rel="opener"` and `target="_blank"`. One positive line compiles with `` href={`/writing/${slug}`} `` where `slug: string`.
- **`empty-state.test.tsx`** (new, AC7):
  - Title as a level-2 heading by default, and `headingLevel="h3"` gives level 3. The description renders.
  - With `action={<Link href="/">Home</Link>}`, the action container follows the description in document order (`compareDocumentPosition`).
  - Without an action, and with `null` or `false`, there is no `[data-slot="empty-state-action"]`.
  - An empty title or description throws.
- **`grid.test.tsx`** (new, AC8):
  - For columns 1, 2 and 3 with four children: each child is a direct child of `[data-slot="grid"]`, and the root has `grid`, `gap-6`, `*:min-w-0`, `grid-cols-1` and exactly the literal classes of that column count. There are no `sm:` or `lg:` classes for 1 column, `sm:grid-cols-2` and no `lg:` for 2, and `sm:grid-cols-2 lg:grid-cols-3` for 3.
  - The default is 1 column. Zero children renders an empty grid.
  - Type-only: `@ts-expect-error` on `columns={4}`.
- **`primitives-source.test.ts`** (new, `// @vitest-environment node`, AC1):
  - For each of the seven component files: the source has no `"use client"` or `'use client'`, no `\bany\b` used as a type (`: any`, `as any` or `<any>`), no `useState`, `useEffect`, `useReducer` or `useLayoutEffect`, and no `dark:`.
  - Importing each module exposes its named function (`PageHeading`, `Section`, `Card`, `Tag`, `Link`, `EmptyState`, `Grid`).
- **`primitives-docs.test.ts`** (new, node, AC12): the `## UI primitives` section of `docs/design-system.md`, sliced up to the next `\n## `, contains the following, and the existing `shell-docs.test.ts` stays unchanged and passing:
  - The names `PageHeading`, `Section`, `Card`, `Tag`, `Link`, `EmptyState`, `Grid` and `Button`.
  - `src/components/primitives`, `aria-labelledby`, `h1`, `noopener noreferrer`, `mailto:` and `buttonVariants`.
  - The heading `### Adding a primitive` and at least one fenced `tsx` example.
- **`src/app/core-pages.test.tsx`** (new, AC9):
  - For each of the five pages: exactly one level-1 heading, inside `[data-slot="page-heading"]`, whose name matches today's (`site.name` or the label). There is a description paragraph.
  - The four placeholder pages render `[data-slot="empty-state"]` with the table's EmptyState description text, and the Home page does not render it.
  - Reading each `page.tsx` source with `node:fs`: none contains `text-3xl font-semibold tracking-tight` or `mt-4 text-muted-foreground`.
- **`src/app/globals.test.ts`** (modified, AC11): add the two D10 pairs to `TEXT_PAIRS`. Nothing else changes.
- Unchanged and passing: `src/app/page.test.tsx` (its `site.name` level-1 heading still resolves), `src/components/site/*.test.tsx`, `shell-docs.test.ts`, `src/components/ui/button.test.tsx` and every `e2e/*.spec.ts`.

## 7. Infra and pipeline
Not applicable. No workflow, Dependabot, environment or deployment change.

## 8. Security and threat notes
- Authn/z and tenant isolation: not applicable (no users).
- Input validation: hrefs are checked by the type at compile time and by `hrefKind` at render. All props come from source code at build time. There is no `dangerouslySetInnerHTML`.
- Secrets: none.
- Data classification: public placeholder copy. Tests use `example.com` and a reserved 555 test number, never the owner's real contact details (CLAUDE.md "Don't").
- No new dependency. `next/link`, `class-variance-authority` and `buttonVariants` are already installed.
- Top threats (STRIDE-style):
  1. Tampering or spoofing through a script URL (`javascript:`, `data:`) in a link. Mitigation: the type rejects every other scheme, the runtime guard throws, and the tests cover both.
  2. Spoofing or information disclosure through an off-site link handled as same-origin (protocol-relative `//host`), which would skip `rel="noopener noreferrer"` and leak the referrer. Mitigation: `//` is excluded in the type and the guard. `rel` and `target` are not caller props.
  3. Denial of an accessible page (the main user-facing risk): a duplicate or missing `h1`, a focus indicator removed by a class, a clickable card with nested controls, or a color-only cue. Mitigation: only PageHeading renders `h1` (types and tests), class assertions block `outline-none` and `focus:`, the card is static, links are underlined, contrast pairs are tested, the e2e one-`h1` check runs unchanged, and Manual verification.

## 9. Verification per criterion
Local checks run from the repository root on Node.js 24. "Built HTML" means `.next/server/app/<route>.html` after `npm run build` (`index.html` for Home). "Built CSS" means the stylesheet under `.next/static/chunks/*.css`.

| AC | Check | Level |
| --- | --- | --- |
| 1 | `primitives-source.test.ts`; `npm run typecheck`; ESLint `--max-warnings=0` (includes `@typescript-eslint/no-explicit-any` from `eslint-config-next/typescript`) | static + local |
| 2 | `page-heading.test.tsx` | local |
| 3 | `section.test.tsx`; the `@ts-expect-error` for `h1` under `npm run typecheck` | static + local |
| 4 | `card.test.tsx` | local |
| 5 | `tag.test.tsx` | local |
| 6 | `link.test.tsx` runtime cases and `@ts-expect-error` lines under `npm run typecheck`. An unused `@ts-expect-error` fails typecheck, so each rejected href is proven to be rejected | static + local |
| 7 | `empty-state.test.tsx` | local |
| 8 | `grid.test.tsx`; built CSS contains `sm:grid-cols-2`, `lg:grid-cols-3` and `*:min-w-0` rules (Manual step 3). One column below `sm` in Manual step 5 | local + manual |
| 9 | `core-pages.test.tsx`; unchanged `page.test.tsx` and `site-shell.test.tsx`; `npm run e2e` with `git diff --stat origin/main -- e2e` empty; built HTML of each placeholder route contains `data-slot="empty-state"` | local |
| 10 | Class assertions in `link.test.tsx` and `card.test.tsx`. Manual step 4 (jsdom has no `:focus-visible` rendering) | local + manual |
| 11 | `globals.test.ts` with the two new pairs in three themes. Print: Manual step 6 | local + manual |
| 12 | `primitives-docs.test.ts`; `shell-docs.test.ts` unchanged; owner read in Manual step 8 | local + manual |
| 13 | `npm run check` exit 0, recording the Vitest file and test counts (at least one test file per primitive); `npm run e2e` exit 0; `git diff --stat origin/main -- package.json package-lock.json next.config.ts tsconfig.json` empty | local |
| 14 | CI `scope` job on the PR; locally `git diff --name-only origin/main...HEAD`, each path exempt or found with `grep -F` in this brief | local + environment |

Edge cases:
- Empty and whitespace titles and descriptions: `text.test.ts` and the component tests.
- Long titles, words and URLs at 320px and at 200% zoom: Manual step 5.
- `h1` rejected for Section, Card and EmptyState: `@ts-expect-error` lines.
- Protocol-relative and other schemes: `link.test.tsx`.
- No `target="_blank"`: `link.test.tsx` and the type.
- Grid with zero, one or an odd number of items: `grid.test.tsx` and Manual step 5.
- Forced colors and dark theme: class assertions and Manual step 6.
- Literal classes: `grid.test.tsx` and the built-CSS grep.
- Hydration and no-JS: no client code (`primitives-source.test.ts`), with the unchanged `e2e/no-js.spec.ts` and Manual step 7.
- Untracked user files not committed: Manual step 1.

Builder-verified at implementation (record in the Checkpoint):
- `wrap-break-word` and `*:min-w-0` compile in Tailwind 4.3.3 (grep the built CSS for `overflow-wrap:break-word` and `:is(* > *)` or the equivalent child selector).
- `LinkHref` inference works through the conditional, or the `H & LinkHref<H>` fallback is used.
- The `<Link<H> ...>` form in Card compiles.
- `useId` in a Server Component builds under Next.js 16.4.2.
- The five routes still build as static (○).

If `useId` or `wrap-break-word` fails, stop and report rather than substituting a client hook or a dynamic class.

Environment evidence, blocked until the PR exists: CI `web`, `e2e`, `scope` and `ci-ok`. Not covered by automation: focus visibility, real layout and wrapping, forced colors and print. These are manual by design, since new Playwright tests and axe are out of scope.

### Manual verification
The owner runs this on a fresh clone of the branch with Node.js 24, before marking the PR ready. Record who ran it and each result in the Checkpoint. Builders do not claim it. Items marked "automated" may also be run by the test agent, which does not replace the human run.

Prerequisites: Chrome or Edge with DevTools (device toolbar, and the Rendering panel's emulation of `prefers-color-scheme`, `forced-colors` and print). Unless a step says otherwise, use `npm run build && npm run start` at `http://localhost:3000`.

1. `git status` on the branch before committing. Expected: `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` are untracked and not staged, and every changed path is in section 11. Automated.
2. `npm ci`, then `npm run check; echo $?`, then `npx playwright install chromium` (once) and `npm run e2e; echo $?`. Expected: both exit 0, with only the 3 known ESLint `ERESOLVE` notices. Record the Vitest file and test counts and the Playwright test count. Covers AC9 and AC13. Automated.
3. After `npm run build`, run:
   ```sh
   cat .next/static/chunks/*.css | grep -oE "grid-cols-[23]|min-width:0|overflow-wrap:break-word" | sort | uniq -c
   for r in index writing projects experience resume; do echo "$r h1=$(grep -o '<h1' .next/server/app/$r.html | wc -l) empty-state=$(grep -c 'data-slot="empty-state"' .next/server/app/$r.html)"; done
   ```
   Expected: the CSS lines `grid-cols-2`, `grid-cols-3`, `min-width:0` and `overflow-wrap:break-word` appear. Each route prints `h1=1`. `empty-state=1` for writing, projects, experience and resume, and `empty-state=0` for index. Covers AC8 and AC9. Automated.
4. In light and then dark theme, Tab through `/writing` from the address bar. Expected: the skip link, shell controls and nav keep their outline as before. There is no new focus stop in `main`, because EmptyState has no action on these pages. To check the Link and Card title link, temporarily add this to `src/app/page.tsx` (import `Card` from `@/components/primitives/card` and `Link` from `@/components/primitives/link`): render `<Card title="Test" href="/projects" />` and `<Link href="https://example.com">x</Link>` on `/` under `npm run dev`. Tab to each, and confirm the 2px `ring` outline is visible and that clicking shows none. Then discard the temporary edit (`git checkout -- src/app/page.tsx`). Covers AC10. Human only.
5. On each of the five routes, at 320px width, at 1280px with 200% zoom and at 1920px. Expected: no horizontal scrollbar, the heading and EmptyState text wrap, and the EmptyState dashed border is visible. With the same temporary edit as step 4, render a `<Grid columns={3}>` of five Cards, one with a 60-character unbroken word and one with a long URL as its description. Expected: 1 column below 640px, 2 from 640px, 3 from 1024px, a partly empty last row, and no overflow. Then discard the edit. Covers AC8 and the wrapping, odd-row and narrow-width edge cases. Human only. Owner judgment: whether 3 columns at `lg` inside `max-w-prose` is too narrow (section 13).
6. Emulate `forced-colors: active` on `/writing` (EmptyState border) and on the temporary Card and Tag. Expected: the borders and the Tag outline are visible. Emulate print. Expected: light colors. Covers AC11 and the forced-colors edge case. Human only.
7. Disable JavaScript and reload `/` and `/writing`. Expected: the same content and layout as with JavaScript. Covers the hydration edge case. Human only.
8. Read the "UI primitives" section of `docs/design-system.md` and the CLAUDE.md Current state and Paths. Expected: the content in section 10. Covers AC12. Human only.
9. Open the PR. Expected: `web`, `e2e`, `scope` and `ci-ok` succeed. Environment evidence, blocked until the PR exists.

Rollback: revert the merge commit through a PR (`git revert -m 1 <merge-sha>`), then re-run step 2. Expected: the pages are back to inline `h1` and paragraph markup, and `src/components/primitives` is gone.

#### Criterion evidence (test agent run)
Run on branch `feat/home-001-reusable-ui-primitives` at the implementation commit plus the added `primitives-contrast.test.ts`. `npm run check` exit 0 and `npm run e2e` exit 0 (11 Playwright tests). Local CI scope check against `origin/main`: exit 0, every non-exempt path listed in this brief. `git diff --stat origin/main -- package.json package-lock.json next.config.ts tsconfig.json e2e` is empty. Built HTML: one `<h1` on all five routes, `data-slot="empty-state"` on the four placeholders only. Human steps below stay open until the owner records a run.

| AC | Automated evidence | Manual step |
| --- | --- | --- |
| 1 | `primitives-source.test.ts` (test_ac1_*), `text.test.ts`, `npm run typecheck`, ESLint `--max-warnings=0` | none |
| 2 | `page-heading.test.tsx` (test_ac2_*) | none |
| 3 | `section.test.tsx` (test_ac3_*), `@ts-expect-error` under typecheck | none |
| 4 | `card.test.tsx` (test_ac4_*) | none |
| 5 | `tag.test.tsx` (test_ac5_*) | none |
| 6 | `link.test.tsx` (test_ac6_*), `@ts-expect-error` lines under typecheck | none |
| 7 | `empty-state.test.tsx` (test_ac7_*) | none |
| 8 | `grid.test.tsx` (test_ac8_*), built CSS grep (step 3) | 5 (layout at 320px, 640px, 1024px) |
| 9 | `core-pages.test.tsx` (test_ac9_*), unchanged `page.test.tsx`, `npm run e2e` (11 passed), built HTML grep (step 3) | none |
| 10 | `link.test.tsx` and `card.test.tsx` (test_ac10_*): no `outline-none` or `focus:` classes | 4 (visible outline, human only) |
| 11 | `globals.test.ts` TEXT_PAIRS in three themes, `primitives-contrast.test.ts` (test_ac11_*) | 6 (forced colors, print) |
| 12 | `primitives-docs.test.ts` (test_ac12_*), unchanged `shell-docs.test.ts` | 8 (owner read) |
| 13 | `npm run check` exit 0 (25 files, 328 tests before the added file), `npm run e2e` exit 0 | none |
| 14 | CI `scope` job logic run locally (exit 0) | 9 (CI on the PR) |


## 10. Docs impact and observability
- `docs/design-system.md`: a new `## UI primitives` section after "Global shell" and before "Breakpoints". It contains:
  - Location: `src/components/primitives`, one file per component, imported through `@/components/primitives/<file>`, with no barrel. All are Server Components. `src/components/ui` stays shadcn-only.
  - The heading rules: only PageHeading renders the page `h1`, one per route. Section, Card and EmptyState take `headingLevel` (`h2` to `h4`), and callers must not skip levels.
  - One short entry per primitive (PageHeading, Section, Card, Tag, Link, EmptyState, Grid) and for the reused `Button`. Each entry gives when to use it, its props, its accessibility behavior and a fenced `tsx` usage example. The Card entry covers the static card, the title link, and the footer for non-interactive metadata only. The Link entry gives the href table from the D6 diagram, `rel="noopener noreferrer"`, no `target`, and `variant` through `buttonVariants`. The Grid entry gives the column breakpoints and says to use EmptyState instead of an empty Grid.
  - The empty-text rule: required text that is empty fails the build, and empty optional text renders nothing.
  - `### Adding a primitive`: a new file in the folder, a Server Component with an exported props type, a `data-slot`, literal classes and tokens only, contrast pairs added to `globals.test.ts`, a test file next to it, an entry in this section, and the path listed in the brief.
- `docs/design-system.md` "Type and spacing": add one line saying the page heading scale lives in PageHeading.
- `CLAUDE.md`:
  - Current state: the UI primitives exist in `src/components/primitives`, with PageHeading on all five routes and EmptyState on the four placeholder routes. Change "Button only" to "Button only, plus the UI primitives in `src/components/primitives`".
  - Paths: add "UI primitives in `src/components/primitives`".
  - Remove nothing else. Keep the strings that `shell-docs.test.ts` asserts.
- `README.md`: no change.
- Observability: none. There is no runtime service, and nothing is logged.

## 11. Files that will change
Builders create or modify only these paths. Any other file is out of scope and must not be committed.

Frontend / application (factory:react-builder):
- `src/components/primitives/text.ts` (new)
- `src/components/primitives/page-heading.tsx` (new)
- `src/components/primitives/section.tsx` (new)
- `src/components/primitives/card.tsx` (new)
- `src/components/primitives/tag.tsx` (new)
- `src/components/primitives/link.tsx` (new)
- `src/components/primitives/empty-state.tsx` (new)
- `src/components/primitives/grid.tsx` (new)
- `src/app/page.tsx` (modified: PageHeading)
- `src/app/writing/page.tsx` (modified: PageHeading and EmptyState)
- `src/app/projects/page.tsx` (modified: PageHeading and EmptyState)
- `src/app/experience/page.tsx` (modified: PageHeading and EmptyState)
- `src/app/resume/page.tsx` (modified: PageHeading and EmptyState)

Tests (factory:react-builder; also exempt from the scope check):
- `src/components/primitives/text.test.ts` (new)
- `src/components/primitives/page-heading.test.tsx` (new)
- `src/components/primitives/section.test.tsx` (new)
- `src/components/primitives/card.test.tsx` (new)
- `src/components/primitives/tag.test.tsx` (new)
- `src/components/primitives/link.test.tsx` (new)
- `src/components/primitives/empty-state.test.tsx` (new)
- `src/components/primitives/grid.test.tsx` (new)
- `src/components/primitives/primitives-source.test.ts` (new)
- `src/components/primitives/primitives-docs.test.ts` (new)
- `src/app/core-pages.test.tsx` (new)
- `src/app/globals.test.ts` (modified: two `TEXT_PAIRS` entries)

Docs (factory:react-builder):
- `docs/design-system.md` (modified)
- `CLAUDE.md` (modified)

Planning (orchestrator/architect):
- `docs/briefs/home-001-reusable-ui-primitives.md` (this brief)
- `docs/stories/home-001-reusable-ui-primitives.md` (already present, untracked)

Not committed: `.next/`, `node_modules/`, `next-env.d.ts` and `*.tsbuildinfo` (gitignored and generated). `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` are untracked user files.

Explicitly not changed: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/*`, `src/components/site/*`, `src/lib/*`, `e2e/*`, `playwright.config.ts`, `.github/` and `README.md`. No new dependency and no icon library.

## 12. Risk
- Level: **Standard**. It changes the markup of all five routes and adds shared components with an href security rule, on an undeployed static site with no data, auth, secrets, dependency or deployment impact, and it reverts as one PR.
- Recovery: revert the merge commit on `main` (`git revert -m 1 <merge-sha>`) through a PR, then run `npm run check` and `npm run e2e` (Manual verification, Rollback). Nothing is deployed, so there is no runtime rollback and no flag.
- Owner: @eng-rodriguez.

## 13. Open questions and ADRs
- ADR: none written. These are local component conventions within the approved Tailwind and shadcn decisions (ADR 0002) and the shell (ADR 0003). They are recorded in `docs/design-system.md`, enforced by types and tests, and reversible in one PR. They add no dependency, service, data store or cross-cutting architecture. The href policy is a code-level safeguard, not an architectural tradeoff. Revisit if a later story enables `typedRoutes` or adds a CSP.
- Open (owner, does not block): `Grid columns={3}` reaches 3 columns at `lg` while `main` stays at `max-w-prose` (about 65ch), so each column is narrow, roughly 190px. Accept in Manual step 5, or a content story can choose `columns={2}` or widen its layout (ADR 0003 consequence).
- Open (owner, does not block): the placeholder copy in the D9 table can be edited in review.
- Follow-up (not this story): if `typedRoutes` is enabled, Link's internal branch needs `as Route`, and `LinkHref` could narrow internal paths to known routes.
- Builder-verified at implementation: the items listed in section 9. If `useId` or `wrap-break-word` fails, or neither `LinkHref` form type-checks, work stops for a brief revision.
- Resolved in this brief:
  - The empty-text rule fails the build (D1).
  - The PageHeading wrapper is a `div` (D2).
  - Section names come from `useId` (D3).
  - The Card title link uses the Link primitive, and the footer is for non-interactive content (D4).
  - The forced-colors Tag border is `border-transparent` (D5).
  - The href type plus runtime guard, the omitted `rel` and `target`, and leaving `typedRoutes` off (D6).
  - EmptyState has no live region (D7).
  - Grid breakpoints are `sm` and `lg`, with `*:min-w-0` (D8).
  - The placeholder page composition (D9).
  - Two new contrast pairs (D10).

## 14. Checkpoint
- Phase: brief written; awaiting owner approval
- Scope: HOME-001 as in the approved story (A1 to A13; owner decisions at story approval: Section, Card, Grid and Tag docs and tests only; the Link scheme policy; EmptyState on the four placeholder routes with PageHeading keeping a short description; Grid 1 to 3 columns; Card title link optional)
- Baseline: 722c0d1 on `docs/found-005-ship-notes`; `feat/home-001-reusable-ui-primitives` to be cut from `origin/main`; untracked user files `AGENTS.md` and `docs/reviews/dependabot-actions-pr-34.md` preserved
- Revisions: 0
- Approvals: story approved by @eng-rodriguez; brief not yet approved
- Check evidence: none yet
- Repairs used: 0 of 3
- Remaining blockers: none
- Next action: owner reviews this brief; on approval, factory:react-builder implements in the section 1 order
