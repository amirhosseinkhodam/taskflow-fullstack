# TaskFlow Backend — Explained

## Overview

NestJS 11 backend with PostgreSQL (raw `pg` Pool). Entrypoint: `src/main.ts` → `AppModule`.

Auto-creates tables on startup via `database.provider.ts`. No migrations.

---

## Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **AppModule** | `src/app.module.ts` | Root module, imports all feature modules |
| **AuthModule** | `src/auth/auth.module.ts` | JWT auth, login/register, roles guard |
| **TaskModule** | `src/task/task.module.ts` | Task CRUD, reordering, assignment, comments |
| **CommentModule** | `src/comment/comment.module.ts` | Task comments CRUD with RBAC |
| **ProjectModule** | `src/project/project.module.ts` | Project CRUD (admin-only write) |
| **AdminModule** | `src/admin/admin.module.ts` | User management (admin-only) |
| **ProfileModule** | `src/profile/profile.module.ts` | Current user profile |
| **DatabaseModule** | `src/shared/database/database.module.ts` | `pg` Pool provider (`DATABASE` token) |

---

## Database Schema

Tables auto-created in `database.provider.ts`:

```sql
users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  "firstName" TEXT,
  "lastName" TEXT,
  "nationalCode" TEXT,
  phone TEXT,
  "birthDate" TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superAdmin'))
)

projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  "projectId" INTEGER NOT NULL REFERENCES projects(id),
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER REFERENCES users(id),
  "assigneeId" INTEGER REFERENCES users(id)
)

task_comments (
  id SERIAL PRIMARY KEY,
  "taskId" INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## Auth & RBAC

- **JWT** via `@nestjs/jwt` + `passport-jwt`
- **Payload**: `{ sub, email, role }` where `role ∈ ('user','admin','superAdmin')`
- **Guards**: `JwtAuthGuard` (authenticates), `RolesGuard` (authorizes via `@Roles()` decorator)
- **Roles**: `user` (default), `admin`, `superAdmin`
- **Admin-only endpoints**: Project create/update/delete, Admin user management
- **Task permissions**:
  - Create: any authenticated user
  - Read: any authenticated user (filtered by project)
  - Update/Delete/Reorder: task creator **OR** task assignee **OR** admin
  - Comment: any authenticated user
  - Edit/Delete comment: comment author **OR** task assignee **OR** admin
  - Assign task (assigneeEmail): admin only

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |

### Projects
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/projects` | user+ | List all projects |
| POST | `/projects` | admin | Create project |
| PUT | `/projects/:id` | admin | Update project |
| DELETE | `/projects/:id` | admin | Delete project (cascades tasks) |

### Tasks
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/tasks` | user+ | List tasks (query: projectId, status, search, page, limit) |
| GET | `/tasks/:id` | user+ | Get single task with creator/assignee names |
| POST | `/tasks` | user+ | Create task (body: title, description, projectId, **assigneeEmail?**) |
| PUT | `/tasks/:id` | user+* | Update task (body: title?, description?, status?, projectId?, **assigneeEmail?**) |
| PATCH | `/tasks/reorder` | user+* | Reorder tasks (body: taskIds[]) |
| DELETE | `/tasks/:id` | user+* | Delete task |

*Update/Delete/Reorder allowed for: task creator, task assignee, or admin.

### Comments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks/:taskId/comments` | List comments for task |
| POST | `/tasks/:taskId/comments` | Add comment (body: content) |
| PUT | `/tasks/comments/:id` | Update comment (body: content) |
| DELETE | `/tasks/comments/:id` | Delete comment |

Comment edit/delete allowed for: comment author, task assignee, or admin.

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List all users |
| DELETE | `/admin/users/:id` | Delete user (no self-delete, no superAdmin) |
| PATCH | `/admin/users/:id/role` | Change role (user/admin, no self, no superAdmin) |
| POST | `/admin/users/:id/change-password` | Admin changes user password |

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Current user profile |
| PUT | `/profile` | Update profile |
| POST | `/profile/change-password` | Change own password |

---

## Key Implementation Details

### Task Assignment
- `assigneeEmail` on create/update (admin only)
- Backend resolves email → `userId` → stores in `tasks.assigneeId`
- Returns `assigneeName` via JOIN in queries

### Comments
- Separate `task_comments` table with CASCADE DELETE on task
- JOIN to `users` for `userName` in responses
- RBAC enforced in `CommentService`

### Database Conventions
- All camelCase columns quoted: `"projectId"`, `"createdAt"`, `"assigneeId"`
- Timestamps auto-managed via `CURRENT_TIMESTAMP`
- `updatedAt` refreshed on every UPDATE

### Frontend Contract
Shared types in `shared/types/`:
- `TaskModel` includes `assigneeId`, `assigneeName`, `creatorName`
- `CommentModel` includes `userName`
- Request DTOs include optional `assigneeEmail`

### Swagger
Available at `http://localhost:3000/api`

---

## Running

```bash
npm run start:dev      # Backend on :3000
npm run start:frontend # Frontend on :4200
npm run build          # Build both
npm run test           # All tests
npm run lint           # ESLint
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | Full PG connection string |
| `PGHOST` | `localhost` | PG host |
| `PGPORT` | `5432` | PG port |
| `PGUSER` | `postgres` | PG user |
| `PGPASSWORD` | `postgres` | PG password |
| `PGDATABASE` | `taskflow` | PG database |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing secret |
