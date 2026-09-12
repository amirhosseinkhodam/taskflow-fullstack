import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectModule } from './project/project.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RATE_LIMITS, RATE_LIMIT_TTL_MS } from './shared/const/rate-limits';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: RATE_LIMIT_TTL_MS, limit: RATE_LIMITS.global }],
    }),
    PrismaModule,
    AuthModule,
    TaskModule,
    AdminModule,
    ProjectModule,
    ProfileModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
