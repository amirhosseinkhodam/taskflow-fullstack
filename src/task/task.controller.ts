import { Body, Controller, Get, Post } from '@nestjs/common';

interface TaskModel {
  id: number;
  title: string;
  projectId: number;
}

@Controller('task')
export class TaskController {
  private tasks: TaskModel[] = [];

  @Get()
  getTasks() {
    return this.tasks;
  }

  @Post()
  createTask(@Body() body: { title: string; projectId: number }): TaskModel {
    const newTask: TaskModel = {
      id: Date.now(),
      title: body.title,
      projectId: body.projectId,
    };
    this.tasks.push(newTask);
    return newTask;
  }
}
