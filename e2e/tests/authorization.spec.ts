import { expect, test } from '@playwright/test';
import {
  ADMIN,
  API_URL,
  loginViaApi,
  registerViaApi,
  uniqueName,
  uniqueUser,
} from '../support/api';
import { loginViaUi, primeSession } from '../support/pages';

test.describe('route protection', () => {
  for (const route of ['/', '/profile', '/admin', '/task-details/1']) {
    test(`an anonymous visitor is redirected away from ${route}`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login/);
    });
  }

  test('a regular user cannot reach the admin panel', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('nonadmin');
    const token = await registerViaApi(request, user);
    await primeSession(page, token);

    await page.goto('/admin');

    await expect(page).toHaveURL(/\/$|\/#/);
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });

  test('an admin can reach the admin panel', async ({ page }) => {
    await loginViaUi(page, ADMIN);

    await page.getByRole('button', { name: 'Admin Panel' }).click();

    await expect(page).toHaveURL(/\/admin/);
  });

  test('a corrupt token does not grant access', async ({ page }) => {
    await primeSession(page, 'not-a-real-jwt');

    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('API authorization', () => {
  test('unauthenticated requests are rejected', async ({ request }) => {
    for (const path of ['/projects', '/tasks', '/admin/users', '/profile/me']) {
      const response = await request.get(`${API_URL}${path}`);
      expect(response.status(), `${path} must require authentication`).toBe(
        401,
      );
    }
  });

  test('a regular user cannot create, edit or delete projects', async ({
    request,
  }) => {
    const user = uniqueUser('rbac-project');
    const token = await registerViaApi(request, user);
    const headers = { Authorization: `Bearer ${token}` };

    const created = await request.post(`${API_URL}/projects`, {
      headers,
      data: { name: uniqueName('forbidden') },
    });
    expect(created.status()).toBe(403);

    const updated = await request.put(`${API_URL}/projects/1`, {
      headers,
      data: { name: uniqueName('forbidden') },
    });
    expect(updated.status()).toBe(403);

    const deleted = await request.delete(`${API_URL}/projects/1`, { headers });
    expect(deleted.status()).toBe(403);
  });

  test('a regular user cannot use any admin endpoint', async ({ request }) => {
    const user = uniqueUser('rbac-admin');
    const token = await registerViaApi(request, user);
    const headers = { Authorization: `Bearer ${token}` };

    expect(
      (await request.get(`${API_URL}/admin/users`, { headers })).status(),
    ).toBe(403);
    expect(
      (
        await request.patch(`${API_URL}/admin/users/1/role`, {
          headers,
          data: { role: 'admin' },
        })
      ).status(),
    ).toBe(403);
    expect(
      (await request.delete(`${API_URL}/admin/users/1`, { headers })).status(),
    ).toBe(403);
  });

  test('a regular user may read projects but not mutate them', async ({
    request,
  }) => {
    const user = uniqueUser('rbac-read');
    const token = await registerViaApi(request, user);

    const response = await request.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  test('a regular user cannot escalate their own role', async ({ request }) => {
    const user = uniqueUser('escalate');
    const token = await registerViaApi(request, user);
    const adminToken = await loginViaApi(request, ADMIN);

    const users = await request.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const found = (
      (await users.json()) as { id: number; email: string }[]
    ).find((u) => u.email === user.email);
    expect(found).toBeTruthy();

    const attempt = await request.patch(
      `${API_URL}/admin/users/${found!.id}/role`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { role: 'admin' },
      },
    );
    expect(attempt.status()).toBe(403);

    const after = await request.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stillUser = (
      (await after.json()) as { email: string; role: string }[]
    ).find((u) => u.email === user.email);
    expect(stillUser?.role).toBe('user');
  });

  test('an admin cannot change their own role', async ({ request }) => {
    const adminToken = await loginViaApi(request, ADMIN);
    const headers = { Authorization: `Bearer ${adminToken}` };

    const users = await request.get(`${API_URL}/admin/users`, { headers });
    const self = ((await users.json()) as { id: number; email: string }[]).find(
      (u) => u.email === ADMIN.email,
    );

    const response = await request.patch(
      `${API_URL}/admin/users/${self!.id}/role`,
      { headers, data: { role: 'user' } },
    );

    expect(response.status()).toBe(400);
  });

  test('the super admin account is protected from admin actions', async ({
    request,
  }) => {
    const adminToken = await loginViaApi(request, ADMIN);
    const headers = { Authorization: `Bearer ${adminToken}` };

    const users = await request.get(`${API_URL}/admin/users`, { headers });
    const superAdmin = (
      (await users.json()) as { id: number; role: string }[]
    ).find((u) => u.role === 'superAdmin');
    expect(superAdmin).toBeTruthy();

    const demoted = await request.patch(
      `${API_URL}/admin/users/${superAdmin!.id}/role`,
      { headers, data: { role: 'user' } },
    );
    expect(demoted.status()).toBe(400);

    const deleted = await request.delete(
      `${API_URL}/admin/users/${superAdmin!.id}`,
      { headers },
    );
    expect(deleted.status()).toBe(400);
  });
});
