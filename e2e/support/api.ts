import type { APIRequestContext } from '@playwright/test';

export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
export const APP_URL = process.env.E2E_APP_URL ?? 'http://localhost:4300';

export const ADMIN = {
  email: 'e2e-admin@taskflow.test',
  password: 'AdminPass123!',
} as const;

export const SUPER_ADMIN = {
  email: 'e2e-superadmin@taskflow.test',
  password: 'SuperPass123!',
} as const;

export interface AuthUser {
  readonly email: string;
  readonly password: string;
}

export function uniqueUser(prefix = 'user'): AuthUser {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `e2e-${prefix}-${nonce}@taskflow.test`,
    password: 'UserPass123!',
  };
}

export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function registerViaApi(
  request: APIRequestContext,
  user: AuthUser,
): Promise<string> {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: { email: user.email, password: user.password },
  });
  if (!response.ok()) {
    throw new Error(
      `register failed (${response.status()}): ${await response.text()}`,
    );
  }
  const body = (await response.json()) as { token: string };
  return body.token;
}

export async function loginViaApi(
  request: APIRequestContext,
  user: AuthUser,
): Promise<string> {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (!response.ok()) {
    throw new Error(
      `login failed (${response.status()}): ${await response.text()}`,
    );
  }
  const body = (await response.json()) as { token: string };
  return body.token;
}

export async function createProjectViaApi(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<{ id: number; name: string }> {
  const response = await request.post(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name },
  });
  if (!response.ok()) {
    throw new Error(
      `create project failed (${response.status()}): ${await response.text()}`,
    );
  }
  return (await response.json()) as { id: number; name: string };
}

export async function createTaskViaApi(
  request: APIRequestContext,
  token: string,
  task: { title: string; description?: string; projectId: number },
): Promise<{ id: number; title: string }> {
  const response = await request.post(`${API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { description: '', ...task },
  });
  if (!response.ok()) {
    throw new Error(
      `create task failed (${response.status()}): ${await response.text()}`,
    );
  }
  return (await response.json()) as { id: number; title: string };
}
