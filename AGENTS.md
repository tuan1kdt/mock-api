# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: Go code. `cmd/server` hosts the HTTP API; `cmd/worker` builds a WASM worker for Cloudflare; `internal/` holds services/handlers; `sql/` contains the D1 schema and SQLC config; `scripts/` has DB helpers.
- `front-end/`: Next.js (TypeScript) UI configured for Cloudflare via `wrangler.toml` and `open-next.config.ts`.
- `frontend-react/`: Vite + React prototype kept in parallel; prefer `front-end/` for production changes unless specified.
- Tooling roots: `Makefile` for worker builds, `docker-compose.yml` for local Postgres, `DEPLOYMENT.md` and `SIZE_OPTIMIZATION.md` for platform notes.

## Build, Test, and Development Commands
- Backend worker build: `make build-worker` (or `npm run build` at repo root) generates `backend/build/app.wasm`.
- Backend server (local Go): `make run-server` or `cd backend && go run ./cmd/server`.
- Cloudflare dev: `npm run dev` (root) to run Wrangler locally; migrations via `npm run migrate:local` / `npm run migrate:remote`.
- Frontend (Next.js): `cd front-end && npm install && npm run dev` for local; `npm run lint` and `npm run build` before deploy; `npm run preview`/`deploy` target Cloudflare.
- Frontend (Vite prototype): `cd frontend-react && npm install && npm run dev` | `npm run build` | `npm run lint`.

## Coding Style & Naming Conventions
- Go: `gofmt` and idiomatic Go naming; keep handlers/services small and table names aligned with `sql/` definitions. Prefer dependency injection over globals.
- TypeScript/React: Follow ESLint configs in each frontend; use functional components, Tailwind utility classes, and kebab-case for files under `app/` routes. Keep env-specific values behind `wrangler` or `.env.local` (not committed).
- Prefer clear names for routes (`/api/mocks/:id` style) and reusable UI pieces in `components/`.

## Testing Guidelines
- Backend: `cd backend && go test ./...` is the baseline; add table-driven tests for handlers and services. Ensure D1/Postgres access is mocked where possible.
- Frontend: No dedicated test runner currently; at minimum run `npm run lint` in the relevant frontend and smoke the primary flows (create/list mocks) locally.
- Add fixtures under `backend/internal/.../testdata` or `front-end/__fixtures__` when introducing new behavior.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits (see history: `feat:`, `refactor:`). Use present-tense, lower-case scopes.
- PRs should include: summary, linked issue (if any), environments touched (backend, worker, Next.js, Vite), and test evidence (lint/test commands + manual checks).
- Keep changes focused; update docs/config samples (`README.md`, `DEPLOYMENT.md`, `wrangler.toml` hints) when behavior or endpoints change.

## Security & Configuration Tips
- Keep secrets out of the repo. Use `wrangler secret` for Cloudflare values and `.env`/`.env.local` for local-only settings.
- Verify migrations align with `backend/sql/d1_schema.sql`; run them before pushing backend changes.
- For Docker-based workflows, confirm `docker-compose up -d` completes before running the Go server to avoid connection errors.
