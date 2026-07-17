import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../features/auth/store/auth';
import { LanguageService } from '../services/language';
import { ButtonComponent } from './button';
import { LanguageToggleComponent } from './language-toggle';
import { ThemeToggleComponent } from './theme-toggle';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonComponent, LanguageToggleComponent, ThemeToggleComponent],
  template: `
    <header
      class="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            @if (showBackButton()) {
              <app-button
                variant="secondary"
                type="button"
                (buttonClick)="goBack()"
              >
                {{ t('backToDashboard') }}
              </app-button>
            }
            <h1 class="text-xl font-semibold text-slate-900 dark:text-white">
              {{ title() }}
            </h1>
            @if (roleBadge()) {
              <span
                class="px-2 py-0.5 text-xs font-medium rounded-full"
                [ngClass]="roleBadgeClasses()"
              >
                {{ roleBadge() }}
              </span>
            }
          </div>
          <div class="flex items-center gap-3 flex-wrap justify-end">
            <ng-content></ng-content>
            <app-language-toggle></app-language-toggle>
            <app-theme-toggle></app-theme-toggle>
            @if (showProfileButton()) {
              <app-button variant="secondary" (buttonClick)="goToProfile()">
                {{ t('profile') }}
              </app-button>
            }
            <app-button variant="secondary" (buttonClick)="logout()">
              {{ t('logout') }}
            </app-button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly roleBadge = input<string>();
  readonly showBackButton = input<boolean>(true);
  readonly showProfileButton = input<boolean>(true);

  readonly #languageService = inject(LanguageService);
  readonly #router = inject(Router);
  readonly #auth = inject(AuthStore);

  readonly roleBadgeClasses = computed(() => {
    const badge = this.roleBadge() ?? '';
    if (badge.includes('superAdmin')) {
      return 'bg-amber-200 text-amber-900 dark:bg-amber-800/40 dark:text-amber-200';
    }
    if (badge.includes('admin')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  });

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  goBack(): void {
    this.#router.navigate(['/']);
  }

  goToProfile(): void {
    this.#router.navigate(['/profile']);
  }

  logout(): void {
    this.#auth.logout();
    this.#router.navigate(['/login']);
  }
}
