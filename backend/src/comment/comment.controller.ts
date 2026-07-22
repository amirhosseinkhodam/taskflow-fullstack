import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '@shared/types/auth';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import type { CommentModel } from '@shared/types/task';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class CommentController {
  readonly #commentService: CommentService;
  constructor(commentService: CommentService) {
    this.#commentService = commentService;
  }

  @Get(':taskId/comments')
  findByTask(
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<CommentModel[]> {
    return this.#commentService.findByTask(taskId);
  }

  @Post(':taskId/comments')
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CommentModel> {
    return this.#commentService.create(taskId, req.user.id, dto.content);
  }

  @Put('comments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CommentModel> {
    return this.#commentService.update(
      id,
      req.user.id,
      req.user.role,
      dto.content!,
    );
  }

  @Delete('comments/:id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<boolean> {
    return this.#commentService.delete(id, req.user.id, req.user.role);
  }
}
