import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api';
import type { CommentModel } from '@shared/types/task';

@Injectable({ providedIn: 'root' })
export class CommentService {
  readonly #api = inject(ApiService);

  getComments(taskId: number) {
    return this.#api.get<CommentModel[]>(`/tasks/${taskId}/comments`);
  }

  createComment(taskId: number, content: string) {
    return this.#api.post<CommentModel>(`/tasks/${taskId}/comments`, {
      content,
    });
  }

  updateComment(id: number, content: string) {
    return this.#api.put<CommentModel>(`/tasks/comments/${id}`, { content });
  }

  deleteComment(id: number) {
    return this.#api.delete<void>(`/tasks/comments/${id}`);
  }
}
