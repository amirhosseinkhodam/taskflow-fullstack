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
  readonly variant = input<
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'ghost'
    | 'warning'
    | 'success'
    | 'outline'
  >('secondary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

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

    const sizes = {
      sm: 'px-3 py-1.5 text-xs min-h-[36px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[44px]',
    };

    const variants = {
      primary:
        'bg-slate-900 dark:bg-slate-600 text-white hover:bg-slate-800 dark:hover:bg-slate-500',
      secondary:
        'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
      destructive:
        'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600',
      ghost:
        'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
      warning: 'bg-amber-500 text-white hover:bg-amber-600',
      success: 'bg-green-600 text-white hover:bg-green-700',
      outline:
        'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
    };

    return [base, sizes[this.size()], variants[this.variant()], this.cssClass()]
      .filter(Boolean)
      .join(' ');
  };
}
