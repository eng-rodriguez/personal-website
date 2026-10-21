# Design system

Tailwind CSS v4 and shadcn/ui, with semantic tokens that follow the OS color scheme or the visitor's theme choice. Decision records: [ADR 0002](adr/0002-tailwind-v4-tokens-os-only-theming.md) (tokens, focus, contrast) and [ADR 0004](adr/0004-theme-choice-with-pre-paint-script.md) (theme choice). `src/app/globals.css` is the only source of token values; this page does not copy them.

## Where tokens live

- All design tokens and global base rules are in `src/app/globals.css`. There is no `tailwind.config` file, and `postcss.config.mjs` only loads `@tailwindcss/postcss`.
- Components use token utilities (`bg-background`, `text-muted-foreground`, `outline-ring`). They never hard-code colors.
- To add a color token:
  1. Add its light value to `:root`.
  2. Add its dark value to both dark blocks (`:root:not([data-theme="light"])` under `@media screen and (prefers-color-scheme: dark)`, and `:root[data-theme="dark"]` under `@media screen`). The values must be identical; the test fails if they differ.
  3. Map it in `@theme inline` as `--color-<name>: var(--<name>)`.
  4. Add its contrast pairs and the name to `src/app/globals.test.ts`.
- Values are `oklch(...)` inside the sRGB gamut. The test fails on any other format or an out-of-gamut color.

## Semantic tokens

- `background` / `foreground`: page canvas and default text.
- `card`, `popover` (each with `-foreground`): raised surfaces and their text.
- `primary`, `secondary`, `accent`, `destructive` (each with `-foreground`): fills for actions and the text drawn on them. `primary` is also the link color.
- `muted` / `muted-foreground`: quiet surfaces and secondary text.
- `input`: the border of interactive controls (at least 3:1 against `background`).
- `ring`: the focus indicator color (at least 3:1 against `background`).
- `border`: decorative dividers only. It is not contrast-tested and must not be the only cue that marks a control.
- `--radius` drives the `rounded-sm` to `rounded-xl` scale.

## Themes

The visitor chooses System (default), Light or Dark with the Theme toggle in the header (ADR 0004).

- Storage: `localStorage` key `site-theme` holds `light` or `dark`. For System the key is removed. A missing, invalid or blocked value means System, and a storage error is swallowed and never logged. The in-session choice still applies when a write fails.
- Attribute: the choice is `data-theme="light"` or `data-theme="dark"` on `<html>`. System is no attribute.
- Pre-paint script: the root layout puts a constant inline script in `<head>`. It is owned by `src/lib/theme.ts` (`themeScript`), reads the key through an allowlist, sets `data-theme`, and always sets `data-js` on `<html>`. `<html>` has `suppressHydrationWarning`, and no other element does. A future Content Security Policy must allow this script by its hash.
- Tokens, defined in `globals.css`:

  | State | Tokens | `color-scheme` |
  | --- | --- | --- |
  | System or no JS, OS light | `:root` light | `light dark` |
  | System or no JS, OS dark | OS dark block | `light dark` |
  | Light, any OS | `:root` light | `light` |
  | Dark, any OS | explicit dark block | `dark` |
  | Print, any state | `:root` light | `light` |

- System follows the OS live in CSS alone, with no listener. Light and Dark pin the theme, so OS changes do nothing. Other tabs follow a change through the `storage` event.
- When printing, the page is always light (the `print` media type): dark tokens exist only under `@media screen`.
- Without JavaScript `data-js` is absent, so the toggle is hidden (`display: none`) and the page follows the OS.
- The `dark:` variant is redefined with `@custom-variant dark` to match the same two dark states. Components still avoid `dark:`: per-theme differences belong in token values, where the contrast test checks both dark blocks. There is no `.dark` class and no `next-themes`.
- `layout.tsx` exports `viewport.colorScheme` so the canvas and native controls match the OS before the stylesheet loads.

## Contrast

`src/app/globals.test.ts` parses `globals.css` and checks the light theme and both dark blocks (OS and explicit) with WCAG 2.2 ratios:

- At least 4.5:1 for text pairs, including the Button hover fills composited over `background`.
- At least 3:1 for `ring` and `input` against `background`.
- Colors with alpha are composited over their backdrop in gamma-encoded sRGB, as browsers do. Ratios are compared unrounded.

When a pair fails, change only the lightness of the token.

## Focus

- Focus is drawn with an `outline` on `:focus-visible` (a global rule in `globals.css`). Outlines stay visible in forced-colors mode; box-shadows do not.
- Never use `outline-none` without a replacement outline, and never rely on a ring or shadow alone.
- Do not use plain `focus:` styles, so mouse clicks show no indicator. The skip link is the one exception (see Global shell).

## Global shell

- Landmarks: the root layout renders one skip link, a `header` (banner), a `nav` named "Primary", one `main#main-content` and a `footer` (contentinfo). Pages render content only and never their own `main`.
- Container: `containerClassName` in `src/components/site/container.ts` (`max-w-prose` reading width, `px-6`), shared by the header, `main` and the footer.
- Breakpoint: `md` (48rem). Below it the navigation is a disclosure (Menu button with `aria-expanded` and `aria-controls`) that closes on link choice, pathname change, Escape (focus returns to the toggle) and widening past `md`. At `md` and wider the links are always visible.
- Active link rule: `isActive` in `src/lib/navigation.ts` (Home exact, sections exact or nested, pathname only). The active link has `aria-current="page"`, an underline and semibold weight, never color alone.
- Skip link: the only allowed plain `focus:` utilities, used for visibility and position. The indicator stays the global outline.
- Adding a core route: add it to `primaryNav`, add its page with a `metadata.title`, and update ADR 0003.
- Theme toggle: a `radiogroup` named "Theme" of three native radios (System, Light, Dark) in `theme-toggle.tsx`. It reads the choice with `useSyncExternalStore` and is invisible (space reserved) until hydration, so a wrong selection is never shown. The selected option is a `primary` fill with semibold text and an underline in forced-colors mode. Focus is an outline on the label.
- Header: `SiteNav` takes an `actions` prop, rendered with the Menu button in one right-aligned, wrapping cluster. Tab order: skip link, brand, Theme group, Menu (below `md`), links. Below about 400px row 1 is the brand and row 2 is the Theme group and Menu. At `md` and wider, row 1 is the brand and the Theme group and row 2 is the links.
- Target size: interactive shell controls use `min-h-10`.

## UI primitives

Seven typed Server Components live in `src/components/primitives`, one file per component, imported through `@/components/primitives/<file>` (no barrel). `src/components/ui` stays shadcn-only and `src/components/site` stays the shell. Every primitive has a `data-slot`, takes an optional `className` merged last, uses token utilities and literal class names only, and has no `dark:` variant.

Rules:

- Heading levels: only PageHeading renders the page `h1`, one per route. Section, Card and EmptyState take `headingLevel` (`h2` to `h4`; `h1` is a type error). The level changes semantics only, not size. Skipping levels is the caller's responsibility.
- Empty text: required text (titles, EmptyState description, Tag text) that is empty or whitespace fails the build. An empty optional description renders nothing.
- Primitives have no outer margin. Pages add spacing through `className`.

### PageHeading

Use once per page. Props: `title`, `description?`, `className?`. Renders a `div` with the `h1` and an optional paragraph.

```tsx
<PageHeading title="Writing" description="Technical articles and notes." />
```

### Section

Use to group content under a heading. Props: `title`, `headingLevel?` (default `h2`), `description?`, `children`, `className?`. Renders a `section` named by its heading through `aria-labelledby`.

```tsx
<Section title="Recent" headingLevel="h2">
  <Grid columns={2}>{cards}</Grid>
</Section>
```

### Card

A static `article`, not clickable as a whole. Props: `title`, `href?`, `headingLevel?` (default `h3`), `description?`, `footer?`, `className?`. With `href` the title is the card's single link (title-link pattern); without it the card is static. The footer is for non-interactive metadata such as Tags and dates, never controls.

```tsx
<Card
  title="Site"
  href="/projects"
  description="A personal website."
  footer={<Tag>TypeScript</Tag>}
/>
```

### Tag

A static, non-focusable `span`. Props: `children` (text), `className?`. It keeps a transparent border so its boundary shows in forced-colors mode.

```tsx
<Tag>TypeScript</Tag>
```

### Link

Props: anchor props except `rel` and `target`, plus `href` and an optional `variant` and `size` from `buttonVariants`. The `href` type accepts only the patterns below; anything else fails typecheck, and a value cast past the type throws at render.

| Href | Renders |
| --- | --- |
| `/path` (not `//` or `/\`) or `#id` | `next/link`, no `rel`, no `target` |
| `http://` or `https://` | plain `a` with `rel="noopener noreferrer"`, no `target` |
| `mailto:` or `tel:` | plain `a`, no `rel` |

Without `variant` the link is `text-primary` and underlined, so it is never marked by color alone. With `variant` it carries the `buttonVariants` classes, including the focus-visible outline. `size` applies only together with `variant` (`variant={null}` counts as no variant). Variant links do not wrap because button styles use `whitespace-nowrap`, so keep labels short. An href containing whitespace or control characters, or whose second character is `/` or `\`, throws at render. Type computed strings as one of the patterns, for example `` `/writing/${slug}` ``.

```tsx
<Link href="https://example.com">Example</Link>
<Link href="/projects" variant="outline">Projects</Link>
```

### EmptyState

Use instead of an empty Grid or list. Props: `title`, `description`, `action?`, `headingLevel?` (default `h2`), `className?`. The action container renders only when an action is given. It is static content, not a live region.

```tsx
<EmptyState title="No articles yet" description="Articles will appear here." />
```

### Grid

Props: `columns?` (1, 2 or 3, default 1), `children`, `className?`. One column below `sm` (40rem), two from `sm`, three from `lg` (64rem). Children are the direct grid items and may shrink (`min-w-0`). An odd last row stays partly empty. Zero children renders an empty grid, so show EmptyState instead.

```tsx
<Grid columns={3}>
  <Card title="One" />
  <Card title="Two" />
</Grid>
```

### Button

The shadcn `Button` in `src/components/ui/button.tsx` is reused unchanged for real buttons. For a link that looks like a button, use `Link` with `variant`, which applies `buttonVariants`.

### Adding a primitive

1. Add one file in `src/components/primitives`: a Server Component with an exported props type, a `data-slot`, literal classes and tokens only.
2. Add its text and background pairs to `TEXT_PAIRS` in `src/app/globals.test.ts`.
3. Add a test file next to it, and add it to `primitives-source.test.ts`.
4. Add an entry in this section.
5. List the path in the brief.

## Hero

The home page (`/`) renders the `Hero` Server Component from `src/components/site/hero.tsx`. The copy lives in `site.hero` in `src/lib/site.ts`; the types and rules are in `src/lib/hero.ts`. To change the copy, edit the config only, never `hero.tsx`.

```ts
// src/lib/hero.ts
export type HeroConfig = {
  readonly name: string;
  readonly role: string;
  readonly statement: string;
  readonly ctas: readonly [HeroCta, HeroCta]; // { label, href }
  readonly portrait?: HeroPortrait; // { src, alt, width, height }
};
```

- Validation: `heroProblems` checks every rule (non-empty text, exactly two CTAs, hrefs from `primaryNav` that are not `/` and not repeated, a valid portrait). Invalid copy fails `npm test` and `npm run build`.
- Heading: the name is the only `h1`, through PageHeading, and the role is its description. The document title stays `site.name`; `site.description` stays the metadata description and is not rendered on `/`.
- CTAs: exactly two, internal core routes from `primaryNav` only (not `/`, not repeated), no `mailto:`, `tel:` or external links. The first uses the primary style and the second the `outline` variant. Keep labels to about 20 characters at most, because variant links do not wrap (the 320px e2e test fails on overflow).
- Portrait: optional and off by default. To add one, put the file in `public/`, set `src` to its local path, a non-empty `alt`, and the image's real `width` and `height`. Local paths only. It is a plain `img` until a story moves it to `next/image`.
- Keyboard and mobile checks: Tab reaches the two CTAs after the header, each with a visible outline in Light and Dark; there is no horizontal scroll at 320px and at 1280px with 200% zoom.

## Breakpoints

Tailwind v4 defaults, not redefined: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem. `md` (48rem) is the only shell breakpoint. The supported minimum width is 320px, and the container keeps `max-w-prose` on wide screens.

Manual check for each core route (jsdom has no layout):

- At 320px, at 1280px with 200% zoom, at 667 by 375 and at 1920px: no horizontal scrollbar, nothing clipped or overlapped, links and toggle options 40px tall.
- At 320px open the menu and change the theme: both work, and the menu closes on Escape, link choice and widening past `md`.
- With JavaScript disabled: the page follows the OS, no theme control or gap is shown, and links work at `md` and wider.

## Reduced motion

A global `prefers-reduced-motion: reduce` rule shortens animations and transitions. Components that transition also add `motion-reduce:transition-none`.

## Type and spacing

- Fonts: the system stack in `--font-sans`. No web fonts.
- Type scale: Tailwind's defaults (`text-xs` to `text-9xl` with their paired line heights). It is not redefined.
- Spacing: `--spacing` is `0.25rem`, so `p-4` is 1rem.
- Page heading scale: lives in PageHeading (`src/components/primitives/page-heading.tsx`).

## Adding a shadcn component

1. Run `npx --yes shadcn@4.21.1 add <name>`, or a newer pinned version that is at least 2 weeks old. Never use `@latest`.
2. Check `git status`. Revert CLI changes outside the brief's file list.
3. Reinstall the pinned dependency versions and remove unused CLI additions (`tw-animate-css`, `lucide-react`, `shadcn`, and a `cn` package). `src/lib/utils.ts` keeps `cn` built from `clsx` and `tailwind-merge`, and components import it from `@/lib/utils`.
4. Copy any `.dark` variables into both dark blocks (identical values) and drop `dark:` overrides.
5. Replace ring focus classes with the outline classes used by `src/components/ui/button.tsx`, and add `motion-reduce:transition-none` to transitions.
6. Add the component's color pairs to the contrast test and a component test.
7. Run `npm run format` and `npm run check`, and list the generated files in the brief.
