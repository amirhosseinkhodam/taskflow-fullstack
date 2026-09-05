import { Component, input, output } from '@angular/core';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { TASK_STATUSES } from '@shared/const/task-statuses';

@Component({
  selector: 'app-status-filter',
  standalone: true,
  imports: [MatChipListbox, MatChipOption, TranslatePipe],
  template: `
    <mat-chip-listbox
      [value]="activeStatus()"
      (change)="statusChange.emit($event.value)"
      aria-label="Filter by status"
    >
      @for (option of statusOptions; track option.value) {
        <mat-chip-option [value]="option.value">
          {{ option.labelKey | translate }}
        </mat-chip-option>
      }
    </mat-chip-listbox>
  `,
})
export class StatusFilterComponent {
  readonly activeStatus = input.required<string>();
  readonly statusChange = output<string>();

  readonly statusOptions = [
    { value: 'all', labelKey: 'all' },
    { value: TASK_STATUSES.PENDING, labelKey: 'pending' },
    { value: TASK_STATUSES.IN_PROGRESS, labelKey: 'inProgress' },
    { value: TASK_STATUSES.DONE, labelKey: 'done' },
  ];
}
