import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import type { AuthUserModel } from '@shared/types/auth';

@Injectable()
export class AdminService {
  readonly #db: Pool;
  constructor(@Inject('DATABASE') db: Pool) {
    this.#db = db;
  }

  async findAllUsers() {
    const result = await this.#db.query<AuthUserModel>(
      `SELECT id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role
       FROM users ORDER BY id`,
    );
    return result.rows;
  }

  async deleteUser(id: number, requesterId: number) {
    if (id === requesterId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    const target = await this.#db.query<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [id],
    );
    if (target.rows.length === 0) {
      throw new NotFoundException('User not found');
    }
    if (target.rows[0].role === 'superAdmin') {
      throw new BadRequestException('Cannot delete superAdmin');
    }

    const result = await this.#db.query('DELETE FROM users WHERE id = $1', [
      id,
    ]);
    if (result.rowCount === 0) {
      throw new NotFoundException('User not found');
    }
    return { success: true };
  }

  async updateUserRole(
    id: number,
    role: 'user' | 'admin' | 'superAdmin',
    requesterId: number,
  ) {
    if (id === requesterId) {
      throw new BadRequestException('Cannot change your own role');
    }

    if (!['user', 'admin'].includes(role)) {
      throw new BadRequestException('Role must be "user" or "admin"');
    }

    const target = await this.#db.query<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [id],
    );
    if (target.rows.length === 0) {
      throw new NotFoundException('User not found');
    }
    if (target.rows[0].role === 'superAdmin') {
      throw new BadRequestException('Cannot modify superAdmin');
    }

    const result = await this.#db.query<AuthUserModel>(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role`,
      [role, id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }
    return result.rows[0];
  }

  async updateUserPassword(
    id: number,
    newPassword: string,
    requesterId: number,
  ) {
    if (id === requesterId) {
      throw new BadRequestException('Cannot change your own password here');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const target = await this.#db.query<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [id],
    );
    if (target.rows.length === 0) {
      throw new NotFoundException('User not found');
    }
    if (target.rows[0].role === 'superAdmin') {
      throw new BadRequestException('Cannot change superAdmin password');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await this.#db.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashed, id],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('User not found');
    }
    return { success: true };
  }
}
