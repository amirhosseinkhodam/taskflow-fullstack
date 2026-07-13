import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <textarea
      [rows]="rows()"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="disabled()"
      [class]="computedClasses()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (focus)="onFocus()"
    ></textarea>
  `,
})
export class TextareaComponent {
  readonly rows = input<number>(4);
  readonly placeholder = input<string>();
  readonly value = input<string>();
  readonly disabled = input<boolean>(false);
  readonly cssClass = input<string>();
  readonly variant = input<'default' | 'error' | 'disabled'>('default');
  readonly error = input<boolean>(false);

  readonly input = output<string>({ alias: 'inputChange' });
  readonly blur = output<void>({ alias: 'inputBlur' });
  readonly focus = output<void>({ alias: 'inputFocus' });

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.input.emit(value);
  }

  onBlur() {
    this.blur.emit();
  }

  onFocus() {
    this.focus.emit();
  }

  readonly computedClasses = () => {
    const base =
      'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-vertical';

    const variants = {
      default:
        'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100',
      error:
        'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100',
      disabled:
        'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50',
    };

    const errorClass = this.error() ? 'ring-red-500 border-red-500' : '';

    return [base, variants[this.variant()], errorClass, this.cssClass()]
      .filter(Boolean)
      .join(' ');
  };
}
