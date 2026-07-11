import { Component, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../shared/services/language';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-center gap-2 mt-4">
        <button
          class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          [disabled]="currentPage() <= 1"
          (click)="pageChange.emit(currentPage() - 1)"
        >
          {{ t('previous') }}
        </button>
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ t('page') }} {{ currentPage() }} / {{ totalPages() }}
        </span>
        <button
          class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          [disabled]="currentPage() >= totalPages()"
          (click)="pageChange.emit(currentPage() + 1)"
        >
          {{ t('next') }}
        </button>
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
