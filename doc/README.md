# TaskFlow Fullstack — Documentation

Central documentation hub for the TaskFlow Fullstack project and reusable development guidelines.

## Structure

```
doc/
├── README.md                    ← You are here (master index)
├── general/                     ← Reusable across all projects
│   ├── README.md                ← General docs index
│   ├── coding-conventions.md    ← Coding standards and patterns
│   ├── security-checklist.md    ← Security best practices
│   └── testing-strategy.md      ← Testing approach and patterns
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

## Quick Reference

| I want to... | Read this |
|---|---|
| Understand the project architecture | `project-specific/WHY.md` |
| Follow coding conventions | `general/coding-conventions.md` + root `AGENTS.md` |
| Build a new feature | `project-specific/DESIGN_SYSTEM.md` |
| Secure the application | `general/security-checklist.md` + `project-specific/SECURITY.md` |
| Write tests | `general/testing-strategy.md` + `project-specific/TESTING_PLAN.md` |
| Set up the backend | `project-specific/backend-README.md` |
| Set up the frontend | `project-specific/frontend-README.md` |
| Learn the backend (from a frontend perspective) | `project-specific/backend-explained.md` |

## Note

`AGENTS.md` remains at the repository root because it is read by opencode as project instructions. It is not duplicated here.
