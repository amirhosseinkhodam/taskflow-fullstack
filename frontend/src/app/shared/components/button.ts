import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[appButton]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="computedClasses()"
      (click)="onClick()"
      (keydown.enter)="onEnter($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly cssClass = input<string>();
  readonly variant = input<'primary' | 'secondary' | 'destructive' | 'ghost'>(
    'secondary',
  );

  readonly click = output<void>({ alias: 'buttonClick' });

  onClick() {
    if (!this.disabled()) {
      this.click.emit();
    }
  }

  onEnter(event: KeyboardEvent) {
    event.preventDefault();
    if (!this.disabled()) {
      this.click.emit();
    }
  }

  readonly computedClasses = () => {
    const base =
      'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      primary:
        'bg-slate-900 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500',
      secondary:
        'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
      destructive:
        'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600',
      ghost:
        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    };

    return [base, variants[this.variant()], this.cssClass()]
      .filter(Boolean)
      .join(' ');
  };
}
