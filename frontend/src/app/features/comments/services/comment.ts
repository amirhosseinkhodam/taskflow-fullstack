import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CommentModel } from '@shared/types/task';

@Injectable({ providedIn: 'root' })
export class CommentService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getComments(taskId: number) {
    return this.#http.get<CommentModel[]>(
      `${this.#apiBaseUrl}/tasks/${taskId}/comments`,
    );
  }

  createComment(taskId: number, content: string) {
    return this.#http.post<CommentModel>(
      `${this.#apiBaseUrl}/tasks/${taskId}/comments`,
      { content },
    );
  }

  updateComment(id: number, content: string) {
    return this.#http.put<CommentModel>(
      `${this.#apiBaseUrl}/tasks/comments/${id}`,
      { content },
    );
  }

  deleteComment(id: number) {
    return this.#http.delete<void>(`${this.#apiBaseUrl}/tasks/comments/${id}`);
  }
}
