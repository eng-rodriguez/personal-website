# Brief: Establish design system (FOUND-002)

- Story: [docs/stories/found-002-establish-design-system.md](../stories/found-002-establish-design-system.md), https://github.com/eng-rodriguez/personal-website/issues/2
- Branch: `feat/found-002-establish-design-system`, baseline `origin/main` 53d9d46
- ADR: [0002. Tailwind v4 tokens, OS-only theming](../adr/0002-tailwind-v4-tokens-os-only-theming.md) (Proposed; accepted together with this brief)

Install Tailwind CSS v4 and initialize shadcn/ui with the Button as its only component. Define semantic color tokens for light and dark themes in `src/app/globals.css`, switched only by `prefers-color-scheme`, along with radius, font, spacing and focus rules. Gate the tokens with an automated WCAG contrast test. Apply base styles and a few utilities to the placeholder home page, and document the system in `docs/design-system.md`. No theme toggle, web fonts, other components, Playwright or deployment work.

This brief supersedes the FOUND-001 brief's "Explicitly not added: Tailwind/PostCSS config, `components.json`" for this story.

## 1. Layers touched

| Order | Layer | Builder | Paths | Depends on |
| --- | --- | --- | --- | --- |
| 1 | frontend (`web` area, repository root) | factory:react-builder with stack-react | Tailwind/PostCSS config, `components.json`, `src/app`, `src/lib/utils.ts`, `src/components/ui`, `package.json`, `package-lock.json`, `docs/design-system.md`, `CLAUDE.md` | none |

- One builder and one PR. Merge order: a single merge. No rollout, because nothing is deployed.
- Pipeline: no change. The existing `web` job (`npm ci --ignore-scripts`, `npm audit --audit-level=high --omit=dev`, `npm run check`) must pass unchanged. If Tailwind's native packages need an install script under `--ignore-scripts` (D3), stop and report. A CI change is outside this brief's scope.
- Infra, backend, ml: not touched.
- Stack: Next.js 16.4.2 App Router (Turbopack build), React 19.3.1, TypeScript ~6.0.3, Vitest 5 with jsdom, npm, Node.js 24. Versions in CLAUDE.md come from `package-lock.json` after install, not from this brief.

## 2. Ownership
Site presentation context (`docs/domain.md`): shared styling and UI primitives that later Writing, Portfolio and Career pages consume. Content contexts are not touched and there are no integrations. Ownership boundaries:
- `src/app/globals.css` owns every design token and global base rule. Components never hard-code colors; they use token utilities.
- `src/components/ui/*` holds shadcn primitives. They are generated once, then owned and edited in the repository (D6).
- `src/lib/utils.ts` holds `cn()` only.

## 3. Domain model
Not applicable. No content schemas, aggregates or migrations.

## 4. API contract
None. No route handlers, server actions or API artifacts. `components.json` is shadcn CLI configuration, not an API contract.

## 5. Data and consistency
Not applicable. No data store. `src/app/globals.css` is the source of truth for token values; `docs/design-system.md` describes them and does not copy the values, so they cannot drift. `package-lock.json` is the source of truth for dependency versions.

## 6. Frontend

### Design decisions
- **D1. Tailwind install (before the shadcn CLI).** Install the dev dependencies (D2), then add `postcss.config.mjs` with `export default { plugins: { "@tailwindcss/postcss": {} } }` and put `@import "tailwindcss";` at the top of `globals.css`, following Tailwind's Next.js guide. No `tailwind.config.*` file (ADR 0002). shadcn's init checks for an existing Tailwind v4 setup, which is why Tailwind goes in first.
- **D2. Dependencies (complete list; add nothing else).** Install with exact version specifiers (`npm install <pkg>@<version>`). npm writes its default caret into `package.json`, which matches the repository convention. The lockfile must resolve exactly these versions, all published at least 2 weeks ago. Check with `npm ls --depth=0`.
  - `devDependencies`: `tailwindcss` 4.3.3, `@tailwindcss/postcss` 4.3.3 (released in lockstep; keep them equal), `postcss` at the version already in `package-lock.json` (8.5.23). `postcss` is listed because Tailwind's Next.js guide installs it and `globals.test.ts` uses `postcss.parse` (D9). It adds no new package to the tree.
  - `dependencies` (runtime, needed by the Button and `cn()`): `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.7.0, plus the Radix Slot package that shadcn 4.21.1 emits for the Button: `radix-ui` 1.6.7 or `@radix-ui/react-slot` 1.3.3. Keep the import the CLI generates, so later `shadcn add` output matches without hand edits. Record which package was used and how many packages it added in the Checkpoint.
  - Not installed, and removed if the CLI adds them: `tw-animate-css` (no component animates yet; it comes in with the first component that does), `lucide-react` (the Button uses no icons; `components.json` keeps `iconLibrary: "lucide"` so a later `shadcn add` installs it when needed), `next-themes`, `prettier-plugin-tailwindcss`, `@testing-library/user-event` (D10), `shadcn` itself.
  - The CLI installs its own dependency versions (usually the latest). Afterwards, reinstall the D2 versions, uninstall the excluded packages and confirm with `npm ls`. No `--force` or `--legacy-peer-deps`. `npm ci` must print no new peer warnings beyond the 3 known ESLint 10 `ERESOLVE` notices (`docs/reviews/eslint-10-peer-warnings.md`).
- **D3. `--ignore-scripts`.** Tailwind v4 loads native binaries through `@tailwindcss/oxide` and `lightningcss` platform packages (optional dependencies). The builder confirms that `rm -rf node_modules .next && npm ci --ignore-scripts && npm run check` passes. If it fails because a package needs its install script, stop and report: changing CI is out of scope. The lockfile must contain the `linux-x64-gnu` entries for both packages (`grep` the lockfile), because CI runs on ubuntu-latest.
- **D4. shadcn init (pinned CLI, run once).** In the repository root, run `npx --yes shadcn@4.21.1 init button` with the neutral base color, CSS variables on, and the Radix-based default style that 4.21.1 offers (new-york or its successor; record the `style` value). Read `npx shadcn@4.21.1 init --help` for non-interactive flags. If `init` does not accept a component argument, run `npx --yes shadcn@4.21.1 add button` right after with the same version, and record that. Never use `shadcn@latest`. `components.json` must contain `"rsc": true`, `"tsx": true`, `"tailwind": { "config": "", "css": "src/app/globals.css", "baseColor": "neutral", "cssVariables": true }` and aliases `components: "@/components"`, `ui: "@/components/ui"`, `utils: "@/lib/utils"`, `lib: "@/lib"`, `hooks: "@/hooks"`. Afterwards, `git status` may show only the files in section 11. Revert any other change the CLI makes (for example to `layout.tsx`, `page.tsx`, `tsconfig.json` or `next.config.ts`) and note it in the Checkpoint. The CLI contacts the shadcn registry at development time only. Nothing it fetches runs at build or run time.
- **D5. Tokens in `src/app/globals.css` (ADR 0002).** Replace the file. Keep this order, and put a short comment at the top that names this structure as the contract the token test parses:
  1. `@import "tailwindcss";` No `@import "tw-animate-css"` and no `@custom-variant dark`. Tailwind v4's default `dark:` variant is already `@media (prefers-color-scheme: dark)`.
  2. `:root` with `color-scheme: light dark;`, `--radius: 0.625rem;` and the light values for these tokens: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`. Add `--destructive-foreground` (recent shadcn templates dropped it; the story requires it). Leave out shadcn's `chart-*` and `sidebar-*` tokens until a component uses them.
  3. `@media (prefers-color-scheme: dark) { :root { ... } }` with a dark value for every color token in item 2. Move the generated `.dark { }` block here. No `.dark` selector may remain.
  4. `@theme inline` mapping each color token to `--color-<name>: var(--<name>)`, plus `--radius-sm/md/lg/xl` derived from `--radius` (shadcn's formulas) and `--font-sans` set to the existing system stack (`system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
  5. `@theme` (not inline) restating `--spacing: 0.25rem`. It is Tailwind's default, written down so the spacing base is a visible, tested project token. The type scale is Tailwind's default `--text-xs` to `--text-9xl` with paired line heights. It is not redefined: it is the project scale and `docs/design-system.md` documents it. No custom size names are invented.
  6. `@layer base`: `* { @apply border-border; }`, `body { @apply bg-background text-foreground font-sans; }`, and `:focus-visible { @apply outline-2 outline-offset-2 outline-ring; }` as the global fallback for every focusable element. This replaces shadcn's `outline-ring/50`. A `@media (prefers-reduced-motion: reduce)` rule on `*, ::before, ::after` sets `animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important;`. Preflight replaces the old `body { margin: 0 }`.
- **D6. Color values.** Use oklch, as shadcn generates (see ADR 0002 for why not hex). Start from shadcn's neutral values, then change only the lightness (L) of neutrals until every pair in D9 passes. Keep destructive's hue, and lower its chroma only if a value falls outside sRGB. Every color must sit inside the sRGB gamut (D9), so the ratio the test computes is the one users see. Prefer opaque values for `--input` and `--ring`; alpha is allowed only on `--border`. These defaults are expected to fail and need adjusting: light `--ring` and `--input`, dark `--input` and `--border` (alpha), dark `--destructive` with light text, and possibly light `--destructive`. No brand hue. The owner reviews the result visually during Manual verification.
- **D7. Generated Button edits (`src/components/ui/button.tsx`).** Keep the cva structure, every generated variant name (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) and size name, the `asChild`/Slot behavior, `data-slot` and the exports. Only these changes are allowed:
  1. Focus: remove `outline-none`, `focus-visible:border-ring`, `focus-visible:ring-ring/50`, `focus-visible:ring-[3px]` and the destructive `focus-visible:ring-destructive/*` classes. Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` to the base classes. An outline survives forced-colors mode; a box-shadow does not. Plain `focus:` styles are not used, so clicking with a mouse shows no indicator.
  2. Remove every `dark:` class (for example `dark:bg-input/30`, `dark:border-input`, `dark:hover:bg-input/50`, `dark:hover:bg-accent/50`, `dark:bg-destructive/60`). Per-theme differences live in token values, where the contrast test checks them.
  3. destructive: `text-white` becomes `text-destructive-foreground`.
  4. outline: make the border color explicit with `border-input` (the interactive border token, 3:1).
  5. Add `motion-reduce:transition-none` next to the generated transition class.
  6. Formatting only, to pass Prettier and ESLint with zero warnings. No lint exemptions or `eslint-disable`.
  `aria-invalid:*` classes without `dark:` stay as generated. `src/lib/utils.ts` stays as generated (`cn = (...inputs) => twMerge(clsx(inputs))`), apart from formatting.
- **D8. Home page and layout.**
  - `src/app/page.tsx`: same markup and copy. Add utilities: `main` gets `mx-auto max-w-prose px-6 py-16`, `h1` gets `text-3xl font-semibold tracking-tight`, and `p` gets `mt-4 text-muted-foreground`. Do not render the Button. A4 limits the page to base styles, and the Manual verification step mounts it temporarily. It stays a synchronous Server Component, and `src/app/page.test.tsx` stays unchanged and passing.
  - `src/app/layout.tsx`: add `export const viewport: Viewport = { colorScheme: "light dark" };`. Next.js then emits `<meta name="color-scheme" content="light dark">`, so the canvas and native controls follow the OS before the stylesheet loads (AC4). No class on `<html>` or `<body>`, no inline script, no `suppressHydrationWarning`.
- States (loading, empty, error, denied): not applicable. A static page with no data.
- No `next/font`, no web fonts, no analytics and no new network calls at build or run time.

The diagram shows how one OS preference reaches every styled element through the tokens, and where the tests read.

```mermaid
flowchart LR
  OS[OS prefers-color-scheme] --> root[":root light values"]
  OS --> dark["@media dark :root values"]
  root & dark --> theme["@theme inline --color-*"]
  theme --> util[Tailwind utilities bg-primary, outline-ring, ...]
  util --> page[page.tsx] & btn[button.tsx]
  css[(globals.css text)] -. postcss.parse .-> t1[globals.test.ts: tokens + contrast]
  btn -. class names .-> t2[button.test.tsx]
```

### Test design
- **D9. `src/app/globals.test.ts`** (`// @vitest-environment node`, modeled on `src/scaffold.test.ts`). It reads `src/app/globals.css` from `process.cwd()` and parses it with `postcss.parse`; Vitest does not render Tailwind. Assertions:
  - Structure: `@import "tailwindcss"` is present. There is no `@custom-variant dark`, no `.dark` selector and no `tw-animate-css` import. `:root` declares `color-scheme: light dark`.
  - Tokens: the light `:root` and the dark media `:root` declare exactly the same set of color tokens, and that set includes all 19 names from D5. `@theme inline` maps each one to `--color-<name>`. `--radius`, `--font-sans` and `--spacing` exist.
  - Base: a `:focus-visible` rule applies the ring outline. The `prefers-reduced-motion: reduce` rule exists.
  - Color math, as pure helpers inside the test file (no runtime consumer, so not in `src/lib`): parse `oklch(L C H)` and `oklch(L C H / A)` (L as a number or percentage, A as a number or percentage), and fail with the token name on any other format. Convert OKLCH to OKLab, then to linear sRGB (CSS Color 4 matrices). Assert every channel is within [-0.001, 1.001] (in gamut). Composite alpha over the backdrop in gamma-encoded sRGB, as browsers do. Compute relative luminance on linearized channels and the ratio `(L1 + 0.05) / (L2 + 0.05)`, compared unrounded (4.49 fails).
  - Pairs, checked in both themes, with one named test case per pair and theme so a failure names it:
    - At least 4.5:1: foreground/background, card-foreground/card, popover-foreground/popover, primary-foreground/primary, secondary-foreground/secondary, muted-foreground/muted, muted-foreground/background, accent-foreground/accent, destructive-foreground/destructive, primary/background (link variant), and the Button hover fills composited over background: primary-foreground on primary at 90%, secondary-foreground on secondary at 80%, destructive-foreground on destructive at 90%. (outline and ghost hover use accent-foreground/accent; outline at rest uses foreground/background.)
    - At least 3:1: ring/background (focus outline, offset over the page background) and input/background (outline Button border and future control borders).
    - Not tested: `--border`, which is decorative. Disabled states, which WCAG exempts.
  - If the generated hover opacities differ from 90/80/90, test the generated values and record them.
- **D10. `src/components/ui/button.test.tsx`** (jsdom; imports `Button` from `@/components/ui/button`):
  - Renders a native `button` with an accessible name.
  - Each variant has its token classes, the same pairs D9 checks: default `bg-primary text-primary-foreground`, destructive `bg-destructive text-destructive-foreground`, outline `border-input bg-background`, secondary `bg-secondary text-secondary-foreground`, ghost `hover:bg-accent hover:text-accent-foreground`, link `text-primary`. No variant contains a `dark:` class.
  - Focus: the classes `focus-visible:outline-2`, `focus-visible:outline-offset-2` and `focus-visible:outline-ring` are present in every variant. There is no `outline-none`, no `focus-visible:ring-*` and no plain `focus:` class.
  - Motion: `motion-reduce:transition-none` is present.
  - Disabled: the `disabled` attribute and `disabled:opacity-50` (or the generated disabled classes) are present, and `button.focus()` leaves `document.activeElement` elsewhere. jsdom does not focus disabled controls.
  - `asChild` with an `<a href>` child renders a link with the button classes.
  - Every generated size renders.
  - `@testing-library/user-event` is not added. jsdom implements neither Tab navigation nor `:focus-visible` matching, so a simulated Tab would prove nothing beyond the class assertions. Real keyboard behavior is checked manually (story A3).
- **`src/lib/utils.test.ts`**: `cn("px-2", "px-4")` returns `"px-4"`, and falsy inputs are dropped.

## 7. Infra and pipeline
Not applicable. No workflow, Dependabot, environment or deployment change. The existing `web` job must pass as is (D3). Dependabot's weekly grouped npm updates will start covering the new packages, which is expected.

## 8. Security and threat notes
- Authn/z, tenant isolation, input validation: not applicable (no users, no input, no data).
- Secrets: none added. Data classification: public placeholder copy only.
- New runtime dependencies (D2): small, widely used UI packages, bundled client-side only where the Button is imported. CI's `npm audit --audit-level=high --omit=dev` must pass.
- Top threats (STRIDE):
  1. Tampering through the npm supply chain (new runtime and dev packages, Tailwind native binaries). Mitigations: exact versions at least 2 weeks old, committed lockfile with registry sha512 integrity, `npm ci --ignore-scripts` in CI, a closed dependency list, removal of unused CLI additions, and `npm audit` in CI.
  2. Tampering through the one-off `npx shadcn@4.21.1` download and its registry fetch. Mitigations: pinned CLI version older than 2 weeks, run once locally, not a project dependency, generated output reviewed in the diff, and nothing fetched at build or run time.
  3. Denial of the site to users who rely on accessibility settings (invisible focus, unreadable text, forced motion). This is not classic STRIDE but is the main user-facing risk here. Mitigations: the contrast test gate, outline-based focus, the reduced-motion rule and the manual checks.

## 9. Verification per criterion
Local checks run from the repository root on Node.js 24 / npm 11. "Fresh clone" means `git clean -xfd` after committing, or a separate clone.

| AC | Check | Level |
| --- | --- | --- |
| 1 | Fresh clone: `npm ci --ignore-scripts && npm run build`, exit 0. Then `grep -rl -- '--color-background' .next/static --include='*.css'` finds the stylesheet, the same CSS contains `.text-muted-foreground` and `.max-w-prose`, and `.next/server/app/index.html` contains `max-w-prose` in a `class` attribute. Plus the browser view in Manual verification | local + manual |
| 2 | `test -f components.json && test -f src/lib/utils.ts && test -f src/components/ui/button.tsx`. `button.test.tsx` imports `@/components/ui/button`. `npm run typecheck`, `npm test` and `npm run build` (which type-checks the project, including the test file's import) exit 0 | static + local |
| 3 | `globals.test.ts` token tests: the same 19-token set in both themes, each with a value | local |
| 4 | `globals.test.ts` structure tests (media query, `color-scheme`, no `.dark`). The built `.next/server/app/index.html` contains `<meta name="color-scheme" content="light dark"/>`. Manual: first paint in both OS themes and native controls/scrollbars | local + manual |
| 5 | `globals.test.ts` contrast tests pass in both themes. Negative check: temporarily set light `--muted-foreground` to the light `--muted` value, and `npm test` fails naming that pair; revert | local |
| 6 | `button.test.tsx` focus-class assertions. Manual: Tab shows the outline in both themes and in forced colors; a mouse click does not | local + manual |
| 7 | Inspect `docs/design-system.md` (sections in section 10) and the CLAUDE.md Current state | static |
| 8 | `npm run check` exit 0 with the Vitest file and test counts recorded; `npm audit --audit-level=high --omit=dev` exit 0; `npm ls` exit 0; `npm ci` output shows only the 3 known `ERESOLVE` notices | local |

Edge cases: reduced motion (D9 rule, D10 class, manual emulation); forced colors (D7 outline, manual emulation); disabled Button (D10); generated files pass lint and Prettier (AC8, with no new ignore entries in `eslint.config.mjs` or `.prettierignore`); no `--force` (AC8 install log); the CLI leaves layout and page alone (`git status` after D4, page test passes); alpha tokens (D9 compositing); the scope check (CI); no network calls (manual Network tab, and `grep -rE 'fonts\.(googleapis|gstatic)' .next/static` finds nothing).

Environment evidence, blocked until the PR exists: the CI `web` job on ubuntu-latest with `--ignore-scripts` (Tailwind's Linux native binaries) and the `scope` job against section 11. Not covered by automation: real rendering, focus visibility, forced colors and first-paint behavior. These are manual by design, since Playwright is out of scope.

### Manual verification
Run by the owner on a fresh clone of the branch with Node.js 24, before marking the PR ready. Record who ran it and the result in the Checkpoint; builders do not claim it. Items marked "automated" may also be run by the test agent, which does not replace the human run.

Prerequisites: a fresh clone of `feat/found-002-establish-design-system`, and Chrome or Edge with DevTools (Rendering panel: "Emulate CSS media feature prefers-color-scheme", "forced-colors" and "prefers-reduced-motion").

1. `npm ci`. Expected: exit 0, only the 3 known ESLint `ERESOLVE` notices, no `EBADENGINE`. Covers AC8. Automated: `npm ci --ignore-scripts` exit 0.
2. `npm run check; echo $?`. Expected: exit 0, steps in order; record the Vitest file and test counts. Covers AC1, AC2, AC3, AC5, AC6, AC8. Automated.
3. `npm audit --audit-level=high --omit=dev` and `npm ls --depth=0`. Expected: both exit 0, and versions match D2. Covers AC8. Automated.
4. AC5 negative check: set light `--muted-foreground` to the light `--muted` value, run `npm test`, and expect a failure naming `muted-foreground/muted` (light). Then `git checkout src/app/globals.css`. Automated.
5. Temporarily mount the Button for inspection. In `src/app/page.tsx`, import `Button` from `@/components/ui/button` and render one of each variant inside `<main>`, plus `<Button disabled>Disabled</Button>`. Run `npm run dev` and open `http://localhost:3000`.
6. OS (or DevTools emulation) set to light, then dark. Hard-reload each time with "Slow 4G" throttling. Expected: the page paints in the matching theme from the first frame with no flash of the other theme, the scrollbar matches the theme, and there is no theme toggle. Covers AC4. Human only.
7. In each theme, press Tab from the address bar through the buttons. Expected: each enabled button shows a clearly visible outline offset from its edge, and the disabled button is skipped. Click a button with the mouse: no outline appears. Covers AC6 and the disabled edge case. Human only.
8. Emulate `forced-colors: active` and repeat the Tab pass. Expected: the focus outline is still visible on every button. Covers the forced-colors edge case. Human only.
9. Emulate `prefers-reduced-motion: reduce` and hover over the buttons. Expected: colors change without a transition. Covers the reduced-motion edge case. Human only.
10. Network tab during steps 6 to 9. Expected: only `localhost` is contacted, with no font or analytics requests. Owner judgment: the neutral palette is acceptable in both themes. Human only.
11. Revert step 5 (`git checkout src/app/page.tsx`) and confirm `git status` is clean.
12. Read `docs/design-system.md` and the CLAUDE.md Current state. Expected: the content listed in section 10. Covers AC7. Human only.
13. Open the PR. Expected: `web`, `scope` and `ci-ok` succeed. Environment evidence; blocked until the PR exists.

Rollback: revert the merge commit through a PR (section 12).

## 10. Docs impact and observability
- `docs/design-system.md` (new, short):
  - Where tokens live and how to add one: light value, dark value, `@theme inline` mapping and contrast pairs.
  - What each semantic token means, with `--input` as the interactive border and `--border` as decorative only.
  - The OS-only themes (no toggle, no `.dark`, `dark:` is media-based).
  - Contrast rules and the test (4.5:1 text, 3:1 ring and control borders, sRGB gamut, compositing).
  - Focus rules (`:focus-visible` outline only, never `outline-none` without a replacement, never ring-only focus).
  - Reduced motion.
  - Type scale (Tailwind defaults, `--font-sans` system stack, no web fonts) and spacing (`--spacing` 0.25rem).
  - Steps to add a shadcn component: `npx --yes shadcn@4.21.1 add <name>` (or a newer pinned version at least 2 weeks old); reinstall pinned dependency versions; move any `.dark` variables into the media block; apply the D7 edits; add the component's color pairs to the contrast test; run `npm run format` and `npm run check`; list the generated files in the brief.
  - No token values copied (`globals.css` is the source).
- `CLAUDE.md`:
  - Current state: Tailwind CSS v4 and shadcn/ui installed (Button only), with lockfile versions for tailwindcss and the shadcn runtime dependencies, tokens in `src/app/globals.css`, and a pointer to `docs/design-system.md`.
  - Approved decisions: ADR 0002.
  - Paths: `src/components/ui`, `components.json`, `postcss.config.mjs`.
  - Factory routing: the shadcn CLI version rule.
  - Remove nothing else.
- `README.md`: no change (scripts and setup are unchanged).
- Observability: none. No runtime service, and nothing is logged.

## 11. Files that will change
Builders create or modify only these paths. Any other file, including CLI output not listed here, is out of scope and must not be committed.

Frontend / application (factory:react-builder):
- `package.json` (modified)
- `package-lock.json` (modified)
- `postcss.config.mjs` (new)
- `components.json` (new)
- `src/app/globals.css` (modified, replaced)
- `src/app/layout.tsx` (modified: `viewport` export)
- `src/app/page.tsx` (modified: utilities)
- `src/lib/utils.ts` (new)
- `src/components/ui/button.tsx` (new)

Tests (factory:react-builder; also exempt from the scope check):
- `src/app/globals.test.ts` (new)
- `src/components/ui/button.test.tsx` (new)
- `src/lib/utils.test.ts` (new)

Docs (factory:react-builder):
- `docs/design-system.md` (new)
- `CLAUDE.md` (modified)

Planning (orchestrator/architect):
- `docs/briefs/found-002-establish-design-system.md` (this brief)
- `docs/adr/0002-tailwind-v4-tokens-os-only-theming.md` (new)
- `docs/stories/found-002-establish-design-system.md` (already present, untracked)

Not committed (gitignored, generated): `.next/`, `node_modules/`, `next-env.d.ts`, `*.tsbuildinfo`.
Explicitly not added: `tailwind.config.*`, `src/hooks/`, other `src/components/ui/*` files, `src/components/theme-provider.tsx`, `.npmrc`, `AGENTS.md`, and any change to `src/app/page.test.tsx`, `eslint.config.mjs`, `.prettierignore`, `tsconfig.json`, `next.config.ts` or `.github/`.

## 12. Risk
- Level: **Standard**. It replaces the global stylesheet and adds runtime UI dependencies to an undeployed static site, with no data, auth, secrets or deployment impact, and reverts as one PR.
- Recovery: revert the merge commit on `main` (`git revert -m 1 <merge-sha>`) through a PR. Nothing is deployed, so there is no runtime rollback and no flag. Close any Dependabot PRs for the removed packages afterwards.
- Owner: @eng-rodriguez.

## 13. Open questions and ADRs
- ADR written: [0002. Tailwind v4 tokens, OS-only theming](../adr/0002-tailwind-v4-tokens-os-only-theming.md) (Proposed; set to Accepted when this brief is approved). It records CSS-first tokens, oklch in the sRGB gamut, media-only theming, `--input`/`--ring` roles, outline focus, editing generated components, and the Button's runtime dependencies.
- Open (owner, does not block): the final palette is shadcn neutral adjusted for contrast. Visual acceptance happens in Manual verification step 10, and a brand hue comes in a later story.
- Builder-verified at implementation (record results in the Checkpoint):
  - that shadcn 4.21.1 targets Tailwind v4 and accepts 4.3.3 (if it emits a different v4 minor, use the newest that is at least 2 weeks old and record it);
  - the style name and Radix package it emits (D2, D4);
  - whether `init button` worked or `add` was needed;
  - the generated hover opacities and size names;
  - `--ignore-scripts` with Tailwind's native packages and the `linux-x64-gnu` lockfile entries (D3);
  - any CLI changes reverted;
  - the final token values that changed from shadcn neutral.
- Resolved in this brief: oklch rather than hex (ADR 0002); no `tw-animate-css`, `lucide-react` or `user-event` (D2, D10); Button not rendered on the home page (D8).

## 14. Checkpoint
- Phase: implemented (d7ad8c8), tests verified, reviews done; awaiting owner final review
- Scope: FOUND-002 as in the approved story
- Baseline: `main` 53d9d46 (clean); branch `feat/found-002-establish-design-system`
- Preserved user edits: none
- Revisions: 0
- Approvals: story approved by owner; brief and ADR 0002 approved by owner (ADR Accepted)
- Builder findings (react-builder, committed in d7ad8c8):
  - shadcn 4.21.1 targets Tailwind v4 and accepted 4.3.3. `components.json` style is `new-york` (also emits `rtl: false`, `prefix: ""`). `init button --base radix -t next --css-variables --no-rtl --no-pointer -y` worked in one step; `add` was not needed.
  - The CLI wrote `import { cn } from "cn"` and `export { cn } from "cn"` (a third-party `cn` package) and `import { Slot } from "radix-ui"` (`Slot.Root`), and added `radix-ui` 1.8.1, `cn`, `lucide-react`, `shadcn`, `tw-animate-css`. Reinstalled D2 versions: `radix-ui` 1.6.7 (adds 1 direct dep; lockfile went from 504 to 614 node_modules entries in total, including Tailwind and its native optional packages), `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.7.0, `tailwindcss`/`@tailwindcss/postcss` 4.3.3, `postcss` 8.5.23. Uninstalled `cn`, `lucide-react`, `shadcn`, `tw-animate-css`.
  - Deviation: `src/lib/utils.ts` is hand-written as `cn = twMerge(clsx(inputs))` (the D2/section 2 form) and `button.tsx` imports `cn` from `@/lib/utils`, because the generated `cn` package is outside D2.
  - Generated hover opacities 90/80/90 (as assumed). Sizes: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg.
  - CLI changes reverted/replaced: the generated globals.css (replaced per D5, dropped `tw-animate-css`/`shadcn/tailwind.css` imports, chart/sidebar tokens, `@custom-variant dark`, `.dark`). The CLI left `layout.tsx`, `page.tsx`, `tsconfig.json` and `next.config.ts` untouched.
  - Token values changed from shadcn neutral (lightness only unless noted): light `--muted-foreground` 0.556 to 0.5; light `--input` 0.922 to 0.6; light `--ring` 0.708 to 0.6; light `--destructive` 0.577 0.245 to 0.55 0.22 (chroma lowered for sRGB gamut and for white text at 90% hover); dark `--destructive` chroma 0.191 to 0.185 (gamut); dark `--input` `oklch(1 0 0 / 15%)` to opaque `oklch(0.5 0 0)`. New `--destructive-foreground`: light `oklch(0.985 0 0)`, dark `oklch(0.145 0 0)`. Dark `--border` keeps its alpha (decorative, untested).
  - `postcss.config.mjs` assigns the config to a `config` const before `export default`, because `import/no-anonymous-default-export` warns under `--max-warnings=0` (no lint exemption used).
  - `rm -rf node_modules .next && npm ci --ignore-scripts` exit 0 with only the 3 ERESOLVE notices and no EBADENGINE; `npm run check` passes after it. Lockfile contains `@tailwindcss/oxide-linux-x64-gnu` and `lightningcss-linux-x64-gnu`.
  - Built output: stylesheet contains `--color-background`, `text-muted-foreground`, `max-w-prose`; index.html has the class and `<meta name="color-scheme" content="light dark"/>`; no Google Fonts references. AC5 negative check failed as expected, naming `muted-foreground/muted` (light), then reverted.
  - Manual verification (human steps 5 to 13) not run by the builder.
- Check evidence: `npm run check` exit 0 (6 test files, 112 tests); `npm audit --audit-level=high --omit=dev` exit 0; `npm ls` exit 0
- Repairs used: 0
- Test verification: every AC mapped to tests or Manual verification steps; no tests added; negative contrast check reproduced
- Reviews (implementation-validator, design-reviewer, security-reviewer): 0 Critical, 0 Important, 6 Minor in scope (none fixed: generated `aria-invalid:ring-destructive/20` has no ring width; hand-maintained contrast pair lists; `.dark` regex check is coarse; duplicate "Installed versions" sentence in CLAUDE.md; `components.json` keeps `iconLibrary: lucide`; `radix-ui` umbrella brings 63 `@radix-ui/*` packages for `Slot` only)
- Deferred unrelated: 5 high `braces` advisories in dev dependencies, identical at baseline 53d9d46 (`npm audit --package-lock-only`); production audit clean
- Remaining blockers: Manual verification steps 5 to 13 (human; step 13 needs the PR)
- Next action: owner final review, then commit closing notes, push and open the PR
