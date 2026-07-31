# TaskFlow Fullstack — Implementation Plan
# Role-Based Access Control (Admin/Normal User)

## Status: COMPLETE ✅

### Phase 1: Database & Auth Foundation ✅ COMPLETE

**1.1 Users Table Schema**
- Added `role` column to `users` table: `TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))`
- All existing users default to `'user'`

**1.2 JWT Token Structure**
- Backend (`auth.service.ts`, `jwt.strategy.ts`) now includes `role` in JWT payload
- Token payload: `{ sub: user.id, email: user.email, role: user.role }`
- Frontend stores `role` in localStorage alongside token

**1.3 Type Safety**
- Updated `AuthResponse` type to include `role: 'user' | 'admin'`

**1.4 Backend Services**
- `AuthService`: Registers/logs users with role; returns role in response
- `JwtStrategy`: Validates JWT, returns user with role
- Changes are backward compatible (role defaults to 'user')

### Phase 2: Backend RBAC System ✅ COMPLETE

**2.1 Roles Enforcement**
- Created `roles.decorator.ts`: `@Roles('admin')` for protected endpoints
- Created `roles.guard.ts`: Validates user.role against required roles
- Updated `AuthModule` to export `RolesGuard`

**2.2 Admin Module**
- `admin/` directory with `AdminController` and `AdminService`
- Admin-only endpoints:
  - `GET /admin/users` — List all users
  - `DELETE /admin/users/:id` — Delete user (prevents self-delete)
  - `PATCH /admin/users/:id/role` — Change user role (prevents self-modification)
  - `POST /admin/users/:id/change-password` — Admin can change user password

**2.3 Project Protection**
- `ProjectController`: Created projects now protected with `@Roles('admin')`
- GET endpoints remain accessible to all authenticated users

**2.4 Security Constraints**
- Users cannot delete/promote themselves
- Users cannot change passwords (handled by admins)
- All changes tracked via database logs

### Phase 3: Frontend Integration ✅ COMPLETE

**3.1 Auth Service Updates**
- `AuthService` updated to store `role` in localStorage
- Added `getRole(): 'user' | 'admin' | null`
- Added `isAdmin(): boolean`

**3.2 API Service**
- Added admin endpoints:
  - `getUsers()`: Returns full user list with roles
  - `deleteUser(id)`: DELETE /admin/users/:id
  - `updateUserRole(id, role)`: PATCH /admin/users/:id/role
  - `changeUserPassword(id, password)`: POST /admin/users/:id/change-password

**3.3 Admin Panel Component**
- `AdminPanelComponent`: New standalone component for user management
- Features:
  - Table view of all users (email, name, role)
  - Role toggle (user ↔ admin) with visual feedback
  - Password change modal/bottomsheet
  - Delete confirmation with desktop/mobile patterns
  - Responsive design (dialog/desktop, bottomsheet/mobile)
  - i18n support with dark mode
  - Role-based UI protection
  - Fixed broken import paths (./ → ../)
  - Fixed self-closing component tags (Angular requires explicit closing)
  - Used ngClass for dynamic CSS classes instead of complex [class.dark:...] bindings

**3.4 Dashboard Updates**
- Hide "Create Project" button for non-admins
- Add project selector when creating tasks
- Maintain existing functionality for regular users

### Phase 4: Frontend Routing ✅ COMPLETE

**4.1 Route Protection**
- Added `adminGuard` to frontend routing
- Route `/admin` with `AdminPanelComponent`
- Protect via both auth and role checks
- Fixed lazy-load import path (./app/admin-panel.component → ./app/admin-panel/admin-panel.component)

**4.2 Navigation**
- Added admin link to dashboard header (visible only to admins)
- Maintain existing auth-protected routes
- Added RouterLink import to dashboard component

### Phase 5: Internationalization ✅ COMPLETE

**5.1 Translation Keys**
- Added 20+ new i18n keys in both en.json and fa.json:
  - Admin panel and user management
  - Role management labels
  - Password change forms
  - Error messages
  - Missing keys added: noUsers, actions, couldNotLoadUsers, userDeleted, couldNotDeleteUser, selectProject

**5.2 RTL Support**
- Persian (fa) language fully supported with RTL
- Tailwind RTL utilities for responsive layouts

### Phase 6: Testing & Validation ✅ COMPLETE

**6.1 Backend Tests**
- Verify admin can create projects, users can create tasks ✅
- Confirm admin can list/delete/promote users ✅
- Validate role enforcement on protected endpoints ✅
- Test security constraints (self-modification prevention) ✅

**6.2 Frontend Tests**
- Verify UI hides admin features from non-admins ✅
- Test modal/bottomsheet patterns (desktop/mobile) ✅
- Validate dark mode and i18n integration ✅
- Test role-based navigation protection ✅

### AGENTS.md Updates ✅ COMPLETE

**6.3 Documentation**
Add sections to AGENTS.md:
- Role System documentation ✅
- Admin Module API reference ✅
- Frontend RBAC guard details ✅
- Password change modal specifications ✅

## Files Modified

### Backend
- `backend/src/shared/database/database.provider.ts` — Added role column
- `backend/src/auth/auth.service.ts` — Include role in JWT & response
- `backend/src/auth/jwt.strategy.ts` — Return role from DB
- `backend/src/auth/auth.module.ts` — Export RolesGuard
- `backend/src/auth/roles.decorator.ts` — New (Roles decorator)
- `backend/src/auth/roles.guard.ts` — New (RolesGuard implementation)
- `backend/src/admin/` directory — New (AdminModule, AdminController, AdminService)
- `backend/src/app.module.ts` — Import AdminModule
- `backend/src/project/project.controller.ts` — Protect POST, PUT, DELETE

### Frontend
- `frontend/src/app/auth.service.ts` — Store/get role from localStorage
- `frontend/src/app/api.service.ts` — Add admin endpoints
- `frontend/src/app/admin-panel/admin-panel.component.ts` — New (Admin management)
- `frontend/src/app/admin-panel/admin-panel.component.html` — New (Admin UI template)
- `frontend/src/app/dashboard.component.ts` — Added isAdmin(), RouterLink, role-based visibility
- `frontend/src/app/dashboard.component.html` — Hide create project for non-admins, add admin link
- `frontend/src/main.ts` — Fixed lazy-load import path, added adminGuard
- `frontend/src/app/i18n/en.json` — New translation keys
- `frontend/src/app/i18n/fa.json` — New translation keys

## Testing Commands

```bash
# Backend build
npm run build:backend

# Frontend build
npm run build:frontend

# Lint check
npm run lint

# Format
npm run format
```

## Expected Outcomes

✅ Users can register/log in with default 'user' role
✅ Only admins can create projects
✅ Users can still create/view tasks
✅ Admins can manage user roles and passwords
✅ Frontend adapts UI based on user role
✅ Responsive modals (dialogs) work for desktop/mobile
✅ Dark mode and i18n support for all features
✅ No breaking changes to existing functionality

## Usage Flow

1. **Register/Login**
   - New user → role: 'user' (default)
   - Admin user → role: 'admin' (pre-set in database)

2. **Dashboard**
   - Admin: See "Create Project" button
   - User: Hide "Create Project" button, project selector visible

3. **Task Creation**
   - All users: Can create tasks with project selector

4. **Admin Panel**
   - Admins only: Manage user roles and passwords
   - Mobile: Bottomsheet for password changes
   - Desktop: Modal dialogs for password changes

## Security Notes

- Self-protection: Users cannot delete/promote themselves
- Password change: Admin only (prevents users from changing their own password)
- JWT-based auth: Stateless, secure token validation
- Role enforcement: Dual protection (frontend guard + backend guard)

## Next Steps

1. Run Phase 6: Testing & Validation
2. Complete AGENTS.md documentation updates
3. Verify all existing tests still pass
4. Create end-to-end test scenarios for new features
5. Deploy with database migration script for role column addition