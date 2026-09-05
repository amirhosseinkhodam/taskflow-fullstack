import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UserRole } from '@shared/const/user-roles';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  readonly #prisma: PrismaService;
  constructor(prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
    this.#prisma = prisma;
  }

  async validate(payload: { sub: number; email: string; role: UserRole }) {
    const user = await this.#prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        nationalCode: true,
        phone: true,
        birthDate: true,
        role: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
