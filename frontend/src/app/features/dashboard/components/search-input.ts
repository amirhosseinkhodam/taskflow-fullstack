import { Component, inject, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../shared/services/language';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <mat-form-field appearance="outline" class="w-full max-w-xs">
      <mat-label>{{ t('searchTasks') }}</mat-label>
      <input
        matInput
        [value]="searchTerm()"
        (input)="onInput($event)"
        placeholder="{{ t('searchTasks') }}"
      />
      <mat-icon matPrefix>search</mat-icon>
    </mat-form-field>
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

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }
}
