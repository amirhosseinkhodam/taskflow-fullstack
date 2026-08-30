# ADR-0002: Use NgRx SignalStore for Feature State

## Status

Accepted

## Context

TaskFlow needs state management for feature-level state (dashboard, admin, auth). The options considered were:

1. **NgRx SignalStore** — Signal-based state management with `withState()`, `withComputed()`, `withMethods()`.
2. **NgRx Store** — Traditional Redux-style state management with actions, reducers, effects.
3. **Component stores** — Simple Angular services with signals.
4. **RxJSBehaviorSubject** — Manual state management with observables.

## Decision

Use `@ngrx/signals` `signalStore()` for feature state.

## Consequences

### Easier

- Simpler API than traditional NgRx Store.
- Signal-based reactivity (no manual subscriptions).
- Less boilerplate (no actions, reducers, effects).
- Easy to test (pure functions, predictable state).

### Harder

- Newer API, less community resources.
- No time-travel debugging (DevTools support limited).
- Manual side effect handling (no built-in effects).

### Trade-offs

- **NgRx Store**: More structure, but more boilerplate. Good for large teams.
- **SignalStore**: Less structure, but less boilerplate. Good for small teams.
- **Component Stores**: Simple, but no shared state across components.
- **BehaviorSubject**: Manual, error-prone, no devtools.

## Alternatives Considered

- **NgRx Store**: Rejected due to boilerplate overhead for a small app.
- **Component Stores**: Considered but shared state needed across features.
- **BehaviorSubject**: Rejected due to manual subscription management.

## Notes

- Auth store uses `{ providedIn: 'root' }` for shared access by guards/interceptor.
- Dashboard and admin stores are component-level (provided per component).
- All async workflows use `rxMethod` with `tapResponse` from `@ngrx/operators`.
