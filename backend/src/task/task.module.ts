import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  providers: [TaskService],
  exports: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
