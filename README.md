# personal-website
Personal engineering website featuring technical writing, projects, professional experience, and resume

## Local setup
Requires Node.js 24 (pinned in `.nvmrc` and `package.json` `engines`).

1. `nvm use` selects the Node.js version from `.nvmrc`.
2. `npm ci` installs the exact dependencies from `package-lock.json`.
3. `cp .env.example .env.local` is optional. The app needs no environment variables yet.
4. `npm run dev` starts the dev server at http://localhost:3000.
5. `npm run check` runs the full verification.

Next.js collects anonymous telemetry. To opt out locally, run `npx next telemetry disable`.

## npm scripts
| Script | Runs |
| --- | --- |
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` (after `build`) |
| `typecheck` | `next typegen && tsc --noEmit` |
| `lint` | `eslint . --max-warnings=0` |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check .` |
| `test` | `vitest run` |
| `check` | typecheck, lint, format:check, test and build in sequence; stops at the first failure |

`npm run check` is the complete verification and the command CI runs.
