import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../dashboard/services/dashboard';
import { LanguageService } from '../../../shared/services/language';
import { TaskItemComponent } from '../../../shared/components/task-item';
import {
  ButtonComponent,
  TaskFormComponent,
  CardComponent,
  PageHeaderComponent,
} from '../../../shared/components';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';
import { switchMap } from 'rxjs';
import { CommentListComponent } from '../../comments/components/comment-list';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    TaskItemComponent,
    TaskFormComponent,
    CardComponent,
    PageHeaderComponent,
    ButtonComponent,
    CommentListComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <app-page-header [title]="t('taskDetails')" [showBackButton]="true" />

      <main class="mx-auto max-w-2xl p-6">
        <app-card>
          @if (loading()) {
            <p
              class="rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
            >
              {{ t('loading') }}
            </p>
          } @else if (error()) {
            <p
              class="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {{ t('taskNotFound') }}
            </p>
          } @else {
            @if (task(); as task) {
              @if (isEditing()) {
                <app-task-form
                  [projects]="projects()"
                  [editingTask]="editingTask()"
                  [showProjectSelect]="false"
                  (submitTask)="saveTask($event)"
                  (cancelEdit)="cancelEdit()"
                />
              } @else {
                <app-task-item
                  [task]="task"
                  [projects]="projects()"
                  [showDetailLink]="false"
                  [showCreatorBadge]="true"
                  [showAssigneeBadge]="true"
                  [showEditButton]="true"
                  (edit)="startEdit($event)"
                  (toggled)="onToggled($event)"
                  (deleted)="onDeleted()"
                />

                <!-- Comments Section -->
                <div
                  class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
                >
                  <h3
                    class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4"
                  >
                    {{ t('comments') }}
                  </h3>
                  <app-comment-list
                    [comments]="comments()"
                    [currentUserId]="currentUserId()"
                    (onDelete)="deleteComment($event)"
                    (onUpdate)="updateComment($event)"
                  />
                  <div class="mt-4">
                    <textarea
                      #commentInput
                      placeholder="{{ t('commentPlaceholder') }}"
                      class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    ></textarea>
                    <div class="mt-2 flex justify-end">
                      <app-button
                        variant="primary"
                        size="sm"
                        (buttonClick)="onAddCommentClick()"
                      >
                        {{ t('addComment') }}
                      </app-button>
                    </div>
                  </div>
                </div>
              }
            }
          }
        </app-card>
      </main>
    </div>
  `,
})
export class TaskDetailsPageComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #dashboardService = inject(DashboardService);
  readonly #languageService = inject(LanguageService);

  readonly task = signal<TaskModel | null>(null);
  readonly projects = signal<ProjectModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly isEditing = signal(false);
  readonly editingTask = signal<TaskModel | null>(null);
  readonly comments = signal<
    {
      id: number;
      taskId: number;
      userId: number;
      userName: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);
  readonly currentUserId = signal<number>(0);
  readonly commentInput =
    viewChild<ElementRef<HTMLTextAreaElement>>('commentInput');

  readonly #taskId: number;

  constructor() {
    this.#taskId = Number(this.#route.snapshot.paramMap.get('id'));
    if (!this.#taskId) {
      this.#router.navigate(['/']);
      return;
    }

    this.#dashboardService
      .getProjects()
      .pipe(
        switchMap((projects) => {
          this.projects.set(projects);
          return this.#dashboardService.getTask(this.#taskId);
        }),
      )
      .subscribe({
        next: (task) => {
          this.task.set(task);
          this.currentUserId.set(Number(localStorage.getItem('userId') ?? '0'));
          this.loadComments();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load task:', err);
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  loadComments(): void {
    this.#dashboardService.getComments(this.#taskId).subscribe({
      next: (comments) => this.comments.set(comments),
      error: (err) => console.error('Failed to load comments:', err),
    });
  }

  onAddCommentClick(): void {
    const el = this.commentInput()?.nativeElement;
    if (!el) return;
    const content = el.value.trim();
    if (!content) return;

    this.#dashboardService.createComment(this.#taskId, content).subscribe({
      next: (comment) => {
        this.comments.update((c) => [...c, comment]);
        el.value = '';
      },
      error: (err) => console.error('Failed to add comment:', err),
    });
  }

  updateComment({ id, content }: { id: number; content: string }): void {
    this.#dashboardService.updateComment(id, content).subscribe({
      next: (updated) => {
        this.comments.update((c) =>
          c.map((comment) => (comment.id === id ? updated : comment)),
        );
      },
      error: (err) => console.error('Failed to update comment:', err),
    });
  }

  deleteComment(id: number): void {
    this.#dashboardService.deleteComment(id).subscribe({
      next: () => {
        this.comments.update((c) => c.filter((comment) => comment.id !== id));
      },
      error: (err) => console.error('Failed to delete comment:', err),
    });
  }

  startEdit(task: TaskModel): void {
    this.editingTask.set(task);
    this.isEditing.set(true);
  }

  saveTask(value: {
    title: string;
    description: string;
    projectId: number;
    assigneeEmail?: string;
  }): void {
    const task = this.task();
    if (!task) return;

    if (!value.title?.trim()) return;

    this.#dashboardService
      .updateTask(task.id, {
        title: value.title,
        description: value.description,
        assigneeEmail: value.assigneeEmail,
      })
      .subscribe({
        next: () => {
          this.#dashboardService.getTask(this.#taskId).subscribe({
            next: (updated) => this.task.set(updated),
          });
          this.editingTask.set(null);
          this.isEditing.set(false);
        },
        error: (err) => console.error('Failed to save task:', err),
      });
  }

  cancelEdit(): void {
    this.editingTask.set(null);
    this.isEditing.set(false);
  }

  onToggled(updated: TaskModel): void {
    this.task.set(updated);
  }

  onDeleted(): void {
    this.#router.navigate(['/']);
  }
}
