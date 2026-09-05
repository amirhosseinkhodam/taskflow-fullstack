import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../shared/prisma/prisma.service';
import { validatePassword } from '../shared/password-validation';

@Injectable()
export class ProfileService {
  readonly #prisma: PrismaService;
  readonly #jwtService: JwtService;
  constructor(prisma: PrismaService, jwtService: JwtService) {
    this.#prisma = prisma;
    this.#jwtService = jwtService;
  }

  async getProfile(userId: number) {
    const user = await this.#prisma.user.findUnique({
      where: { id: userId },
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
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
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
    const existing = await this.#prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existing) {
      throw new UnauthorizedException('User not found');
    }

    if (fields.email && fields.email !== existing.email) {
      const emailConflict = await this.#prisma.user.findFirst({
        where: { email: fields.email, id: { not: userId } },
        select: { id: true },
      });
      if (emailConflict) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.#prisma.user.update({
      where: { id: userId },
      data: {
        email: fields.email ?? existing.email,
        firstName:
          fields.firstName !== undefined
            ? fields.firstName
            : existing.firstName,
        lastName:
          fields.lastName !== undefined ? fields.lastName : existing.lastName,
        nationalCode:
          fields.nationalCode !== undefined
            ? fields.nationalCode
            : existing.nationalCode,
        phone: fields.phone !== undefined ? fields.phone : existing.phone,
        birthDate:
          fields.birthDate !== undefined
            ? fields.birthDate
            : existing.birthDate,
      },
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

    const token = this.#jwtService.sign({
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalCode: user.nationalCode,
      phone: user.phone,
      birthDate: user.birthDate,
      role: user.role,
    });

    return { token, user };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.#prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    validatePassword(newPassword);

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.#prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { success: true };
  }
}
