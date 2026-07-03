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
| `npm run lint` | ESLint — checks both `backend/src/**/*.ts` and `frontend/src/**/*.ts` |
| `npm run format` | Prettier — writes both `backend/src` and `frontend/src` |

No test setup exists (no spec/e2e files found).

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

## Conventions

### File style

- Single quotes, trailing commas (Prettier config).
- Backend: `backend/src/<module>/` (controller, service, module, model, dto).
- Frontend: `frontend/src/main.ts` bootstraps with routing; components in `frontend/src/app/features/<name>/pages/`.

### No `private` keyword — use `#` prefix (and know when NOT to use it)

- Never use TypeScript's `private` keyword. Use the native ECMAScript `#` prefix for truly private fields and methods instead.
- **Rationale**: `#` provides true hard privacy at the JS level, enforced by the runtime. Enforced by ESLint `no-restricted-syntax`.
- **Angular template bindings can't access `#` fields** — anything referenced in the template MUST be public (no `#`). This includes:
  - `input()` / `output()` signals
  - `signal()` used in template bindings (`{{ showPassword() }}`, `(click)="showPassword.set(...)"`)
  - store instances injected and used in template (`readonly store = inject(DashboardStore)` → `store.projects()`)
  - `form: FormGroup` used with `[formGroup]="form"`
- **Default to `#`** for everything else: injected services used only in class logic, `FormBuilder`, utility methods, etc.
- Examples:
  ```ts
  // ✅ public — template needs them
  readonly store = inject(DashboardStore);
  readonly form = createTaskForm(this.#fb);
  readonly projects = input.required<ProjectModel[]>();
  readonly showPassword = signal(false);

  // ✅ # private — class-only logic
  readonly #fb = inject(FormBuilder);
  readonly #languageService = inject(LanguageService);
  readonly #dialog = inject(MatDialog);
  ```
- **Before**: `private readonly foo = inject(Foo);` / `constructor(private readonly svc: Svc) {}`
- **After**: `readonly #foo = inject(Foo);` / `readonly #svc: Svc;\nconstructor(svc: Svc) { this.#svc = svc; }`
- NestJS constructor parameter properties: remove `private`, add a class field with `#`, and assign in the constructor body **after** `super()`.

### Forms conventions

- **Single property form** → use template-driven `ngModel` (`FormsModule`). Example: the project creation form in the dashboard (`[(ngModel)]="store.taskTitle"`).
- **Multiple property form** → use Reactive Forms (`ReactiveFormsModule`, `FormBuilder`, `formControlName`, `FormGroup`). Example: the task form in the dashboard (3 fields: title, projectId, description), Login (2 fields), Register (3 fields).
- **Why**: Reactive Forms scale better for validation, dynamic fields, and complex interactions. Template-driven is fine for trivial single-field forms.
- Not automatically enforced by ESLint — use judgment during code review.

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

## Dark mode conventions

- Tailwind `dark:` classes work globally (generated by Tailwind, not scoped). Use them freely in templates.
- Component-level `styles:` / `styleUrls` are **scoped** by Angular (`ViewEncapsulation.Emulated`). The `.dark` class lives on `<html>`, so `.dark .my-class` inside a component's `styles` block **will not work** — the selector can't reach `<html>` through the encapsulation boundary.
- **Pattern**: Inject `ThemeService`, bind `[class.dark]="theme.isDark()"` on the component's root element (e.g. the `<button>`), then use `.my-class.dark { ... }` in the component's scoped styles. See `theme-toggle.component.ts` and `language-toggle.component.ts` for reference.
- Avoid hardcoded colors in inline `style=""` attributes (e.g. `color: #64748b`). Use Tailwind classes (`text-slate-500 dark:text-slate-400`) instead, which adapt to dark mode automatically.
- `ThemeService` (signal-based) manages `isDark`, adds/removes `.dark` on `<html>`, persists to `localStorage` key `app-theme`.

## i18n (internationalization) conventions

- Supported languages: English (`en`), Persian/Farsi (`fa`, RTL).
- Translation files: `frontend/src/app/i18n/en.json` and `fa.json`. **Single source of truth** — never hardcode translation strings in components.
- `LanguageService` loads translations, exposes `translate(key: string)` method, manages `currentLanguage` signal, sets `dir="rtl"`/`dir="ltr"` on `<html>`, persists to `localStorage` key `app-language`.
- Components use a thin `t(key)` helper that delegates to `languageService.translate(key)`. Template example: `{{ t('logout') }}`, `[placeholder]="t('email')"`.
- `TranslatePipe` exists (`frontend/src/app/shared/pipes/translate.pipe.ts`) for template pipe syntax (`{{ 'key' | translate }}`) but components currently use the `t()` method pattern.
- `tailwindcss-rtl` plugin is installed for RTL utility classes (e.g. `rtl:ms-4`). Use Tailwind RTL utilities instead of manual CSS direction flips.
- To add a new language: create `i18n/<code>.json`, add the language to `LanguageService.languages[]`, and add the `translations` entry in `LanguageService`.

## State management conventions (NgRx + SignalStore)

Packages: `@ngrx/signals@19.2.1`, `@ngrx/store@19.2.1`, `@ngrx/effects@19.2.1`.

### Which tool to use

| Use case | Tool | Scope |
|---|---|---|
| Global state needed by multiple components/services (auth, user session) | `@ngrx/signals` (`signalStore`) | Root-level (`providedIn: 'root'`) |
| Scoped feature state used only by one page/component (dashboard, admin panel) | `@ngrx/signals` (`signalStore`) | Component-level (injected per component) |
| Simple UI state (theme, language) | Angular `signal()` in a service | Root-level with `providedIn: 'root'` |

### Feature directory structure

```
frontend/src/app/
├── features/
│   ├── <feature-name>/
│   │   ├── store/          # NgRx store (actions/reducer/effects/selectors) OR SignalStore file
│   │   ├── pages/          # Page components (routed, lazy-loaded)
│   │   ├── components/     # Sub-components used within the feature
│   │   ├── services/       # Feature-specific services
│   │   ├── models/         # Feature-specific models/interfaces
│   │   ├── forms/          # Form services or reactive form configurations
│   │   ├── const/          # Constants and enums
│   │   └── index.ts        # Barrel export (public API)
├── shared/                  # Shared across features
│   ├── components/          # ThemeToggle, LanguageToggle, ConfirmDialog, ConfirmBottomSheet
│   ├── services/            # ThemeService, LanguageService
│   ├── pipes/               # TranslatePipe
│   ├── models/              # Shared models (or use @shared/* from monorepo root)
│   └── index.ts
├── core/                    # Singleton app-wide concerns
│   ├── services/            # ApiService
│   ├── interceptors/        # Auth interceptor
│   └── guards/              # Auth guard, Admin guard
└── app.component.ts
```

- Only create directories a feature actually needs. If a feature has no sub-components, skip `components/`. If it uses only shared models, skip `models/`.

### NgRx store patterns (root-level)

- Only the `auth` feature uses root-level SignalStore (for shared access by guards/interceptor/components).
- Auth store is provided via `{ providedIn: 'root' }` in the store definition file.
- Auth state shape: `{ token, user, error, loading }`.
- Guards and interceptor inject the store directly.
- Login/Register components call store methods (`auth.login()`, `auth.register()`).

### SignalStore patterns

- All features use `@ngrx/signals` `signalStore()`.
- Auth store uses `{ providedIn: 'root' }`; Dashboard and Admin stores could be component-level.
- Stores define: `withState()`, `withComputed()`, `withMethods()`, `withHooks()`.
- Components inject the store directly: `readonly store = inject(DashboardStore)`.
- Template binds to store signals: `{{ store.projects() }}`, `store.loadProjects()`.
- Initial data loading happens in `withHooks` `onInit` or the component's `ngOnInit`.

### Component file structure

- Each component is a **single `.ts` file** containing both the class and the inline `template:`.
- Never use `templateUrl:` or external `.html` files — everything lives in the `.ts` file.
- Example:
  ```ts
  @Component({
    selector: 'app-example',
    standalone: true,
    imports: [...],
    template: `...`,  // inline, no templateUrl
  })
  export class ExampleComponent { }
  ```

### Forms directory (`forms/`)

- Each feature with reactive forms gets a `forms/` directory containing factory functions that create `FormGroup` instances.
- Naming: `create<Name>Form(fb: FormBuilder): FormGroup`.
- Export default values alongside for reset: `export const <NAME>_FORM_DEFAULTS = { ... }`.
- Components inject `FormBuilder` and call the factory: `readonly #fb = inject(FormBuilder); readonly form = createLoginForm(this.#fb);`.
- Keeps form configuration (fields, validators, defaults) separate from component logic.

### Form services in stores

- **Forms are created and managed in the store, not the component.** Instead of passing form values from component to store via method parameters, inject the form service (or `FormBuilder`) directly into the store and build the form there.
- This eliminates data-passing boilerplate between components and stores — the store owns the form state and can read values directly when needed (e.g., `this.form.value.title`).
- **Pattern**: The store defines a `form` property (via `withState` or `withComputed`), creates it using an injected form factory, and template-bound methods (`saveTask`, `login`, etc.) read values straight from `this.form`.
- **Why**: Form services are `providedIn: 'root'`, so injecting them in the store is just as natural as injecting `HttpClient` or `ApiService`. The store becomes the single source of truth for both domain state and form state, removing the need to shuttle data through component method calls.

### Component decomposition (SOLID/DRY)

- **Page components** (in `pages/`) act as orchestrators — they inject stores, compose layout from sub-components, and wire events.
- **Sub-components** (in `components/`) are presentational/dumb — receive data via `input()`, emit actions via `output()`.
- Use `input()`, `input.required()`, and `output()` from `@angular/core` instead of the `@Input()` / `@Output()` decorator pattern.
  ```ts
  // ✅ new signal-based API
  readonly projects = input.required<ProjectModel[]>();
  readonly editingTask = input<TaskModel | null>(null);
  readonly submitTask = output<{ title: string; description: string; projectId: number }>();
  ```
- React to input changes with `effect()` instead of `ngOnChanges`:
  ```ts
  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) this.form.patchValue({ ... });
      else this.form.reset(TASK_FORM_DEFAULTS);
    });
  }
  ```
- Read input signals with `()` in both class (`this.editingTask()`) and template (`{{ editingTask() }}`).
- A sub-component should have **exactly one responsibility** (e.g., `TaskFormComponent` owns the task form, `TaskListComponent` owns the drag-drop list).
- **No form state in stores** — form state (field values, validation) lives in the component's `FormGroup`, not in the SignalStore. The store holds only application state (entities, loading, errors).
- **DRY**: If the same template appears twice, extract it into a shared sub-component with `input()`/`output()`.
- Sub-components that need i18n inject `LanguageService` and implement their own `t()` helper.
