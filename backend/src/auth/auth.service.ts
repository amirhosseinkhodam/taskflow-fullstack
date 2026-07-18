import {
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
export class AuthService {
  readonly #db: Pool;
  readonly #jwtService: JwtService;
  constructor(@Inject('DATABASE') db: Pool, jwtService: JwtService) {
    this.#db = db;
    this.#jwtService = jwtService;
  }

  #signToken(user: AuthUserModel): string {
    return this.#jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async register(email: string, password: string) {
    const existing = await this.#db.query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (existing.rows[0]) {
      throw new ConflictException('Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await this.#db.query<AuthUserModel>(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role`,
      [email, hashed],
    );
    const user = result.rows[0];
    const token = this.#signToken(user);

    return { token, user };
  }

  async login(email: string, password: string) {
    const result = await this.#db.query<AuthUserModel & { password: string }>(
      `SELECT id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role, password
       FROM users WHERE email = $1`,
      [email],
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.#signToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}
