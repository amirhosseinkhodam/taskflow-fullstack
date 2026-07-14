import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language';
import { InputComponent } from '../../../shared/components';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, InputComponent],
  template: `
    <div class="relative">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clip-rule="evenodd"
        />
      </svg>
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
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SearchInputComponent {
  readonly searchTerm = input<string>('');
  readonly searchChange = output<string>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
