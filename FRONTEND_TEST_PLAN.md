# Frontend Test Plan — Sequential Execution Order

## Batch 1 — Standalone services (no Angular dependencies)
| # | File | Tests | Why first |
|---|---|---|---|
| 1 | `shared/services/theme.spec.ts` | 4 tests | Pure service, localStorage + signal |
| 2 | `shared/services/language.spec.ts` | 10 tests | Pure service, localStorage + signal + i18n |

## Batch 2 — HttpClient services (need `HttpClientTestingModule`)
| # | File | Tests | Why together |
|---|---|---|---|
| 3 | `features/auth/services/auth.spec.ts` | 2 tests | All 3 use same pattern |
| 4 | `features/dashboard/services/dashboard.spec.ts` | 11 tests | HttpClientTestingModule |
| 5 | `features/admin/services/admin.spec.ts` | 4 tests | HttpClientTestingModule |

## Batch 3 — Pipes
| # | File | Tests | Why here |
|---|---|---|---|
| 6 | `shared/pipes/jalali-date.spec.ts` | 3 tests | Pure pipe, no TestBed needed |
| 7 | `shared/pipes/translate.spec.ts` | 2 tests | Impure pipe, needs TestBed + LanguageService mock |

## Batch 4 — Form services (need TestBed for DI)
| # | File | Tests | Why together |
|---|---|---|---|
| 8 | `shared/forms/task.spec.ts` | 5 tests | FormBuilder DI |
| 9 | `features/auth/forms/login.spec.ts` | 3 tests | FormBuilder DI |
| 10 | `features/auth/forms/register.spec.ts` | 3 tests | FormBuilder DI |
| 11 | `features/admin/forms/password.spec.ts` | 5 tests | FormBuilder + cross-field validator |

## Batch 5 — Guards & interceptor (need functional guard execution)
| # | File | Tests | Why here |
|---|---|---|---|
| 12 | `core/guards/auth.guard.spec.ts` | 5 tests | Functional guards, mock AuthStore |
| 13 | `core/interceptors/auth.interceptor.spec.ts` | 3 tests | Functional interceptor, mock AuthStore + HttpTestingController |

## Batch 6 — Simple shared components (no Material deps)
| # | File | Tests | Why together |
|---|---|---|---|
| 14 | `shared/components/button.spec.ts` | 5 tests | Attribute selector, test host needed |
| 15 | `shared/components/input.spec.ts` | 7 tests | Element selector |
| 16 | `shared/components/card.spec.ts` | 3 tests | Element selector |
| 17 | `shared/components/textarea.spec.ts` | 4 tests | Element selector |
| 18 | `shared/components/form.spec.ts` | 2 tests | Attribute selector, test host needed |

## Batch 7 — Toggle components + auth sub-component
| # | File | Tests | Why together |
|---|---|---|---|
| 19 | `shared/components/theme-toggle.spec.ts` | 2 tests | Mock ThemeService |
| 20 | `shared/components/language-toggle.spec.ts` | 2 tests | Mock LanguageService + ThemeService |
| 21 | `features/auth/components/password-input.spec.ts` | 3 tests | Needs parent FormGroup (test host) |

## Batch 8 — Material dialog/sheet components
| # | File | Tests | Why together |
|---|---|---|---|
| 22 | `shared/components/confirm-dialog.spec.ts` | 3 tests | Mock MatDialogRef + LanguageService |
| 23 | `shared/components/confirm-bottom-sheet.spec.ts` | 3 tests | Mock MatBottomSheetRef + LanguageService |

## Batch 9 — Auth pages (need store mocks)
| # | File | Tests | Why together |
|---|---|---|---|
| 24 | `features/auth/pages/login.spec.ts` | 4 tests | Mock AuthStore, LoginFormService, LanguageService |
| 25 | `features/auth/pages/register.spec.ts` | 4 tests | Mock AuthStore, RegisterFormService, LanguageService |

## Batch 10 — Dashboard sub-components (inputs/outputs)
| # | File | Tests | Why together |
|---|---|---|---|
| 26 | `features/dashboard/components/pagination.spec.ts` | 6 tests | Simple I/O |
| 27 | `features/dashboard/components/status-filter.spec.ts` | 2 tests | Material chips |
| 28 | `features/dashboard/components/search-input.spec.ts` | 3 tests | FormsModule |
| 29 | `features/dashboard/components/project-filter.spec.ts` | 2 tests | NgSelectModule |
| 30 | `features/dashboard/components/task-list.spec.ts` | 2 tests | DragDrop + TaskItemComponent |
| 31 | `features/dashboard/components/project-list.spec.ts` | 4 tests | FormsModule + JalaliDatePipe |
| 32 | `features/dashboard/components/project-edit-dialog.spec.ts` | 4 tests | Mock MatDialogRef + MAT_DIALOG_DATA |
| 33 | `features/dashboard/components/project-delete-confirm.spec.ts` | 4 tests | Mock MatDialogRef + MAT_DIALOG_DATA |

## Batch 11 — Complex shared components
| # | File | Tests | Why here |
|---|---|---|---|
| 34 | `shared/components/task-item.spec.ts` | 9 tests | Mock DashboardService, MatDialog, LanguageService |
| 35 | `shared/components/task-form.spec.ts` | 4 tests | TaskFormService real, mock LanguageService |

## Batch 12 — Stores (most complex, need fakeAsync)
| # | File | Tests | Why last |
|---|---|---|---|
| 36 | `features/auth/store/auth.spec.ts` | 7 tests | Root-level store, mock 4 deps |
| 37 | `features/dashboard/store/dashboard.spec.ts` | 8 tests | Component-level store, mock DashboardService |
| 38 | `features/admin/store/admin.spec.ts` | 4 tests | Component-level store, mock AdminService + PasswordFormService |

## Batch 13 — Page components
| # | File | Tests | Why last |
|---|---|---|---|
| 39 | `features/admin/pages/admin-panel.spec.ts` | 5 tests | Complex, mock 7 deps |
| 40 | `features/task-details/pages/task-details.spec.ts` | 2 tests | Routed page, mock ActivatedRoute |

## Verification
After all files are written:
```bash
npm run test:frontend 2>&1
```
Fix any failures, re-run until green.

---

**Total: 40 spec files, ~140 tests**
