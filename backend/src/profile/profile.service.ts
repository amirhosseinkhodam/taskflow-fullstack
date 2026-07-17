import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

@Injectable()
export class ProfileService {
  readonly #db: Pool;
  readonly #jwtService: JwtService;
  constructor(@Inject('DATABASE') db: Pool, jwtService: JwtService) {
    this.#db = db;
    this.#jwtService = jwtService;
  }

  async getProfile(userId: number) {
    const result = await this.#db.query<{
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin' | 'superAdmin';
    }>('SELECT id, email, name, role FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }
    return result.rows[0];
  }

  async updateProfile(
    userId: number,
    email: string | undefined,
    currentPassword: string,
  ) {
    const user = await this.#db.query<{
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin' | 'superAdmin';
      password: string;
    }>('SELECT id, email, name, role, password FROM users WHERE id = $1', [
      userId,
    ]);
    if (user.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const existing = user.rows[0];
    if (!(await bcrypt.compare(currentPassword, existing.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (email && email !== existing.email) {
      const emailCheck = await this.#db.query<{ id: number }>(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId],
      );
      if (emailCheck.rows.length > 0) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedEmail = email ?? existing.email;

    const result = await this.#db.query<{
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin' | 'superAdmin';
    }>(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, name, role',
      [updatedEmail, userId],
    );

    const updatedUser = result.rows[0];
    const token = this.#jwtService.sign({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return { token, user: updatedUser };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.#db.query<{ password: string }>(
      'SELECT password FROM users WHERE id = $1',
      [userId],
    );
    if (user.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    if (!(await bcrypt.compare(currentPassword, user.rows[0].password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.#db.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashed,
      userId,
    ]);

    return { success: true };
  }
}
