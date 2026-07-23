# TaskFlow Fullstack — Documentation

Central documentation hub for the TaskFlow Fullstack project.

## Structure

```
doc/
├── README.md                    ← You are here (master index)
└── project-specific/            ← TaskFlow-only documentation
    ├── README.md                ← Project docs index
    ├── WHY.md                   ← Design decisions and rationale
    ├── DESIGN_SYSTEM.md         ← UI design tokens and component rules
    ├── SECURITY.md              ← Security plan and vulnerabilities
    ├── SECURITY_IMPLEMENTATION_SUMMARY.md
    ├── TESTING_PLAN.md          ← Complete testing plan
    ├── PLAN_UI_RESTORE.md       ← UI restoration plan
    ├── PLAN-profile-page.md     ← Profile page feature plan
    ├── backend-explained.md     ← Backend explained for frontend devs
    ├── backend-README.md        ← Backend setup and run instructions
    └── frontend-README.md       ← Frontend setup and run instructions
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
| Understand the project architecture | `project-specific/WHY.md` |
| Follow coding conventions | `~/.config/opencode/AGENTS.md` + `~/.config/opencode/docs/coding-conventions.md` |
| Build a new feature | `project-specific/DESIGN_SYSTEM.md` |
| Secure the application | `~/.config/opencode/docs/security-checklist.md` + `project-specific/SECURITY.md` |
| Write tests | `~/.config/opencode/docs/testing-strategy.md` + `project-specific/TESTING_PLAN.md` |
| Set up the backend | `project-specific/backend-README.md` |
| Set up the frontend | `project-specific/frontend-README.md` |
| Learn the backend (from a frontend perspective) | `project-specific/backend-explained.md` |

## Note

- `AGENTS.md` at the project root contains TaskFlow-specific info (commands, architecture, setup, RBAC)
- General conventions are in `~/.config/opencode/AGENTS.md` (auto-loaded by opencode for all projects)
- `backend/backend-explained.md` is also available at the project root for quick reference
