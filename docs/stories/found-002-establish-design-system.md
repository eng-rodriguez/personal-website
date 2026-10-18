# Establish design system
Source: FOUND-002, https://github.com/eng-rodriguez/personal-website/issues/2 (labels: area:foundation, priority:p0, type:feature)

As the site owner, I want Tailwind CSS and shadcn/ui installed with typography, spacing, color, focus and theme tokens defined for light and dark, so that later stories can build Site presentation on accessible, reusable design tokens and components.

Assumptions:
- A1. The theme follows the OS preference (`prefers-color-scheme`) only. There is no user toggle and no `next-themes`.
- A2. Color tokens are CSS custom properties using shadcn's semantic names (background, foreground, primary, muted, accent, border, ring, destructive and the matching `*-foreground` names) for light and dark.
- A3. Keyboard focus uses `:focus-visible`. Unit tests assert the focus classes and CSS. Playwright stays out of scope, so a manual keyboard check covers real rendering.
- A4. shadcn/ui is initialized (`components.json`, `cn()` utility) with the Button as the only component. The home page may use the tokens for base styles only.
- A5. Typography keeps the system font stack, with no web font loading. A type scale and spacing are defined as Tailwind tokens.
- A6. `prettier-plugin-tailwindcss` is not added. The shadcn CLI version is pinned when used.
- A7. A short design-system document is added at `docs/design-system.md` and the CLAUDE.md Current state is updated.

Decisions on the open questions:
- Palette: start from shadcn's neutral base and adjust values until every pair passes the contrast test. No brand hue yet.
- The contrast test covers the semantic token pairs and the pairs each Button variant uses.
- The Button ships with the shadcn default variants and sizes.
- Generated shadcn files are fixed to pass ESLint and the Prettier check; they are not exempted.
- Tailwind CSS: the latest v4 supported by the pinned shadcn CLI.
- The manual keyboard check is recorded in the brief's Manual verification section.

## Acceptance criteria
1. Given a fresh clone with the pinned Node.js version, when I run `npm ci` and then `npm run build`, then Tailwind CSS utilities are applied to the home page and the production build exits with code 0.
2. Given the repository, when I inspect it, then `components.json`, the `cn()` utility in `src/lib/utils.ts` and a Button component under `src/components/ui` exist. The Button can be imported through the `@/*` alias in the type check, the build and the unit tests.
3. Given the global stylesheet, when I read it, then semantic color tokens (background, foreground, primary, muted, accent, border, ring, destructive and their foreground pairs) are defined for the light theme and for the dark theme. Each token has a value in both themes.
4. Given the OS preference is light or dark, when the home page loads, then it uses the matching theme from the first paint, with no visible flash of the other theme and no user toggle. Native controls and scrollbars use the matching `color-scheme`.
5. Given the token values for each theme, when the automated contrast test runs, then every text and foreground pair (for example foreground on background, and primary-foreground on primary) is at least 4.5:1. The focus ring and the border of interactive controls are at least 3:1 against the adjacent background, per WCAG 2.2. The test fails if any ratio is below its threshold.
6. Given the Button, when it receives keyboard focus (Tab), then a visible focus indicator appears on `:focus-visible` in both themes. It is not shown on mouse click, and the unit tests assert that the focus classes are present.
7. Given a typography scale and a spacing scale are defined as Tailwind tokens, when I read the design-system document, then it describes the tokens, the two themes, the focus rules and the steps to add a shadcn component. The CLAUDE.md Current state reflects Tailwind and shadcn/ui as installed.
8. Given the change is applied, when I run `npm run check`, then typecheck, ESLint (with `--max-warnings=0`), the Prettier check, the unit tests, including the existing home page test, and the production build all pass. `npm audit --audit-level=high --omit=dev` also passes.

## Edge cases
- Reduced motion: transitions and animations on components are disabled or minimized when `prefers-reduced-motion: reduce` is set.
- Forced-colors or high-contrast mode: the focus indicator stays visible and does not depend on a custom color or box-shadow alone.
- Disabled Button: WCAG exempts inactive components from the contrast minimum, so a disabled Button is not held to 4.5:1. It is still visibly different from the enabled state and not focusable by Tab.
- Generated shadcn files must pass ESLint with zero warnings and the Prettier check without exemptions.
- Installing Tailwind and shadcn must not need `--force` or `--legacy-peer-deps`, and must not introduce a high-severity audit finding in production dependencies.
- The shadcn CLI is run once and its version is pinned. The CLI must not overwrite `src/app/layout.tsx` or `page.tsx` in a way that breaks the existing home page test.
- JSDOM does not render Tailwind. Token and contrast tests parse the CSS text, in the style of `src/scaffold.test.ts`, and component tests assert class names. Real visual focus is verified manually.
- Opacity-modified or alpha color tokens: contrast is computed on the effective composited color, not the raw token.
- The CI brief scope check compares changed files with the brief's file list, so generated files must appear in the brief.
- No network calls, fonts or analytics are added at build or run time.

## Out of scope
- A user-facing theme toggle, theme persistence and `next-themes`.
- Web font loading and custom typefaces.
- shadcn components other than the Button.
- Playwright, end-to-end tests and automated visual or browser-based accessibility testing.
- `prettier-plugin-tailwindcss`.
- Real page design, navigation, layout, branding, and content pages (Writing, Portfolio, Career).
- MDX pipeline and Zod frontmatter schemas.
- Vercel deployment.
- New backend services, authentication, CMS and database.
