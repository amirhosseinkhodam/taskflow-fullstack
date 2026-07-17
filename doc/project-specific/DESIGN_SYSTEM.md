# TaskFlow UI Design System

> Living document. Updated after each feature review.

---

## 1. Design Tokens (Tailwind Config)

All tokens live in `frontend/tailwind.config.js` under `theme.extend`.

### Border Radius

| Token | Value | Use |
|---|---|---|
| `card` | `1rem` (16px) | Cards, panels, containers |
| `control` | `0.5rem` (8px) | Buttons, inputs, selects, textareas |
| `badge` | `9999px` | Pills, chips, status badges |
| `container` | `0.75rem` (12px) | Task items, sub-containers |

### Shadows

| Token | Use |
|---|---|
| `card` | Default card elevation |
| `card-hover` | Card hover state |
| `dialog` | Modal/dialog elevation |

### Spacing

| Token | Value | Use |
|---|---|---|
| `control-gap` | `0.75rem` (12px) | Between adjacent controls (inline) |
| `section-gap` | `1.5rem` (24px) | Between sections/cards vertically |
| `page-padding` | `1.5rem` (24px) | Standard page padding |

### Typography Scale

| Token | Size | Line Height | Weight | Use |
|---|---|---|---|---|
| `page-title` | `1.875rem` (30px) | `2.25rem` | 700 (bold) | Page headings |
| `section-title` | `1.25rem` (20px) | `1.75rem` | 600 (semibold) | Section/card headings |
| `body` | `0.875rem` (14px) | `1.25rem` | 400 | Body text, input text |
| `caption` | `0.75rem` (12px) | `1rem` | 400 | Timestamps, metadata |

### Focus Ring (Consistent Everywhere)

- Width: `2px`
- Offset: `2px`
- Color: `slate-500` (light) / `slate-400` (dark)

### Min Heights (Control Alignment)

| Size | Height |
|---|---|
| `sm` | `36px` |
| `md` | `40px` |
| `lg` | `44px` |

Button `md` and Input must both resolve to `min-h-[40px]` so they align when side-by-side.

---

## 2. Component Rules

### Buttons (`app-button`)

| Variant | Use Case | Visual |
|---|---|---|
| `primary` | Main CTA (Submit, Save, Add) | Filled dark (`slate-900` / `slate-600`) |
| `secondary` | Neutral (Cancel, Back, Close) | Bordered, no fill |
| `destructive` | Irreversible danger (Delete) | Filled red |
| `ghost` | Inline/icon actions (row edit, delete) | No border, no fill |
| `outline` | **Remove** — duplicate of `secondary` | — |

**Spacing**: When primary + secondary sit together, use `gap-3`.

**Heights**: Enforce `min-h-[40px]` for `md` to match inputs.

### Inputs / Textareas / Selects (`app-input`, `app-textarea`, `app-select`)

- **Height**: `min-h-[40px]` (py-2 + border = ~40px)
- **Border radius**: `rounded-control` (8px)
- **Focus ring**: `ring-2 ring-slate-500 ring-offset-2` — always
- **Label spacing**: `mb-1.5`
- **Error state**: `border-red-500 ring-red-500` — same ring width

### Cards (`app-card`)

- **Border radius**: `rounded-card` (16px)
- **Shadow**: `shadow-card`
- **Padding**: `p-6` (md, default)
- **No border by default** — use shadow for elevation
- `bordered` variant adds `border border-slate-200 dark:border-slate-700`

### Forms (`app-form`)

- **Vertical spacing**: `space-y-4` between fields (default)
- **Never add extra `mt-*` on first child** — `space-y` handles it
- **Inline variant**: `flex gap-3 items-end`
- **Default variant**: wraps with card styling (`bg-white rounded-card p-6 shadow`)

### Modals / Dialogs

- **Width**: `max-w-sm` (384px) for confirms, `max-w-md` (448px) for forms
- **Actions**: `mat-dialog-actions align="end" class="gap-2"`
- **Cancel**: `variant="secondary"` (bordered) — NOT `mat-text`
- **Confirm**: `variant="primary"` or `variant="destructive"` for danger

### Tables

- Wrap in `<app-card variant="bordered">`
- Header row: `bg-slate-50 dark:bg-slate-800/50`
- Cell padding: `px-4 py-3`
- Text: `text-sm`

### Empty States

Standard pattern (use everywhere):

```
rounded-card border border-dashed border-slate-300 dark:border-slate-600
p-8 text-center text-sm text-slate-500 dark:text-slate-400
```

### Alerts / Banners

| Type | Background | Text |
|---|---|---|
| Error | `bg-red-50 dark:bg-red-900/30` | `text-red-700 dark:text-red-300` |
| Warning | `bg-amber-50 dark:bg-amber-900/30` | `text-amber-700 dark:text-amber-300` |
| Success | `bg-green-50 dark:bg-green-900/30` | `text-green-700 dark:text-green-300` |
| Info | `bg-blue-50 dark:bg-blue-900/30` | `text-blue-700 dark:text-blue-300` |

All: `rounded-control px-4 py-3 text-sm`

---

## 3. Interaction States

| State | Rule |
|---|---|
| **Focus** | `ring-2 ring-slate-500 ring-offset-2` — SAME everywhere |
| **Hover** | Subtle background darkening per variant |
| **Active** | `ring-offset-0` (optional press effect) |
| **Disabled** | `opacity-50 cursor-not-allowed` |

---

## 4. Layout Standards

### Page Containers

| Page | Max Width | Padding |
|---|---|---|
| Login / Register | `max-w-md` | `p-6` |
| Dashboard | `max-w-4xl` | `p-6` |
| Task Details | `max-w-2xl` | `p-6` |
| Admin | `max-w-7xl` | `px-4 sm:px-6 lg:px-8 py-8` |

### Vertical Rhythm

- Between sections: `mt-6` (24px)
- Between cards: `gap-6` (24px)
- Between controls in a form: `space-y-4` (16px)
- Between inline controls: `gap-3` (12px)
- Between page title and content: `mb-6` (24px)

### Responsive

- Mobile-first with `sm:` prefix
- Forms: stack vertically on mobile, inline on desktop
- Cards: single column on mobile, grid on desktop where applicable
- Admin table: horizontal scroll on mobile

---

## 5. Accessibility

- All interactive elements must have visible focus indicator
- Buttons: use `aria-label` for icon-only buttons
- Color contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Skip-to-content link on all pages
- Form inputs: associated labels via `for`/`id` or `formControlName`
- Error messages: linked to inputs via `aria-describedby`

---

## 6. Custom Elements Styling Rules

- All shared UI primitives use Tailwind classes in `computedClasses()` — no CSS/SCSS
- `cssClass` input for consumer overrides
- `variant` input for predefined styles
- Consistent `rounded-control` for all interactive elements
- Consistent focus ring across all components

---

## 7. Implementation Order

| # | Feature | Status |
|---|---|---|
| 1 | Login | Done |
| 2 | Register | Done |
| 3 | Dashboard page | Done |
| 4 | Task Details page | Done |
| 5 | Admin Panel page | Done |
| 6 | Task items & Task list | Done |
| 7 | Dialogs / Modals | Done |
| 8 | Shared component refinements | Done |

---

## 8. Workflow

For each feature:
1. Inspect against this plan
2. List issues with line references
3. Propose changes with rationale
4. **Wait for approval**
5. Apply changes
6. Run build + lint
7. User reviews
8. Update this plan with refinements
9. Move to next feature

---

## 9. Refinements (Learned from Implementation)

### Login (Round 1)

- **Error banner**: Use `py-3` not `py-2` — consistent with alert standard
- **Subtitle text**: Always specify `text-sm` — never leave size unscoped
- **`max-w-sm` (384px)** is the right width for 2-field auth forms — `max-w-md` was too wide
- **Never mix `mt-*` with `gap`** — the form component's `gap-4` handles all vertical spacing. Adding `mt-*` creates uneven gaps
- **CTA buttons**: Use `[cssClass]="'w-full'"` for full-width primary actions (login submit)
- **Header spacing**: Use `mb-3 gap-5` (not `mb-6`) on header divs inside forms — `gap-5` gives horizontal space between title and toggle, `mb-3` keeps header tight against form fields
- **Register link**: No extra `mt-*` — `gap-4` from form handles spacing after button

### Register (Round 1)

- **Never override `variant="default"` with `cssClass`** — the default variant already provides `bg-white rounded-2xl p-6 shadow`. Passing duplicate classes via `cssClass` creates maintenance overhead (e.g. `p-8` vs `p-6` inconsistency)
- **Same pattern as Login** — all refinements from Login apply identically: `max-w-sm`, `mb-3 gap-5`, `py-3` on error banner, `text-sm` on subtitle, no `mt-*` on inputs/button, full-width CTA

### Dashboard (Round 1)

- **Subtitle**: Always `text-sm` + `mt-1` (not `mt-2`)
- **Health/info banners**: Use `py-3` (not `py-2`) — consistent alert standard
- **Inside cards**: Never add `mt-*` on first child — card `p-6` handles padding, `gap-4` handles spacing between children
- **Empty states**: Use `rounded-card` (16px) + `p-8` + `text-sm` — consistent pattern
- **Task items**: Use `rounded-container` (12px) — distinct from cards but consistent
- **Pagination**: Use `gap-3` (not `gap-2`) — consistent with button gap standard
- **Tailwind tokens**: Added `rounded-card` (1rem) and `rounded-container` (0.75rem) to `tailwind.config.js`

### Task Details (Round 1)

- **Loading/error states**: Use alert pattern — `rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm` (loading) / `rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm` (error) — not plain `<p>` without styling

### Admin Panel (Round 1)

- **Table container**: Use `rounded-card` (not `rounded-xl`) — consistent with design tokens
- **Inside `<app-form>`**: Never add `mt-*` on children — `gap-4` handles all spacing. Remove redundant `mt-2` on second input and button row
- **Message banner**: Use `px-4 py-3` (not `p-4`) — consistent alert standard
- **`[ngClass]` for dynamic classes**: Still acceptable in Angular 19 for dynamic class binding via `CommonModule`

### Shared Components (Critical)

- **FormComponent uses `flex flex-col gap-4`** (not `space-y-4`) for vertical spacing — CSS `gap` works regardless of children's display type (inline or block), so no `host` hacks needed on individual components
- **Inline/horizontal variants override to `flex-row`** — the base `flex-col` is overridden by variant-specific `flex-row items-end` or `flex-row items-center`
- **Form buttons**: Use `[cssClass]="'w-full'"` for full-width CTA buttons (e.g. login submit)
- **Never use `host: { class: 'block w-full' }`** on form control components — it's fragile and leaks layout concerns into components
