import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, input, output, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import type { CommentModel } from '@shared/types/task';
import { ButtonComponent } from '../../../shared/components/button';
import { ConfirmBottomSheetComponent } from '../../../shared/components/confirm-bottom-sheet';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { InputComponent } from '../../../shared/components/input';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date';
import { TranslatePipe } from '../../../shared/pipes/translate';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [LocalizedDatePipe, TranslatePipe, ButtonComponent, InputComponent],
  template: `
    <div class="space-y-3">
      @if (comments().length === 0) {
        <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          {{ 'noCommentsYet' | translate }}
        </p>
      } @else {
        @for (comment of comments(); track comment.id) {
          <div
            class="flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-surface dark:shadow-none"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-900 dark:text-slate-100">
                  {{ comment.userName || ('unknownUser' | translate) }}
                </span>
                <span class="text-xs text-slate-400 dark:text-slate-500">
                  {{ comment.createdAt | localizedDate }}
                </span>
              </div>
              <p
                class="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
              >
                {{ comment.content }}
              </p>
              @if (isEditing(comment.id)) {
                <div class="mt-2 flex gap-2">
                  <app-input
                    type="text"
                    [value]="editContent[comment.id] || comment.content"
                    (inputChange)="editContent[comment.id] = $event"
                    (inputKeydown)="
                      $event.key === 'Enter'
                        ? saveEdit(comment.id)
                        : $event.key === 'Escape'
                          ? cancelEdit(comment.id)
                          : null
                    "
                    cssClass="flex-1"
                  />
                  <app-button
                    variant="primary"
                    size="sm"
                    (buttonClick)="saveEdit(comment.id)"
                  >
                    {{ 'save' | translate }}
                  </app-button>
                  <app-button
                    variant="secondary"
                    size="sm"
                    (buttonClick)="cancelEdit(comment.id)"
                  >
                    {{ 'cancel' | translate }}
                  </app-button>
                </div>
              } @else if (canEdit(comment)) {
                <div class="mt-2 flex gap-2">
                  <app-button
                    variant="secondary"
                    size="sm"
                    (buttonClick)="startEdit(comment.id)"
                  >
                    {{ 'editComment' | translate }}
                  </app-button>
                  <app-button
                    variant="destructive"
                    size="sm"
                    (buttonClick)="confirmDelete(comment.id)"
                  >
                    {{ 'deleteComment' | translate }}
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

  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #breakpointObserver = inject(BreakpointObserver);

  readonly editingCommentId = signal<number | null>(null);
  readonly editContent: Record<number, string> = {};
  readonly isPhone = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
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
    const data = {
      title: 'deleteComment',
      message: 'confirmDeleteComment',
    };

    const confirmed$ = this.isPhone()
      ? this.#bottomSheet
          .open(ConfirmBottomSheetComponent, { data })
          .afterDismissed()
      : this.#dialog.open(ConfirmDialogComponent, { data }).afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;
      this.onDelete.emit(commentId);
    });
  }
}
