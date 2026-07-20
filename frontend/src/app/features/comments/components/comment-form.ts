import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language';
import { TextareaComponent } from '../../../shared/components/textarea';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule, TextareaComponent, ButtonComponent],
  template: `
    <div class="mt-4">
      <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
        {{ t('addComment') }}
      </h3>
      <div class="flex gap-2">
        <app-textarea
          [(ngModel)]="content"
          [placeholder]="t('commentPlaceholder')"
          rows="3"
          variant="default"
          class="flex-1"
        />
        <app-button
          variant="primary"
          size="lg"
          type="button"
          (buttonClick)="onSubmit()"
          [disabled]="!content.trim()"
        >
          {{ t('addComment') }}
        </app-button>
      </div>
    </div>
  `,
})
export class CommentFormComponent {
  content = '';
  readonly submitComment = output<string>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onSubmit(): void {
    const trimmed = this.content.trim();
    if (!trimmed) return;
    this.submitComment.emit(trimmed);
    this.content = '';
  }
}
