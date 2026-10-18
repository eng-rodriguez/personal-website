# Design system

Tailwind CSS v4 and shadcn/ui, with semantic tokens that follow the OS color scheme. Decision record: [ADR 0002](adr/0002-tailwind-v4-tokens-os-only-theming.md). `src/app/globals.css` is the only source of token values; this page does not copy them.

## Where tokens live

- All design tokens and global base rules are in `src/app/globals.css`. There is no `tailwind.config` file, and `postcss.config.mjs` only loads `@tailwindcss/postcss`.
- Components use token utilities (`bg-background`, `text-muted-foreground`, `outline-ring`). They never hard-code colors.
- To add a color token:
  1. Add its light value to `:root`.
  2. Add its dark value to `:root` inside `@media (prefers-color-scheme: dark)`.
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

Light and dark follow `prefers-color-scheme` only. There is no toggle, no `.dark` class and no `next-themes`. Tailwind's default `dark:` variant is media-based, but components avoid `dark:` overrides: per-theme differences belong in token values, where the contrast test checks them. `layout.tsx` exports `viewport.colorScheme` so the canvas and native controls match the OS before the stylesheet loads.

## Contrast

`src/app/globals.test.ts` parses `globals.css` and checks both themes with WCAG 2.2 ratios:

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
- Target size: interactive shell controls use `min-h-10`.

## Reduced motion

A global `prefers-reduced-motion: reduce` rule shortens animations and transitions. Components that transition also add `motion-reduce:transition-none`.

## Type and spacing

- Fonts: the system stack in `--font-sans`. No web fonts.
- Type scale: Tailwind's defaults (`text-xs` to `text-9xl` with their paired line heights). It is not redefined.
- Spacing: `--spacing` is `0.25rem`, so `p-4` is 1rem.

## Adding a shadcn component

1. Run `npx --yes shadcn@4.21.1 add <name>`, or a newer pinned version that is at least 2 weeks old. Never use `@latest`.
2. Check `git status`. Revert CLI changes outside the brief's file list.
3. Reinstall the pinned dependency versions and remove unused CLI additions (`tw-animate-css`, `lucide-react`, `shadcn`, and a `cn` package). `src/lib/utils.ts` keeps `cn` built from `clsx` and `tailwind-merge`, and components import it from `@/lib/utils`.
4. Move any `.dark` variables into the media block and drop `dark:` overrides.
5. Replace ring focus classes with the outline classes used by `src/components/ui/button.tsx`, and add `motion-reduce:transition-none` to transitions.
6. Add the component's color pairs to the contrast test and a component test.
7. Run `npm run format` and `npm run check`, and list the generated files in the brief.
