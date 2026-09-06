import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_ROLES } from '@shared/const/user-roles';
import { PrismaService } from '../shared/prisma/prisma.service';
import type { TaskModel, PaginatedResponseModel } from '@shared/types/task';

@Injectable()
export class TaskService {
  readonly #prisma: PrismaService;
  constructor(prisma: PrismaService) {
    this.#prisma = prisma;
  }

  async create(
    title: string,
    description: string,
    projectId: number,
    userId: number,
    assigneeEmail?: string,
  ): Promise<TaskModel> {
    const project = await this.#prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    let assigneeId: number | null = null;
    if (assigneeEmail) {
      const user = await this.#prisma.user.findUnique({
        where: { email: assigneeEmail },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException('Assignee not found');
      }
      assigneeId = user.id;
    }

    const maxPos = await this.#prisma.task.aggregate({
      where: { projectId },
      _max: { position: true },
    });
    const nextPos = (maxPos._max.position ?? -1) + 1;

    const task = await this.#prisma.task.create({
      data: {
        title,
        description,
        projectId,
        position: nextPos,
        userId,
        assigneeId,
      },
    });

    return this.findOne(task.id) as Promise<TaskModel>;
  }

  async findAll(filters: {
    projectId?: number;
    status?: string;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseModel<TaskModel>> {
    const where: Record<string, unknown> = {};

    if (filters.projectId !== undefined) {
      where.projectId = filters.projectId;
    }
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters.searchTerm) {
      where.OR = [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        {
          description: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(100, filters.limit ?? 5));
    const [total, tasks] = await Promise.all([
      this.#prisma.task.count({ where }),
      this.#prisma.task.findMany({
        where,
        include: {
          creator: {
            select: { firstName: true, lastName: true, email: true },
          },
          assignee: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const data = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? '',
      status: t.status,
      projectId: t.projectId,
      position: t.position,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      userId: t.userId ?? 0,
      creatorName: t.creator
        ? [t.creator.firstName, t.creator.lastName].filter(Boolean).join(' ') ||
          t.creator.email
        : undefined,
      assigneeId: t.assigneeId,
      assigneeName: t.assignee
        ? [t.assignee.firstName, t.assignee.lastName]
            .filter(Boolean)
            .join(' ') || t.assignee.email
        : null,
      assigneeEmail: t.assignee?.email ?? null,
    })) as unknown as TaskModel[];

    return { data, total, page, limit, totalPages };
  }

  async findOne(id: number): Promise<TaskModel | null> {
    const t = await this.#prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignee: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    if (!t) return null;

    return {
      id: t.id,
      title: t.title,
      description: t.description ?? '',
      status: t.status,
      projectId: t.projectId,
      position: t.position,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      userId: t.userId ?? 0,
      creatorName: t.creator
        ? [t.creator.firstName, t.creator.lastName].filter(Boolean).join(' ') ||
          t.creator.email
        : undefined,
      assigneeId: t.assigneeId,
      assigneeName: t.assignee
        ? [t.assignee.firstName, t.assignee.lastName]
            .filter(Boolean)
            .join(' ') || t.assignee.email
        : null,
      assigneeEmail: t.assignee?.email ?? null,
    };
  }

  async update(
    id: number,
    requesterId: number,
    requesterRole: string,
    title?: string,
    description?: string,
    status?: string,
    projectId?: number,
    assigneeEmail?: string,
  ): Promise<boolean> {
    const task = await this.#prisma.task.findUnique({
      where: { id },
      select: { id: true, userId: true, assigneeId: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isAdmin =
      requesterRole === USER_ROLES.ADMIN ||
      requesterRole === USER_ROLES.SUPER_ADMIN;

    let assigneeId: number | null = task.assigneeId;
    if (assigneeEmail !== undefined) {
      const newAssignee = assigneeEmail
        ? await this.#prisma.user.findUnique({
            where: { email: assigneeEmail },
            select: { id: true },
          })
        : null;
      const newAssigneeId = newAssignee?.id ?? null;

      const isChangingAssignee = newAssigneeId !== task.assigneeId;
      if (isChangingAssignee && !isAdmin) {
        throw new ForbiddenException('Only admins can reassign tasks');
      }
      assigneeId = newAssigneeId;
    }

    if (projectId !== undefined && !isAdmin) {
      throw new ForbiddenException(
        'Only admins can move tasks between projects',
      );
    }

    if (projectId !== undefined) {
      const project = await this.#prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException('Target project not found');
      }
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (projectId !== undefined) data.projectId = projectId;
    if (assigneeEmail !== undefined) data.assigneeId = assigneeId;

    if (Object.keys(data).length === 0) {
      return false;
    }

    const result = await this.#prisma.task.updateMany({
      where: { id },
      data,
    });

    return result.count > 0;
  }

  async reorder(taskIds: number[]): Promise<void> {
    if (taskIds.length === 0) {
      throw new BadRequestException('taskIds must not be empty');
    }

    const uniqueIds = [...new Set(taskIds)];
    if (uniqueIds.length !== taskIds.length) {
      throw new BadRequestException('taskIds must not contain duplicates');
    }

    const tasks = await this.#prisma.task.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    if (tasks.length !== uniqueIds.length) {
      throw new BadRequestException('One or more task IDs do not exist');
    }

    await this.#prisma.$transaction(
      taskIds.map((taskId, i) =>
        this.#prisma.task.update({
          where: { id: taskId },
          data: { position: i },
        }),
      ),
    );
  }

  async delete(id: number): Promise<boolean> {
    const task = await this.#prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const result = await this.#prisma.task.delete({ where: { id } });
    return result.id === id;
  }

  async deleteByProject(projectId: number): Promise<void> {
    await this.#prisma.task.deleteMany({ where: { projectId } });
  }
}
