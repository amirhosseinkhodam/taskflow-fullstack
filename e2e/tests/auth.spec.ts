import { expect, test } from '@playwright/test';
import { ADMIN, registerViaApi, uniqueUser } from '../support/api';
import {
  expectDashboard,
  expectFormError,
  fillCredentials,
  gotoLogin,
  gotoRegister,
  loginViaUi,
  registerViaUi,
} from '../support/pages';

test.describe('registration', () => {
  test('a new user can register and lands on the dashboard', async ({
    page,
  }) => {
    await registerViaUi(page, uniqueUser('signup'));

    const token = await page.evaluate(() =>
      window.localStorage.getItem('token'),
    );
    expect(token).toBeTruthy();
  });

  test('registering an existing email surfaces an error and does not navigate', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('duplicate');
    await registerViaApi(request, user);

    await gotoRegister(page);
    await fillCredentials(page, user);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expectFormError(page, 'Email already registered');
    await expect(page).toHaveURL(/\/register/);
  });

  test('a weak password is rejected by the server', async ({ page }) => {
    const user = uniqueUser('weak');

    await gotoRegister(page);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill('123');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/register/);
    const token = await page.evaluate(() =>
      window.localStorage.getItem('token'),
    );
    expect(token).toBeNull();
  });
});

test.describe('login', () => {
  test('a registered user can log in', async ({ page, request }) => {
    const user = uniqueUser('login');
    await registerViaApi(request, user);

    await loginViaUi(page, user);
  });

  test('wrong password shows an error and grants no session', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('badpass');
    await registerViaApi(request, user);

    await gotoLogin(page);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expectFormError(page, 'Invalid email or password');
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() =>
      window.localStorage.getItem('token'),
    );
    expect(token).toBeNull();
  });

  test('an unknown email cannot log in', async ({ page }) => {
    await gotoLogin(page);
    await fillCredentials(page, uniqueUser('ghost'));
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expectFormError(page, 'Invalid email or password');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('session lifecycle', () => {
  test('the session survives a page reload', async ({ page, request }) => {
    const user = uniqueUser('persist');
    await registerViaApi(request, user);
    await loginViaUi(page, user);

    await page.reload();

    await expectDashboard(page);
  });

  test('logging out clears the session and blocks the dashboard', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('logout');
    await registerViaApi(request, user);
    await loginViaUi(page, user);

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);

    const token = await page.evaluate(() =>
      window.localStorage.getItem('token'),
    );
    expect(token).toBeNull();

    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('the admin account can log in', async ({ page }) => {
    await loginViaUi(page, ADMIN);

    await expect(
      page.getByRole('button', { name: 'Admin Panel' }),
    ).toBeVisible();
  });
});
