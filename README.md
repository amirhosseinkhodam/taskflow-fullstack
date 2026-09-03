# TaskFlow

A full-stack task management application with role-based access control and bilingual support (English/Persian).

## Features

- **Authentication** — JWT-based registration and login (7-day token expiration)
- **Role-Based Access Control** — Three roles: `user`, `admin`, `superAdmin` with granular permissions
- **Projects** — Create, edit, delete projects (admin-only); all users can view and filter
- **Tasks** — Full CRUD with status management (`pending`, `in-progress`, `done`), assignment, and ownership checks
- **Drag & Drop Ordering** — Reorder tasks within a project via drag and drop
- **Comments** — Add, edit, delete comments on tasks with ownership-based authorization
- **Admin Panel** — User management: list users, toggle roles, force password changes, delete users
- **Profile Management** — Edit personal info (name, email, phone, national code, birth date) and change password
- **Search & Filtering** — Filter tasks by project, status, and text search with pagination
- **Dark Mode** — Class-based theme toggle, persisted to localStorage
- **English/Persian i18n** — Language toggle persisted to localStorage
- **RTL Support** — Full right-to-left layout for Persian via `tailwindcss-rtl`
- **Jalali Calendar** — Persian date formatting via `date-fns-jalali`
- **Responsive UI** — Mobile-first design with adaptive layouts and responsive dialogs/bottom sheets

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Angular 19 (standalone), TypeScript 5.8, @ngrx/signals (SignalStore), Tailwind CSS 3.4, Angular Material/CDK, @ng-select/ng-select, date-fns + date-fns-jalali, RxJS |
| **Backend** | NestJS 11, Passport.js + JWT, pg (raw SQL), class-validator/class-transformer, Helmet, @nestjs/throttler, @nestjs/swagger |
| **Database** | PostgreSQL 16 — raw `pg` Pool, no ORM |
| **Testing** | Jest 29, ts-jest, jest-preset-angular, @nestjs/testing |
| **DevTools** | ESLint 9 (flat config), Prettier, concurrently |

## Architecture

### Monorepo Layout

Single `package.json` at the root with all dependencies for both halves. No npm workspaces.

```
taskflow-fullstack/
├── backend/          NestJS application (src/ + tests/)
├── frontend/         Angular application (src/ + tests/)
├── shared/           Cross-half shared TypeScript interfaces
├── scripts/          Database setup and seed scripts
└── package.json      Single manifest for all dependencies
```

### Backend

- **Modules**: Auth, Task, Project, Comment, Admin, Profile
- **Raw SQL**: No ORM. All queries use `pg` Pool with parameterized statements
- **JWT Authentication**: Passport strategy extracts user from token, guards protect routes
- **RBAC**: `@Roles()` decorator + `RolesGuard` for admin-only endpoints. SuperAdmin bypasses all role checks
- **Rate Limiting**: Global 30 req/60s, with stricter limits on auth endpoints (5 register, 10 login)
- **Validation**: Global `ValidationPipe` with whitelist, forbidNonWhitelisted, and transform

### Frontend

- **Standalone Components**: No NgModules. All components use `standalone: true`
- **SignalStore**: Feature-scoped state management with `@ngrx/signals`
- **Custom Element Library**: 16 reusable UI primitives (`app-button`, `app-input`, `app-select`, `app-card`, etc.)
- **Lazy Loading**: All route components are lazy-loaded via `loadComponent`
- **Interceptor**: JWT token automatically attached to all HTTP requests
- **Guards**: `authGuard` for protected routes, `adminGuard` for admin-only routes

### Shared Types

TypeScript interfaces in `shared/types/` are imported by both halves via the `@shared/*` path alias.

## Security

- **JWT**: 7-day expiration, `{ sub, email, role }` payload, validated via Passport strategy
- **Passwords**: bcrypt hashing (10 rounds), complexity validation (min 8 chars, uppercase, lowercase, digit, special character)
- **Helmet**: Security HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Rate Limiting**: Global throttle (30 req/60s) + stricter per-route limits on auth endpoints
- **Input Validation**: Global `ValidationPipe` strips unknown properties and rejects non-whitelisted fields
- **CORS**: Configurable via `CORS_ORIGIN` env var (defaults to `http://localhost:4200`)
- **Admin Safeguards**: Admins cannot delete/modify themselves or superAdmins

### Authorization

| Role | Permissions |
|---|---|
| `user` | View projects, create/edit own tasks, comment on tasks, edit own profile |
| `admin` | All user permissions + create/edit/delete projects, manage users via admin panel |
| `superAdmin` | All admin permissions + cannot be modified or deleted by admins |

### Database

| Table | Purpose |
|---|---|
| `users` | User accounts with email, hashed password, profile fields, role |
| `projects` | Project containers for tasks |
| `tasks` | Tasks with title, description, status, position, project and user references |
| `task_comments` | Comments on tasks with user reference |

Tables are auto-created on application startup. No migration tool is used.

## Testing

**290 tests** — 84 backend + 206 frontend — all passing.

```bash
npm run test              # Run all tests
npm run test:backend      # Backend only (12 suites, 84 tests)
npm run test:frontend     # Frontend only (39 suites, 206 tests)
npm run test:backend:cov  # Backend with coverage
npm run test:frontend:cov # Frontend with coverage
```

Backend tests cover services, controllers, guards, and strategies using `@nestjs/testing` and mocked `pg` Pool. Frontend tests use Angular TestBed with HttpTestingController.

## Docker

Docker Compose runs all three services:

```bash
docker compose up --build
```

| Service | Internal Port | External Port | Notes |
|---|---|---|---|
| **frontend** | 80 | `8080` | nginx serving Angular build |
| **backend** | 3000 | `3001` | NestJS in production mode |
| **postgres** | 5432 | `5433` | PostgreSQL 16 Alpine |

Override external ports via env vars: `DOCKER_FRONTEND_PORT`, `DOCKER_BACKEND_PORT`, `DOCKER_PGPORT`.

### How It Works

- **frontend** — Multi-stage build: Angular production build served by nginx. nginx proxies API requests (`/auth`, `/projects`, `/tasks`, `/api`, `/admin/*`, `/profile/*`) to the backend.
- **backend** — Multi-stage build: NestJS compiled then run with `tini` as init. Connects to the `postgres` service via Docker network.
- **postgres** — PostgreSQL 16 Alpine with health check. Data persisted in a named volume (`taskflow_db`).

## Local Development

### Prerequisites

- **Node.js** >= 22
- **PostgreSQL** >= 16
- **npm** >= 9

### Installation

```bash
git clone <repository-url>
cd taskflow-fullstack
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

**Required:**

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWT tokens. **The app will not start without it.** |

**Database** (defaults for local PostgreSQL):

| Variable | Default | Description |
|---|---|---|
| `PGHOST` | `localhost` | PostgreSQL host |
| `PGPORT` | `5432` | PostgreSQL port |
| `PGUSER` | `postgres` | PostgreSQL user |
| `PGPASSWORD` | `postgres` | PostgreSQL password |
| `PGDATABASE` | `taskflow` | Database name |

**Optional:**

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:4200` | Comma-separated allowed origins |
| `SUPER_ADMIN_EMAIL` | — | Email for auto-seeded super admin user |
| `SUPER_ADMIN_PASSWORD` | — | Password for auto-seeded super admin user |
| `ADMIN_EMAIL` | — | Email for regular admin seed |
| `ADMIN_PASSWORD` | — | Password for regular admin seed |
| `PORT` | `3000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |

### Setup and Run

```bash
npm run setup    # Create database + seed admin user (first time only)
npm run dev      # Start backend + frontend concurrently
```

- **Backend**: `http://localhost:3000` (NestJS with hot-reload)
- **Frontend**: `http://localhost:4200` (Angular dev server)

Or run them separately:

```bash
npm run start:dev       # Backend only (watch mode)
npm run start:frontend  # Frontend only (Angular dev server)
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both backend + frontend in dev mode |
| `npm run start:dev` | Backend dev server (watch mode) |
| `npm run start:frontend` | Angular dev server |
| `npm run build` | Build both backend and frontend |
| `npm run build:backend` | Build backend only |
| `npm run build:frontend` | Build frontend only |
| `npm run test` | Run all tests |
| `npm run test:backend` | Run backend tests |
| `npm run test:frontend` | Run frontend tests |
| `npm run lint` | ESLint (source + test files) |
| `npm run format` | Prettier (source + test files) |
| `npm run setup` | Create database + seed admin user |
| `npm run db:setup` | Create database (tables auto-created on startup) |
| `npm run db:seed` | Seed admin user only |

## API

Swagger UI is available in non-production mode at `http://localhost:3000/api`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `GET` | `/projects` | JWT | List all projects |
| `GET` | `/projects/:id` | JWT | Get a single project |
| `POST` | `/projects` | JWT (admin) | Create a project |
| `PUT` | `/projects/:id` | JWT (admin) | Update a project |
| `DELETE` | `/projects/:id` | JWT (admin) | Delete a project |
| `GET` | `/tasks` | JWT | List tasks (with filters and pagination) |
| `GET` | `/tasks/:id` | JWT | Get a single task |
| `POST` | `/tasks` | JWT | Create a task |
| `PUT` | `/tasks/:id` | JWT | Update a task |
| `PATCH` | `/tasks/reorder` | JWT | Reorder tasks |
| `DELETE` | `/tasks/:id` | JWT | Delete a task |
| `GET` | `/tasks/:taskId/comments` | JWT | List comments for a task |
| `POST` | `/tasks/:taskId/comments` | JWT | Add a comment |
| `PUT` | `/tasks/comments/:id` | JWT | Edit a comment |
| `DELETE` | `/tasks/comments/:id` | JWT | Delete a comment |
| `GET` | `/admin/users` | JWT (admin) | List all users |
| `DELETE` | `/admin/users/:id` | JWT (admin) | Delete a user |
| `PATCH` | `/admin/users/:id/role` | JWT (admin) | Change user role |
| `POST` | `/admin/users/:id/change-password` | JWT (admin) | Admin change user password |
| `GET` | `/profile/me` | JWT | Get current user profile |
| `PATCH` | `/profile/me` | JWT | Update profile |
| `PATCH` | `/profile/me/password` | JWT | Change own password |

## Project Structure

```
taskflow-fullstack/
├── backend/
│   ├── src/
│   │   ├── admin/              Admin module (user management)
│   │   ├── auth/               Auth module (JWT, login, register)
│   │   ├── comment/            Comment module (task comments)
│   │   ├── filters/            Global exception filter
│   │   ├── profile/            Profile module (user profile)
│   │   ├── project/            Project module (CRUD)
│   │   ├── shared/
│   │   │   ├── database/       PostgreSQL provider and schema
│   │   │   └── password-validation.ts
│   │   ├── task/               Task module (CRUD, reorder)
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── tests/                  Backend test files (mirrors src/)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           Guards, interceptors, services
│   │   │   ├── features/
│   │   │   │   ├── admin/      Admin panel feature
│   │   │   │   ├── auth/       Login, register feature
│   │   │   │   ├── comments/   Comment feature
│   │   │   │   ├── dashboard/  Dashboard feature
│   │   │   │   ├── profile/    Profile feature
│   │   │   │   └── task-details/ Task detail page feature
│   │   │   ├── i18n/           Translation files (en.json, fa.json)
│   │   │   └── shared/         Components, services, pipes, forms, models
│   │   └── main.ts             Bootstrap
│   └── tests/                  Frontend test files (mirrors src/)
├── shared/
│   └── types/                  Shared TypeScript interfaces
├── scripts/                    Database setup and seed scripts
├── docker-compose.yml
├── .env.example
├── eslint.config.mjs
├── tsconfig.json
├── angular.json
├── nest-cli.json
└── package.json
```

## CI

GitHub Actions workflow runs on push/PR to `master`:

1. Install dependencies (`npm ci`)
2. Lint (`eslint`)
3. Backend tests (`jest --config backend/jest.config.ts`)
4. Frontend tests (`jest --config frontend/jest.config.ts`)
5. Build backend (`nest build`)
6. Build frontend (`ng build`)

## Future Improvements

- E2E tests (Playwright or Cypress)
- Production deployment configuration
- Task file attachments
- Email notifications

## License

No license specified. All rights reserved by default.
