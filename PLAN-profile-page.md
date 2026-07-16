# Plan: Profile Page with Self Password Change

## Context

- **Current state**: No profile page exists. No task assignment feature exists. The `tasks` table has no `assigneeId` column. The admin panel has a password change form (inline, not modal) that uses `PasswordFormService` and calls `POST /admin/users/:id/change-password`. The admin endpoint explicitly rejects self-password-change (`id === requesterId`).
- **User data available**: The `AuthStore` (root-level, `providedIn: 'root'`) holds the logged-in user's `id`, `email`, `name`, `role` from the JWT token. This is accessible everywhere.
- **Reuse target**: The `PasswordFormService` (`frontend/src/app/features/admin/forms/password.ts`) with its `newPassword` + `confirmPassword` fields and `matchPasswords` validator will be **moved to shared** and reused for both admin and self password change.

---

## Phase 1: Task Assignment Feature (Backend + Shared Types)

This is a prerequisite for the profile page to show "tasks assigned to me."

### 1.1 Database Schema — Add `assigneeId` to tasks

**File**: `backend/src/shared/database/database.provider.ts`

Add after the existing `userId` column migration:

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "assigneeId" INTEGER REFERENCES users(id)
```

### 1.2 Shared TaskModel — Add `assigneeId`

**File**: `shared/types/task.ts`

Add `readonly assigneeId?: number | null` and `readonly assigneeName?: string` to `TaskModel`.

### 1.3 Backend Task Service — Include assignee in queries, support assignment on create/update

**File**: `backend/src/task/task.service.ts`

- `findAll()`: LEFT JOIN `users` on `assigneeId` to return `assigneeName`.
- `findOne()`: Same join.
- `create()`: Accept optional `assigneeId` in the insert.
- `update()`: Accept optional `assigneeId` in the update.
- Add a new `getTasksByAssignee(userId)` method for the profile page.

### 1.4 Backend Task Controller — Accept `assigneeId` in POST/PUT bodies

**File**: `backend/src/task/task.controller.ts`

- `POST /tasks`: Add optional `assigneeId` to body.
- `PUT /tasks/:id`: Add optional `assigneeId` to body.

### 1.5 Backend — New endpoint for user's assigned tasks

**File**: `backend/src/task/task.controller.ts`

Add: `GET /tasks/assigned-to-me` (protected by `JwtAuthGuard`) — returns tasks where `assigneeId = req.user.id`.

**File**: `backend/src/task/task.service.ts`

Implement `findByAssignee(userId: number)`.

### 1.6 Frontend Task Model — Update shared type

**File**: `shared/types/task.ts` (already covered in 1.2)

### 1.7 Frontend — Task form component update (for assignee selection)

**File**: `frontend/src/app/shared/components/task-form.ts`

This is out of scope for the profile page itself but needed to actually assign tasks. The task form would need a user selector dropdown. **However**, since the user said "first we should add the feature of assigning task", this should be included but can be a minimal implementation (e.g., a `<select>` or `<app-select>` of users shown only to admins).

---

## Phase 2: Move `PasswordFormService` to Shared

### 2.1 Move form service

**From**: `frontend/src/app/features/admin/forms/password.ts`
**To**: `frontend/src/app/shared/forms/password.ts`

The file stays identical. Update imports in:

- `frontend/src/app/features/admin/store/admin.ts` — change import path
- `frontend/src/app/features/admin/pages/admin-panel.ts` — change import path

### 2.2 Export from barrel

**File**: `frontend/src/app/shared/forms/` — add `password.ts` to a barrel export or import directly.

---

## Phase 3: Backend — Self Password Change Endpoint

The admin endpoint rejects self-change. We need a new endpoint.

### 3.1 New endpoint on Auth controller

**File**: `backend/src/auth/auth.controller.ts`

Add: `POST /auth/change-password` (protected by `JwtAuthGuard`)

Body: `{ currentPassword: string, newPassword: string }`

**File**: `backend/src/auth/auth.service.ts`

Add `changePassword(userId, currentPassword, newPassword)` method:

1. Fetch user by `userId`, verify `currentPassword` matches via `bcrypt.compare`.
2. Validate `newPassword` length >= 6.
3. Hash and update.

**File**: `backend/src/auth/auth.module.ts`

Already exports `AuthService` and `JwtModule`. The controller just needs `JwtAuthGuard` import.

---

## Phase 4: Frontend — Profile Feature

### 4.1 New feature directory structure

```
frontend/src/app/features/profile/
├── pages/
│   └── profile.ts              # ProfileComponent (page)
├── store/
│   └── profile.ts              # ProfileStore (SignalStore)
├── services/
│   └── profile.ts              # ProfileService (HTTP calls)
└── index.ts                    # barrel export
```

### 4.2 ProfileService

**File**: `frontend/src/app/features/profile/services/profile.ts`

```ts
@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getAssignedTasks(userId: number) {
    return this.#http.get<TaskModel[]>(`${this.#apiBaseUrl}/tasks/assigned-to/${userId}`);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.#http.post<void>(`${this.#apiBaseUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }
}
```

### 4.3 ProfileStore

**File**: `frontend/src/app/features/profile/store/profile.ts`

```ts
export const ProfileStore = signalStore(
  withState({ assignedTasks: [], isLoading: false, message: '' }),
  withMethods((store, profileService = inject(ProfileService), passwordForm = inject(PasswordFormService), auth = inject(AuthStore)) => ({
    loadAssignedTasks: rxMethod<void>(...),  // calls profileService.getAssignedTasks(auth.user()!.id)
    changeOwnPassword: rxMethod<void>(...),  // calls profileService.changePassword(...) using passwordForm
    openPasswordDialog: () => { ... },       // opens dialog/bottomsheet
  })),
);
```

The password change flow:

1. User clicks "Change Password" button on profile page.
2. Store's `openPasswordDialog()` checks `isPhone()` signal.
3. Opens `PasswordDialogComponent` (new shared component) or `PasswordBottomSheetComponent` (new shared component).
4. Both components use `PasswordFormService` internally.
5. On submit, store calls `changeOwnPassword()` which calls `ProfileService.changePassword()`.
6. On success, shows message and closes dialog/bottomsheet.

### 4.4 Password Dialog/BottomSheet Components (shared)

**New files**:

- `frontend/src/app/shared/components/password-dialog.ts` — `PasswordDialogComponent` (Material Dialog)
- `frontend/src/app/shared/components/password-bottom-sheet.ts` — `PasswordBottomSheetComponent` (Material BottomSheet)

Both components:

- Inject `PasswordFormService`
- Have a form with `newPassword` + `confirmPassword` fields
- Emit result via `MAT_DIALOG_DATA` / `MatBottomSheetRef`
- Follow the existing `ConfirmDialogComponent` / `ConfirmBottomSheetComponent` pattern

**Alternatively (simpler approach)**: Since the admin panel currently uses an **inline form** (not a dialog), and the user wants the profile page to use a **dialog/bottomsheet**, we should create these new shared components. But we could also just create a single reusable component that renders inside a dialog template.

**Recommended approach**: Create a single `PasswordChangeContentComponent` (shared, in `shared/components/`) that contains the password form UI. Then:

- For desktop: wrap it in a `MatDialog` with `PasswordDialogComponent` as the host.
- For mobile: wrap it in a `MatBottomSheet` with `PasswordBottomSheetComponent` as the host.

Actually, the simplest approach that follows existing patterns: create `PasswordDialogComponent` and `PasswordBottomSheetComponent` that both contain the same form template (duplicated, like `ConfirmDialogComponent` and `ConfirmBottomSheetComponent` are). This keeps each component self-contained.

### 4.5 Profile Page Component

**File**: `frontend/src/app/features/profile/pages/profile.ts`

The page:

- Header with back button, theme toggle, language toggle, logout (same pattern as admin panel).
- Displays user info: name, email, role (from `AuthStore`).
- "Change Password" button that triggers dialog/bottomsheet (same `isPhone()` + `BreakpointObserver` pattern as admin panel).
- Section for "Assigned Tasks" (list of tasks where `assigneeId === user.id`). Initially shows a placeholder or empty state since task assignment isn't built yet.
- Uses `ProfileStore` to load assigned tasks and manage password change.

---

## Phase 5: Routing

### 5.1 Add `/profile` route

**File**: `frontend/src/app/main.route.ts`

Add before the wildcard:

```ts
{
  path: 'profile',
  loadComponent: () =>
    import('./features/profile/pages/profile').then((m) => m.ProfileComponent),
  canActivate: [authGuard],
},
```

### 5.2 Navigation entry point

Add a "Profile" link/button somewhere accessible — likely in the header of the dashboard page, or as a user menu dropdown. The simplest: add a button in the dashboard header that navigates to `/profile`.

---

## Phase 6: i18n

### 6.1 Add translation keys

**Files**: `frontend/src/app/i18n/en.json` and `fa.json`

New keys:

- `profile` — "Profile" / "پروفایل"
- `yourProfile` — "Your Profile" / "پروفایل شما"
- `assignedTasks` — "Assigned Tasks" / "تسک‌های اختصاص‌یافته"
- `noAssignedTasks` — "No tasks assigned to you" / "تسکی به شما اختصاص داده نشده"
- `changeOwnPassword` — "Change Password" / "تغییر رمز عبور"
- `currentPassword` — "Current Password" / "رمز عبور فعلی"
- `incorrectCurrentPassword` — "Current password is incorrect" / "رمز عبور فعلی اشتباه است"
- `passwordChangedSuccessfully` — "Password changed successfully" / "رمز عبور با موفقیت تغییر کرد"
- `couldNotChangeOwnPassword` — "Could not change password" / "نمی‌توان رمز عبور را تغییر داد"
- `assignee` — "Assignee" / "مسئول"
- `unassigned` — "Unassigned" / "بدون مسئول"

---

## File Change Summary

| # | File | Action |
|---|------|--------|
| 1 | `backend/src/shared/database/database.provider.ts` | Add `assigneeId` column migration |
| 2 | `shared/types/task.ts` | Add `assigneeId`, `assigneeName` to `TaskModel` |
| 3 | `backend/src/task/task.service.ts` | Add assignee joins, `findByAssignee()`, accept `assigneeId` in create/update |
| 4 | `backend/src/task/task.controller.ts` | Accept `assigneeId` in POST/PUT, add `GET /tasks/assigned-to-me` |
| 5 | `backend/src/auth/auth.controller.ts` | Add `POST /auth/change-password` |
| 6 | `backend/src/auth/auth.service.ts` | Add `changePassword()` method |
| 7 | `frontend/src/app/features/admin/forms/password.ts` | Move to `shared/forms/password.ts` |
| 8 | `frontend/src/app/features/admin/store/admin.ts` | Update import path |
| 9 | `frontend/src/app/features/admin/pages/admin-panel.ts` | Update import path |
| 10 | `frontend/src/app/shared/components/password-dialog.ts` | **New** — dialog for password change |
| 11 | `frontend/src/app/shared/components/password-bottom-sheet.ts` | **New** — bottomsheet for password change |
| 12 | `frontend/src/app/shared/components/index.ts` | Export new components |
| 13 | `frontend/src/app/features/profile/services/profile.ts` | **New** — HTTP service |
| 14 | `frontend/src/app/features/profile/store/profile.ts` | **New** — SignalStore |
| 15 | `frontend/src/app/features/profile/pages/profile.ts` | **New** — profile page component |
| 16 | `frontend/src/app/features/profile/index.ts` | **New** — barrel export |
| 17 | `frontend/src/app/main.route.ts` | Add `/profile` route |
| 18 | `frontend/src/app/i18n/en.json` | Add new translation keys |
| 19 | `frontend/src/app/i18n/fa.json` | Add new translation keys |

---

## Implementation Order

1. **Phase 1** (Task Assignment) — Backend schema + service + controller + shared types
2. **Phase 2** (Move PasswordFormService) — Quick refactor, no behavior change
3. **Phase 3** (Self Password Change Endpoint) — Backend auth controller + service
4. **Phase 4** (Frontend Profile Feature) — New feature with dialog/bottomsheet
5. **Phase 5** (Routing) — Wire up the route
6. **Phase 6** (i18n) — Can be done alongside Phase 4

---

## Open Questions

1. **Task assignment UI**: Should the task assignment be admin-only (admin assigns tasks to users) or should any user be able to assign? Currently the task form is shared and used in the dashboard.

2. **Profile page header**: Should the profile page have its own header (like admin panel does) or should it reuse the dashboard header with an extra nav link?

3. **Password dialog/bottomsheet**: Should these be brand new shared components, or would you prefer a single reusable component that renders differently based on screen size? (The existing pattern uses separate `ConfirmDialogComponent` and `ConfirmBottomSheetComponent` — I'd follow that.)

4. **"Assigned to me" task list**: Should it show basic task info (title, status, project) as a simple list, or should it be a full-featured table with filtering/pagination like the admin users table?
