import { Component, input, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
} from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, HugeiconsIconComponent],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
  template: `
    <div class="relative mt-3">
      <input
        class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 pe-10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        [type]="showPassword() ? 'text' : 'password'"
        [formControlName]="controlName()"
        [placeholder]="placeholderValue()"
        [autocomplete]="autocompleteValue()"
      />
      <button
        type="button"
        class="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 dark:text-slate-500"
        (click)="showPassword.set(!showPassword())"
      >
        @if (showPassword()) {
          <hugeicons-icon
            [icon]="ViewOffIcon"
            [size]="20"
            color="currentColor"
            [strokeWidth]="1.5"
          />
        } @else {
          <hugeicons-icon
            [icon]="ViewIcon"
            [size]="20"
            color="currentColor"
            [strokeWidth]="1.5"
          />
        }
      </button>
    </div>
  `,
})
export class PasswordInputComponent {
  readonly controlName = input.required<string>();
  readonly placeholderValue = input('');
  readonly autocompleteValue = input('');
  readonly showPassword = signal(false);

  readonly icons = { ViewIcon, ViewOffIcon };
}
