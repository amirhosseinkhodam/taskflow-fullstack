import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Pool } from 'pg';
import type { AuthUserModel } from '@shared/types/auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  readonly #db: Pool;
  constructor(@Inject('DATABASE') db: Pool) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-me',
    });
    this.#db = db;
  }

  async validate(payload: {
    sub: number;
    email: string;
    role: 'user' | 'admin' | 'superAdmin';
  }) {
    const result = await this.#db.query<AuthUserModel>(
      `SELECT id, email, "firstName", "lastName", "nationalCode", phone, "birthDate", role
       FROM users WHERE id = $1`,
      [payload.sub],
    );
    const user = result.rows[0];
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
