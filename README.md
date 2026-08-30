# TaskFlow

A full-stack task management application with real-time collaboration features, role-based access control, and bilingual support (English/Persian).

## Features

- **Authentication** — JWT-based registration and login with 7-day token expiration
- **Role-Based Access Control** — Three roles: `user`, `admin`, `superAdmin` with granular permissions
- **Projects** — Create, edit, delete projects (admin-only); all users can view and filter
- **Tasks** — Full CRUD with status management (`pending`, `in-progress`, `done`), assignment, and ownership checks
- **Drag & Drop Ordering** — Reorder tasks within a project via drag and drop
- **Comments** — Add, edit, delete comments on tasks with ownership-based authorization
- **Admin Panel** — User management: list users, toggle roles, force password changes, delete users
- **Profile Management** — Edit personal info (name, email, phone, national code, birth date) and change password
- **Search & Filtering** — Filter tasks by project, status, and text search with pagination
- **Dark Mode** — Class-based theme toggle, persisted to localStorage
- **English/Persian i18n** — 154 translation keys, language toggle persisted to localStorage
- **RTL Support** — Full right-to-left layout for Persian via `tailwindcss-rtl`
- **Jalali Calendar** — Persian date formatting via `date-fns-jalali`
- **Responsive UI** — Mobile-first design with adaptive layouts and responsive dialogs/bottom sheets

## Screenshots

> Screenshots will be added here once captured.

<!-- 
  Suggested screenshots:
  - Dashboard (desktop, light mode)
  - Dashboard (desktop, dark mode)
  - Dashboard (mobile)
  - Task details with comments
  - Admin panel
  - Profile page
  - Login / Register
-->

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Angular 19 | Standalone component architecture, signals, modern control flow |
| @ngrx/signals | SignalStore for feature state management |
| Tailwind CSS | Utility-first styling with custom design tokens |
| Angular Material CDK | Drag & drop, breakpoint observer, dialogs, bottom sheets |
| @ng-select/ng-select | Enhanced select dropdowns |
| date-fns / date-fns-jalali | Date formatting (Gregorian and Jalali) |
| tailwindcss-rtl | RTL utility classes for Persian layout |
| RxJS | Async stream management |
| TypeScript 5.8 | Type safety with strict mode |

### Backend

| Technology | Purpose |
|---|---|
| NestJS 11 | Modular backend framework with dependency injection |
| Passport.js + JWT | Authentication strategy and guards |
| pg (node-postgres) | Raw SQL queries via connection pool |
| class-validator / class-transformer | DTO validation and transformation |
| Helmet | Security HTTP headers |
| @nestjs/throttler | Rate limiting (global + per-route) |
| @nestjs/swagger | Auto-generated API documentation |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Primary database with 4 tables |

### Testing

| Technology | Purpose |
|---|---|
| Jest | Test runner for both frontend and backend |
| ts-jest | TypeScript compilation for backend tests |
| jest-preset-angular | Angular testing utilities for frontend tests |
| @nestjs/testing | NestJS testing utilities (TestBed equivalent) |

### Developer Tools

| Technology | Purpose |
|---|---|
| ESLint 9 | Linting with flat config |
| Prettier | Code formatting |
| concurrently | Run backend and frontend dev servers simultaneously |

## Architecture

### Monorepo Layout

Single `package.json` at the root with all dependencies for both halves. No npm workspaces.

```
taskflow-fullstack/
├── backend/          NestJS application (src/ + tests/)
├── frontend/         Angular application (src/ + tests/)
├── shared/           Cross-half shared types and constants
├── scripts/          Database setup and seed scripts
├── docs/             ADRs and feature documentation
└── package.json      Single manifest for all dependencies
```

### Backend Architecture

- **Module-based**: Auth, Task, Project, Comment, Admin, Profile modules
- **Raw SQL**: No ORM. All queries use `pg` Pool directly with parameterized statements
- **JWT Authentication**: Passport strategy extracts user from token, guards protect routes
- **RBAC**: `@Roles()` decorator + `RolesGuard` for admin-only endpoints. SuperAdmin bypasses all role checks
- **Rate Limiting**: Global 30 req/60s, with stricter limits on auth endpoints (5 register, 10 login)
- **Validation**: Global `ValidationPipe` with whitelist, forbidNonWhitelisted, and transform

### Frontend Architecture

- **Standalone Components**: No NgModules. All components use `standalone: true`
- **SignalStore**: Feature-scoped state management with `@ngrx/signals`
- **Custom Element Library**: 16 reusable UI components (`app-button`, `app-input`, `app-select`, `app-card`, etc.)
- **Lazy Loading**: All route components are lazy-loaded via `loadComponent`
- **Interceptor**: JWT token automatically attached to all HTTP requests
- **Guards**: `authGuard` for protected routes, `adminGuard` for admin-only routes

### Shared Types

TypeScript interfaces in `shared/types/` are imported by both halves via the `@shared/*` path alias.

## Authentication & Security

### Authentication Flow

1. User registers with email + password (hashed with bcrypt, 10 rounds)
2. Backend returns a JWT (7-day expiration) containing `{ sub, email, role }`
3. Frontend stores token in `localStorage`
4. HTTP interceptor attaches `Authorization: Bearer <token>` to all requests
5. Passport JWT strategy validates token and attaches user to request

### Authorization

| Role | Permissions |
|---|---|
| `user` | View projects, create/edit own tasks, comment on tasks, edit own profile |
| `admin` | All user permissions + create/edit/delete projects, manage users via admin panel |
| `superAdmin` | All admin permissions + cannot be modified or deleted by admins |

### Security Measures

- **Helmet**: Sets security HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Rate Limiting**: Global throttle (30 req/60s) + stricter per-route limits on auth endpoints
- **Input Validation**: Global `ValidationPipe` strips unknown properties and rejects non-whitelisted fields
- **CORS**: Restricted to `http://localhost:4200` (Angular dev server)
- **Password Validation**: Min 8 chars, uppercase, lowercase, digit, special character, not in common passwords list
- **Admin Safeguards**: Admins cannot delete/modify themselves or superAdmins

### Database Tables

| Table | Purpose |
|---|---|
| `users` | User accounts with email, hashed password, profile fields, role |
| `projects` | Project containers for tasks |
| `tasks` | Tasks with title, description, status, position, project and user references |
| `task_comments` | Comments on tasks with user reference |

Tables are auto-created on application startup. No migration tool is used.

## Testing

### Backend Tests

```bash
npm run test:backend
```

- **84 tests** across **12 test suites** — all passing
- Covers: services, controllers, guards, strategies
- Uses `@nestjs/testing` for dependency injection and `pg` Pool mocking

### Frontend Tests

```bash
npm run test:frontend
```

> **Note**: Frontend tests have a pre-existing configuration issue (`jest.config.ts` references `tsconfig.frontend.spec.json` from the wrong directory). The test infrastructure is in place but tests currently fail to run due to this path resolution issue.

### Running All Tests

```bash
npm run test           # backend + frontend
npm run test:backend:cov   # backend with coverage
npm run test:frontend:cov  # frontend with coverage
```

## Internationalization

- **Languages**: English (`en.json`) and Persian/Farsi (`fa.json`)
- **Translation Keys**: 154 keys covering all UI text, validation messages, and labels
- **RTL Support**: `dir="rtl"` attribute set on `<html>` when Persian is active; `tailwindcss-rtl` plugin provides RTL utility classes
- **Jalali Calendar**: `LocalizedDatePipe` automatically switches between `date-fns` (Gregorian) and `date-fns-jalali` (Persian) based on the active language
- **Persistence**: Selected language is saved to `localStorage` and restored on reload

## Project Structure

```
taskflow-fullstack/
├── backend/
│   ├── src/
│   │   ├── admin/              # Admin module (user management)
│   │   ├── auth/               # Auth module (JWT, login, register)
│   │   ├── comment/            # Comment module (task comments)
│   │   ├── filters/            # Global exception filter
│   │   ├── profile/            # Profile module (user profile)
│   │   ├── project/            # Project module (CRUD)
│   │   ├── shared/
│   │   │   ├── database/       # PostgreSQL provider and schema
│   │   │   ├── password-validation.ts
│   │   │   └── types/          # Shared TypeScript interfaces
│   │   ├── task/               # Task module (CRUD, reorder)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── tests/                  # Backend test files (mirrors src/)
│   ├── jest.config.ts
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Interceptors, guards
│   │   │   ├── features/
│   │   │   │   ├── admin/      # Admin panel feature
│   │   │   │   ├── auth/       # Login, register feature
│   │   │   │   ├── comments/   # Comment feature
│   │   │   │   ├── dashboard/  # Dashboard feature
│   │   │   │   ├── profile/    # Profile feature
│   │   │   │   └── task-details/ # Task detail page feature
│   │   │   ├── i18n/           # Translation files (en.json, fa.json)
│   │   │   └── shared/         # Shared components, services, pipes, forms
│   │   ├── environments/       # Environment configs (dev/prod)
│   │   └── main.ts             # Bootstrap
│   ├── tests/                  # Frontend test files (mirrors src/)
│   ├── jest.config.ts
│   └── tailwind.config.js
├── shared/
│   ├── const/                  # Shared constants
│   └── types/                  # Shared TypeScript interfaces
├── scripts/                    # Database setup and seed scripts
├── docs/                       # ADRs and feature documentation
├── .env.example                # Environment variable template
├── eslint.config.mjs           # ESLint flat config
├── tsconfig.json               # Root TypeScript config
├── angular.json                # Angular build config
├── nest-cli.json               # NestJS CLI config
└── package.json                # Single dependency manifest
```

## Local Development

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### Installation

```bash
git clone <repository-url>
cd taskflow-fullstack
npm install
```

### Environment Variables

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

Required:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWT tokens. **Required — the app will not start without it.** |

Database (defaults provided for local PostgreSQL):

| Variable | Default | Description |
|---|---|---|
| `PGHOST` | `localhost` | PostgreSQL host |
| `PGPORT` | `5432` | PostgreSQL port |
| `PGUSER` | `postgres` | PostgreSQL user |
| `PGPASSWORD` | `postgres` | PostgreSQL password |
| `PGDATABASE` | `taskflow` | Database name |

Optional:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |

### Database Setup

```bash
npm run setup
```

This creates the `taskflow` database (if it doesn't exist), creates all tables, and seeds an admin user:

- **Email**: `admin@taskflow.com`
- **Password**: `admin123`

Tables are also auto-created on application startup, so you can skip `db:setup` if you prefer.

### Development Servers

```bash
npm run dev
```

Runs both backend and frontend concurrently:

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
| `npm run lint` | Lint all source and test files |
| `npm run format` | Format all source and test files with Prettier |
| `npm run setup` | Create database + seed admin user |
| `npm run db:setup` | Create database tables |
| `npm run db:seed` | Seed admin user only |

## API Documentation

Swagger UI is available in development mode at:

```
http://localhost:3000/api
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `GET` | `/projects` | JWT | List all projects |
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

## Health Check

```
GET http://localhost:3000/api/health
```

Response:

```json
{ "status": "ok" }
```

## Architecture Decisions

Two Architecture Decision Records (ADRs) are documented in `docs/adr/`:

| ADR | Decision |
|---|---|
| [ADR-0001](docs/adr/0001-use-raw-pg-over-prisma.md) | Use raw `pg` Pool instead of Prisma ORM |
| [ADR-0002](docs/adr/0002-use-signalstore-for-state.md) | Use NgRx SignalStore for frontend state management |

## Future Improvements

- [ ] Docker and docker-compose for containerized development and deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Frontend test suite fixes (resolve `tsconfig.frontend.spec.json` path issue)
- [ ] E2E tests (Playwright or Cypress)
- [ ] Production deployment configuration
- [ ] Real-time updates via WebSockets
- [ ] Task file attachments
- [ ] Email notifications

## License

No license is currently specified. All rights reserved by default.
