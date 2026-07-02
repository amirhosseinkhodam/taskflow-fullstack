export type UserRole = 'user' | 'admin' | 'superadmin';

export interface AuthResponse {
  token: string;
  user: { id: number; email: string; name: string; role: UserRole };
}
