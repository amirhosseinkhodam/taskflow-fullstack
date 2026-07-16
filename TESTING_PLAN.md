# TaskFlow Fullstack — Complete Testing Plan

## Phase 0: Test Infrastructure Setup

### Step 0.1: Install test dependencies
```bash
npm install --save-dev jest @types/jest ts-jest @nestjs/testing jest-preset-angular
```

### Step 0.2: Create `backend/jest.config.ts`
- Preset: `ts-jest`
- Test environment: `node`
- Root dir: `backend/src`
- Test match: `**/*.spec.ts`
- Module paths: resolve `@shared/*` to `shared/*`
- Coverage dir: `backend/coverage`
- Transform: extends `tsconfig.backend.spec.json`

### Step 0.3: Create `tsconfig.backend.spec.json`
- Extends `tsconfig.backend.json`
- Adds `"types": ["jest", "node"]`

### Step 0.4: Create `frontend/jest.config.ts`
- Preset: `jest-preset-angular`
- Root dir: `frontend/src`
- Test match: `**/*.spec.ts`
- Setup files after env: `frontend/setup-jest.ts`
- Module paths: resolve `@shared/*` to `shared/*`, `@models/*` to `frontend/src/app/models/*`
- Coverage dir: `frontend/coverage`
- Transform ignore patterns for `@ngrx`, `@ng-select`, etc.

### Step 0.5: Create `frontend/setup-jest.ts`
```ts
import 'jest-preset-angular/setup-jest';
```

### Step 0.6: Add test scripts to `package.json`
```json
"test:backend": "jest --config backend/jest.config.ts",
"test:backend:watch": "jest --config backend/jest.config.ts --watch",
"test:backend:cov": "jest --config backend/jest.config.ts --coverage",
"test:frontend": "jest --config frontend/jest.config.ts",
"test:frontend:watch": "jest --config frontend/jest.config.ts --watch",
"test:frontend:cov": "jest --config frontend/jest.config.ts --coverage",
"test": "npm run test:backend && npm run test:frontend",
"test:watch": "npm run test:backend:watch & npm run test:frontend:watch"
```

---

## Phase 1: Backend Unit Tests

### Step 1.1: `AppService` — `backend/src/app.service.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `getHealth()` returns `{ status: 'ok' }` | `toEqual({ status: 'ok' })` |
| 2 | `getHello()` returns `'Hello World!'` | `toBe('Hello World!')` |

No mocks needed — pure service.

### Step 1.2: `AppController` — `backend/src/app.controller.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `getHealth()` returns health object | Delegates to `AppService.getHealth()` |
| 2 | `getHello()` returns hello string | Delegates to `AppService.getHello()` |

Mock: `AppService` (spy on both methods).

### Step 1.3: `AuthService` — `backend/src/auth/auth.service.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `register()` — success (new email) | Returns `{ token, user }`, user has correct fields, password is hashed |
| 2 | `register()` — conflict (existing email) | Throws `ConflictException` |
| 3 | `login()` — success (correct credentials) | Returns `{ token, user }` with correct shape |
| 4 | `login()` — failure (wrong password) | Throws `UnauthorizedException` |
| 5 | `login()` — failure (nonexistent email) | Throws `UnauthorizedException` |

Mocks: `Pool` (mock `query` to return rows), `JwtService` (mock `sign` to return a fake token).

### Step 1.4: `AuthController` — `backend/src/auth/auth.controller.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `register()` delegates to `AuthService.register()` | Passes `dto.email`, `dto.password`, `dto.name` |
| 2 | `login()` delegates to `AuthService.login()` | Passes `dto.email`, `dto.password` |

Mock: `AuthService` (spy on `register`, `login`).

### Step 1.5: `JwtStrategy` — `backend/src/auth/jwt.strategy.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `validate()` — user found | Returns `{ id, email, name, role }` |
| 2 | `validate()` — user not found | Throws `UnauthorizedException` |

Mock: `Pool` (mock `query`).

### Step 1.6: `RolesGuard` — `backend/src/auth/roles.guard.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | No roles required (handler has no `@Roles`) | Returns `false` (per current impl: `if (!requiredRoles) return false`) |
| 2 | User has required role | Returns `true` |
| 3 | User does NOT have required role | Returns `false` |
| 4 | User is `superAdmin` | Returns `true` regardless of required roles |
| 5 | No user on request | Returns `false` |
| 6 | User with no role property | Returns `false` |

Mock: `Reflector` (mock `getAllAndOverride`), mock `ExecutionContext` (with `switchToHttp().getRequest()`).

### Step 1.7: `TaskService` — `backend/src/task/task.service.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `create()` — inserts task at next position | Returns full `TaskModel` with creator name |
| 2 | `create()` — first task in project gets position 0 | Correct position |
| 3 | `findAll()` — no filters | Returns paginated response with default page=1, limit=5 |
| 4 | `findAll()` — filter by projectId | SQL includes `WHERE t."projectId" = $1` |
| 5 | `findAll()` — filter by status | SQL includes status condition |
| 6 | `findAll()` — filter by searchTerm | SQL includes ILIKE on title/description |
| 7 | `findAll()` — pagination (page=2, limit=10) | Correct offset calculation |
| 8 | `findAll()` — clamps page<1 to 1, limit>100 to 100 | Boundary values |
| 9 | `findOne()` — existing id | Returns `TaskModel` |
| 10 | `findOne()` — nonexistent id | Returns `null` |
| 11 | `update()` — updates title only | Only title field in SET clause |
| 12 | `update()` — updates multiple fields | All fields present, `updatedAt` set |
| 13 | `update()` — no fields provided | Returns `false` |
| 14 | `update()` — nonexistent task | Returns `false` (rowCount=0) |
| 15 | `reorder()` — calls BEGIN, UPDATE for each id, COMMIT | Correct SQL sequence |
| 16 | `reorder()` — error triggers ROLLBACK | Client.release() still called |
| 17 | `delete()` — existing task | Returns `true` |
| 18 | `delete()` — nonexistent task | Returns `false` |
| 19 | `deleteByProject()` — removes all tasks for project | SQL runs DELETE with projectId |

Mock: `Pool` (mock `query` and `connect` for reorder transaction).

### Step 1.8: `TaskController` — `backend/src/task/task.controller.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `findAll()` — no query params | Calls `taskService.findAll({})` |
| 2 | `findAll()` — with all query params | Converts strings to numbers, passes filter object |
| 3 | `findOne()` — delegates with parsed id | Calls `taskService.findOne(id)` |
| 4 | `create()` — delegates with body + user id | Calls `taskService.create(title, desc, projectId, userId)` |
| 5 | `update()` — delegates with all fields | Calls `taskService.update(id, title, desc, status, projectId)` |
| 6 | `reorder()` — delegates with taskIds | Calls `taskService.reorder(taskIds)` |
| 7 | `delete()` — delegates with id | Calls `taskService.delete(id)` |

Mock: `TaskService` (spy on all methods).

### Step 1.9: `ProjectService` — `backend/src/project/project.service.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `findAll()` — returns all projects ordered by id | SQL includes `ORDER BY id` |
| 2 | `findOne()` — existing id | Returns `ProjectModel` |
| 3 | `findOne()` — nonexistent id | Returns `null` |
| 4 | `create()` — inserts and returns project | Returns `{ id, name, createdAt, updatedAt }` |
| 5 | `update()` — name provided | Updates name, sets `updatedAt`, returns project |
| 6 | `update()` — no name provided (undefined) | Returns `null` immediately, no DB call |
| 7 | `delete()` — calls `taskService.deleteByProject` then deletes project | Both methods called, returns `true` |
| 8 | `delete()` — nonexistent project | Returns `false` (rowCount=0) |

Mocks: `Pool` (mock `query`), `TaskService` (mock `deleteByProject`).

### Step 1.10: `ProjectController` — `backend/src/project/project.controller.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `getProjects()` — delegates to service | Calls `findAll()` |
| 2 | `findOneProject()` — delegates with id | Calls `findOne(id)` |
| 3 | `createProject()` — delegates with body.name | Calls `create(name)` |
| 4 | `updateProject()` — delegates with id + body.name | Calls `update(id, name)` |
| 5 | `deleteProject()` — delegates with id | Calls `delete(id)` |

Mock: `ProjectService` (spy on all methods).

### Step 1.11: `AdminService` — `backend/src/admin/admin.service.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `findAllUsers()` — returns all users | Ordered by id |
| 2 | `deleteUser()` — success (different user, not superAdmin) | Returns `{ success: true }` |
| 3 | `deleteUser()` — self-delete attempt | Throws `BadRequestException` |
| 4 | `deleteUser()` — superAdmin target | Throws `BadRequestException` |
| 5 | `deleteUser()` — nonexistent user | Throws `NotFoundException` |
| 6 | `deleteUser()` — delete returns rowCount=0 | Throws `NotFoundException` |
| 7 | `updateUserRole()` — success | Returns updated user |
| 8 | `updateUserRole()` — self-modification | Throws `BadRequestException` |
| 9 | `updateUserRole()` — invalid role value | Throws `BadRequestException` |
| 10 | `updateUserRole()` — superAdmin target | Throws `BadRequestException` |
| 11 | `updateUserRole()` — nonexistent user | Throws `NotFoundException` |
| 12 | `updateUserPassword()` — success | Returns `{ success: true }`, password is hashed |
| 13 | `updateUserPassword()` — self-change | Throws `BadRequestException` |
| 14 | `updateUserPassword()` — short password (<6 chars) | Throws `BadRequestException` |
| 15 | `updateUserPassword()` — empty password | Throws `BadRequestException` |
| 16 | `updateUserPassword()` — superAdmin target | Throws `BadRequestException` |
| 17 | `updateUserPassword()` — nonexistent user | Throws `NotFoundException` |

Mock: `Pool` (mock `query`).

### Step 1.12: `AdminController` — `backend/src/admin/admin.controller.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `getUsers()` — delegates | Calls `findAllUsers()` |
| 2 | `deleteUser()` — delegates with id + req.user.id | Calls `deleteUser(id, userId)` |
| 3 | `updateUserRole()` — delegates with id, role, req.user.id | Calls `updateUserRole(id, role, userId)` |
| 4 | `changeUserPassword()` — delegates with id, password, req.user.id | Calls `updateUserPassword(id, password, userId)` |

Mock: `AdminService` (spy on all methods), mock `req` object.

---

## Phase 2: Frontend Unit Tests

### Step 2.1: `ThemeService` — `frontend/src/app/shared/services/theme.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Initial state — no localStorage | `isDark()` is `false` |
| 2 | Initial state — localStorage `'dark'` | `isDark()` is `true` |
| 3 | `toggle()` — from light to dark | `isDark()` becomes `true`, localStorage set, `<html>` has `dark` class |
| 4 | `toggle()` — from dark to light | `isDark()` becomes `false`, localStorage updated, `<html>` has no `dark` class |

Mock: `localStorage` (spy), `document.documentElement.classList`.

### Step 2.2: `LanguageService` — `frontend/src/app/shared/services/language.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Default language is `'en'` | `currentLanguage()` === `'en'` |
| 2 | `translate()` — known key | Returns English translation |
| 3 | `translate()` — unknown key | Returns the key itself |
| 4 | `toggle()` — en → fa | `currentLanguage()` === `'fa'`, `dir` is `'rtl'` |
| 5 | `toggle()` — fa → en | `currentLanguage()` === `'en'`, `dir` is `'ltr'` |
| 6 | `setLanguage('fa')` — valid | Sets to `'fa'` |
| 7 | `setLanguage('xx')` — invalid | No change |
| 8 | `getLanguageOption('en')` | Returns correct option with `rtl: false` |
| 9 | `getCurrentLanguageOption()` | Returns current language's option |
| 10 | Persistence — saves to localStorage | localStorage key `'app-language'` updated |
| 11 | Restore from localStorage | Loads saved language on init |

Mock: `localStorage`, `document.documentElement`.

### Step 2.3: `JalaliDatePipe` — `frontend/src/app/shared/pipes/jalali-date.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `transform(null)` | Returns `''` |
| 2 | `transform(undefined)` | Returns `''` |
| 3 | `transform('2024-01-15T10:30:00Z')` | Returns Jalali formatted string matching `yyyy/MM/dd HH:mm` pattern |

No mocks — pipe is pure.

### Step 2.4: `TranslatePipe` — `frontend/src/app/shared/pipes/translate.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `transform('logout')` | Returns English translation of `'logout'` |
| 2 | After language change, pipe updates | Returns new language's translation |

Mock: `LanguageService` (provide via `TestBed`).

### Step 2.5: `AuthService` (Frontend) — `frontend/src/app/features/auth/services/auth.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `login()` — calls POST `/auth/login` | `HttpClient.post` called with correct URL and payload |
| 2 | `register()` — calls POST `/auth/register` | `HttpClient.post` called with correct URL and payload |

Mock: `HttpTestingController`.

### Step 2.6: `DashboardService` (Frontend) — `frontend/src/app/features/dashboard/services/dashboard.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `getHealth()` — GET `/api/health` | Correct URL |
| 2 | `getTask(id)` — GET `/tasks/{id}` | Correct URL |
| 3 | `getProjects()` — GET `/projects` | Correct URL |
| 4 | `getTasks()` — no filters | GET `/tasks` with no query params |
| 5 | `getTasks()` — with projectId, status, search, page, limit | Query string correct |
| 6 | `createProject(name)` — POST `/projects` | Correct body `{ name }` |
| 7 | `updateProject(id, value)` — PUT `/projects/{id}` | Correct body |
| 8 | `deleteProject(id)` — DELETE `/projects/{id}` | Correct URL |
| 9 | `createTask(value)` — POST `/tasks` | Correct body |
| 10 | `updateTask(id, value)` — PUT `/tasks/{id}` | Correct body |
| 11 | `updateTaskStatus(id, status)` — delegates to `updateTask` | Passes `{ status }` |
| 12 | `reorderTasks(taskIds)` — PATCH `/tasks/reorder` | Correct body |
| 13 | `deleteTask(id)` — DELETE `/tasks/{id}` | Correct URL |

Mock: `HttpTestingController`.

### Step 2.7: `AdminService` (Frontend) — `frontend/src/app/features/admin/services/admin.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `getUsers()` — GET `/admin/users` | Correct URL |
| 2 | `deleteUser(id)` — DELETE `/admin/users/{id}` | Correct URL |
| 3 | `updateUserRole(id, role)` — PATCH `/admin/users/{id}/role` | Correct body |
| 4 | `changeUserPassword(id, password)` — POST `/admin/users/{id}/change-password` | Correct body |

Mock: `HttpTestingController`.

### Step 2.8: `AuthStore` — `frontend/src/app/features/auth/store/auth.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Initial state | `token: null`, `user: null`, `error: null`, `isLoading: false` |
| 2 | `isLoggedIn` computed — no token | `false` |
| 3 | `isLoggedIn` computed — has token | `true` |
| 4 | `isAdmin` computed — user is admin | `true` |
| 5 | `isAdmin` computed — user is user | `false` |
| 6 | `restoreSession()` — valid token in localStorage | Sets `token` and decodes `user` |
| 7 | `restoreSession()` — no token | State unchanged |
| 8 | `login()` — success | Sets `token`, `user`, navigates to `/`, clears error |
| 9 | `login()` — 401 error | Sets `error: 'Invalid credentials'`, clears isLoading |
| 10 | `login()` — other error | Sets `error: 'Login failed'` |
| 11 | `login()` — invalid form (form.invalid) | No HTTP call made |
| 12 | `register()` — success | Sets `token`, `user`, navigates to `/` |
| 13 | `register()` — 409 error | Sets `error: 'Email already registered'` |
| 14 | `register()` — other error | Sets `error: 'Registration failed'` |
| 15 | `logout()` | Clears token/user/error, navigates to `/login` |

Mocks: `AuthService`, `Router`, `LoginFormService`, `RegisterFormService`, `localStorage`.

### Step 2.9: `DashboardStore` — `frontend/src/app/features/dashboard/store/dashboard.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Initial state | All defaults correct |
| 2 | `hasProjects` computed — empty | `false` |
| 3 | `hasProjects` computed — has projects | `true` |
| 4 | `firstProjectId` computed — empty | `0` |
| 5 | `firstProjectId` computed — has projects | First project's id |
| 6 | `editingTask` computed — no editingTaskId | `null` |
| 7 | `editingTask` computed — valid editingTaskId | Returns matching task |
| 8 | `currentFilters` computed | Combines filter + page + limit |
| 9 | `loadHealth()` — success | Sets `healthStatus` to response |
| 10 | `loadHealth()` — error | Sets `healthStatus: 'offline'` |
| 11 | `loadProjects()` — success | Sets `projects`, clears `isLoading` |
| 12 | `loadProjects()` — error | Clears `isLoading` |
| 13 | `loadTasks()` — success | Sets tasks, pagination |
| 14 | `loadTasks()` — error | Clears `isLoading` |
| 15 | `createProject()` — success | Appends project, sets message |
| 16 | `createProject()` — error | Sets error message |
| 17 | `setFilter()` — updates filter, resets page to 1 | Filter and page updated, tasks reloaded |
| 18 | `setPage()` — updates page | Page updated, tasks reloaded |
| 19 | `startEdit()` / `cancelEdit()` | Sets/clears `editingTaskId` |
| 20 | `saveTask()` — create (no editingTaskId) | Calls createTask, reloads tasks |
| 21 | `saveTask()` — update (has editingTaskId) | Calls updateTask, reloads tasks |
| 22 | `saveTask()` — empty title | No API call |
| 23 | `reorderTasks()` — success | Updates tasks order |
| 24 | `reorderTasks()` — error | Reloads original tasks |
| 25 | `toggleTask()` — success | Reloads tasks |
| 26 | `toggleTask()` — error | Sets error message |
| 27 | `deleteTask()` — success | Reloads tasks |
| 28 | `deleteTask()` — error | Sets error message |
| 29 | `startEditProject()` / `cancelEditProject()` | Sets/clears `editingProjectId` |
| 30 | `updateProject()` — success | Updates project in list, clears editing |
| 31 | `updateProject()` — no editingProjectId | No API call |
| 32 | `updateProject()` — error | Sets error message |
| 33 | `deleteProject()` — success | Removes from list, reloads tasks |
| 34 | `deleteProject()` — error | Sets error message |

Mock: `DashboardService` (spy on all methods), return `of(...)` observables.

### Step 2.10: `AdminStore` — `frontend/src/app/features/admin/store/admin.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Initial state | Defaults correct |
| 2 | `userCount` computed | Returns `users().length` |
| 3 | `loadUsers()` — success | Sets `users`, clears `isLoading` |
| 4 | `loadUsers()` — error | Sets error message |
| 5 | `deleteUser()` — success | Removes user from list, sets message |
| 6 | `deleteUser()` — error | Sets error message |
| 7 | `updateUserRole()` — success | Updates user in list, sets message |
| 8 | `updateUserRole()` — error | Sets error message |
| 9 | `startPasswordChange()` | Resets form, sets `passwordChangeUserId` |
| 10 | `cancelPasswordChange()` | Resets form, clears `passwordChangeUserId` |
| 11 | `changePassword()` — success | Resets form, clears userId, sets message |
| 12 | `changePassword()` — invalid form | No API call |
| 13 | `changePassword()` — no userId | No API call |
| 14 | `changePassword()` — error | Sets error message |

Mock: `AdminService`, `PasswordFormService`.

### Step 2.11: `TaskFormService` — `frontend/src/app/shared/forms/task.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Initial form state — invalid | `form.valid` is `false` |
| 2 | Form becomes valid with title + projectId | `form.valid` is `true` |
| 3 | `patchProjectId()` | Sets projectId |
| 4 | `patchForEdit()` | Patches title, projectId, description |
| 5 | `resetForm(projectId)` | Resets to empty with given projectId |

No mocks — pure reactive form testing.

### Step 2.12: Guards — `frontend/src/app/core/guards/auth.guard.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `authGuard` — logged in | Returns `true` |
| 2 | `authGuard` — not logged in | Returns `Router.parseUrl('/login')` |
| 3 | `adminGuard` — admin user | Returns `true` |
| 4 | `adminGuard` — non-admin user | Returns `Router.parseUrl('/')` |
| 5 | `adminGuard` — not logged in | Returns `Router.parseUrl('/')` |

Mock: `AuthStore` (provide via `{ providedIn: 'root' }` mock), `Router`.

### Step 2.13: `authInterceptor` — `frontend/src/app/core/interceptors/auth.interceptor.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | No token — request passes through unchanged | No `Authorization` header |
| 2 | Has token — `Authorization: Bearer <token>` header added | Header present |
| 3 | Has token — other headers preserved | Original headers intact |

Mock: `AuthStore`, `HttpTestingController`.

### Step 2.14: Shared Components — `frontend/src/app/shared/components/button.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders `<button>` when no routerLink/href | Native button element present |
| 2 | Renders `<a>` when `routerLink` provided | Anchor element present |
| 3 | `disabled` input — button disabled | `disabled` attribute |
| 4 | `variant` input — applies correct CSS classes | Class string contains variant classes |
| 5 | `size` input — applies correct size classes | Class string contains size classes |
| 6 | `click` output — emits on button click | `buttonClick` event emitted |
| 7 | Enter keydown — emits `buttonClick` | Keyboard interaction |

Mock: `Router` (for routerLink tests).

### Step 2.15: Shared Components — `frontend/src/app/shared/components/input.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders `<input>` | Input element present |
| 2 | `type` input — sets input type | `type` attribute correct |
| 3 | `placeholder` input | Placeholder attribute set |
| 4 | `disabled` input | Input disabled |
| 5 | `ControlValueAccessor` — writeValue | Input value updates |
| 6 | `ControlValueAccessor` — onChange fires | Emits value changes |

### Step 2.16: `CardComponent`, `TextareaComponent`, `FormComponent` — minimal tests
Each: render test + variant CSS class test + disabled/size input tests.

### Step 2.17: `ThemeToggleComponent` — `frontend/src/app/shared/components/theme-toggle.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders toggle element | Element present |
| 2 | Click toggles theme | `ThemeService.toggle()` called |

### Step 2.18: `LanguageToggleComponent` — `frontend/src/app/shared/components/language-toggle.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders toggle element | Element present |
| 2 | Click toggles language | `LanguageService.toggle()` called |

### Step 2.19: `PasswordInputComponent` — `frontend/src/app/features/auth/components/password-input.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders input type="password" | Default hidden |
| 2 | Toggle visibility — shows password | Type changes to "text" |
| 3 | Toggle back — hides password | Type changes to "password" |

### Step 2.20: Auth Pages — `frontend/src/app/features/auth/pages/login.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders login form with email + password fields | Inputs present |
| 2 | Submit calls `store.login()` | Store method called |
| 3 | Displays error from store | Error text rendered |
| 4 | Loading state — disables submit | Button disabled |

Mock: `AuthStore`.

### Step 2.21: Auth Pages — `frontend/src/app/features/auth/pages/register.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders register form with name + email + password | Inputs present |
| 2 | Submit calls `store.register()` | Store method called |
| 3 | Displays error from store | Error text rendered |

Mock: `AuthStore`.

### Step 2.22: Dashboard Components — `pagination.spec.ts`, `project-filter.spec.ts`, `status-filter.spec.ts`, `search-input.spec.ts`, `task-list.spec.ts`, `project-list.spec.ts`
Each component: render test + input/output binding tests + conditional rendering tests.

### Step 2.23: `TaskItemComponent` — `frontend/src/app/shared/components/task-item.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders task title + description | Text content present |
| 2 | Toggle button emits `toggled` | Event emitted |
| 3 | Delete button opens confirm dialog | Dialog opens |
| 4 | Edit button emits `edit` | Event emitted |
| 5 | Detail link has correct route | Router link correct |

Mock: `DashboardService` (for API calls), `MatDialog`.

### Step 2.24: `TaskFormComponent` — `frontend/src/app/shared/components/task-form.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders form with title + description + project select | Inputs present |
| 2 | Submit emits `submitTask` with form values | Correct payload |
| 3 | Cancel emits `cancelEdit` | Event emitted |
| 4 | Editing mode — pre-fills form via effect | Form values match editingTask |
| 5 | `showProjectSelect=false` — hides project dropdown | Dropdown not rendered |

Mock: `TaskFormService`.

### Step 2.25: Admin Panel — `frontend/src/app/features/admin/pages/admin-panel.spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | Renders user table | Table rows present |
| 2 | Role toggle calls `store.updateUserRole()` | Store method called |
| 3 | Delete button opens confirmation | Dialog opens |
| 4 | Password change opens form | Form rendered |

Mock: `AdminStore`.

---

## Phase 3: Backend Integration Tests (HTTP-level)

### Step 3.1: `Auth` e2e — `backend/test/auth.e2e-spec.ts`
Uses `@nestjs/testing` `Test.createTestingModule` + `INestApplication` with `supertest`.

| # | Test case | Assert |
|---|---|---|
| 1 | `POST /auth/register` — success | 201, `{ token, user: { id, email, name, role } }` |
| 2 | `POST /auth/register` — duplicate email | 409 |
| 3 | `POST /auth/register` — missing fields | 400 (validation) |
| 4 | `POST /auth/login` — success | 200, `{ token, user }` |
| 5 | `POST /auth/login` — wrong password | 401 |
| 6 | `POST /auth/login` — nonexistent email | 401 |

Setup: Spin up real NestJS app with mocked `DATABASE` provider (in-memory pg or mock pool).

### Step 3.2: `Projects` e2e — `backend/test/project.e2e-spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `GET /projects` — no auth | 401 |
| 2 | `GET /projects` — with valid token | 200, array of projects |
| 3 | `POST /projects` — non-admin user | 403 |
| 4 | `POST /projects` — admin user | 201, created project |
| 5 | `PUT /projects/:id` — admin | 200, updated project |
| 6 | `DELETE /projects/:id` — admin | 200, true |
| 7 | `DELETE /projects/:id` — cascades task deletion | Tasks removed |

### Step 3.3: `Tasks` e2e — `backend/test/task.e2e-spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `GET /tasks` — no auth | 401 |
| 2 | `GET /tasks` — with token, no filters | 200, paginated response |
| 3 | `GET /tasks?projectId=X` — filter | Filtered results |
| 4 | `GET /tasks?status=pending` | Status-filtered |
| 5 | `GET /tasks?search=foo` | Search-filtered |
| 6 | `GET /tasks?page=2&limit=2` | Correct page |
| 7 | `POST /tasks` — create | 201, task with correct fields |
| 8 | `PUT /tasks/:id` — update | 200, true |
| 9 | `PATCH /tasks/reorder` — reorder | 200, positions updated |
| 10 | `DELETE /tasks/:id` — delete | 200, true |

### Step 3.4: `Admin` e2e — `backend/test/admin.e2e-spec.ts`
| # | Test case | Assert |
|---|---|---|
| 1 | `GET /admin/users` — non-admin | 403 |
| 2 | `GET /admin/users` — admin | 200, user list |
| 3 | `DELETE /admin/users/:id` — delete regular user | 200 |
| 4 | `DELETE /admin/users/:id` — delete self | 400 |
| 5 | `PATCH /admin/users/:id/role` — change role | 200 |
| 6 | `POST /admin/users/:id/change-password` — success | 200 |

---

## Execution Order & File Manifest

### Execution order (dependencies flow top-down):

```
Phase 0 (setup)
  └── Install deps, create configs
Phase 1 (backend unit — no DB needed)
  ├── Step 1.1  app.service.spec.ts
  ├── Step 1.2  app.controller.spec.ts
  ├── Step 1.3  auth.service.spec.ts
  ├── Step 1.4  auth.controller.spec.ts
  ├── Step 1.5  jwt.strategy.spec.ts
  ├── Step 1.6  roles.guard.spec.ts
  ├── Step 1.7  task.service.spec.ts
  ├── Step 1.8  task.controller.spec.ts
  ├── Step 1.9  project.service.spec.ts
  ├── Step 1.10 project.controller.spec.ts
  ├── Step 1.11 admin.service.spec.ts
  └── Step 1.12 admin.controller.spec.ts
Phase 2 (frontend unit — TestBed needed)
  ├── Step 2.1  theme.service.spec.ts
  ├── Step 2.2  language.service.spec.ts
  ├── Step 2.3  jalali-date.pipe.spec.ts
  ├── Step 2.4  translate.pipe.spec.ts
  ├── Step 2.5  auth.service.spec.ts (frontend)
  ├── Step 2.6  dashboard.service.spec.ts
  ├── Step 2.7  admin.service.spec.ts (frontend)
  ├── Step 2.8  auth.store.spec.ts
  ├── Step 2.9  dashboard.store.spec.ts
  ├── Step 2.10 admin.store.spec.ts
  ├── Step 2.11 task.form.spec.ts
  ├── Step 2.12 auth.guard.spec.ts
  ├── Step 2.13 auth.interceptor.spec.ts
  ├── Step 2.14 button.component.spec.ts
  ├── Step 2.15 input.component.spec.ts
  ├── Step 2.16 card/textarea/form.component.spec.ts
  ├── Step 2.17 theme-toggle.component.spec.ts
  ├── Step 2.18 language-toggle.component.spec.ts
  ├── Step 2.19 password-input.component.spec.ts
  ├── Step 2.20 login.page.spec.ts
  ├── Step 2.21 register.page.spec.ts
  ├── Step 2.22 dashboard sub-components
  ├── Step 2.23 task-item.component.spec.ts
  ├── Step 2.24 task-form.component.spec.ts
  └── Step 2.25 admin-panel.page.spec.ts
Phase 3 (backend integration — full NestJS app context)
  ├── Step 3.1  auth.e2e-spec.ts
  ├── Step 3.2  project.e2e-spec.ts
  ├── Step 3.3  task.e2e-spec.ts
  └── Step 3.4  admin.e2e-spec.ts
```

### Complete file manifest (56+ new files):

**Config files (4):**
```
backend/jest.config.ts
tsconfig.backend.spec.json
frontend/jest.config.ts
frontend/setup-jest.ts
```

**Backend test files (16):**
```
backend/src/app.service.spec.ts
backend/src/app.controller.spec.ts
backend/src/auth/auth.service.spec.ts
backend/src/auth/auth.controller.spec.ts
backend/src/auth/jwt.strategy.spec.ts
backend/src/auth/roles.guard.spec.ts
backend/src/task/task.service.spec.ts
backend/src/task/task.controller.spec.ts
backend/src/project/project.service.spec.ts
backend/src/project/project.controller.spec.ts
backend/src/admin/admin.service.spec.ts
backend/src/admin/admin.controller.spec.ts
backend/test/auth.e2e-spec.ts
backend/test/project.e2e-spec.ts
backend/test/task.e2e-spec.ts
backend/test/admin.e2e-spec.ts
```

**Frontend test files (36+):**
```
frontend/src/app/shared/services/theme.spec.ts
frontend/src/app/shared/services/language.spec.ts
frontend/src/app/shared/pipes/jalali-date.spec.ts
frontend/src/app/shared/pipes/translate.spec.ts
frontend/src/app/shared/forms/task.spec.ts
frontend/src/app/shared/components/button.spec.ts
frontend/src/app/shared/components/input.spec.ts
frontend/src/app/shared/components/card.spec.ts
frontend/src/app/shared/components/textarea.spec.ts
frontend/src/app/shared/components/form.spec.ts
frontend/src/app/shared/components/theme-toggle.spec.ts
frontend/src/app/shared/components/language-toggle.spec.ts
frontend/src/app/shared/components/confirm-dialog.spec.ts
frontend/src/app/shared/components/confirm-bottom-sheet.spec.ts
frontend/src/app/shared/components/task-item.spec.ts
frontend/src/app/shared/components/task-form.spec.ts
frontend/src/app/core/guards/auth.guard.spec.ts
frontend/src/app/core/interceptors/auth.interceptor.spec.ts
frontend/src/app/features/auth/services/auth.spec.ts
frontend/src/app/features/auth/store/auth.spec.ts
frontend/src/app/features/auth/pages/login.spec.ts
frontend/src/app/features/auth/pages/register.spec.ts
frontend/src/app/features/auth/components/password-input.spec.ts
frontend/src/app/features/dashboard/services/dashboard.spec.ts
frontend/src/app/features/dashboard/store/dashboard.spec.ts
frontend/src/app/features/dashboard/components/pagination.spec.ts
frontend/src/app/features/dashboard/components/project-filter.spec.ts
frontend/src/app/features/dashboard/components/status-filter.spec.ts
frontend/src/app/features/dashboard/components/search-input.spec.ts
frontend/src/app/features/dashboard/components/task-list.spec.ts
frontend/src/app/features/dashboard/components/project-list.spec.ts
frontend/src/app/features/dashboard/components/project-edit-dialog.spec.ts
frontend/src/app/features/dashboard/components/project-delete-confirm.spec.ts
frontend/src/app/features/admin/services/admin.spec.ts
frontend/src/app/features/admin/store/admin.spec.ts
frontend/src/app/features/admin/pages/admin-panel.spec.ts
frontend/src/app/features/task-details/pages/task-details.spec.ts
```

**Total: ~56 new files (4 config + 16 backend tests + 36+ frontend tests)**

---

## Key Mocking Strategies

| Context | Mock approach |
|---|---|
| **Backend services** (Pg Pool) | `jest.fn()` on `pool.query`, `pool.connect` |
| **Backend guards** | Mock `Reflector`, mock `ExecutionContext` |
| **Backend integration** | `@nestjs/testing` `Test.createTestingModule`, real NestJS app |
| **Frontend services** (HttpClient) | `HttpTestingController` from `@angular/common/http/testing` |
| **Frontend stores** | Mock service injected via `TestBed`, return `of()` / `throwError()` |
| **Frontend guards/interceptors** | Mock `AuthStore` via `TestBed` injection token |
| **Frontend components** | `TestBed.configureTestingModule`, mock stores/services |
| **localStorage** | `jest.spyOn(Storage.prototype, 'getItem')` / `setItem` |
| **document** | `jest.spyOn(document.documentElement.classList, ...)` |
