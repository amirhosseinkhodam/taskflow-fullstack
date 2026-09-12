import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../shared/prisma/prisma.service';

@Injectable()
export class AuthService {
  readonly #prisma: PrismaService;
  readonly #jwtService: JwtService;
  constructor(prisma: PrismaService, jwtService: JwtService) {
    this.#prisma = prisma;
    this.#jwtService = jwtService;
  }

  #signToken(user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    nationalCode: string | null;
    phone: string | null;
    birthDate: string | null;
    role: string;
  }): string {
    return this.#jwtService.sign({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalCode: user.nationalCode,
      phone: user.phone,
      birthDate: user.birthDate,
      role: user.role,
    });
  }

  async register(email: string, password: string) {
    const existing = await this.#prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.#prisma.user.create({
      data: { email, password: hashed },
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
    const token = this.#signToken(user);
    return { token, user };
  }

  async login(email: string, password: string) {
    const user = await this.#prisma.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user;
    const token = this.#signToken(userWithoutPassword);
    return { token, user: userWithoutPassword };
  }
}
