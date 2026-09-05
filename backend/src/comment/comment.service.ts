import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_ROLES } from '@shared/const/user-roles';
import { PrismaService } from '../shared/prisma/prisma.service';
import type { CommentModel } from '@shared/types/task';

@Injectable()
export class CommentService {
  readonly #prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.#prisma = prisma;
  }

  async create(
    taskId: number,
    userId: number,
    content: string,
  ): Promise<CommentModel> {
    const task = await this.#prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.#prisma.taskComment.create({
      data: { taskId, userId, content },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    const userName = comment.user
      ? [comment.user.firstName, comment.user.lastName]
          .filter(Boolean)
          .join(' ') || comment.user.email
      : 'Unknown';

    return {
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      userName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  async findByTask(taskId: number): Promise<CommentModel[]> {
    const comments = await this.#prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      userId: c.userId,
      userName: c.user
        ? [c.user.firstName, c.user.lastName].filter(Boolean).join(' ') ||
          c.user.email
        : 'Unknown',
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async update(
    id: number,
    requesterId: number,
    requesterRole: string,
    content: string,
  ): Promise<CommentModel> {
    const comment = await this.#prisma.taskComment.findUnique({
      where: { id },
      select: { id: true, userId: true, taskId: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAdmin =
      requesterRole === USER_ROLES.ADMIN ||
      requesterRole === USER_ROLES.SUPER_ADMIN;
    const isAuthor = comment.userId === requesterId;

    const task = await this.#prisma.task.findUnique({
      where: { id: comment.taskId },
      select: { assigneeId: true },
    });
    const isAssignee = task?.assigneeId === requesterId;

    if (!isAdmin && !isAuthor && !isAssignee) {
      throw new ForbiddenException(
        'You can only edit your own comments or comments on tasks assigned to you',
      );
    }

    const updated = await this.#prisma.taskComment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    const userName = updated.user
      ? [updated.user.firstName, updated.user.lastName]
          .filter(Boolean)
          .join(' ') || updated.user.email
      : 'Unknown';

    return {
      id: updated.id,
      taskId: updated.taskId,
      userId: updated.userId,
      userName,
      content: updated.content,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(
    id: number,
    requesterId: number,
    requesterRole: string,
  ): Promise<boolean> {
    const comment = await this.#prisma.taskComment.findUnique({
      where: { id },
      select: { id: true, userId: true, taskId: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAdmin =
      requesterRole === USER_ROLES.ADMIN ||
      requesterRole === USER_ROLES.SUPER_ADMIN;
    const isAuthor = comment.userId === requesterId;

    const task = await this.#prisma.task.findUnique({
      where: { id: comment.taskId },
      select: { assigneeId: true },
    });
    const isAssignee = task?.assigneeId === requesterId;

    if (!isAdmin && !isAuthor && !isAssignee) {
      throw new ForbiddenException(
        'You can only delete your own comments or comments on tasks assigned to you',
      );
    }

    const result = await this.#prisma.taskComment.delete({ where: { id } });
    return result.id === id;
  }
}
