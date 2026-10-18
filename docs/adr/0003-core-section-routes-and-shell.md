# 0003. Core section routes and shell

- Status: Accepted
- Date: 2026-10-18
- Deciders: Josue Rodriguez (@eng-rodriguez)
- Related: [FOUND-003 story](../stories/found-003-build-global-shell.md), [FOUND-003 brief](../briefs/found-003-build-global-shell.md), https://github.com/eng-rodriguez/personal-website/issues/3

## Context
CLAUDE.md leaves the content model and rendering details unresolved, and `docs/domain.md` names three content contexts (Writing, Portfolio, Career) but no URLs. The global shell needs a fixed set of navigation targets now, and every later content story adds pages under them. Once the site is deployed, these paths become public URLs that links and search results point to, so renaming them later needs redirects. The approved FOUND-003 story chose the route set and labels and ruled out a separate case study route.

## Decision
We will:
- Use five top-level core routes with these navigation labels: Home `/`, Writing `/writing`, Projects `/projects`, Experience `/experience`, Resume `/resume`. Each is a static App Router page at `src/app/<segment>/page.tsx`. Later detail pages nest under their section (for example `/writing/<slug>`), so a section link stays active on its nested paths.
- Reach case studies through Projects. No top-level case study route is added. Whether a case study is a kind of project or its own content type stays open.
- Keep `/resume` as the resume entry point regardless of whether it becomes a web page, a PDF or both, and regardless of whether it is generated from professional experience.
- Make the root layout own the Site presentation shell: one skip link, header with the primary navigation, one `main` landmark with the shared content container, and footer. Pages render content only and never render their own `main`.
- Keep the navigation items in one module (`src/lib/navigation.ts`), the only place a core route is added, renamed or removed.

## Consequences
- Positive: later Writing, Portfolio and Career stories add pages without touching the shell, and URLs follow the content types visitors look for rather than internal context names.
- Negative: renaming a core route after deployment needs a redirect and an update to this ADR. A page that needs a wider layout than the shared reading width must opt out explicitly in a later story.
- Follow-ups: the content model stories decide the case study type and the resume format; the deployment story adds `metadataBase`, a sitemap and canonical URLs.

## Alternatives
- A separate top-level case study route: excluded by the approved story; case studies are reached through Projects.
- Other route names: none recorded.
