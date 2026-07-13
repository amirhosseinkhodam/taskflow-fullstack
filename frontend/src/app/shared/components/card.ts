import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl shadow" [class]="computedClasses()">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  readonly cssClass = input<string>();
  readonly variant = input<'default' | 'bordered'>('default');

  readonly computedClasses = () => {
    const base = 'rounded-2xl shadow';
    const variants = {
      default: 'bg-white dark:bg-slate-800 p-6',
      bordered:
        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6',
    };
    return [base, variants[this.variant()], this.cssClass()]
      .filter(Boolean)
      .join(' ');
  };
}
