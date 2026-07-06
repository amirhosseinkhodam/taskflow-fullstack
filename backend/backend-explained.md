# TaskFlow Backend — Explained for Frontend Developers

You know Angular, components, services, HTTP calls, and TypeScript. The backend is just the **other half of the stack** — same patterns, different libraries.

**Big idea**: Your frontend calls APIs to get/send data. The backend calls a **database** to get/send data. Replace `HttpClient` with a database connection and you're 80% there.

---

## The Dashboard Feature (Projects + Tasks)

The dashboard shows projects (columns) with tasks (cards inside). Two backend modules handle this.

---

### `backend/src/project/` — Projects

#### `project.controller.ts` — The Router

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

#### `project.service.ts` — The Data Layer

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

#### `project.dto.ts` — Type Definitions

Like your `ProjectModel` interface, but also generates Swagger docs. DTO = Data Transfer Object — it defines what data the API expects/receives.

```typescript
export class CreateProjectDto {
  readonly name: string;  // the only field you send when creating a project
}
```

---

### `backend/src/task/` — Tasks

Same pattern: controller defines routes, service runs SQL.

| Endpoint | Method | What it does | Like frontend |
|---|---|---|---|
| `/tasks?projectId=3` | GET | Get tasks filtered by project | `http.get('/tasks', { params: { projectId } })` |
| `/tasks` | POST | Create task | `http.post('/tasks', body)` |
| `/tasks/5` | PUT | Update task | `http.put('/tasks/5', body)` |
| `/tasks/reorder` | PATCH | Reorder tasks after drag-and-drop | `http.patch('/tasks/reorder', body)` |
| `/tasks/5` | DELETE | Delete task | `http.delete('/tasks/5')` |

#### `task.controller.ts`

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

#### `task.service.ts`

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

---

### `backend/src/shared/database/database.provider.ts` — The Setup

This is like your `environment.ts` + `main.ts` combined. It:

1. Reads **environment variables** (`DATABASE_URL`, `PGHOST`, etc.) — same concept as `environment.ts` but for the server
2. Creates a connection pool to PostgreSQL
3. **Auto-creates tables** on startup if they don't exist
4. Retries 10 times if the database isn't ready yet

The tables it creates:

```
users     → id, email, password, name, role
projects  → id, name, createdAt, updatedAt
tasks     → id, title, description, status, projectId, position, createdAt, updatedAt
```

`projectId` on tasks is a **foreign key** — like a TypeScript constraint, but enforced by the database. A task's `projectId` must point to an existing project's `id`.

---

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

---

## Key mental model: Frontend vs Backend

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

---

## Questions?

Pick a feature and I'll explain it the same way:

| Feature | What it covers |
|---|---|
| **Authentication** | Register, login, JWT tokens, bcrypt password hashing |
| **Admin Panel** | User management, role changes, password resets |
| **Guards & Decorators** | How `@Roles('admin')` and guards protect routes |
| **Main entry** | `main.ts`, `app.module.ts`, CORS, Swagger docs |
