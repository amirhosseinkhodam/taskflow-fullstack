import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { AuthUser } from './api';

export async function gotoLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page.getByPlaceholder('Email')).toBeVisible();
}

export async function gotoRegister(page: Page): Promise<void> {
  await page.goto('/register');
  await expect(page.getByPlaceholder('Email')).toBeVisible();
}

export async function fillCredentials(
  page: Page,
  user: AuthUser,
): Promise<void> {
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
}

export async function loginViaUi(page: Page, user: AuthUser): Promise<void> {
  await gotoLogin(page);
  await fillCredentials(page, user);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expectDashboard(page);
}

export async function registerViaUi(page: Page, user: AuthUser): Promise<void> {
  await gotoRegister(page);
  await fillCredentials(page, user);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expectDashboard(page);
}

export async function expectDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/$|\/#/);
  await expect(
    page.getByRole('heading', { name: 'TaskFlow', level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
}

export async function expectFormError(page: Page, text: string): Promise<void> {
  await expect(page.locator('app-form').getByText(text)).toBeVisible();
}

export async function primeSession(page: Page, token: string): Promise<void> {
  await page.addInitScript(
    ([value]) => window.localStorage.setItem('token', value),
    [token],
  );
}

export async function createProjectViaUi(
  page: Page,
  name: string,
): Promise<void> {
  await page.getByPlaceholder('New project name').fill(name);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

export async function createTaskViaUi(
  page: Page,
  title: string,
  projectName: string,
): Promise<void> {
  await page.getByPlaceholder('Enter task title').fill(title);
  await selectProject(page, projectName);
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

export async function selectProject(
  page: Page,
  projectName: string,
): Promise<void> {
  const select = page.locator('app-task-form ng-select');
  await select.click();
  await page
    .locator('.ng-dropdown-panel .ng-option')
    .filter({ hasText: projectName })
    .first()
    .click();
}
