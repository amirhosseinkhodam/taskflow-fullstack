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
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      /* Mobile: target the inner chips container of mat-chip-listbox */
      @media (max-width: 639px) {
        :host ::ng-deep .mat-mdc-chip-listbox,
        :host ::ng-deep .mdc-evolution-chip-set__chips {
          display: flex !important;
          flex-wrap: nowrap;
          gap: 8px !important;
          width: 100% !important;
          margin: 0 !important;
        }

        :host ::ng-deep mat-chip-option {
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
        }
      }

      /* Desktop: inline-flex */
      @media (min-width: 640px) {
        :host ::ng-deep .mat-mdc-chip-listbox,
        :host ::ng-deep .mdc-evolution-chip-set__chips {
          display: inline-flex !important;
          grid-template-columns: none !important;
          width: auto !important;
        }

        :host ::ng-deep mat-chip-option {
          width: auto !important;
        }
      }
    `,
  ],
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
