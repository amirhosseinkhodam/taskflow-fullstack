# Project-Specific Documentation — TaskFlow Fullstack

All documentation specific to the TaskFlow Fullstack project. These docs describe design decisions, architecture, security, testing, and feature plans for this particular codebase.

## Documents

| File | Description |
|---|---|
| [WHY.md](./WHY.md) | Design decisions and rationale — answers "why" for every architectural choice (database, auth, state management, component patterns) |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Living UI design system — tokens, component rules, interaction states, layout standards, accessibility |
| [SECURITY.md](./SECURITY.md) | Security plan — identified vulnerabilities, risk levels, remediation strategies |
| [SECURITY_IMPLEMENTATION_SUMMARY.md](./SECURITY_IMPLEMENTATION_SUMMARY.md) | Implementation status of security enhancements |
| [TESTING_PLAN.md](./TESTING_PLAN.md) | Complete testing plan — infrastructure, backend tests, frontend tests, coverage targets |
| [PLAN_UI_RESTORE.md](./PLAN_UI_RESTORE.md) | UI restoration plan — root causes of visual drift, feature-by-feature fix strategy |
| [PLAN-profile-page.md](./PLAN-profile-page.md) | Profile page feature plan — `/profile` route with editable name/email and password change |
| [backend-explained.md](./backend-explained.md) | Backend explained for frontend developers — NestJS concepts mapped to Angular patterns |
| [backend-README.md](./backend-README.md) | Backend setup and run instructions |
| [frontend-README.md](./frontend-README.md) | Frontend setup and run instructions |

## Architecture Overview

- **Backend**: NestJS 11 + raw `pg` Pool (PostgreSQL). No ORM. JWT auth with RBAC (user/admin/superAdmin).
- **Frontend**: Angular 19 standalone. SignalStore for state. Custom element library. Tailwind-only styling.
- **Monorepo**: Single `package.json` at root. Shared types in `shared/types/`.

For the full rules and conventions, see the root `AGENTS.md`.
