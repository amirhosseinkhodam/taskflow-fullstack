import { Module, forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { DatabaseModule } from './shared/database/database.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    TaskModule,
    forwardRef(() => ProjectModule),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
