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
import type { AuthUserModel } from '@shared/types/auth';

@Injectable()
export class ProfileService {
  readonly #db: Pool;
  readonly #jwtService: JwtService;
  constructor(@Inject('DATABASE') db: Pool, jwtService: JwtService) {
    this.#db = db;
    this.#jwtService = jwtService;
  }

  async getProfile(userId: number) {
    const result = await this.#db.query<AuthUserModel>(
      `SELECT id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role
       FROM users WHERE id = $1`,
      [userId],
    );
    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }
    return result.rows[0];
  }

  async updateProfile(
    userId: number,
    fields: {
      email?: string;
      firstName?: string;
      lastName?: string;
      nationalCode?: string;
      phone?: string;
      birthDate?: string;
    },
  ) {
    const user = await this.#db.query<AuthUserModel & { password: string }>(
      `SELECT id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role, password
       FROM users WHERE id = $1`,
      [userId],
    );
    if (user.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const existing = user.rows[0];

    if (fields.email && fields.email !== existing.email) {
      const emailCheck = await this.#db.query<{ id: number }>(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [fields.email, userId],
      );
      if (emailCheck.rows.length > 0) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedEmail = fields.email ?? existing.email;
    const updatedFirstName =
      fields.firstName !== undefined ? fields.firstName : existing.firstName;
    const updatedLastName =
      fields.lastName !== undefined ? fields.lastName : existing.lastName;
    const updatedNationalCode =
      fields.nationalCode !== undefined
        ? fields.nationalCode
        : existing.nationalCode;
    const updatedPhone =
      fields.phone !== undefined ? fields.phone : existing.phone;
    const updatedBirthDate =
      fields.birthDate !== undefined ? fields.birthDate : existing.birthDate;

    const result = await this.#db.query<AuthUserModel>(
      `UPDATE users SET
        email = $1,
        "firstName" = $2,
        "lastName" = $3,
        "nationalCode" = $4,
        phone = $5,
        "birthDate" = $6
       WHERE id = $7
       RETURNING id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role`,
      [
        updatedEmail,
        updatedFirstName,
        updatedLastName,
        updatedNationalCode,
        updatedPhone,
        updatedBirthDate,
        userId,
      ],
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
