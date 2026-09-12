function limitFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const RATE_LIMIT_TTL_MS = 60_000;

export const RATE_LIMITS = {
  global: limitFromEnv(process.env.THROTTLE_GLOBAL_LIMIT, 30),
  register: limitFromEnv(process.env.THROTTLE_REGISTER_LIMIT, 5),
  login: limitFromEnv(process.env.THROTTLE_LOGIN_LIMIT, 10),
} as const;
