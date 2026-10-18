# 0002. Tailwind v4 tokens, OS-only theming

- Status: Accepted
- Date: 2026-10-18
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [FOUND-002 story](../stories/found-002-establish-design-system.md), [FOUND-002 brief](../briefs/found-002-establish-design-system.md), https://github.com/eng-rodriguez/personal-website/issues/2

## Context
CLAUDE.md approves Tailwind CSS and shadcn/ui but does not say where design tokens live, how light and dark themes switch, or which shadcn defaults the project keeps. Every later Site presentation story builds on these choices, and changing them later means touching every component. shadcn's current template targets Tailwind v4 with CSS-first configuration, oklch color values and a class-based `.dark` theme driven by `next-themes`. The approved story rules out a theme toggle and `next-themes` and requires an automated WCAG contrast test on the tokens. Some shadcn defaults fail that test or the story's edge cases: the dark theme's alpha borders and light ring fall below 3:1, and the Button's box-shadow focus ring disappears in forced-colors mode.

## Decision
We will:
- Configure Tailwind v4 CSS-first. `src/app/globals.css` is the single source of design tokens. There is no `tailwind.config` file, and `postcss.config.mjs` only loads `@tailwindcss/postcss`.
- Use shadcn's semantic token names as CSS custom properties with oklch values inside the sRGB gamut. Light values sit on `:root` and dark values on `:root` inside `@media (prefers-color-scheme: dark)`, mapped to utilities through `@theme inline`. Tailwind's default media-based `dark:` variant is kept: no `.dark` class, no `@custom-variant dark`, no `next-themes` and no inline theme script.
- Treat `--input` as the border of interactive controls and `--ring` as the focus indicator color, both at least 3:1 against `--background`. `--border` is for decorative dividers only.
- Draw focus with a solid `outline` on `:focus-visible`, not a box-shadow ring, so it stays visible in forced-colors mode.
- Run the shadcn CLI with a pinned version, then edit the generated components to fit these rules. Per-theme differences live in token values, not in `dark:` utility overrides.
- Gate the tokens with a unit test that parses `globals.css` and checks WCAG 2.2 contrast ratios on composited colors.
- Accept the shadcn Button's runtime dependencies (`class-variance-authority`, `clsx`, `tailwind-merge` and the Radix Slot package the CLI emits). Unused CLI defaults (`tw-animate-css`, `lucide-react`) are left out until a component needs them.

## Consequences
- Positive: the theme is right from the first paint with no JavaScript. The contrast test covers each theme because the tokens are the only switch. Focus stays visible in high-contrast modes, and the tokens are named the same way upstream shadcn components expect.
- Negative: each later `shadcn add` needs manual follow-up: move any `.dark` variables into the media block, swap ring focus classes for the outline pattern, and drop `dark:` color overrides. The contrast test needs a small oklch-to-sRGB conversion, and visitors cannot override the OS theme.
- Follow-ups: a theme toggle needs a new decision that supersedes this one (class-based variant, persistence and a pre-paint script). Revisit the gamut rule if a brand color needs Display P3.

## Alternatives
- Class-based `.dark` theme with `next-themes` and a toggle: excluded by the approved story (no toggle, no persistence).
- Hex color values: the contrast test would be simpler, but values would differ from the oklch tokens that future `shadcn add` runs write, and adjusting lightness to pass contrast is less predictable.
- Keeping shadcn's `ring-[3px] ring-ring/50` focus style: the half-alpha ring is hard to keep above 3:1, and box-shadows are removed in forced-colors mode.
