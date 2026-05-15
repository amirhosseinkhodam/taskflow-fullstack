import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { DatabaseModule } from './shared/database/database.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [DatabaseModule, TaskModule, forwardRef(() => ProjectModule)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
