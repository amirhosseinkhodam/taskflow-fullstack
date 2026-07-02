# Migration Plan: NgRx + SignalStore Integration

## Overview

Migrate the frontend from ad-hoc component state to a structured architecture using:
- **@ngrx/store + @ngrx/effects** for global auth state (root-level)
- **@ngrx/signals (SignalStore)** for feature-scoped state (component-level)

## Conventions

| Convention | Detail |
|---|---|
| **Auth store** | Root-level NgRx (`@ngrx/store` + `@ngrx/effects`). Provided in `main.ts` via `provideStore()`. |
| **Feature stores** | Component-level `@ngrx/signals` `signalStore()`. Injected per-component, destroyed with component. |
| **Directory structure** | Feature folders under `features/` with `store/`, `pages/`, `components/`, `services/`, `models/` as needed. |
| **Barrel exports** | Each feature folder has `index.ts` re-exporting public API. |
| **Shared code** | Small utilities, pipes, components that don't belong to a feature go in `shared/`. |

## Target Directory Structure

```
frontend/src/app/
├── features/
│   ├── auth/
│   │   ├── store/
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.reducer.ts
│   │   │   ├── auth.effects.ts
│   │   │   ├── auth.selectors.ts
│   │   │   └── auth.state.ts
│   │   ├── pages/
│   │   │   ├── login.component.ts
│   │   │   └── register.component.ts
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── store/
│   │   │   └── dashboard.store.ts
│   │   ├── pages/
│   │   │   └── dashboard.component.ts (+ .html)
│   │   └── index.ts
│   └── admin/
│       ├── store/
│       │   └── admin.store.ts
│       ├── pages/
│       │   └── admin-panel.component.ts (+ .html)
│       └── index.ts
├── shared/
│   ├── components/
│   │   ├── theme-toggle.component.ts
│   │   ├── language-toggle.component.ts
│   │   ├── confirm-dialog.component.ts
│   │   └── confirm-bottom-sheet.component.ts
│   ├── services/
│   │   ├── theme.service.ts
│   │   └── language.service.ts
│   ├── pipes/
│   │   └── translate.pipe.ts
│   └── models/
├── core/
│   ├── services/
│   │   └── api.service.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   └── guards/
│       ├── auth.guard.ts
│       └── admin.guard.ts
└── app.component.ts
```

## Steps

### Step 1: Install Packages
```bash
npm install @ngrx/signals @ngrx/store @ngrx/effects @ngrx/store-devtools
```

### Step 2: Extend AGENTS.md with Store Conventions
Add store architecture conventions section to AGENTS.md.

### Step 3: Create Feature Directory Structure
Create `features/`, `shared/`, `core/` folder layout with barrel exports.

### Step 4: Migrate Auth to Root-Level NgRx Store
- Create `auth.actions.ts`, `auth.reducer.ts`, `auth.effects.ts`, `auth.selectors.ts`, `auth.state.ts`
- Update `main.ts` with `provideStore()` and `provideEffects()`
- Refactor guards and interceptor to use store selectors
- Refactor Login/Register components to dispatch actions

### Step 5: Migrate Dashboard to Component-Level SignalStore
- Create `dashboard.store.ts` with `signalStore()`
- Refactor DashboardComponent to inject and use the store

### Step 6: Migrate Admin to Component-Level SignalStore
- Create `admin.store.ts` with `signalStore()`
- Refactor AdminPanelComponent to inject and use the store

### Step 7: Move Shared Components/Services
- Move theme/language toggles, confirm dialogs to `shared/components/`
- Move theme/language services to `shared/services/`
- Move translate pipe to `shared/pipes/`
- Move api.service.ts to `core/services/`

### Step 8: Update Routing & Imports
- Update `main.ts` routes to use barrel exports
- Fix all import paths

### Step 9: Verify
- `npm run lint`
- `npm run build:frontend`
- Manual testing
