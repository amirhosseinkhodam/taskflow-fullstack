import { Component, input, signal } from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import {
  CONTROL_BASE_CLASSES,
  CONTROL_VARIANT_CLASSES,
  controlFocusClasses,
} from '../../../shared/const/control-classes';
import { TranslatePipe } from '../../../shared/pipes/translate';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, HugeiconsIconComponent, TranslatePipe],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
  template: `
    <div class="relative mt-3">
      <input
        [class]="inputClasses"
        [type]="showPassword() ? 'text' : 'password'"
        [formControlName]="controlName()"
        [placeholder]="placeholderValue()"
        [autocomplete]="autocompleteValue()"
      />
      <button
        type="button"
        class="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        [attr.aria-label]="
          (showPassword() ? 'hidePassword' : 'showPassword') | translate
        "
        [attr.aria-pressed]="showPassword()"
        (click)="showPassword.set(!showPassword())"
      >
        @if (showPassword()) {
          <hugeicons-icon
            [icon]="icons.ViewOffSlashIcon"
            [size]="20"
            color="currentColor"
            [strokeWidth]="1.5"
          />
        } @else {
          <hugeicons-icon
            [icon]="icons.ViewIcon"
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

  readonly icons = { ViewIcon, ViewOffSlashIcon };

  readonly inputClasses = [
    CONTROL_BASE_CLASSES,
    CONTROL_VARIANT_CLASSES.default,
    controlFocusClasses(false),
    'pe-10',
  ].join(' ');
}
