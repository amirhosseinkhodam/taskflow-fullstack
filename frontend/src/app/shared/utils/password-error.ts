const PASSWORD_ERROR_MAP: Record<string, string> = {
  'Password must be at least 8 characters': 'passwordTooShort8',
  'Password must be at most 128 characters': 'passwordTooLong',
  'Password must contain at least one uppercase letter':
    'passwordNeedsUppercase',
  'Password must contain at least one lowercase letter':
    'passwordNeedsLowercase',
  'Password must contain at least one number': 'passwordNeedsNumber',
  'Password must contain at least one special character':
    'passwordNeedsSpecialChar',
  'Password is too common': 'passwordTooCommon',
  'Current password is incorrect': 'incorrectCurrentPassword',
  'Cannot change your own password here': 'cannotChangeOwnPassword',
};

export function mapPasswordError(backendMessage: string): string {
  return PASSWORD_ERROR_MAP[backendMessage] ?? 'couldNotChangePassword';
}
