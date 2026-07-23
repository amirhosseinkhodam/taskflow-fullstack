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
| `npm run lint` | ESLint — checks `backend/src/**/*.ts`, `backend/tests/**/*.ts`, `frontend/src/**/*.ts`, `frontend/tests/**/*.ts` |
| `npm run format` | Prettier — writes `backend/src`, `backend/tests`, `frontend/src`, `frontend/tests` |
| `npm run test` | Run all tests (backend + frontend) |
| `npm run test:backend` | Run backend tests only |
| `npm run test:frontend` | Run frontend tests only |

Test files live in `backend/tests/` and `frontend/tests/`, mirroring the `src/` directory structure. They import source files via relative paths (e.g. `'../../src/auth/auth.controller'`).

## Architecture

- **Backend**: NestJS + `pg` Pool (raw SQL queries). Database provider is injected via `'DATABASE'` string token. Tables are auto-created on app startup in `database.provider.ts`.
- **Database**: PostgreSQL. Uses `pg` Pool. Config via `DATABASE_URL` or individual `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` env vars.
- **Frontend**: Angular 19 standalone (no `NgModule`). Uses `bootstrapApplication` with `provideHttpClient()` and `provideRouter()`.
- **Frontend API calls**: Directly target `http://localhost:3000` (hardcoded in `api.service.ts`). The proxy config (`proxy.conf.json`) only rewrites `/api` → `/`; it's not used for `/projects` or `/tasks` calls.
- **Swagger**: Available at `http://localhost:3000/api` (auto-served by `@nestjs/swagger`).
- **CORS**: Backend allows `http://localhost:4200` only.
- **Auth**: JWT-based. Register at `/auth/register`, login at `/auth/login`. Protected routes (projects, tasks) require `Authorization: Bearer <token>` header. JWT payload includes `{ sub, email, role }`.
- **RBAC**: Role-Based Access Control with two roles: `user` (default) and `admin`. Admin-only actions: create/edit/delete projects, manage users via admin panel.
- **Frontend routes**: `/login` (public), `/register` (public), `/` dashboard (protected), `/admin` (admin-only). Auth guard redirects unauthenticated users to `/login`. Admin guard redirects non-admins to `/`. HTTP interceptor attaches JWT from `localStorage`.

## Setup

- Copy `.env` (or create from scratch) — `DATABASE_URL` or individual `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` env vars.
- Backend loads env via `import 'dotenv/config'` at the top of `main.ts`.
- Database tables auto-create on first startup via `ensureTables()` — no migrations to run.
- A PostgreSQL 16 instance (extracted from a deb, `/tmp/pg/usr/lib/postgresql/16/bin/`) is running for this session. In production or a clean environment, you need your own PostgreSQL.

## Notable quirks

- `lint` now checks **both** backend and frontend.
- `noImplicitAny: false` in backend tsconfig (looser than root `strict: true`).
- `prettier/prettier` in eslint config sets `endOfLine: "auto"`.
- `prisma` / `@prisma/client` are **unused** — database is raw `pg` Pool.
- `postgres` (Postgres.js) package is **unused** — only `pg` is used.
- `database.sqlite` in repo root is stale (leftover from sql.js experiment).
- All camelCase columns in SQL (`"projectId"`, `"createdAt"`, `"updatedAt"`) are quote-escaped in CREATE TABLE and must also be quoted in query references — unquoted `updatedAt` folds to `updatedat` and raises `42703`. Always quote camelCase identifiers.

## Third-party library preference

- **Always prefer well-maintained third-party libraries over hand-rolling utility code** for common tasks like date handling, crypto, validation, etc.
- Currently installed: `date-fns-jalali` for Jalali/Persian date formatting (use `formatDate` from `date-fns-jalali`).
- **Never write custom calendar converters, date parsers, or formatting utilities** when a library already exists. If you need date manipulation, use `date-fns` / `date-fns-jalali`. If you need something else (e.g. UUID generation, deep cloning), install a dedicated library instead of reimplementing it.
- When adding a new third-party utility library, install it at root `package.json` and document it in this section.
- **Use existing libraries first.** Before creating any utility, check if a well-maintained library already does it. Search npm, check GitHub stars, last publish date. Only build custom if nothing suitable exists.

## Workflow rules

- **Plan mode for multi-file changes**: When a task requires editing more than 1–2 files, present a plan first and ask for approval before implementing. The user often forgets to switch to plan mode, so the assistant must proactively propose one.
- **Auto-delete plan files**: When a plan `.md` file is created during planning, delete it after implementation is complete.
- **Never commit or push to GitHub**: Commits and pushes are **permanently blocked** unless they originate from a verified human user. Automated scripts and non-human processes are denied access to the GitHub repository entirely.
- **Always use custom components**: Replace all standard HTML (`<input>`, `<button>`, `<textarea>`, `<form>`, etc.) with custom component equivalents from `frontend/src/app/shared/components/`. Never create new HTML elements for common UI patterns — use the existing component library instead.
- **Update `backend-explained.md` after backend edits**: Whenever any file under `backend/` is created, edited, or deleted, update `backend/backend-explained.md` to reflect the changes. Add documentation for new modules/endpoints, update descriptions for modified ones, and remove entries for deleted ones. This keeps the backend documentation in sync with the actual code.

## Documentation structure

- `doc/project-specific/` — TaskFlow-only documentation (plans, security, design system, testing plan, READMEs).
- `backend/backend-explained.md` — Backend explained for frontend developers.
- General coding conventions, security checklists, and testing strategies are in `~/.config/opencode/AGENTS.md` and `~/.config/opencode/docs/` (shared across all projects).

## Role-Based Access Control (RBAC)

- **Roles**: `user` (default on registration) and `admin`.
- **Backend enforcement**: `@Roles('admin')` decorator + `RolesGuard` on protected endpoints. Only `ProjectController` POST/PUT/DELETE are admin-only; all GET endpoints are accessible to authenticated users.
- **Admin module**: `backend/src/admin/` — `AdminController` provides:
  - `GET /admin/users` — List all users
  - `DELETE /admin/users/:id` — Delete user (prevents self-delete)
  - `PATCH /admin/users/:id/role` — Change user role (prevents self-modification)
  - `POST /admin/users/:id/change-password` — Admin can change user password
- **Frontend guards**: `authGuard` (checks `isLoggedIn()`) and `adminGuard` (checks `isLoggedIn() && isAdmin()`) in `frontend/src/main.ts`.
- **Admin panel**: `frontend/src/app/features/admin/pages/admin-panel.component.ts` — User management UI with role toggle, password change, delete confirmation.
- **Dashboard behavior**: "Create Project" form visible only to admins. All users can view projects and create tasks.
- **Security constraints**: Users cannot delete/promote themselves. Password changes are admin-only.
- **Setting admin role**: New users get `role: 'user'` by default. To make a user admin, update the `role` column in the `users` table directly: `UPDATE users SET role = 'admin' WHERE email = '<email>';`
