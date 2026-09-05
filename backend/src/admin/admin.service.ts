import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { USER_ROLES, type UserRole } from '@shared/const/user-roles';
import { PrismaService } from '../shared/prisma/prisma.service';
import { validatePassword } from '../shared/password-validation';

@Injectable()
export class AdminService {
  readonly #prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.#prisma = prisma;
  }

  findAllUsers() {
    return this.#prisma.user.findMany({
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
      orderBy: { id: 'asc' },
    });
  }

  async deleteUser(id: number, requesterId: number) {
    if (id === requesterId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    const target = await this.#prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === USER_ROLES.SUPER_ADMIN) {
      throw new BadRequestException('Cannot delete superAdmin');
    }

    await this.#prisma.$transaction([
      this.#prisma.task.updateMany({
        where: { assigneeId: id },
        data: { assigneeId: null },
      }),
      this.#prisma.taskComment.deleteMany({ where: { userId: id } }),
      this.#prisma.user.delete({ where: { id } }),
    ]);

    return { success: true };
  }

  async updateUserRole(id: number, role: UserRole, requesterId: number) {
    if (id === requesterId) {
      throw new BadRequestException('Cannot change your own role');
    }

    if (role !== USER_ROLES.USER && role !== USER_ROLES.ADMIN) {
      throw new BadRequestException('Role must be "user" or "admin"');
    }

    const target = await this.#prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === USER_ROLES.SUPER_ADMIN) {
      throw new BadRequestException('Cannot modify superAdmin');
    }

    const user = await this.#prisma.user.update({
      where: { id },
      data: { role },
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
    return user;
  }

  async updateUserPassword(
    id: number,
    newPassword: string,
    requesterId: number,
  ) {
    if (id === requesterId) {
      throw new BadRequestException('Cannot change your own password here');
    }

    validatePassword(newPassword);

    const target = await this.#prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === USER_ROLES.SUPER_ADMIN) {
      throw new BadRequestException('Cannot change superAdmin password');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.#prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
    return { success: true };
  }
}
