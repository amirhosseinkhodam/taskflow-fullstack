export type UserRole = 'user' | 'admin' | 'superAdmin';

export interface AuthResponseModel {
  token: string;
  user: { id: number; email: string; name: string; role: UserRole };
}
