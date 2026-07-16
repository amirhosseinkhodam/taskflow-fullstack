import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { TaskModel, PaginatedResponseModel } from '@shared/types/task';
import type { AuthenticatedRequest } from '@shared/types/auth';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, ReorderTaskDto } from './task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  readonly #taskService: TaskService;
  constructor(taskService: TaskService) {
    this.#taskService = taskService;
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponseModel<TaskModel>> {
    return this.#taskService.findAll({
      projectId: projectId ? Number(projectId) : undefined,
      status,
      searchTerm: search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskModel | null> {
    return this.#taskService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TaskModel> {
    return this.#taskService.create(
      dto.title,
      dto.description ?? '',
      dto.projectId,
      req.user.id,
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<boolean> {
    return this.#taskService.update(
      id,
      req.user.id,
      req.user.role,
      dto.title,
      dto.description,
      dto.status,
      dto.projectId,
    );
  }

  @Patch('reorder')
  reorder(
    @Body() dto: ReorderTaskDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.#taskService.reorder(dto.taskIds, req.user.id, req.user.role);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<boolean> {
    return this.#taskService.delete(id, req.user.id, req.user.role);
  }
}
