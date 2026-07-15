import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="relative mt-3">
      <app-input
        type="password"
        [formControlName]="controlName()"
        [placeholder]="placeholderValue()"
        [autocomplete]="autocompleteValue()"
        [disabled]="disabled()"
        variant="default"
      />
      <app-button
        variant="icon"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3"
        (buttonClick)="showPassword.set(!showPassword())"
        aria-label="Toggle password visibility"
      >
        @if (showPassword()) {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="size-5"
          >
            <path
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
            />
            <path
              d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
            />
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          </svg>
        } @else {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="size-5"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      </app-button>
    </div>
  `,
})
export class PasswordInputComponent {
  readonly controlName = input.required<string>();
  readonly placeholderValue = input('');
  readonly autocompleteValue = input('');
  readonly showPassword = signal(false);
  readonly disabled = input(false);
  readonly variant = input<'default' | 'error' | 'disabled'>('default');
}
