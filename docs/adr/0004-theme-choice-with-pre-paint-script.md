# 0004. Theme choice with pre-paint script

- Status: Accepted. Supersedes the theming parts of [ADR 0002](0002-tailwind-v4-tokens-os-only-theming.md).
- Date: 2026-10-18
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [FOUND-004 story](../stories/found-004-themes-and-responsiveness.md), [FOUND-004 brief](../briefs/found-004-themes-and-responsiveness.md), https://github.com/eng-rodriguez/personal-website/issues/4

## Context
ADR 0002 switches light and dark only through `prefers-color-scheme`, so visitors cannot override the OS. FOUND-004 adds a remembered choice of System, Light or Dark that must apply before first paint, keep working without JavaScript, and print in light. The owner approved on 2026-10-18: three options with System as the default, `localStorage` only, a segmented radio group in the header, a small project-owned inline script in the root layout with no new dependency, and light printing. A CSS media query cannot read a stored value, so a stored choice that differs from the OS has to reach the CSS as a selector before the first paint.

## Decision
We will:
- Express an explicit choice as `data-theme="light"` or `data-theme="dark"` on `<html>`. System means the attribute is absent, so the page without JavaScript and the System choice behave the same, and live OS changes need no script.
- Keep the light tokens on `:root`. Declare the dark tokens twice with identical values: `:root:not([data-theme="light"])` inside `@media screen and (prefers-color-scheme: dark)` (System), and `:root[data-theme="dark"]` inside `@media screen` (explicit Dark). The contrast test checks both blocks and fails if they differ.
- Set `color-scheme` per state: `light dark` on `:root`, `light` for explicit Light and in `@media print`, `dark` for explicit Dark. Dark tokens apply only to `screen`, so print always uses the light tokens.
- Redefine Tailwind's `dark:` variant with `@custom-variant` to match the same two conditions. Components still keep per-theme differences in token values, not `dark:` utilities.
- Run a constant inline script as the first child of `<head>` in the root layout. It reads the `site-theme` key, accepts only `light` or `dark`, sets `data-theme`, and always sets `data-js` on `<html>`. Storage errors are caught and leave System. `<html>` gets `suppressHydrationWarning`, and only `<html>`.
- Hide the toggle with CSS until `data-js` is present, and keep it invisible until hydration. Its state comes from `useSyncExternalStore` reading the `<html>` attribute, with a server snapshot of "unknown". Choosing a theme updates the attribute first and storage second. System removes the key. Other tabs follow through the `storage` event.

ADR 0002's other decisions stay in force: CSS-first tokens in `globals.css`, oklch in the sRGB gamut, the `--input` and `--ring` roles, outline focus, edited shadcn components and the contrast test.

## Consequences
- Positive: the stored theme is right on the first paint, System follows the OS live in CSS alone, no-JS visitors get the OS theme with no dead control, and both dark blocks stay under the contrast test.
- Negative: dark values are written twice, and each `shadcn add` must copy any `.dark` variables into both blocks. A future Content Security Policy must allow the inline script by hash. The choice is per browser, and a private session with blocked storage resets to System on reload.
- Follow-ups: the headers and deployment story records the script hash in any CSP. Revisit the duplication if `light-dark()` support becomes acceptable for every supported browser.

## Alternatives
- `next-themes`: excluded by the owner decision (no new dependency).
- Cookie or server-side theme: excluded by the story (no cookie, no server, static-first).
- `light-dark()` token values switched by `color-scheme`: one value pair per token and no duplication, but needs Safari 17.5 or later, departs from the shadcn token layout, and needs a new parser in the contrast test.
- A script that always sets the resolved theme and listens to `matchMedia`: more JavaScript, and the no-JS page would still need the media-query dark block.
- `next/script` with `beforeInteractive`: in the App Router it goes through the Next.js runtime rather than running as a plain inline script, so it is not guaranteed to run before first paint.
