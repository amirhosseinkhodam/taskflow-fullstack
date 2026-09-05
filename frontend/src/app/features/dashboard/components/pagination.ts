import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [ButtonComponent, TranslatePipe],
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-center gap-3 mt-3">
        <app-button
          variant="secondary"
          type="button"
          [disabled]="currentPage() <= 1"
          (buttonClick)="pageChange.emit(currentPage() - 1)"
        >
          {{ 'previous' | translate }}
        </app-button>
        <span class="text-sm text-slate-600 dark:text-slate-400">
          {{ 'page' | translate }} {{ currentPage() }} / {{ totalPages() }}
        </span>
        <app-button
          variant="secondary"
          type="button"
          [disabled]="currentPage() >= totalPages()"
          (buttonClick)="pageChange.emit(currentPage() + 1)"
        >
          {{ 'next' | translate }}
        </app-button>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();
}
