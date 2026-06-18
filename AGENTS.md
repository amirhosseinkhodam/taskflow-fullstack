# TaskFlow Fullstack — AGENTS.md

## Overview

Monorepo with a **NestJS 11 backend** (`backend/`) and an **Angular 19 standalone frontend** (`frontend/`). Entrypoints: `backend/src/main.ts`, `frontend/src/main.ts` (bootstrapped via `bootstrapApplication`). Both live at root `package.json`.

## Quick commands

| Command | Action |
|---|---|
| `npm run start:dev` | Backend dev server (watch mode) on `localhost:3000` |
| `npm run start:frontend` | Angular dev server on `localhost:4200` |
| `npm run build` | Build both: `nest build && ng build` |
| `npm run build:backend` | `nest build` |
| `npm run build:frontend` | `ng build` |
| `npm run lint` | ESLint — only checks `backend/src/**/*.ts` (not frontend) |
| `npm run format` | Prettier — writes both `backend/src` and `frontend/src` |

No test setup exists (no spec/e2e files found).

## Architecture

- **Backend**: NestJS + `pg` Pool (raw SQL queries). Database provider is injected via `'DATABASE'` string token. Tables are auto-created on app startup in `database.provider.ts`.
- **Database**: PostgreSQL. Uses `pg` Pool. Config via `DATABASE_URL` or individual `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` env vars.
- **Frontend**: Angular 19 standalone (no `NgModule`). Uses `bootstrapApplication` with `provideHttpClient()`.
- **Frontend API calls**: Directly target `http://localhost:3000` (hardcoded in `api.service.ts`). The proxy config (`proxy.conf.json`) only rewrites `/api` → `/`; it's not used for `/projects` or `/tasks` calls.
- **Swagger**: Available at `http://localhost:3000/api` (auto-served by `@nestjs/swagger`).
- **CORS**: Backend allows `http://localhost:4200` only.

## Setup

- Copy `.env` (or create from scratch) — `DATABASE_URL` or individual `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` env vars.
- Backend loads env via `import 'dotenv/config'` at the top of `main.ts`.
- Database tables auto-create on first startup via `ensureTables()` — no migrations to run.
- A PostgreSQL 16 instance (extracted from a deb, `/tmp/pg/usr/lib/postgresql/16/bin/`) is running for this session. In production or a clean environment, you need your own PostgreSQL.

## Notable quirks

- `lint` does **not** check frontend code.
- `noImplicitAny: false` in backend tsconfig (looser than root `strict: true`).
- `prettier/prettier` in eslint config sets `endOfLine: "auto"`.
- `prisma` / `@prisma/client` are **unused** — database is raw `pg` Pool.
- `postgres` (Postgres.js) package is **unused** — only `pg` is used.
- `database.sqlite` in repo root is stale (leftover from sql.js experiment).
- All camelCase columns in SQL (`"projectId"`, `"createdAt"`, `"updatedAt"`) are quote-escaped in CREATE TABLE and must also be quoted in query references — unquoted `updatedAt` folds to `updatedat` and raises `42703`. Always quote camelCase identifiers.

## File style

- Single quotes, trailing commas (Prettier config).
- Backend: `backend/src/<module>/` (controller, service, module, model, dto).
- Frontend: `frontend/src/main.ts` has inline component + bootstrap (no separate app component files beyond the template).
