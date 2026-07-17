# Plan: `/profile` Route — Checklist

## Overview

A user profile page at `/profile` showing user information (name, email, role) with editable name/email and self-service password change. Admin panel style layout. Auto re-login after profile update (new JWT). Future: profile image.

---

## Backend

### 1. Create `backend/src/profile/profile.dto.ts`
- [ ] `UpdateProfileDto` — `name?: string` (1-100), `email?: string` (isEmail), `currentPassword: string` (required)
- [ ] `ChangePasswordDto` — `currentPassword: string`, `newPassword: string` (min 6, max 128)

### 2. Create `backend/src/profile/profile.service.ts`
- [ ] Inject `DATABASE` (Pool) and `JwtService`
- [ ] `getProfile(userId)` — `SELECT id, email, name, role FROM users WHERE id = $1`
- [ ] `updateProfile(userId, name?, email?, currentPassword)` — verify current password via bcrypt, check email uniqueness if changed, update row, return new JWT + user
- [ ] `changePassword(userId, currentPassword, newPassword)` — verify current password, hash new, update row, return `{ success: true }`

### 3. Create `backend/src/profile/profile.controller.ts`
- [ ] `@Controller('profile')` with `@ApiTags('profile')`
- [ ] `GET /profile/me` — returns current user profile (uses `@Request()` to get `user.id` from JWT)
- [ ] `PATCH /profile/me` — update name/email (requires `currentPassword`), returns `{ token, user }`
- [ ] `PATCH /profile/me/password` — change password (requires `currentPassword`), returns `{ success: true }`

### 4. Create `backend/src/profile/profile.module.ts`
- [ ] Import `DatabaseModule`, `AuthModule` (for JwtModule/JwtService)
- [ ] Register `ProfileController`, `ProfileService`

### 5. Edit `backend/src/app.module.ts`
- [ ] Add `ProfileModule` to imports array

---

## Frontend

### 6. Create `frontend/src/app/features/profile/services/profile.ts`
- [ ] `ProfileService` — `@Injectable({ providedIn: 'root' })`
- [ ] `getMe()` → `GET http://localhost:3000/profile/me`
- [ ] `updateProfile(dto)` → `PATCH http://localhost:3000/profile/me`
- [ ] `changePassword(dto)` → `PATCH http://localhost:3000/profile/me/password`

### 7. Create `frontend/src/app/features/profile/forms/profile-form.ts`
- [ ] `ProfileFormService` — reactive form with `name` and `email` fields
- [ ] `patchFromUser(user)` method to pre-fill from `AuthStore.user()`
- [ ] `resetForm()` method

### 8. Create `frontend/src/app/features/profile/forms/change-password-form.ts`
- [ ] `ChangePasswordFormService` — reactive form with `currentPassword`, `newPassword`, `confirmPassword`
- [ ] `matchPasswords` cross-field validator
- [ ] `resetForm()` method

### 9. Edit `frontend/src/app/features/auth/store/auth.ts`
- [ ] Add `updateSession(response: AuthResponseModel)` method to `withMethods`:
  ```ts
  const updateSession = (response: AuthResponseModel) => {
    localStorage.setItem('token', response.token);
    patchState(store, { token: response.token, user: response.user });
  };
  ```
- [ ] Export it in the return object: `{ login, register, logout, restoreSession, updateSession }`

### 10. Create `frontend/src/app/features/profile/pages/profile.ts`
- [ ] `ProfileComponent` — standalone, no store (injects `AuthStore` + `ProfileService` directly)
- [ ] Admin panel style layout: sticky header (back button, title, role badge, lang/theme toggles, logout) + `<main>` content
- [ ] Two `<app-card>` sections:
  1. **Profile Information** — role badge (read-only), name input, email input, Save button
  2. **Change Password** — current password, new password, confirm password inputs, Save button
- [ ] `ngOnInit`: load user from `AuthStore`, pre-fill profile form
- [ ] `saveProfile()`: call `ProfileService.updateProfile()`, on success call `auth.updateSession(response)`
- [ ] `savePassword()`: call `ProfileService.changePassword()`, on success reset form + show message
- [ ] Success/error messages using `signal<string>` (same pattern as admin panel)

### 11. Create `frontend/src/app/features/profile/index.ts`
- [ ] Barrel export for `ProfileComponent`

### 12. Edit `frontend/src/app/main.route.ts`
- [ ] Add route before wildcard `**`:
  ```ts
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/pages/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  }
  ```

### 13. Edit `frontend/src/app/i18n/en.json`
- [ ] Add keys: `profile`, `profileInformation`, `updateProfile`, `profileUpdated`, `couldNotUpdateProfile`, `currentPassword`, `passwordChanged`, `couldNotChangePassword`, `incorrectCurrentPassword`

### 14. Edit `frontend/src/app/i18n/fa.json`
- [ ] Add corresponding Persian translations for all new keys

---

## File Summary

| # | File | Action |
|---|------|--------|
| 1 | `backend/src/profile/profile.dto.ts` | **Create** |
| 2 | `backend/src/profile/profile.service.ts` | **Create** |
| 3 | `backend/src/profile/profile.controller.ts` | **Create** |
| 4 | `backend/src/profile/profile.module.ts` | **Create** |
| 5 | `backend/src/app.module.ts` | **Edit** — add ProfileModule |
| 6 | `frontend/src/app/features/profile/services/profile.ts` | **Create** |
| 7 | `frontend/src/app/features/profile/forms/profile-form.ts` | **Create** |
| 8 | `frontend/src/app/features/profile/forms/change-password-form.ts` | **Create** |
| 9 | `frontend/src/app/features/auth/store/auth.ts` | **Edit** — add updateSession |
| 10 | `frontend/src/app/features/profile/pages/profile.ts` | **Create** |
| 11 | `frontend/src/app/features/profile/index.ts` | **Create** |
| 12 | `frontend/src/app/main.route.ts` | **Edit** — add /profile route |
| 13 | `frontend/src/app/i18n/en.json` | **Edit** — add profile keys |
| 14 | `frontend/src/app/i18n/fa.json` | **Edit** — add profile keys |

**Total: 9 new files, 5 edits**

---

## Implementation Order

1. Backend DTOs + Service + Controller + Module (files 1-4)
2. Register module in AppModule (file 5)
3. Frontend service + form services (files 6-8)
4. Auth store updateSession method (file 9)
5. Profile page component (file 10)
6. Barrel export + routing (files 11-12)
7. i18n keys (files 13-14)
8. Run `npm run lint` and `npm run build` to verify

---

## Design Decisions

- **No store for profile page** — self-contained, injects AuthStore directly
- **Auto re-login** — backend returns new JWT after name/email change, frontend updates seamlessly
- **Current password required** for both profile update and password change
- **Role displayed as read-only badge** — same styling as admin panel
- **Admin panel style layout** — sticky header with back/title/role/toggles/logout
- **Future-proof** — card-based layout makes it easy to add avatar section later
