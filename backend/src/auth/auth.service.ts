import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

@Injectable()
export class AuthService {
  readonly #db: Pool;
  readonly #jwtService: JwtService;
  constructor(@Inject('DATABASE') db: Pool, jwtService: JwtService) {
    this.#db = db;
    this.#jwtService = jwtService;
  }

  async register(email: string, password: string, name: string) {
    const existing = await this.#db.query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (existing.rows[0]) {
      throw new ConflictException('Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await this.#db.query<{
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin' | 'superAdmin';
    }>(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
      [email, hashed, name],
    );
    const user = result.rows[0];
    const token = this.#jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  }

  async login(email: string, password: string) {
    const result = await this.#db.query<{
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin' | 'superAdmin';
      password: string;
    }>('SELECT id, email, name, role, password FROM users WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.#jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
