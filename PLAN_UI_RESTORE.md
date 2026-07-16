# Plan: Restore Original UI Appearance

## Goal
Keep custom elements. Fix their flexibility so each feature can reproduce its original appearance. Feature-by-feature restoration, starting with Login.

## Root Causes of Visual Drift

1. **FormComponent changed spacing model**: `space-y-4` → `flex flex-col gap-4`
2. **ButtonComponent always adds focus ring**: `focus:ring-2 focus:ring-slate-500 focus:ring-offset-2` on ALL buttons (original had none)
3. **ButtonComponent `icon` variant conflicts with `cssClass`**: `p-2` from variant vs `p-0` from cssClass — Tailwind can't reliably resolve
4. **InputComponent hardcodes `text-sm`**: Original Login/Register inputs had no `text-sm` (16px default)

---

## Phase 1: Custom Element Fixes

### 1.1 ButtonComponent — Make focus ring optional
- Add `focusRing = input<boolean>(false)`
- Default `false` matches original (no focus ring)
- Dialogs/modals can opt in with `[focusRing]="true"`

### 1.2 ButtonComponent — Fix icon variant
- Remove `p-2 rounded-lg` from icon variant (consumers control via cssClass)
- Icon variant should only set color/hover behavior

### 1.3 InputComponent — Remove hardcoded text-sm
- Remove `text-sm` from base class
- Restores browser-default 16px text
- Features needing 14px can add `[cssClass]="'text-sm'"`

### 1.4 FormComponent — Restore space-y-4
- Change base from `flex flex-col gap-4` back to `space-y-4`

---

## Phase 2: Login/Register Restoration

### login.ts
- `max-w-sm` → `max-w-md`
- Header `mb-3 gap-5` → `mb-6`
- Subtitle: remove `text-sm`
- Error: `py-3` → `py-2`
- Form: add `[cssClass]="'p-8'"`
- Button: add `mt-6` via cssClass
- Register link: add `mt-4`

### register.ts
Same pattern as login.

---

## Phase 3: Other Features (after approval)
- Dashboard, Task Form, Task Item, Task Details, Project List, Pagination, Search Input, Admin Panel, Confirm Dialogs
