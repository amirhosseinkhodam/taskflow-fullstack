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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskModel } from '@shared/types/task.model';
import { TaskService } from './task.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string): Promise<TaskModel[]> {
    return this.taskService.findAll(projectId ? Number(projectId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskModel | null> {
    return this.taskService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { title: string; description: string; projectId: number },
  ): Promise<TaskModel> {
    return this.taskService.create(
      body.title,
      body.description,
      body.projectId,
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
    return this.taskService.update(
      id,
      body.title,
      body.description,
      body.status,
      body.projectId,
    );
  }

  @Patch('reorder')
  reorder(@Body() body: { taskIds: number[] }): Promise<void> {
    return this.taskService.reorder(body.taskIds);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.taskService.delete(id);
  }
}
