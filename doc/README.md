# TaskFlow Fullstack — Documentation

Central documentation hub for the TaskFlow Fullstack project.

## Structure

```
doc/
├── README.md                    ← You are here (master index)
├── WHY.md                       ← Design decisions and rationale
├── DESIGN_SYSTEM.md             ← UI design tokens and component rules
├── SECURITY.md                  ← Security plan and vulnerabilities
├── SECURITY_IMPLEMENTATION_SUMMARY.md
├── TESTING_PLAN.md              ← Complete testing plan
├── PLAN_UI_RESTORE.md           ← UI restoration plan
├── PLAN-profile-page.md         ← Profile page feature plan
├── backend-explained.md         ← Backend explained for frontend devs
├── backend-README.md            ← Backend setup and run instructions
└── frontend-README.md           ← Frontend setup and run instructions
```

## General Guidelines (shared across all projects)

Located at `~/.config/opencode/`:

| File | Description |
|---|---|
| `AGENTS.md` | Main conventions — naming, file structure, TypeScript, forms, components, Angular syntax, state management |
| `docs/coding-conventions.md` | Coding standards — naming, file structure, imports, TypeScript hygiene |
| `docs/security-checklist.md` | Security best practices — authentication, authorization, input validation |
| `docs/testing-strategy.md` | Testing approach — unit/integration/e2e strategy, mocking patterns |

## Quick Reference

| I want to... | Read this |
|---|---|
| Understand the project architecture | `WHY.md` |
| Follow coding conventions | `~/.config/opencode/AGENTS.md` + `~/.config/opencode/docs/coding-conventions.md` |
| Build a new feature | `DESIGN_SYSTEM.md` |
| Secure the application | `~/.config/opencode/docs/security-checklist.md` + `SECURITY.md` |
| Write tests | `~/.config/opencode/docs/testing-strategy.md` + `TESTING_PLAN.md` |
| Set up the backend | `backend-README.md` |
| Set up the frontend | `frontend-README.md` |
| Learn the backend (from a frontend perspective) | `backend-explained.md` |

## Architecture Overview

- **Backend**: NestJS 11 + raw `pg` Pool (PostgreSQL). No ORM. JWT auth with RBAC (user/admin/superAdmin).
- **Frontend**: Angular 19 standalone. SignalStore for state. Custom element library. Tailwind-only styling.
- **Monorepo**: Single `package.json` at root. Shared types in `shared/types/`.

## Note

- `AGENTS.md` at the project root contains TaskFlow-specific info (commands, architecture, setup, RBAC)
- General conventions are in `~/.config/opencode/AGENTS.md` (auto-loaded by opencode for all projects)
