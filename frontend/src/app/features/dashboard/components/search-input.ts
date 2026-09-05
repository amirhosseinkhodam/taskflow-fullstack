import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language';
import { InputComponent } from '../../../shared/components/input';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, InputComponent, HugeiconsIconComponent],
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
        [placeholder]="t('searchTasks')"
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

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
