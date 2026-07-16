import { Component, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../shared/services/language';
import { ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-center gap-3 mt-3">
        <app-button
          variant="secondary"
          type="button"
          [disabled]="currentPage() <= 1"
          (buttonClick)="pageChange.emit(currentPage() - 1)"
        >
          {{ t('previous') }}
        </app-button>
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ t('page') }} {{ currentPage() }} / {{ totalPages() }}
        </span>
        <app-button
          variant="secondary"
          type="button"
          [disabled]="currentPage() >= totalPages()"
          (buttonClick)="pageChange.emit(currentPage() + 1)"
        >
          {{ t('next') }}
        </app-button>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
