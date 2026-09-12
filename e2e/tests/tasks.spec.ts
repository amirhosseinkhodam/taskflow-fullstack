import { expect, test } from '@playwright/test';
import {
  ADMIN,
  API_URL,
  createProjectViaApi,
  createTaskViaApi,
  loginViaApi,
  registerViaApi,
  uniqueName,
  uniqueUser,
} from '../support/api';
import {
  createTaskViaUi,
  loginViaUi,
  primeSession,
  selectProject,
} from '../support/pages';

async function seedProject(
  request: import('@playwright/test').APIRequestContext,
) {
  const token = await loginViaApi(request, ADMIN);
  const project = await createProjectViaApi(
    request,
    token,
    uniqueName('task-proj'),
  );
  return { token, project };
}

test.describe('task creation', () => {
  test('a user can create a task and it persists', async ({
    page,
    request,
  }) => {
    const { project } = await seedProject(request);
    const title = uniqueName('task-create');

    await loginViaUi(page, ADMIN);
    await createTaskViaUi(page, title, project.name);

    await page.reload();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  });

  test('a regular user can create a task in an existing project', async ({
    page,
    request,
  }) => {
    const { project } = await seedProject(request);
    const user = uniqueUser('task-author');
    const token = await registerViaApi(request, user);
    const title = uniqueName('task-by-user');

    await primeSession(page, token);
    await page.goto('/');

    await createTaskViaUi(page, title, project.name);
  });

  test('a task title is required', async ({ page, request }) => {
    const { project } = await seedProject(request);

    await loginViaUi(page, ADMIN);
    await selectProject(page, project.name);
    await page.getByRole('button', { name: 'Add Task' }).click();

    await expect(page.getByPlaceholder('Enter task title')).toHaveValue('');
  });

  test('creating a task against a missing project is rejected', async ({
    request,
  }) => {
    const token = await loginViaApi(request, ADMIN);

    const response = await request.post(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: uniqueName('orphan'), description: '', projectId: 999999 },
    });

    expect(response.status()).toBe(404);
  });
});

test.describe('task editing and deletion', () => {
  test('a user can edit a task title', async ({ page, request }) => {
    const { token, project } = await seedProject(request);
    const original = uniqueName('task-edit');
    const renamed = `${original}-updated`;
    await createTaskViaApi(request, token, {
      title: original,
      projectId: project.id,
    });

    await loginViaUi(page, ADMIN);
    const row = page
      .locator('app-task-item')
      .filter({ hasText: original })
      .first();
    await row.getByRole('button', { name: 'Edit' }).click();

    const titleField = page.getByPlaceholder('Enter task title');
    await expect(titleField).toHaveValue(original);
    await titleField.fill(renamed);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText(renamed, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(renamed, { exact: true })).toBeVisible();
  });

  test('a user can toggle a task between pending and done', async ({
    page,
    request,
  }) => {
    const { token, project } = await seedProject(request);
    const title = uniqueName('task-toggle');
    const task = await createTaskViaApi(request, token, {
      title,
      projectId: project.id,
    });

    await loginViaUi(page, ADMIN);
    const row = page
      .locator('app-task-item')
      .filter({ hasText: title })
      .first();
    await row.locator('ng-select').click();
    await page
      .locator('.ng-dropdown-panel .ng-option')
      .filter({ hasText: 'Done' })
      .first()
      .click();

    await expect
      .poll(async () => {
        const response = await request.get(`${API_URL}/tasks/${task.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return ((await response.json()) as { status: string }).status;
      })
      .toBe('done');
  });

  test('a user can delete a task after confirming', async ({
    page,
    request,
  }) => {
    const { token, project } = await seedProject(request);
    const title = uniqueName('task-delete');
    await createTaskViaApi(request, token, {
      title,
      projectId: project.id,
    });

    await loginViaUi(page, ADMIN);
    const row = page
      .locator('app-task-item')
      .filter({ hasText: title })
      .first();
    await row.getByRole('button', { name: 'Delete' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /delete|confirm|yes/i }).click();

    await expect(page.getByText(title, { exact: true })).toBeHidden();
    await page.reload();
    await expect(page.getByText(title, { exact: true })).toBeHidden();
  });

  test('deleting an already-deleted task returns 404', async ({ request }) => {
    const { token, project } = await seedProject(request);
    const task = await createTaskViaApi(request, token, {
      title: uniqueName('twice'),
      projectId: project.id,
    });
    const headers = { Authorization: `Bearer ${token}` };

    expect(
      (
        await request.delete(`${API_URL}/tasks/${task.id}`, { headers })
      ).status(),
    ).toBe(200);
    expect(
      (
        await request.delete(`${API_URL}/tasks/${task.id}`, { headers })
      ).status(),
    ).toBe(404);
  });
});

test.describe('task assignment', () => {
  test('only an admin can reassign a task', async ({ request }) => {
    const { token: adminToken, project } = await seedProject(request);
    const assignee = uniqueUser('assignee');
    await registerViaApi(request, assignee);

    const author = uniqueUser('author');
    const authorToken = await registerViaApi(request, author);
    const task = await createTaskViaApi(request, authorToken, {
      title: uniqueName('assign'),
      projectId: project.id,
    });

    const forbidden = await request.put(`${API_URL}/tasks/${task.id}`, {
      headers: { Authorization: `Bearer ${authorToken}` },
      data: { assigneeEmail: assignee.email },
    });
    expect(forbidden.status()).toBe(403);

    const allowed = await request.put(`${API_URL}/tasks/${task.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { assigneeEmail: assignee.email },
    });
    expect(allowed.ok()).toBe(true);
  });

  test('an admin can unassign a task with an empty email', async ({
    request,
  }) => {
    const { token, project } = await seedProject(request);
    const assignee = uniqueUser('unassign-me');
    await registerViaApi(request, assignee);
    const task = await createTaskViaApi(request, token, {
      title: uniqueName('unassign'),
      projectId: project.id,
    });
    const headers = { Authorization: `Bearer ${token}` };

    await request.put(`${API_URL}/tasks/${task.id}`, {
      headers,
      data: { assigneeEmail: assignee.email },
    });

    const cleared = await request.put(`${API_URL}/tasks/${task.id}`, {
      headers,
      data: { assigneeEmail: '' },
    });
    expect(cleared.ok()).toBe(true);

    const after = await request.get(`${API_URL}/tasks/${task.id}`, { headers });
    expect(
      ((await after.json()) as { assigneeEmail: string | null }).assigneeEmail,
    ).toBeNull();
  });

  test('assigning to an unknown email clears the assignee', async ({
    request,
  }) => {
    const { token, project } = await seedProject(request);
    const assignee = uniqueUser('known-assignee');
    await registerViaApi(request, assignee);
    const task = await createTaskViaApi(request, token, {
      title: uniqueName('bad-assign'),
      projectId: project.id,
    });
    const headers = { Authorization: `Bearer ${token}` };

    await request.put(`${API_URL}/tasks/${task.id}`, {
      headers,
      data: { assigneeEmail: assignee.email },
    });

    const response = await request.put(`${API_URL}/tasks/${task.id}`, {
      headers,
      data: { assigneeEmail: 'nobody-here@taskflow.test' },
    });
    expect(response.ok()).toBe(true);

    const after = await request.get(`${API_URL}/tasks/${task.id}`, { headers });
    expect(
      ((await after.json()) as { assigneeEmail: string | null }).assigneeEmail,
    ).toBeNull();
  });
});

test.describe('task filtering and search', () => {
  test('search narrows the task list', async ({ page, request }) => {
    const { token, project } = await seedProject(request);
    const needle = uniqueName('needle');
    const other = uniqueName('haystack');
    await createTaskViaApi(request, token, {
      title: needle,
      projectId: project.id,
    });
    await createTaskViaApi(request, token, {
      title: other,
      projectId: project.id,
    });

    await loginViaUi(page, ADMIN);
    await page.locator('app-search-input input').fill(needle);

    await expect(page.getByText(needle, { exact: true })).toBeVisible();
    await expect(page.getByText(other, { exact: true })).toBeHidden();
  });

  test('the status filter separates pending from done tasks', async ({
    page,
    request,
  }) => {
    const { token, project } = await seedProject(request);
    const pending = uniqueName('still-pending');
    const done = uniqueName('already-done');
    await createTaskViaApi(request, token, {
      title: pending,
      projectId: project.id,
    });
    const doneTask = await createTaskViaApi(request, token, {
      title: done,
      projectId: project.id,
    });
    await request.put(`${API_URL}/tasks/${doneTask.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: 'done' },
    });

    await loginViaUi(page, ADMIN);
    await page.locator('app-search-input input').fill(done);

    await expect(page.getByText(done, { exact: true })).toBeVisible();
    await expect(page.getByText(pending, { exact: true })).toBeHidden();
  });
});
