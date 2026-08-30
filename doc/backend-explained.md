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

### Shared Utilities
| File | Purpose |
|------|---------|
| `src/shared/password-validation.ts` | Password complexity validation (8+ chars, uppercase, lowercase, number, special char) |
| `src/filters/all-exceptions.filter.ts` | Global exception filter — returns generic error messages, logs details server-side |

---

## Database Schema

Tables auto-created in `database.provider.ts`:

```sql
users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
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
- **Payload**: `{ sub, email, firstName, lastName, nationalCode, phone, birthDate, role }` where `role ∈ ('user','admin','superAdmin')`
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
| DELETE | `/admin/users/:id` | Delete user (no self-delete, no superAdmin). Unassigns tasks, removes comments, then deletes in a transaction. |
| PATCH | `/admin/users/:id/role` | Change role (user/admin, no self, no superAdmin) |
| POST | `/admin/users/:id/change-password` | Admin changes user password |

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile/me` | Current user profile |
| PATCH | `/profile/me` | Update profile (email, firstName, lastName, nationalCode, phone, birthDate) |
| PATCH | `/profile/me/password` | Change own password |

---

## Security

### Password Policy
- Minimum 8 characters, maximum 128
- Requires uppercase, lowercase, number, and special character
- Rejects common passwords
- Validation in `shared/password-validation.ts`, used by both AdminService and ProfileService

### Rate Limiting
- Global: 30 requests per 60 seconds per IP
- Auth register: 5 requests per 60 seconds
- Auth login: 10 requests per 60 seconds
- Configured via `@nestjs/throttler` in `AppModule`

### Error Handling
- Global exception filter in `filters/all-exceptions.filter.ts`
- Returns generic error messages without exposing internals
- Logs detailed errors server-side only

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
npm run setup           # First-time: create DB + seed admin user
npm run dev             # Start backend + frontend together
npm run start:dev       # Backend only on :3000
npm run start:frontend  # Frontend only on :4200
npm run db:setup        # Create taskflow database if missing
npm run db:seed         # Seed admin user (admin@taskflow.com / admin123)
npm run build           # Build both
npm run test            # All tests
npm run lint            # ESLint
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

---

## Beginner's Walkthrough (for Frontend Developers)

You know Angular, components, services, HTTP calls, and TypeScript. The backend is just the **other half of the stack** — same patterns, different libraries.

**Big idea**: Your frontend calls APIs to get/send data. The backend calls a **database** to get/send data. Replace `HttpClient` with a database connection and you're 80% there.

### The Dashboard Feature (Projects + Tasks)

The dashboard shows projects (columns) with tasks (cards inside). Two backend modules handle this.

#### `backend/src/project/` — Projects

**`project.controller.ts` — The Router**

Like an Angular component file, but instead of template+logic, it defines **API endpoints** (`@Get`, `@Post`, `@Put`, `@Delete`). Each method maps a URL to a handler.

```typescript
@Controller('projects')    // all routes start with /projects
@UseGuards(JwtAuthGuard)   // must be logged in (like Angular canActivate)
export class ProjectController {

  @Get()                    // GET  /projects        → list all
  @Get(':id')               // GET  /projects/5      → get one
  @Post()                   // POST /projects        → create (admin only)
  @Put(':id')               // PUT  /projects/5      → update (admin only)
  @Delete(':id')            // DELETE /projects/5    → delete (admin only)
}
```

REST = the controller maps **HTTP methods + URLs** to functions. Same REST you use on the frontend, but you're writing the server side.

**`project.service.ts` — The Data Layer**

This is like your Angular service, but instead of `this.http.get<Project[]>('/projects')`, it runs raw SQL:

```typescript
// Your frontend:
this.http.get<ProjectModel[]>('/projects')

// Backend equivalent ('#db' = database connection):
await this.#db.query<ProjectModel>(
  'SELECT id, name, "createdAt", "updatedAt" FROM projects ORDER BY id'
);
```

`#db` is a **PostgreSQL connection pool** — think of it as `HttpClient` but for talking to a database. The SQL query is like the URL + response type combined into one.

**`project.dto.ts` — Type Definitions**

Like your `ProjectModel` interface, but also generates Swagger docs. DTO = Data Transfer Object — it defines what data the API expects/receives.

```typescript
export class CreateProjectDto {
  readonly name: string;  // the only field you send when creating a project
}
```

#### `backend/src/task/` — Tasks

Same pattern: controller defines routes, service runs SQL.

| Endpoint | Method | What it does | Like frontend |
|---|---|---|---|
| `/tasks?projectId=3` | GET | Get tasks filtered by project | `http.get('/tasks', { params: { projectId } })` |
| `/tasks` | POST | Create task | `http.post('/tasks', body)` |
| `/tasks/5` | PUT | Update task | `http.put('/tasks/5', body)` |
| `/tasks/reorder` | PATCH | Reorder tasks after drag-and-drop | `http.patch('/tasks/reorder', body)` |
| `/tasks/5` | DELETE | Delete task | `http.delete('/tasks/5')` |

**`task.controller.ts`**

```typescript
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    // @Query = like query params in Angular (this happens in the URL)
    return this.#taskService.findAll(projectId ? Number(projectId) : undefined);
  }

  @Post()
  create(@Body() body: { title: string; description: string; projectId: number }) {
    // @Body = like the body you send in POST/PUT requests in Angular
    return this.#taskService.create(body.title, body.description, body.projectId);
  }
}
```

`@Query()` and `@Body()` are **decorators that extract data from the HTTP request** — like Angular's `@Input()` but for HTTP. They pull values from the URL query string or the request body.

**`task.service.ts`**

The `reorder` method is worth noting — it uses a **database transaction**:

```typescript
await client.query('BEGIN');     // "start a batch"
for (let i = 0; i < taskIds.length; i++) {
  await client.query(
    'UPDATE tasks SET "position" = $1 WHERE id = $2',
    [i, taskIds[i]]
  );
}
await client.query('COMMIT');    // "all good, save everything"
// if anything fails → 'ROLLBACK'  (undo like a git revert)
```

Like `Promise.all` with a safety net — either ALL updates succeed, or NONE do.

#### `backend/src/shared/database/database.provider.ts` — The Setup

This is like your `environment.ts` + `main.ts` combined. It:

1. Reads **environment variables** (`DATABASE_URL`, `PGHOST`, etc.) — same concept as `environment.ts` but for the server
2. Creates a connection pool to PostgreSQL
3. **Auto-creates tables** on startup if they don't exist
4. Retries 10 times if the database isn't ready yet

The tables it creates:

```
users     → id, email, password, firstName, lastName, nationalCode, phone, birthDate, role
projects  → id, name, createdAt, updatedAt
tasks     → id, title, description, status, projectId, position, createdAt, updatedAt
```

`projectId` on tasks is a **foreign key** — like a TypeScript constraint, but enforced by the database. A task's `projectId` must point to an existing project's `id`.

### The Request Flow (from your frontend)

When your Angular component does:

```typescript
this.http.get<ProjectModel[]>('/projects')
```

Here's exactly what happens:

```
Browser                          Backend (NestJS)              Database
   │                                  │                          │
   │  GET /projects                   │                          │
   │  Authorization: Bearer <token>   │                          │
   │─────────────────────────────────>│                          │
   │                                  │                          │
   │                             Verify token                     │
   │                             (jwt.strategy.ts)                │
   │                                  │                          │
   │                             ProjectController.findAll()      │
   │                                  │                          │
   │                             ProjectService.findAll()         │
   │                                  │                          │
   │                                  │  SELECT ... FROM projects │
   │                                  │──────────────────────────>│
   │                                  │       ┌──────────┐       │
   │                                  │       │  JSON    │       │
   │                                  │       │  data    │       │
   │                                  │<──────│──────────│───────│
   │                                  │                          │
   │         [ { id, name, ... } ]    │                          │
   │<─────────────────────────────────│                          │
   │                                  │                          │
```

That's it. The backend is just a **middleman** between your Angular app and the database.

### `backend/src/profile/` — User Profile

Self-service profile management. Users can view their full profile, update their personal info (firstName, lastName, email, nationalCode, phone, birthDate), and change their own password.

**`profile.controller.ts` — The Router**

```typescript
@Controller('profile')           // all routes start with /profile
@UseGuards(JwtAuthGuard)         // must be logged in
export class ProfileController {

  @Get('me')                     // GET  /profile/me         → get own profile
  @Patch('me')                   // PATCH /profile/me        → update profile fields
  @Patch('me/password')          // PATCH /profile/me/password → change own password
}
```

**`profile.service.ts` — The Logic**

- `getProfile(userId)` — fetches `{ id, email, firstName, lastName, nationalCode, phone, birthDate, role }` from the `users` table
- `updateProfile(userId, fields)` — checks email uniqueness if changing email, updates all provided fields, returns a **new JWT** (because email is embedded in the token)
- `changePassword(userId, currentPassword, newPassword)` — verifies current password, hashes new one, updates the row

**`profile.dto.ts` — Request Validation**

- `UpdateProfileDto` — all fields optional: `email?`, `firstName?`, `lastName?`, `nationalCode?`, `phone?`, `birthDate?`
- `ChangePasswordDto` — `currentPassword`, `newPassword` (min 6 chars)

**Key design decisions**

- **No password required** for profile info changes — users can freely update their name, phone, national code, and birth date
- **Email uniqueness** — if the user changes their email, uniqueness is checked against other users
- **New JWT on profile update** — the JWT contains `{ sub, email, role }`, so changing email invalidates the old token. The backend returns a fresh token and the frontend swaps it seamlessly.
- **No role self-modification** — users cannot change their own role (that's admin-only via `/admin/users/:id/role`)

### Key mental model: Frontend vs Backend

| Concept | Your World (Frontend) | Backend World |
|---|---|---|
| Entry point | `main.ts` (bootstrap Angular) | `main.ts` (create NestJS app, listen on port 3000) |
| Components | `@Component` | `@Controller` |
| Services | `@Injectable` service | `@Injectable` service (same!) |
| DI (Dependency Injection) | `inject(Service)` | `@Inject('DATABASE')` or constructor DI |
| Guards | `canActivate` (route guard) | `@UseGuards(JwtAuthGuard)` (endpoint guard) |
| HTTP calls | `this.http.get()` (to server) | SQL queries (to database) |
| Async handling | `Observable` / `signal()` | `async/await` + `Promise` |
| Config | `environment.ts` | `process.env.*` |
| Module wiring | `imports: [RouterModule.forChild]` | `@Module({ imports, controllers, providers })` |
| State | Signals, NgRx stores | Stateless — each request is fresh |
| Types | `interface` / `type` | Same TypeScript interfaces |

The biggest shift: **On the frontend, you call an API. On the backend, you ARE the API — you write the code that other people's frontends (or your own) call.**
