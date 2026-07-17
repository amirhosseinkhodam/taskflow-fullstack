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

## Conventions

### File style

- Single quotes, trailing commas (Prettier config).
- Backend: `backend/src/<module>/` (controller, service, module, model, dto).
- Frontend: `frontend/src/main.ts` bootstraps with routing; components in `frontend/src/app/features/<name>/pages/`.
- Tests: `backend/tests/<module>/` and `frontend/tests/app/`, mirroring the `src/` directory structure.
- Documentation: All `.md` files go in `doc/` — use `doc/general/` for reusable guidelines, `doc/project-specific/` for TaskFlow-only docs. Never create `.md` files at the repo root (except `AGENTS.md` which opencode reads directly).

### Naming conventions

- **String literals / enum values**: Use camelCase — e.g. `'superAdmin'`, `'taskCreated'`, `'couldNotLoadTasks'`.
- **Interfaces / types**: Always append `Model` suffix — e.g. `AuthPayloadModel`, `TaskModel`, `UserModel`, `HealthResponseModel`, `CreateTaskRequestModel`.
- **Classes / services / components / pipes / guards / interceptors**: PascalCase — e.g. `DashboardStore`, `TaskFormService`, `AuthInterceptor`.
- **Files**: Match the primary export — `auth.service.ts` exports `AuthService`, `task.model.ts` exports `TaskModel`, `auth.store.ts` exports `AuthStore`.
- **Translation keys**: camelCase — e.g. `superAdmin`, `signInToAccount`, `couldNotLoadTasks`.

### File naming (drop directory-redundant suffixes)

Files inside a feature subdirectory (`models/`, `services/`, `store/`, `forms/`, `pages/`, `components/`, `pipes/`) do **not** repeat the directory name as a suffix. The directory provides the context.

| Directory | Before | After |
|---|---|---|
| `models/` | `auth.model.ts` | `auth.ts` |
| `services/` | `auth.service.ts` | `auth.ts` |
| `store/` | `auth.store.ts` | `auth.ts` |
| `forms/` | `login.form.service.ts` | `login.ts` |
| `pages/` | `login.component.ts` | `login.ts` |
| `components/` | `password-input.component.ts` | `password-input.ts` |
| `pipes/` | `translate.pipe.ts` | `translate.ts` |
| `shared/types/` | `auth.model.ts` | `auth.ts` |

**Exception**: Files in `core/guards/` and `core/interceptors/` keep their suffixes (`auth.guard.ts`, `auth.interceptor.ts`) because the directory alone doesn't imply the type.

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
│   │   ├── forms/          # Form services (inline definitions, no factory functions)
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

### Form services (canonical pattern)

Each reactive form gets its own `@Injectable({ providedIn: 'root' })` service class in the `forms/` directory. The form is exposed via a `get form()` getter, and helper methods encapsulate mutations.

```ts
// features/auth/forms/login.form.service.ts
import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class LoginFormService {
  readonly #fb = inject(FormBuilder);
  readonly #form = this.#fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  resetForm() {
    this.#form.reset();
  }

  get form() {
    return this.#form;
  }
}
```

Rules:
- Import order: `inject` before `Injectable` from `@angular/core`; `FormBuilder` (and `Validators` if needed) from `@angular/forms`.
- `#fb` and `#form` are always `readonly #` private fields.
- The `FormGroup` type is **not** declared inline on the class field — TypeScript infers it from `this.#fb.nonNullable.group(...)`.
- Expose the form via a `get form()` getter (never a public field).
- Encapsulate patch/reset/any mutation logic in named methods (`patchIds`, `resetForm`, etc.) — callers use `service.patchIds(...)` not `service.form.patchValue(...)`.
- **One form per service file** — never combine multiple forms in a single service. If a feature needs login and register forms, create `login.form.service.ts` and `register.form.service.ts` separately.
- Name the service `<FormName>FormService`, e.g. `LoginFormService`, `RegisterFormService`, `AddTodoFormService`.
- Place feature-specific services in `frontend/src/app/features/<feature>/forms/<form-name>.form.service.ts`.
- Place shared form services (used by multiple features) in `frontend/src/app/shared/forms/<name>.ts`.
- **API service methods** accept model types instead of inline object literals:
  ```ts
  // ✅ correct — use a model type
  login(value: AuthPayloadModel) {
    return this.#http.post<AuthResponse>('/auth/login', value);
  }

  // ❌ wrong — inline object type
  login(value: { email: string; password: string }) {
    return this.#http.post<AuthResponse>('/auth/login', value);
  }
  ```
- Create models in `features/<feature>/models/<feature>.model.ts`.

### Form services in stores

- **Forms are created and managed in the form service, not the store.** The store injects the form service to drive form state.
- The store does **not** own the form definition — it delegates to the form service's `get form()` and calls its mutation methods.
- **Pattern**: The store injects the service (`readonly #addTodoForm = inject(AddTodoFormService)`) and template-bound methods read values from `this.#addTodoForm.form.value.title` or call `this.#addTodoForm.patchIds(...)`.
- **Passing form values to API services**: The store passes `formService.form.getRawValue()` directly to the API service — **never destructure form values in the store**. The API service method should accept the form value object as a single parameter. Use `getRawValue()` instead of `.value` because `.value` returns `Partial<T>` (disabled controls excluded), while `getRawValue()` returns the full non-partial type.
  ```ts
  // ✅ correct — pass form value directly via getRawValue()
  return authService.login(loginForm.form.getRawValue()).pipe(...);

  // ❌ wrong — do not destructure
  const { email, password } = loginForm.form.value;
  return authService.login(email!, password!).pipe(...);

  // ❌ wrong — .value returns Partial<T>, causes TS errors
  return authService.login(loginForm.form.value).pipe(...);
  ```
- API service methods should accept model types instead of individual params:
  ```ts
  // ✅ correct — use a model type
  login(value: AuthPayloadModel) {
    return this.#http.post<AuthResponse>('/auth/login', value);
  }

  // ❌ wrong — do not use individual params for form data
  login(email: string, password: string) {
    return this.#http.post<AuthResponse>('/auth/login', { email, password });
  }
  ```
- **Shared form components**: When a shared form component (e.g. `TaskFormComponent`) is used, the store does **not** inject the form service at all. Form values arrive via the component's `output()` events. The store receives typed payloads and updates state accordingly — it never calls `patchValue`, `resetForm`, or `getRawValue` on any form.

### TypeScript hygiene rules

- **Use `interface` instead of `type`** for object shapes. Union types (`type X = 'a' | 'b'`) are the only acceptable use of `type`.
- **`readonly` on all immutable properties**: Add `readonly` to every interface and class property that is assigned once and never mutated. This includes DTOs, model interfaces, and injected singleton services exposed to templates. Module-level `const` variables are already immutable by the `const` binding — `readonly` applies to properties, not local bindings.
- **Remove dead code**: Always remove unused imports, unused variables, unused `const` declarations, and anything else that isn't referenced. No dead code should survive review.
- **No `any` or `unknown` in interfaces or types**: Never use `any` or `unknown` as a field type in interfaces or type aliases. Use specific types, `unknown` with type narrowing, or generics instead.
- **Interfaces and types live in `models/` directories only**: Never define `interface` or `type` inside a component, service, pipe, guard, interceptor, or store file (except `initialState` type annotations inside stores, which are fine). All interfaces and types must be exported from a `models/` directory — either `shared/models/` for cross-feature types or `features/<name>/models/` for feature-specific types. Import them where needed.

### Shared form components (own their form, never receive FormGroup as input)

- **A shared form component owns its form internally** by injecting its own `FormService`. Consumers never pass a `FormGroup` as input.
- **Pattern**: The component takes model/primitive inputs (`editingTask`, `projects`, `showProjectSelect`) and emits typed output events (`submitTask`, `cancelEdit`, `projectChange`). It uses `effect()` to react to input changes (pre-fill for editing, reset after save).
- **Form service location**: Shared form services (used by multiple features) go in `shared/forms/<name>.ts`. Feature-specific form services stay in `features/<feature>/forms/`.
- **Store never touches form state**: The store receives form values via component output events. It does not inject form services or interact with form state directly.
- **Example** (`TaskFormComponent`):
  ```ts
  // ✅ correct
  readonly projects = input.required<ProjectModel[]>();
  readonly editingTask = input<TaskModel | null>(null);
  readonly submitTask = output<{ title: string; description: string; projectId: number }>();

  readonly #taskForm = inject(TaskFormService);

  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) this.#taskForm.patchForEdit(task.title, task.projectId, task.description);
    });
  }

  // ❌ wrong — never accept FormGroup as input
  readonly form = input.required<FormGroup>();
  ```

### Component decomposition (SOLID/DRY) — components must be as dumb and reusable as possible

- **Page components** (in `pages/`) act as orchestrators — they inject stores, compose layout from sub-components, and wire events.
- **Sub-components** (in `components/`) are presentational/dumb — receive data via `input()`, emit actions via `output()`. They must be **as dumb as possible**: no business logic, no service injection, no store access. They are reusable UI building blocks.
- **Every component has exactly one purpose.** If a component does two things, split it into two components. A filter bar is not the same as a task list — they are separate components. A search input is not the same as a status chip group — they are separate components. Follow the Single Responsibility Principle strictly.
- **Break down aggressively.** If a template block is reused or could be reused, extract it. If a component has more than ~80 lines of template, it probably needs splitting. Each component should be small enough that you can understand it at a glance.
- **Reuse across features.** A component in `shared/components/` must not depend on any feature-specific store, service, or model. It receives everything via `input()` and communicates via `output()`. This makes it usable in any feature without modification.
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
- **Shared task actions**: When task toggle/delete logic (confirm dialog + API calls) is needed in multiple places (task list, task detail page), extract it into a shared component (e.g. `TaskItemComponent` in `shared/components/`). The component owns the confirm dialog + API calls internally and emits `toggled`/`deleted` events so parents can react (refresh list, navigate away). This keeps toggle/delete logic in one place instead of duplicating it across features.
- **Design audit after refactors**: Always inspect layout/spacing after extracting or restructuring components. Verify that items aren't stuck to container edges, flex layouts match the original design, buttons sit alongside descriptions (not below them), and vertical spacing between elements is consistent. Do not assume the parent container handles all spacing — each component is responsible for its own internal layout.

### Tailwind-only styling (no CSS/SCSS)

- **Remove CSS and SCSS as much as possible — use only Tailwind utility classes.** Never write custom CSS in `styles:` arrays, `styleUrls`, or `.css`/`.scss` files. The only exception is `frontend/src/styles.css`, which is kept minimal for Tailwind directives (`@tailwind`), Angular Material theme import, and global `color-scheme` / RTL text-align rules that cannot be expressed as Tailwind utilities.
- Component-level `styles:` blocks must be eliminated entirely. All styling must use Tailwind classes directly in templates.
- If a design requires CSS that can be expressed with Tailwind utilities (including arbitrary values like `w-[18px]`, `top-[9px]`), use those instead of writing custom CSS.
- This is enforced by convention — code review should reject any new `styles:`, `styleUrl`, or `styleUrls` in component metadata.

## Custom Element Pattern

All shared UI primitives (buttons, inputs, cards, toggles, dialogs, etc.) **must** follow this pattern:

### Core Rule: Always Use Custom Elements
- **Always use custom elements** for UI primitives — never use native HTML elements directly in components.
- If a custom element doesn't exist for a native element you need (e.g., checkbox, radio, date picker), **suggest building it** before falling back to the native element.
- **Never silently use native HTML** when a custom equivalent should exist — ask for permission to build it.

### Visual Fidelity When Replacing Native Elements
When replacing native HTML with custom elements, you **must** verify the rendered output matches exactly:
1. **Compare rendered classes**: List every class on the original native element. Compare with what the custom component renders. Any extra or missing classes are bugs.
2. **Check for unintended additions**: Custom components add base classes (focus rings, transitions, min-height, inline-flex, etc.) that the original didn't have. Use `cssClass` to override or make the feature optional (e.g., `focusRing` input).
3. **Check attribute passthrough**: If the original had `autocomplete`, `aria-*`, or other attributes, ensure the custom component accepts and passes them through.
4. **Specialized components may use native elements**: Components with unique styling (toggles, specialized buttons) that can't be reproduced by custom element inputs should use native `<button>`/`<input>` directly. See `ThemeToggleComponent` and `LanguageToggleComponent` as examples.

### Component Syntax Only
- **Always use `<app-button>`, `<app-input>`, `<app-card>`, etc.** (element selector)
- **Never** use attribute syntax like `<button appButton>`, `<input appInput>`, etc.

### Native Attribute Passthrough
Accept native HTML attributes as `input()` signals and pass them to the rendered native element:
```ts
readonly routerLink = input<any[] | string>();
readonly href = input<string>();
readonly type = input<'button' | 'submit' | 'reset'>('button');
readonly disabled = input<boolean>(false);
readonly id = input<string>();
readonly ariaLabel = input<string>();
// ...other native attributes as needed
```

### Render Appropriate Native Element
- Use `<a>` when `routerLink` or `href` is provided (navigation)
- Use `<button>` for form actions (submit, reset, button)
- Use `<input>` for form controls
- Use conditional templates (`*ngIf` / `ng-template`) to switch between native elements

### Content Projection
Always use `<ng-content></ng-content>` for flexible content (text, icons, nested components).

### Class-Based Variants
Use `variant`, `size`, `cssClass`, and optionally `color`/`appearance` inputs with a computed `class` binding:
```ts
// Standard variants
readonly variant = input<'primary' | 'secondary' | 'destructive' | 'ghost' | 'warning' | 'success' | 'outline'
  | 'mat' | 'mat-raised' | 'mat-flat' | 'mat-stroked' | 'mat-text'>('secondary');

// Material Design color variants (for mat-* variants)
readonly color = input<'primary' | 'accent' | 'warn' | 'basic'>('primary');

readonly size = input<'sm' | 'md' | 'lg'>('md');
readonly cssClass = input<string>();

readonly computedClasses = () => {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  // ...variant logic including Material Design variants
  return [base, sizes[this.size()], variantClass, this.cssClass()].filter(Boolean).join(' ');
};
```

### Output Events
Emit native events via `output()` with aliased names:
```ts
readonly click = output<void>({ alias: 'buttonClick' });
readonly focus = output<void>({ alias: 'buttonFocus' });
```

### Template Example
```html
<ng-container *ngIf="routerLink() || href(); else buttonTemplate">
  <a [routerLink]="routerLink()" [href]="href()" [class]="computedClasses()" (click)="onClick($event)">
    <ng-content></ng-content>
  </a>
</ng-container>
<ng-template #buttonTemplate>
  <button [type]="type()" [disabled]="disabled()" [class]="computedClasses()" (click)="onClick()" (keydown.enter)="onEnter($event)">
    <ng-content></ng-content>
  </button>
</ng-template>
```

### Usage Examples
```html
<!-- Standard buttons -->
<app-button variant="primary" routerLink="/dashboard" size="lg">
  <mat-icon>home</mat-icon>
  {{ t('goHome') }}
</app-button>

<app-button variant="secondary" type="submit" (buttonClick)="onSubmit()">
  {{ t('save') }}
</app-button>

<app-button variant="ghost" ariaLabel="Close dialog" (buttonClick)="close()">
  <mat-icon>close</mat-icon>
</app-button>

<!-- Material Design buttons (for dialogs, bottom sheets) -->
<app-button variant="mat-text" (buttonClick)="onCancel()">{{ t('cancel') }}</app-button>
<app-button variant="mat-raised" color="warn" (buttonClick)="onConfirm()">{{ t('delete') }}</app-button>
<app-button variant="mat-stroked" color="primary" (buttonClick)="onAction()">{{ t('action') }}</app-button>
<app-button variant="mat-flat" color="accent" (buttonClick)="onSave()">{{ t('save') }}</app-button>
```

### Specialized Components Exception
Components with unique behavior/animations (e.g., `ThemeToggleComponent`, `LanguageToggleComponent`, `PasswordInputComponent`) may use native `<button>` directly since they are **self-contained UI components**, not generic reusable primitives.

### Missing Custom Elements
- **Never fall back to native HTML elements** when a custom element is needed but doesn't exist. Always prefer custom elements over native HTML for consistency and maintainability.
- If you encounter a native element that requires a custom equivalent (e.g., `<input type="checkbox">`, `<input type="radio">`, `<input type="range">`, `<details>`, `<dialog>`), **ask permission to build it** rather than using the native element directly.
- When proposing a new custom element, **suggest the selector name** (e.g., `app-checkbox`, `app-radio`, `app-toggle`) and **describe the API surface** (inputs, outputs, variants) before building it.
- **Existing native elements that need custom equivalents** (build these if not yet created):
  - `<input type="checkbox">` → `app-checkbox`
  - `<input type="radio">` → `app-radio`
  - `<input type="range">` → `app-slider`
  - `<input type="date">` → `app-date-picker`
  - `<details>` → `app-collapsible`
  - Native `<select>` → `app-select` (already exists)
- **Exception**: Elements inside self-contained specialized components (e.g., `ThemeToggleComponent`) may use native elements directly since they are isolated, non-reusable UI.

### Existing Components Following This Pattern
- `ButtonComponent` (`frontend/src/app/shared/components/button.ts`)
- `InputComponent` (`frontend/src/app/shared/components/input.ts`)
- `CardComponent` (`frontend/src/app/shared/components/card.ts`)
- `TextareaComponent` (`frontend/src/app/shared/components/textarea.ts`)
- `SelectComponent` (`frontend/src/app/shared/components/select.ts`)
- **Check this list before building a new component** — if the element already exists, use it. Only propose a new component when no existing one matches the required native element.

## Modern Angular Syntax Rules

### Use Built-in Control Flow (Angular 17+)
- **Never use `*ngIf`, `*ngFor`, `*ngSwitch`** — use `@if`, `@for`, `@switch` instead
- **Never use `<ng-container>` or `<ng-template>`** for control flow — use `@if`/`@for` blocks directly
- **Never use `*ngIf="condition; else template"`** — use `@if (condition) { ... } @else { ... }`

### Component Template Syntax
- Use **inline `template:`** only (no `templateUrl`)
- Use **signal-based inputs**: `input()`, `input.required()` from `@angular/core`
- Use **signal-based outputs**: `output()` from `@angular/core`
- Use **signal-based queries**: `viewChild()`, `contentChild()` etc.
- **No `NgModule`** — standalone components only

### Custom Element Naming Convention
- **Selector prefix**: All shared UI primitives use `app-` prefix (e.g., `app-button`, `app-input`, `app-select`, `app-card`, `app-form`)
- **Component class**: PascalCase with `Component` suffix (e.g., `ButtonComponent`, `SelectComponent`)
- **File name**: kebab-case matching selector without prefix (e.g., `button.ts`, `select.ts`)
- **Export barrel**: Export from `shared/components/index.ts`

### Custom Element Simplicity Rules
- **Minimal API surface**: Only expose props needed by consumers — prefer `cssClass` for custom styling over many variant props
- **Single responsibility**: Each custom element does ONE thing (button, input, select, card)
- **No business logic**: Custom elements are presentational only — no service injection, no store access, no API calls
- **Native attribute passthrough**: Pass through standard HTML attributes (`disabled`, `id`, `aria-*`, `placeholder`, `type`) as `input()` signals
- **Content projection**: Use `<ng-content>` for flexible content — avoid rigid slot APIs
- **Output aliasing**: Emit events with `output({ alias: 'customName' })` for clean consumer API
- **Signal-based inputs/outputs**: Use `input()`, `output()` — no `@Input()`/`@Output()` decorators
- **No `ng-container`/`ng-template`**: Keep template flat — simple native element wrapper only
- **Inline template only**: No `templateUrl` — template in `@Component({ template: \`...\` })`

### Button Component
- **Always use `<app-button>`** for all button needs
- **Never use native `<button>`** directly in components (except specialized components like `ThemeToggleComponent`)
- **No `routerLink` on `<app-button>`** — use `(buttonClick)` handler with `router.navigate()` instead
- **No `<ng-container>` or `<ng-template>`** in button component — simple `<button>` element only

### Select Component
- **Always use `<app-select>`** for all select/dropdown needs
- **Never use native `<select>`** directly in components
- **Internally uses `@ng-select/ng-select`** for enhanced UI (searchable, clearable, customizable)
- **Options format**: `{ value: number | string; label: string }[]`
- **ControlValueAccessor**: Works with `formControlName` in reactive forms
- **Inputs**: `options`, `placeholder`, `disabled`, `variant`, `cssClass`, `value`
- **Outputs**: `selectChange`, `selectBlur`, `selectFocus`, `selectKeydown`
- **Example**:
  ```html
  <app-select
    formControlName="projectId"
    [placeholder]="t('selectProject')"
    [options]="projectOptions()"
    variant="default"
  />
  ```

### Router Navigation
- Inject `Router` and use `this.#router.navigate([...])` in click handlers
- Don't use `routerLink` directive on custom button components
