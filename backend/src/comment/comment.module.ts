import { Module } from '@nestjs/common';
import { DatabaseModule } from '../shared/database/database.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
