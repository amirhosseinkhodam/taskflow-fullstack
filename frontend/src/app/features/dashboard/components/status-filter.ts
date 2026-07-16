import { Component, inject, input, output } from '@angular/core';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { LanguageService } from '../../../shared/services/language';

@Component({
  selector: 'app-status-filter',
  standalone: true,
  imports: [MatChipListbox, MatChipOption],
  template: `
    <mat-chip-listbox
      [value]="activeStatus()"
      (change)="statusChange.emit($event.value)"
      aria-label="Filter by status"
    >
      @for (option of statusOptions; track option.value) {
        <mat-chip-option [value]="option.value">
          {{ t(option.labelKey) }}
        </mat-chip-option>
      }
    </mat-chip-listbox>
  `,
})
export class StatusFilterComponent {
  readonly activeStatus = input.required<string>();
  readonly statusChange = output<string>();

  readonly #languageService = inject(LanguageService);

  readonly statusOptions = [
    { value: 'all', labelKey: 'all' },
    { value: 'pending', labelKey: 'pending' },
    { value: 'done', labelKey: 'done' },
  ];

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
