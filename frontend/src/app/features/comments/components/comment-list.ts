import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../shared/services/language';
import { JalaliDatePipe } from '../../../shared/pipes/jalali-date';
import { ButtonComponent } from '../../../shared/components/button';
import { FormsModule } from '@angular/forms';
import type { CommentModel } from '@shared/types/task';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, JalaliDatePipe, ButtonComponent, FormsModule],
  template: `
    <div class="space-y-3">
      @if (comments().length === 0) {
        <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          {{ t('noCommentsYet') }}
        </p>
      } @else {
        @for (comment of comments(); track comment.id) {
          <div
            class="flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-900 dark:text-slate-100">
                  {{ comment.userName || t('unknownUser') }}
                </span>
                <span class="text-xs text-slate-400 dark:text-slate-500">
                  {{ comment.createdAt | jalaliDate }}
                </span>
              </div>
              <p
                class="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
              >
                {{ comment.content }}
              </p>
              @if (isEditing(comment.id)) {
                <div class="mt-2 flex gap-2">
                  <input
                    type="text"
                    [value]="editContent[comment.id] || comment.content"
                    (input)="editContent[comment.id] = $event.target.value"
                    class="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    (keydown.enter)="saveEdit(comment.id)"
                    (keydown.escape)="cancelEdit(comment.id)"
                  />
                  <app-button
                    variant="primary"
                    size="sm"
                    (buttonClick)="saveEdit(comment.id)"
                  >
                    {{ t('save') }}
                  </app-button>
                  <app-button
                    variant="secondary"
                    size="sm"
                    (buttonClick)="cancelEdit(comment.id)"
                  >
                    {{ t('cancel') }}
                  </app-button>
                </div>
              } @else if (canEdit(comment)) {
                <div class="mt-2 flex gap-2">
                  <app-button
                    variant="ghost"
                    size="sm"
                    (buttonClick)="startEdit(comment.id)"
                  >
                    {{ t('editComment') }}
                  </app-button>
                  <app-button
                    variant="destructive"
                    size="sm"
                    (buttonClick)="confirmDelete(comment.id)"
                  >
                    {{ t('deleteComment') }}
                  </app-button>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class CommentListComponent {
  readonly comments = input.required<CommentModel[]>();
  readonly currentUserId = input.required<number>();
  readonly onDelete = output<number>();
  readonly onUpdate = output<{ id: number; content: string }>();

  readonly #languageService = inject(LanguageService);

  readonly editingCommentId = signal<number | null>(null);
  readonly editContent: Record<number, string> = {};

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  isEditing(commentId: number): boolean {
    return this.editingCommentId() === commentId;
  }

  canEdit(comment: CommentModel): boolean {
    return comment.userId === this.currentUserId();
  }

  startEdit(commentId: number): void {
    this.editingCommentId.set(commentId);
    this.editContent[commentId] =
      this.comments().find((c) => c.id === commentId)?.content ?? '';
  }

  saveEdit(commentId: number): void {
    const content = this.editContent[commentId]?.trim();
    if (content) {
      this.onUpdate.emit({ id: commentId, content });
    }
    this.cancelEdit(commentId);
  }

  cancelEdit(commentId: number): void {
    this.editingCommentId.set(null);
    delete this.editContent[commentId];
  }

  confirmDelete(commentId: number): void {
    if (confirm(this.t('confirmDeleteComment'))) {
      this.onDelete.emit(commentId);
    }
  }
}
