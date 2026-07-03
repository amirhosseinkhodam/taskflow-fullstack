import type { UserRole } from '@shared/types/auth';

export interface UserModel {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}
