# Plan: Replace All Native HTML Elements with Custom Components

## Current State
- **Custom components already exist**: `app-button`, `app-input`, `app-textarea`, `app-form`, `app-card`, `app-password-input`, `app-theme-toggle`, `app-language-toggle`
- **Used in project**: `app-input` (13 places), `app-textarea` (1 place), `app-form` (3 places), `app-button` (recently migrated)

## Remaining Native Elements to Replace

| Native Element | Location | Replacement Needed |
|---|---|---|
| `<form>` (native) | `task-form.ts:19` | Use `<form appForm>` directive |
| `<select>` + `<option>` | `task-form.ts:30-38` | Create `app-select` component |
| `<div class="...">` (card-like) | Multiple places | Use `<app-card>` |

## Components to Create/Enhance

1. **`app-select`** - New component for `<select>`/`<option>` replacement
   - Support `formControlName`, `placeholder`, `options`, `variant`, `disabled`, `cssClass`
   - Emit `selectionChange` event

2. **Enhance `app-form`** - Already exists as attribute directive `[appForm]`, need to ensure it's used properly
   - Currently used as attribute on `<form>` - this is correct per pattern

3. **Enhance `app-card`** - Already exists, need to replace all card-like `<div>` wrappers

## Files to Modify

| File | Changes |
|---|---|
| `shared/components/task-form.ts` | Replace `<form>` → `<form appForm>`, replace `<select>` → `<app-select>` |
| `shared/components/index.ts` | Export new `SelectComponent` |
| `shared/components/select.ts` | **NEW FILE** - Create select component |

## Component Pattern (per AGENTS.md)

All new custom elements must follow:
- **Component syntax only**: `<app-select>` not `<select appSelect>`
- **Native attribute passthrough**: `disabled`, `id`, `aria-label`, `formControlName` as `input()`
- **Content projection**: `<ng-content>`
- **Class-based variants**: `variant`, `size`, `cssClass` with `computedClasses()`
- **Output events**: Aliased names (`selectionChange` → `selectChange`)
- **Signal-based**: `input()`, `output()`, `@if`/`@for` control flow

## Implementation Steps

1. ✅ **Create `app-select` component** in `shared/components/select.ts`
2. ✅ **Export from `shared/components/index.ts`**
3. ✅ **Update `task-form.ts`** to use `<form appForm>` and `<app-select>`
4. ✅ **Replace card-like divs** in `task-details.ts` and `dashboard.ts` with `<app-card>`
5. ✅ **Verify build & lint pass**