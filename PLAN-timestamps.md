# Plan: Add Creation & Modification Timestamps

## Current State

| Entity | DB Columns | Shared Model | Frontend Display |
|---|---|---|---|
| **Tasks** | Already has `"createdAt"`, `"updatedAt"` | Already includes both fields | NOT displayed |
| **Projects** | Only `id`, `name` | Only `id`, `name` | N/A |

## Goal

- Store Gregorian timestamps in the database (already done for tasks, to be added for projects)
- Display timestamps in Jalali (Persian calendar) in the frontend
- Show creation time on all items; additionally show modification time only when it differs from creation time

---

## Phase 1: Backend — Add timestamps to Projects

### 1.1 Database schema

**File:** `backend/src/shared/database/database.provider.ts`

- Add `"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP` and `"updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP` to the `projects` CREATE TABLE statement
- Add defensive `ALTER TABLE projects ADD COLUMN IF NOT EXISTS` statements (same pattern used for the `tasks` table's `position` column)

### 1.2 Shared model

**File:** `shared/types/project.ts`

- Add `readonly createdAt: string` and `readonly updatedAt: string` to `ProjectModel`

### 1.3 Project service

**File:** `backend/src/project/project.service.ts`

- `findAll()`: `SELECT id, name, "createdAt", "updatedAt" FROM projects ORDER BY id`
- `findOne()`: same columns
- `create()`: INSERT returns `"createdAt", "updatedAt"`
- `update()`: append `"updatedAt" = CURRENT_TIMESTAMP` to the SET clause

---

## Phase 2: Frontend — Jalali date pipe

### 2.1 Install dependency

```bash
npm install jalaali-js
```

### 2.2 Create pipe

**New file:** `frontend/src/app/shared/pipes/jalali-date.ts`

- Standalone `JalaliDatePipe` implementing `PipeTransform`
- Accepts an ISO date string, converts to Jalali using `jalaali-js`
- Output format: `YYYY/MM/DD HH:mm` (e.g., `1405/04/15 14:30`)

### 2.3 Export pipe

**File:** `frontend/src/app/shared/index.ts`

- Add export for `JalaliDatePipe`

---

## Phase 3: Frontend — Display timestamps

### 3.1 i18n keys

**Files:** `frontend/src/app/i18n/en.json`, `fa.json`

- Add keys:
  - `created`: `"Created"` / `"ایجاد شده"`
  - `modified`: `"Modified"` / `"ویرایش شده"`

### 3.2 Task list component

**File:** `frontend/src/app/features/dashboard/components/task-list.ts`

- Import `JalaliDatePipe`
- Below the task description/status area, render:
  - Created timestamp with `t('created')` label (always shown)
  - Modified timestamp with `t('modified')` label (shown only when `updatedAt !== createdAt`)
- Style: small muted text (`text-xs text-slate-400 dark:text-slate-500`)

### 3.3 Dashboard page — project list

**File:** `frontend/src/app/features/dashboard/pages/dashboard.ts`

- Same pattern for project list items:
  - Always show created timestamp
  - Conditionally show modified timestamp when `updatedAt !== createdAt`

---

## Phase 4: Verify

- Run `npm run lint`
- Run `npm run build`

---

## Files Summary

| File | Change |
|---|---|
| `backend/src/shared/database/database.provider.ts` | Add timestamp columns to `projects` table |
| `shared/types/project.ts` | Add `createdAt`, `updatedAt` to `ProjectModel` |
| `backend/src/project/project.service.ts` | Update SQL to include timestamps |
| `package.json` | Add `jalaali-js` dependency |
| `frontend/src/app/shared/pipes/jalali-date.ts` | **NEW** — Jalali date pipe |
| `frontend/src/app/shared/index.ts` | Export pipe |
| `frontend/src/app/i18n/en.json` | Add `created`, `modified` keys |
| `frontend/src/app/i18n/fa.json` | Add `created`, `modified` keys |
| `frontend/src/app/features/dashboard/components/task-list.ts` | Display timestamps on task cards |
| `frontend/src/app/features/dashboard/pages/dashboard.ts` | Display timestamps on project items |
