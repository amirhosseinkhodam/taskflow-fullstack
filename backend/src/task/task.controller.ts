import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TaskModel } from './task.model';
import { TaskService } from './task.service';

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

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.taskService.delete(id);
  }
}
