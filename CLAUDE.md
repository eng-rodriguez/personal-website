# personal-website
Personal engineering website featuring technical writing, projects, professional experience and resume. Context: personal.

## Detected stack
- Backend: none
- Frontend: Next.js (React) chosen; not scaffolded yet, so no manifests, lockfiles, source or versions exist
- Infrastructure/runtime: none; hosting target not chosen
- CI/delivery owner: GitHub Actions for PR checks (`ci`, `pr-format`); no delivery workflow or hosting
- Factory routing: factory:react-builder with stack-react for components and hooks; Next.js routing, rendering and data-fetching follow the framework's conventions for the installed version. factory:pipeline-builder for `.github/`.
Record installed versions from the lockfile once scaffolded. Approve a minimal layout and check plan before adding dependencies.

## Ownership and contracts
- Single repository; no components yet.
- API contract artifacts: none.

## Existing commands
- Complete verification from Git root: unknown (`<TODO>` once scaffolded)
- Build/run: not applicable yet
- Tests/static checks: none in the repository; test tools not yet chosen
- Infrastructure validation: not applicable
Never deploy from the development workflow. Unknown commands are not verification.

## Paths
- Site source: `<TODO>` (register as the `web` area in `.factory.yml` when scaffolded)
- Planning artifacts: `docs/domain.md`, `docs/adr/`, `docs/briefs/`, `docs/stories/`, `docs/closing-notes/`
- CI: `.github/workflows/ci.yml`, `.github/workflows/pr-format.yml`, `.github/dependabot.yml`

## Project-specific decisions
- Licensed under MIT.
- `<TODO>`: hosting target and content format (e.g. MDX posts) once chosen.

## Verification and recovery
- No hosting or delivery exists yet; release and recovery owner: @eng-rodriguez.

## Don't
- Log credentials or sensitive personal data.
- Publish personal contact details beyond what is intended for the public site.
- Change framework, deployment ownership or dependencies outside approved scope.

## Lessons
