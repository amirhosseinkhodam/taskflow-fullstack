import { Module, forwardRef } from '@nestjs/common';
import { AppModule } from '../app.module';
import { DatabaseModule } from '../shared/database/database.module';
import { TaskModule } from '../task/task.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [forwardRef(() => AppModule), DatabaseModule, TaskModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
