import { Module, forwardRef } from '@nestjs/common';
import { TaskModule } from 'src/task/task.module';
import { AppModule } from '../app.module';
import { DatabaseModule } from '../shared/database/database.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [forwardRef(() => AppModule), DatabaseModule, TaskModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
