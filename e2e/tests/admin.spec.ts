import { expect, test } from '@playwright/test';
import {
  ADMIN,
  API_URL,
  loginViaApi,
  registerViaApi,
  uniqueUser,
} from '../support/api';
import { loginViaUi } from '../support/pages';

test.describe('admin panel', () => {
  test('an admin sees the user list', async ({ page, request }) => {
    const user = uniqueUser('listed');
    await registerViaApi(request, user);

    await loginViaUi(page, ADMIN);
    await page.getByRole('button', { name: 'Admin Panel' }).click();
    await expect(page).toHaveURL(/\/admin/);

    await expect(
      page.locator('tr').filter({ hasText: user.email }),
    ).toBeVisible();
  });

  test('an admin can promote a user to admin and demote them back', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('promote');
    await registerViaApi(request, user);

    await loginViaUi(page, ADMIN);
    await page.goto('/admin');

    const row = page.locator('tr').filter({ hasText: user.email }).first();
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: /Promote/ }).click();
    await expect(row.getByRole('button', { name: /Demote/ })).toBeVisible();

    const adminToken = await loginViaApi(request, ADMIN);
    const promoted = await request.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const record = (
      (await promoted.json()) as { email: string; role: string }[]
    ).find((u) => u.email === user.email);
    expect(record?.role).toBe('admin');

    await row.getByRole('button', { name: /Demote/ }).click();
    await expect(row.getByRole('button', { name: /Promote/ })).toBeVisible();
  });

  test('an admin can delete a user', async ({ page, request }) => {
    const user = uniqueUser('deletable');
    await registerViaApi(request, user);

    await loginViaUi(page, ADMIN);
    await page.goto('/admin');

    const row = page.locator('tr').filter({ hasText: user.email }).first();
    await row.getByRole('button', { name: 'Delete' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /delete|confirm|yes/i }).click();

    await expect(
      page.locator('tr').filter({ hasText: user.email }),
    ).toHaveCount(0);

    const login = await request.post(`${API_URL}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(login.status()).toBe(401);
  });

  test('an admin cannot delete their own account', async ({ request }) => {
    const adminToken = await loginViaApi(request, ADMIN);
    const headers = { Authorization: `Bearer ${adminToken}` };

    const users = await request.get(`${API_URL}/admin/users`, { headers });
    const self = ((await users.json()) as { id: number; email: string }[]).find(
      (u) => u.email === ADMIN.email,
    );

    const response = await request.delete(
      `${API_URL}/admin/users/${self!.id}`,
      { headers },
    );

    expect(response.status()).toBe(400);
  });

  test('an admin can reset a user password and the new one works', async ({
    request,
  }) => {
    const user = uniqueUser('pwreset');
    await registerViaApi(request, user);
    const adminToken = await loginViaApi(request, ADMIN);
    const headers = { Authorization: `Bearer ${adminToken}` };

    const users = await request.get(`${API_URL}/admin/users`, { headers });
    const target = (
      (await users.json()) as { id: number; email: string }[]
    ).find((u) => u.email === user.email);

    const newPassword = 'RotatedPass456!';
    const reset = await request.post(
      `${API_URL}/admin/users/${target!.id}/change-password`,
      { headers, data: { password: newPassword } },
    );
    expect(reset.ok()).toBe(true);

    const withNew = await request.post(`${API_URL}/auth/login`, {
      data: { email: user.email, password: newPassword },
    });
    expect(withNew.ok()).toBe(true);

    const withOld = await request.post(`${API_URL}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(withOld.status()).toBe(401);
  });

  test('an admin cannot set a weak password for a user', async ({
    request,
  }) => {
    const user = uniqueUser('weakreset');
    await registerViaApi(request, user);
    const adminToken = await loginViaApi(request, ADMIN);
    const headers = { Authorization: `Bearer ${adminToken}` };

    const users = await request.get(`${API_URL}/admin/users`, { headers });
    const target = (
      (await users.json()) as { id: number; email: string }[]
    ).find((u) => u.email === user.email);

    const response = await request.post(
      `${API_URL}/admin/users/${target!.id}/change-password`,
      { headers, data: { password: '123' } },
    );

    expect(response.status()).toBe(400);
  });

  test('promoting a user grants them project management', async ({
    request,
  }) => {
    const user = uniqueUser('newadmin');
    const userToken = await registerViaApi(request, user);
    const adminToken = await loginViaApi(request, ADMIN);
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const before = await request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { name: 'should-fail' },
    });
    expect(before.status()).toBe(403);

    const users = await request.get(`${API_URL}/admin/users`, {
      headers: adminHeaders,
    });
    const target = (
      (await users.json()) as { id: number; email: string }[]
    ).find((u) => u.email === user.email);
    await request.patch(`${API_URL}/admin/users/${target!.id}/role`, {
      headers: adminHeaders,
      data: { role: 'admin' },
    });

    const elevatedToken = await loginViaApi(request, user);
    const after = await request.post(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${elevatedToken}` },
      data: { name: `promoted-${Date.now()}` },
    });
    expect(after.ok()).toBe(true);
  });
});
