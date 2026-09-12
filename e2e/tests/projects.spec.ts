import { expect, test } from '@playwright/test';
import {
  ADMIN,
  API_URL,
  createProjectViaApi,
  loginViaApi,
  uniqueName,
} from '../support/api';
import { createProjectViaUi, loginViaUi } from '../support/pages';

test.describe('project management', () => {
  test('an admin can create a project and see it listed', async ({ page }) => {
    const name = uniqueName('proj-create');

    await loginViaUi(page, ADMIN);
    await createProjectViaUi(page, name);

    await page.reload();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test('a created project becomes selectable when adding a task', async ({
    page,
  }) => {
    const name = uniqueName('proj-select');

    await loginViaUi(page, ADMIN);
    await createProjectViaUi(page, name);

    await page.locator('app-task-form ng-select').click();
    await expect(
      page
        .locator('.ng-dropdown-panel .ng-option')
        .filter({ hasText: name })
        .first(),
    ).toBeVisible();
  });

  test('an admin can rename a project', async ({ page, request }) => {
    const original = uniqueName('proj-rename');
    const renamed = `${original}-renamed`;

    const token = await loginViaApi(request, ADMIN);
    await createProjectViaApi(request, token, original);

    await loginViaUi(page, ADMIN);
    const row = page
      .locator('app-project-list li, app-project-list [role="listitem"]')
      .filter({ hasText: original })
      .first();
    await row.getByRole('button', { name: 'Edit' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox').first().fill(renamed);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(renamed, { exact: true })).toBeVisible();
    await expect(page.getByText(original, { exact: true })).toBeHidden();
  });

  test('an admin can delete a project after confirming', async ({
    page,
    request,
  }) => {
    const name = uniqueName('proj-delete');

    const token = await loginViaApi(request, ADMIN);
    await createProjectViaApi(request, token, name);

    await loginViaUi(page, ADMIN);
    await expect(page.getByText(name, { exact: true })).toBeVisible();

    const row = page
      .locator('app-project-list li, app-project-list [role="listitem"]')
      .filter({ hasText: name })
      .first();
    await row.getByRole('button', { name: 'Delete' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /delete|confirm|yes/i }).click();

    await expect(page.getByText(name, { exact: true })).toBeHidden();

    await page.reload();
    await expect(page.getByText(name, { exact: true })).toBeHidden();
  });

  test('deleting a project removes its tasks', async ({ page, request }) => {
    const projectName = uniqueName('cascade');
    const taskTitle = uniqueName('cascade-task');

    const token = await loginViaApi(request, ADMIN);
    const project = await createProjectViaApi(request, token, projectName);
    await request.post(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: taskTitle, description: '', projectId: project.id },
    });

    await request.delete(`${API_URL}/projects/${project.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await loginViaUi(page, ADMIN);
    await expect(page.getByText(taskTitle, { exact: true })).toBeHidden();
  });

  test('a project name is required', async ({ page }) => {
    await loginViaUi(page, ADMIN);

    const before = await page.locator('app-project-list li').count();
    await page.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(page.locator('app-project-list li')).toHaveCount(before);
  });
});
