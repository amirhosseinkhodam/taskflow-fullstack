# Coding Conventions

Reusable coding standards and patterns. Adapt to your framework and team preferences.

---

## 1. Naming Conventions

### Files
- **Components/Classes**: PascalCase — `UserProfileComponent`, `AuthService`
- **Services/Utils**: camelCase — `auth.service.ts`, `date.utils.ts`
- **Models/Types**: PascalCase with `Model` suffix — `UserModel`, `TaskModel`
- **Tests**: Match the source file name — `auth.service.spec.ts`

### Variables and Functions
- **Variables/functions**: camelCase — `currentUser`, `getUserById()`
- **Constants**: camelCase (already immutable by `const`) — `apiBaseUrl`, `maxRetries`
- **Boolean variables**: Use `is`, `has`, `should`, `can` prefixes — `isLoading`, `hasPermission`
- **Event handlers**: `on` prefix — `onClick()`, `onSubmit()`

### Interfaces vs Types
- Use `interface` for object shapes — `interface User { id: number; name: string }`
- Use `type` only for unions/enums — `type Status = 'active' | 'inactive'`
- Append `Model` suffix for DTOs and API response types
- Never use `any` or `unknown` as a field type — use specific types or `unknown` with narrowing
- All interfaces and types live in `models/` directories — never inside components, services, or stores

---

## 2. File Structure

### Component File (Single Responsibility)
```ts
// component-name.ts — single file, no external templates
import { Component } from '@angular/core';

@Component({
  selector: 'app-component-name',
  standalone: true,
  template: `...`,
})
export class ComponentNameComponent {
  // inputs, outputs, class logic
}
```

### Service File
```ts
// feature.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureService {
  readonly #http = inject(HttpClient);

  getData(): Observable<Data[]> {
    return this.#http.get<Data[]>('/api/data');
  }
}
```

### Model File
```ts
// feature.model.ts
export interface FeatureModel {
  readonly id: number;
  readonly name: string;
  readonly createdAt: string;
}
```

---

## 3. Import Order

Organize imports in groups, separated by blank lines:

1. **Framework core** — `@angular/core`, `@nestjs/common`
2. **Third-party** — `@ngrx/signals`, `rxjs`, `bcryptjs`
3. **Internal shared** — `../../../shared/services/theme`
4. **Internal feature** — `../store/auth`, `./login.form.service`
5. **Types** — `import type { X } from '...'` (always last)

---

## 4. TypeScript Hygiene

- **No `any`** — use `unknown` and narrow with type guards
- **No `private` keyword** — use `#` prefix for true private fields
- **`readonly` on all immutable properties** — interfaces, DTOs, injected services
- **Remove dead code** — no unused imports, variables, or methods
- **Use `interface`** instead of `type` for object shapes

---

## 5. Function Patterns

### Prefer Named Functions Over Anonymous Callbacks
```ts
// ✅ Good
const items = data.map(formatItem);

// ❌ Avoid
const items = data.map((item) => {
  return { ...item, formatted: true };
});
```

### Early Returns Over Nested Ifs
```ts
// ✅ Good
function processUser(user: UserModel | null): string {
  if (!user) return 'anonymous';
  if (!user.name) return 'unnamed';
  return user.name;
}

// ❌ Avoid
function processUser(user: UserModel | null): string {
  if (user) {
    if (user.name) {
      return user.name;
    } else {
      return 'unnamed';
    }
  } else {
    return 'anonymous';
  }
}
```

---

## 6. Error Handling

- Use specific error types, not generic `Error`
- Log errors with context, not just the message
- Provide actionable error messages to users
- Never swallow errors silently

```ts
// ✅ Good
try {
  await saveData(data);
} catch (error) {
  console.error('Failed to save data:', { data, error });
  this.message.set('Could not save. Please try again.');
}
```

---

## 7. Comments

- **Don't comment obvious code** — the code should be self-documenting
- **Do comment "why"** — explain non-obvious decisions, workarounds, or business rules
- **Use TODO sparingly** — always include who/when to revisit: `// TODO(amirhossein, 2026-07): revisit after API v2`

---

## 8. Git Conventions

### Commit Messages
- Use imperative mood: "Add feature" not "Added feature"
- Keep subject line under 72 characters
- Reference issues: `Fix login redirect (#42)`

### Branch Naming
- `feature/<name>` — new features
- `fix/<name>` — bug fixes
- `refactor/<name>` — code refactoring
- `docs/<name>` — documentation changes

---

## 9. Code Review Checklist

- [ ] No unused imports or variables
- [ ] No `any` types without justification
- [ ] Error handling is present and meaningful
- [ ] No hardcoded values (use constants or config)
- [ ] Tests cover the happy path and edge cases
- [ ] Accessibility considerations addressed
- [ ] No secrets or credentials in code
