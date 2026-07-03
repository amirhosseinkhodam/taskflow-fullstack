import type { UserRole } from '@shared/types/auth';

export interface UserModel {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}
