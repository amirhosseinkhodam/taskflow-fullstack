# Migration Plan: base-angular-template improvements → TaskFlow

> Comparing `angular-base-template` at `/home/amirhosseinkdm/Documents/angular-base-template`
> with `taskflow-fullstack` at `/home/amirhosseinkdm/Documents/taskflow-fullstack`.

---

## 1. Package Cleanup & Additions

### Remove (unused)
- `@prisma/client` — project uses raw `pg`, not Prisma
- `prisma` — CLI for unused ORM
- `postgres` — Postgres.js driver, only `pg` is used

### Add
- `@hugeicons/angular` — icon component wrapper (base template has it, taskflow doesn't)
- `@hugeicons/core-free-icons` — icon SVG definitions (Sun01, Moon02, Translate, Menu01, Cancel01)

### Verify before removing
- `@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools` — check if any store imports them

---

## 2. Configuration Files

### 2.1 `styles.css` → `styles.scss`
- **File**: `frontend/src/styles.css` → rename to `styles.scss`
- **File**: `angular.json` — update `styles` array reference
- **Reason**: AGENTS.md says "no `.css` files allowed"

### 2.2 `index.html` — add Vazirmatn font
- **File**: `frontend/src/index.html`
- Add Google Fonts preconnect + stylesheet link for Vazirmatn
- Matches base template for Persian RTL support

### 2.3 `styles.scss` — add font-family + RTL improvements
- Add `html { font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; }` for both light/dark
- Replace `text-align: right` with `@apply text-right` for RTL inputs

### 2.4 `tailwind.config.js` — add missing design tokens
```js
spacing: { '4.5': '18px' },
minHeight: { 'screen-80': '80vh' },
height: { '98': '24.5rem' },
fontFamily: { vazirmatn: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'] },
```

---

## 3. New Shared Services & Components

### 3.1 NotificationService (NEW)
- **File**: `frontend/src/app/shared/services/notification.ts`
- Signal-based: `show(type, message)`, `dismiss()`, auto-dismiss after 3s
- Uses `NotificationModel` and `NotificationType`

### 3.2 NotificationModel (NEW)
- **File**: `frontend/src/app/shared/models/notification.ts`
- `NotificationType = 'error' | 'success' | 'warning' | 'info'`
- `NotificationModel { message: string; type: NotificationType }`

### 3.3 NotificationComponent (NEW)
- **File**: `frontend/src/app/shared/components/notification.ts`
- Fixed-position toast at top-center, styled per type

### 3.4 Add to AppComponent
- **File**: `frontend/src/app/app.ts`
- Add `<app-notification />` in root template

---

## 4. Component Upgrades

### 4.1 Replace inline SVGs with Hugeicons

| File | Current | Replace with |
|---|---|---|
| `theme-toggle.ts` | inline SVG sun/moon | `Sun01Icon`, `Moon02Icon` via `HugeiconsIconComponent` |
| `language-toggle.ts` | inline SVG globe | `TranslateIcon` via `HugeiconsIconComponent` |
| `page-header.ts` | inline SVG hamburger | `Menu01Icon`, `Cancel01Icon` via `HugeiconsIconComponent` |

### 4.2 Fix button.ts arbitrary values
- **File**: `frontend/src/app/shared/components/button.ts`
- `min-h-[36px]` → `min-h-9`
- `min-h-[40px]` → `min-h-10`
- `min-h-[44px]` → `min-h-11`
- Reason: AGENTS.md bans arbitrary value syntax

### 4.3 ConfirmDialogComponent — use TranslatePipe
- **File**: `frontend/src/app/shared/components/confirm-dialog.ts`
- Remove `LanguageService` injection and `t()` helper
- Import and use `TranslatePipe` in template instead

### 4.4 ConfirmBottomSheetComponent — use TranslatePipe
- **File**: `frontend/src/app/shared/components/confirm-bottom-sheet.ts`
- Same pattern fix as confirm-dialog

---

## 5. Model & Type Extractions

### 5.1 SelectOption → models file
- **New file**: `frontend/src/app/shared/models/select.ts`
- Move `SelectOption` interface from `select.ts`
- Update import in `select.ts`

### 5.2 Language types → models file
- **New file**: `frontend/src/app/shared/models/language.ts`
- Move `Language` type and `LanguageOptionModel` from `language.ts` service
- Update import in `language.ts`

---

## 6. Barrel Exports

### 6.1 Add `shared/index.ts` barrel
- **File**: `frontend/src/app/shared/index.ts` (NEW)
- Re-export components, pipes, forms, const

### 6.2 Fix `shared/components/index.ts`
- Add missing `TaskItemComponent` export

---

## 7. i18n

### 7.1 Add missing keys
Both `en.json` and `fa.json`:
- `"appName"` — needed by NavbarComponent/FooterComponent if used later
- `"allRightsReserved"` — same

---

## 8. Skip (per user decision)

- ~~NavbarComponent~~ — keeping existing PageHeaderComponent
- ~~FooterComponent~~ — not adding footer to TaskFlow

---

## Files Changed Summary

| # | File | Action |
|---|---|---|
| 1 | `package.json` | Remove 3 unused, add 2 hugeicons |
| 2 | `frontend/src/styles.css` | Rename to `.scss` |
| 3 | `angular.json` | Update styles reference |
| 4 | `frontend/src/index.html` | Add Vazirmatn font |
| 5 | `frontend/src/styles.scss` | Font-family + RTL |
| 6 | `frontend/tailwind.config.js` | Add design tokens |
| 7 | `frontend/src/app/shared/services/notification.ts` | NEW |
| 8 | `frontend/src/app/shared/models/notification.ts` | NEW |
| 9 | `frontend/src/app/shared/components/notification.ts` | NEW |
| 10 | `frontend/src/app/shared/models/select.ts` | NEW |
| 11 | `frontend/src/app/shared/models/language.ts` | NEW |
| 12 | `frontend/src/app/shared/index.ts` | NEW |
| 13 | `frontend/src/app/shared/components/theme-toggle.ts` | Hugeicons |
| 14 | `frontend/src/app/shared/components/language-toggle.ts` | Hugeicons |
| 15 | `frontend/src/app/shared/components/page-header.ts` | Hugeicons |
| 16 | `frontend/src/app/shared/components/button.ts` | Fix arbitrary values |
| 17 | `frontend/src/app/shared/components/confirm-dialog.ts` | Use TranslatePipe |
| 18 | `frontend/src/app/shared/components/confirm-bottom-sheet.ts` | Use TranslatePipe |
| 19 | `frontend/src/app/shared/components/select.ts` | Update import |
| 20 | `frontend/src/app/shared/services/language.ts` | Update import |
| 21 | `frontend/src/app/shared/components/index.ts` | Add TaskItemComponent |
| 22 | `frontend/src/app/app.ts` | Add notification component |
| 23 | `frontend/src/app/i18n/en.json` | Add missing keys |
| 24 | `frontend/src/app/i18n/fa.json` | Add missing keys |
