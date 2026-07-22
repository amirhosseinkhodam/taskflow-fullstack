import { BadRequestException } from '@nestjs/common';

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const COMMON_PASSWORDS = new Set([
  'password',
  '12345678',
  'qwerty123',
  'letmein',
  'welcome1',
  'admin123',
]);

export function validatePassword(password: string): void {
  if (!password || password.length < MIN_LENGTH) {
    throw new BadRequestException(
      `Password must be at least ${MIN_LENGTH} characters`,
    );
  }

  if (password.length > MAX_LENGTH) {
    throw new BadRequestException(
      `Password must be at most ${MAX_LENGTH} characters`,
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new BadRequestException(
      'Password must contain at least one uppercase letter',
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new BadRequestException(
      'Password must contain at least one lowercase letter',
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new BadRequestException('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    throw new BadRequestException(
      'Password must contain at least one special character',
    );
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    throw new BadRequestException('Password is too common');
  }
}
