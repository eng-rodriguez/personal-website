# Lite review: Dependabot GitHub Actions group bump (PR 34)

Source: Dependabot PR eng-rodriguez/personal-website#34, `ci: Bump the actions group across 1 directory with 5 updates`, head `0a900de`.

## Change
Only `.github/workflows/ci.yml` changes, with 10 `uses:` lines across 5 actions. Each one stays pinned to a full SHA, and its comment now gives the exact version instead of the major alone.

| Action | From | To | SHA | Released |
| --- | --- | --- | --- | --- |
| actions/checkout | v4.4.0 | v7.0.1 | `3d3c42e5` | 2026-07-20 |
| dorny/paths-filter | v3.0.4 | v4.0.3 | `ceb8a2b8` | 2026-08-05 |
| actions/setup-go | v5.6.0 | v7.0.0 | `b7ad1dad` | 2026-07-16 |
| astral-sh/setup-uv | v5.4.2 | v10.3.0 | `1c37ad07` | 2026-10-09 |
| actions/setup-node | v4.4.0 | v7.1.0 | `949feb24` | 2026-10-08 |

## Plan (approved)
- Scope: review and merge PR 34 as Dependabot wrote it. No changes to app code, npm dependencies or `dependabot.yml`.
- Check that each SHA is the commit behind its release tag.
- Read the release notes of the skipped majors against the inputs this workflow uses.
- Run actionlint and zizmor locally on the PR head, then run the validator and the security reviewer.
- Merge only after the owner confirms.

Risk: **Low**. The change only affects CI: the workflow token is read-only, no secrets are used and nothing deploys. Recovery: revert the merge commit on `main`.

## Breaking-change review
- All five majors move the actions to the Node 24 runtime, which GitHub-hosted `ubuntu-latest` supports.
- setup-node v5 caches automatically. The workflow already sets `cache: npm`. v7 removed the placeholder `NODE_AUTH_TOKEN`, and nothing here publishes.
- setup-go: the workflow keeps `cache: false`.
- setup-uv v7 to v10 changed cache defaults and pruning, and v10 disables the cache for untrusted events. The workflow passes no inputs and doesn't rely on a cache.
- checkout v7 blocks checking out fork PRs under `pull_request_target` and `workflow_run`. This workflow runs only on `pull_request` and `merge_group`, and every checkout sets `persist-credentials: false`.

## Check results
- SHA to tag: all 5 match. Checked through the GitHub API, with annotated tags dereferenced.
- `actionlint` 1.7.12: exit 0.
- `zizmor==1.28.0 --min-severity medium`: exit 0 offline and exit 0 online (impostor-commit, known-vulnerable-actions). 9 findings below medium were suppressed.
- PR CI: `changes`, `secrets`, `workflows`, `web` and `ci-ok` passed. `scope` and `pr-format` were skipped by design for Dependabot branches.
- `npm run check` was not run locally. The PR touches no app files, and the `web` job ran it in CI.

## Review findings
- Validator: passed. One Low finding: the version comments are now exact versions, which is harmless.
- Security: nothing Critical or High.
  - Medium: setup-uv (10 days old) and setup-node (11 days old) are young releases that skip several majors. Their release notes were read (see above). The repository has no cooldown rule for actions.
  - Low: if the setup-uv cache is ever on, it holds only the pinned zizmor. The PR runs CI on ubuntu-latest, which covers runtime compatibility.

## Deferred
- Add `cooldown: { default-days: 14 }` to the github-actions entry in `.github/dependabot.yml`, to match the 2-week rule used for the shadcn CLI. This is a separate change.
- The `scope` job (checkout v7 with `fetch-depth: 0`) is skipped on Dependabot branches. Its first run with checkout v7 will be on the next `feat/` or `fix/` PR.
- Already true before this PR: setup-uv doesn't pin the uv version, and the gitleaks, actionlint and Go pins in CI are older versions.

## Checkpoint
- Phase: merged. Squashed as `ca694e1` on 2026-10-19
- Baseline: `origin/main`. Reviewed head `0a900de`. Branch protection requires PRs to be up to date, so a `@dependabot rebase` comment was used to bring the PR up to date with `main`. The rebased head `2080900` has the same 10 pin lines, and its CI passed (`ci-ok`, `web`, `workflows`, `secrets`, `changes`).
- Approvals: the owner approved the lite plan and the merge
- Repairs used: 0
- How to verify:
  1. On PR 34, the checks list shows `ci-ok`, `web`, `workflows`, `secrets` and `changes` passing.
  2. After the merge, `git grep -n 'uses:' .github/workflows/ci.yml` on `main` shows only the 5 SHAs above.
  3. Run `actionlint` and `zizmor --min-severity medium .github/workflows` on `main`. Both exit 0.
  4. The next `feat/` or `fix/` PR runs the `scope` job, and it passes with checkout v7.
