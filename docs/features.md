# TaskFlow — Features

## Authentication

### Registration
1. User navigates to `/register`.
2. Fills in name, email, password, confirm password.
3. Form validates: email format, password strength (8+ chars, uppercase, lowercase, number, special char), passwords match.
4. On submit: `POST /auth/register` with `{ name, email, password }`.
5. On success: JWT stored in `localStorage`, user redirected to `/`.
6. On failure: Error message displayed (e.g., "Email already registered").

### Login
1. User navigates to `/login`.
2. Fills in email and password.
3. On submit: `POST /auth/login` with `{ email, password }`.
4. On success: JWT stored in `localStorage`, user redirected to `/`.
5. On failure: Error message displayed (e.g., "Invalid credentials").

### Logout
1. User clicks "Logout" button.
2. JWT removed from `localStorage`.
3. User redirected to `/login`.

## Dashboard

### View Projects
1. User sees project list on the left (admin) or top section (regular user).
2. Projects loaded via `GET /projects`.
3. Each project shows name and creation date.

### Create Project (Admin Only)
1. Admin fills in project name in the input field.
2. Clicks "Add" button.
3. On success: Project appears in the list.
4. On failure: Error message displayed.

### Edit Project (Admin Only)
1. Admin clicks edit button on a project.
2. Bottom sheet (mobile) or dialog (desktop) opens with project name input.
3. Admin modifies name and saves.
4. On success: Project name updated in the list.

### Delete Project (Admin Only)
1. Admin clicks delete button on a project.
2. Confirmation dialog shows number of undone tasks.
3. Admin confirms deletion.
4. On success: Project removed from the list.

## Tasks

### View Tasks
1. User sees task list on the right section.
2. Tasks loaded via `GET /tasks` with filters (project, status, search).
3. Each task shows title, description, status, project, and creator.

### Create Task
1. User fills in task title, description, and project.
2. Clicks "Add Task" button.
3. On success: Task appears in the list.
4. On failure: Error message displayed.

### Edit Task
1. User clicks edit button on a task.
2. Task form pre-fills with existing data.
3. User modifies fields and saves.
4. On success: Task updated in the list.

### Toggle Task Status
1. User clicks toggle button on a task.
2. Status cycles: pending → in-progress → done → pending.
3. On success: Task status updated.

### Delete Task
1. User clicks delete button on a task.
2. Confirmation dialog appears.
3. User confirms deletion.
4. On success: Task removed from the list.

### Reorder Tasks (Drag & Drop)
1. User drags a task to a new position.
2. On drop: `POST /tasks/reorder` with new order.
3. On success: Task list reflects new order.

## Task Details

### View Task Details
1. User navigates to `/task/:id`.
2. Task details loaded via `GET /tasks/:id`.
3. Shows title, description, status, project, creator, assignee.

### Edit Task from Details
1. User clicks edit button.
2. Task form appears inline.
3. User modifies fields and saves.
4. On success: Task details updated.

## Comments

### Add Comment
1. User types comment in textarea on task details page.
2. Clicks "Add Comment" button.
3. On success: Comment appears in the list.

### Edit Comment
1. User clicks edit button on their own comment.
2. Comment content appears in an input field.
3. User modifies and saves (Enter key or Save button).
4. On success: Comment updated.

### Delete Comment
1. User clicks delete button on their own comment.
2. Confirmation dialog appears.
3. User confirms deletion.
4. On success: Comment removed from the list.

## Admin Panel

### View Users
1. Admin navigates to `/admin`.
2. User list loaded via `GET /admin/users`.
3. Each user shows name, email, and role.

### Change User Role
1. Admin clicks promote/demote button on a user.
2. On success: User role updated in the list.
3. Note: Admin cannot change their own role.

### Change User Password
1. Admin clicks "Change Password" button on a user.
2. Bottom sheet (mobile) or dialog (desktop) opens.
3. Admin enters new password and confirms.
4. On success: Password changed.

### Delete User
1. Admin clicks delete button on a user.
2. Confirmation dialog appears.
3. Admin confirms deletion.
4. On success: User removed from the list.
5. Note: Admin cannot delete themselves.

## Profile

### View Profile
1. User navigates to `/profile`.
2. Profile data loaded via `GET /auth/me`.
3. Shows name, email, phone, national code, birth date.

### Edit Profile
1. User clicks edit button.
2. Profile form appears with current data.
3. User modifies fields and saves.
4. On success: Profile updated.

### Change Password
1. User clicks "Change Password" button.
2. Bottom sheet (mobile) or dialog (desktop) opens.
3. User enters current password, new password, and confirms.
4. On success: Password changed.

## Theme & Language

### Toggle Theme
1. User clicks theme toggle button (sun/moon icon).
2. Theme switches between light and dark.
3. Preference persisted in `localStorage`.

### Toggle Language
1. User clicks language toggle button (EN/FA).
2. Language switches between English and Persian.
3. Direction switches between LTR and RTL.
4. Preference persisted in `localStorage`.

## Responsive Design

### Mobile (< 768px)
- Hamburger menu for navigation.
- Bottom sheets instead of dialogs.
- Full-width layouts.
- Touch-friendly interactions.

### Desktop (>= 768px)
- Inline navigation buttons.
- Dialogs for confirmations and forms.
- Side-by-side layouts.
- Hover interactions.
