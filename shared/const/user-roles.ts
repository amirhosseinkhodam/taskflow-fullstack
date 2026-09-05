export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superAdmin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
