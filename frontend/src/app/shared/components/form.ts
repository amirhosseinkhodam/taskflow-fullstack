import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[appForm]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <form [class]="computedClasses()">
      <ng-content></ng-content>
    </form>
  `,
})
export class FormComponent {
  readonly cssClass = input<string>();
  readonly variant = input<'default' | 'inline' | 'vertical' | 'horizontal'>(
    'default',
  );

  readonly computedClasses = signal<string>(this.#getClasses());

  #getClasses(): string {
    const base = 'space-y-4';

    const variants = {
      default: 'bg-white dark:bg-slate-800 rounded-2xl p-6 shadow',
      inline: 'flex gap-4 items-end',
      vertical: 'space-y-4',
      horizontal: 'flex gap-4 items-center',
    };

    return [base, variants[this.variant()], this.cssClass()]
      .filter(Boolean)
      .join(' ');
  }

  ngOnInit() {
    this.computedClasses.set(this.#getClasses());
  }
}
