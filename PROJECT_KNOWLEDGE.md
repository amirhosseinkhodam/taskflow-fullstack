# TaskFlow — Project Knowledge & Learning Guide

> Living document. Updated after every architecturally relevant change.

## Overview

TaskFlow is a full-stack task management application with a **NestJS 11 backend** and an **Angular 19 standalone frontend**. Single-package monorepo layout.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 19 (standalone), NgRx SignalStore, Tailwind CSS 3.4 |
| Backend | NestJS 11, raw `pg` Pool (PostgreSQL 16) |
| Auth | JWT (passport-jwt), bcryptjs |
| State | `@ngrx/signals` (SignalStore) |
| Styling | Tailwind utility classes, SCSS (global only) |
| i18n | Custom `LanguageService` + `TranslatePipe`, JSON translation files |
| Testing | Jest 30, jest-preset-angular |

## Architecture

```
<project-root>/
├── package.json          # Single root package.json
├── frontend/             # Angular 19 app
├── backend/              # NestJS 11 app
└── shared/               # Cross-half shared types
```

### Backend (`backend/`)

- **Modules**: Auth, Admin, Project, Task, Comment, Profile, Database (shared)
- **Database**: PostgreSQL via raw `pg` Pool. Tables auto-created on startup.
- **Auth**: JWT-based. Payload: `{ sub, email, role }`.
- **RBAC**: Two roles: `user` (default) and `admin`. Admin-only: project CRUD, user management.
- **API**: Swagger at `/api` in non-production.
- **CORS**: `http://localhost:4200` only.

### Frontend (`frontend/`)

- **Bootstrap**: `bootstrapApplication` with `provideHttpClient()`, `provideRouter()`.
- **Routes**: `/login`, `/register`, `/` (dashboard), `/admin`, `/profile`, `/task/:id`.
- **Guards**: `authGuard`, `adminGuard` in `main.ts`.
- **Interceptor**: `authInterceptor` attaches JWT from `localStorage`.
- **State**: SignalStore per feature (dashboard, admin, auth).
- **Components**: Standalone, inline templates, signal-based I/O.

### Shared (`shared/`)

- `shared/types/auth.ts` — `UserRole`, `AuthUserModel`, `AuthResponseModel`
- `shared/types/project.ts` — `ProjectModel`
- `shared/types/task.ts` — `TaskModel`, `CommentModel`, `TaskFilterModel`

## Key Decisions

### Raw `pg` over Prisma

- **Decision**: Use raw `pg` Pool instead of Prisma ORM.
- **Reason**: Simpler setup, no schema migration overhead for a small app.
- **Trade-off**: Manual SQL queries, no type-safe query builder.
- **Note**: `@prisma/client` is installed but unused. Can be removed.

### SignalStore over NgRx Store

- **Decision**: Use `@ngrx/signals` `signalStore()` for feature state.
- **Reason**: Simpler API, signal-based reactivity, less boilerplate.
- **Pattern**: `withState()`, `withComputed()`, `withMethods()`, `withHooks()`.

### Custom Element Pattern

- **Decision**: All shared UI primitives use `<app-button>`, `<app-input>`, etc.
- **Reason**: Consistency, reusability, enforce styling conventions.
- **Rule**: Never use native HTML elements in feature components.

### Inline Templates Only

- **Decision**: All components use `template:` (no `templateUrl`).
- **Reason**: Single-file components, easier to maintain.

## Data Flow

1. **Login**: `LoginFormService` → `AuthStore.login()` → `AuthService.login()` → `POST /auth/login` → JWT stored in `localStorage`.
2. **Dashboard Load**: `DashboardStore` → `DashboardService.getProjects()` + `getTasks()` → `GET /projects`, `GET /tasks`.
3. **Task Create**: `TaskFormComponent` output → `DashboardStore.saveTask()` → `DashboardService.createTask()` → `POST /tasks`.
4. **Task Toggle**: `TaskItemComponent` → `DashboardStore.toggleTask()` → `PATCH /tasks/:id/status`.

## Anti-Patterns to Avoid

- Using native `<button>`, `<input>`, `<textarea>` in feature components.
- Using `private` keyword (use `#` prefix instead).
- Using TypeScript `enum` (use `as const` objects).
- Using `templateUrl` (use inline `template:`).
- Importing from barrel files (`index.ts`).
- Hardcoding translation strings in components.

## Must Not Change

- Single `package.json` at root (no npm workspaces).
- Raw `pg` Pool (no ORM migration without team consensus).
- Standalone components only (no `NgModule`).
- Inline templates only (no `templateUrl`).
