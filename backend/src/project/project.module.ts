import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { TaskModule } from '../task/task.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [DatabaseModule, TaskModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
