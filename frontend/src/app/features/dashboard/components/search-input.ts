import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { InputComponent } from '../../../shared/components/input';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, InputComponent, HugeiconsIconComponent, TranslatePipe],
  template: `
    <div class="relative">
      <hugeicons-icon
        [icon]="Search01Icon"
        [size]="16"
        color="currentColor"
        [strokeWidth]="1.5"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
      <app-input
        type="search"
        [ngModel]="searchTerm()"
        (ngModelChange)="searchChange.emit($event)"
        [placeholder]="'searchTasks' | translate"
        variant="default"
        [cssClass]="'pl-9'"
      />
    </div>
  `,
})
export class SearchInputComponent {
  readonly searchTerm = input<string>('');
  readonly searchChange = output<string>();

  readonly Search01Icon = Search01Icon;
}
