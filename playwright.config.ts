import { defineConfig, devices } from '@playwright/test';

const API_PORT = Number(process.env.E2E_API_PORT ?? 3000);
const APP_PORT = Number(process.env.E2E_APP_PORT ?? 4300);

const API_URL = `http://localhost:${API_PORT}`;
const APP_URL = `http://localhost:${APP_PORT}`;

const E2E_DB = process.env.E2E_PGDATABASE ?? 'taskflow_e2e';

export default defineConfig({
  testDir: './e2e/tests',

  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],

  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command:
        'npx ts-node -P tsconfig.e2e.json e2e/support/global-setup.ts && node dist/backend/src/main.js',
      url: `${API_URL}/api/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        PORT: String(API_PORT),
        NODE_ENV: 'development',
        PGDATABASE: E2E_DB,
        JWT_SECRET: 'e2e-jwt-secret-not-for-production',
        CORS_ORIGIN: APP_URL,
        THROTTLE_GLOBAL_LIMIT: '10000',
        THROTTLE_REGISTER_LIMIT: '10000',
        THROTTLE_LOGIN_LIMIT: '10000',
      },
    },
    {
      command: `npx ng serve --port ${APP_PORT} --configuration development`,
      url: APP_URL,
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
