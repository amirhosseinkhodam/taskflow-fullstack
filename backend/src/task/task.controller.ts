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
import { TaskService } from './task.service';

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
    @Body() body: { title: string; description: string; projectId: number },
    @Req() req: Request & { user: { id: number } },
  ): Promise<TaskModel> {
    return this.#taskService.create(
      body.title,
      body.description,
      body.projectId,
      req.user.id,
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      description?: string;
      status?: string;
      projectId?: number;
    },
  ): Promise<boolean> {
    return this.#taskService.update(
      id,
      body.title,
      body.description,
      body.status,
      body.projectId,
    );
  }

  @Patch('reorder')
  reorder(@Body() body: { taskIds: number[] }): Promise<void> {
    return this.#taskService.reorder(body.taskIds);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.#taskService.delete(id);
  }
}
