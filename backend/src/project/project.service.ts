import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { TaskService } from '../task/task.service';
import type { ProjectModel } from '@shared/types/project';

@Injectable()
export class ProjectService {
  readonly #prisma: PrismaService;
  readonly #taskService: TaskService;
  constructor(prisma: PrismaService, taskService: TaskService) {
    this.#prisma = prisma;
    this.#taskService = taskService;
  }

  async findAll(): Promise<ProjectModel[]> {
    const projects = await this.#prisma.project.findMany({
      orderBy: { id: 'asc' },
    });
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async findOne(id: number): Promise<ProjectModel | null> {
    const p = await this.#prisma.project.findUnique({ where: { id } });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async create(name: string): Promise<ProjectModel> {
    const p = await this.#prisma.project.create({ data: { name } });
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async update(id: number, name?: string): Promise<ProjectModel | null> {
    if (name === undefined) return null;

    const p = await this.#prisma.project.update({
      where: { id },
      data: { name },
    });
    return {
      id: p.id,
      name: p.name,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async delete(id: number): Promise<boolean> {
    await this.#taskService.deleteByProject(id);
    const result = await this.#prisma.project.delete({ where: { id } });
    return result.id === id;
  }
}
