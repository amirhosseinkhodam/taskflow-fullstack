import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, input, signal } from '@angular/core';
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
          <div class="flex items-center gap-2 sm:gap-4 min-w-0">
            @if (!isMobile() && showBackButton()) {
              <app-button
                variant="secondary"
                type="button"
                (buttonClick)="goBack()"
              >
                {{ t('backToDashboard') }}
              </app-button>
            }
            <h1
              class="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white truncate"
            >
              {{ title() }}
            </h1>
            @if (!isMobile() && roleBadge()) {
              <span
                class="px-2 py-0.5 text-xs font-medium rounded-full hidden sm:inline-flex"
                [ngClass]="roleBadgeClasses()"
              >
                {{ roleBadge() }}
              </span>
            }
          </div>
          <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ng-content></ng-content>
            <app-language-toggle></app-language-toggle>
            <app-theme-toggle></app-theme-toggle>
            @if (!isMobile()) {
              @if (showProfileButton()) {
                <app-button variant="secondary" (buttonClick)="goToProfile()">
                  {{ t('profile') }}
                </app-button>
              }
              <app-button variant="secondary" (buttonClick)="logout()">
                {{ t('logout') }}
              </app-button>
            } @else {
              <div class="relative">
                <app-button
                  variant="secondary"
                  type="button"
                  (buttonClick)="menuOpen.set(!menuOpen())"
                  [ariaLabel]="t('menu')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </app-button>
                @if (menuOpen()) {
                  <div
                    class="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg z-50"
                  >
                    <div class="py-1">
                      @if (roleBadge()) {
                        <div
                          class="px-4 py-2 border-b border-slate-200 dark:border-slate-700"
                        >
                          <span
                            class="px-2 py-0.5 text-xs font-medium rounded-full"
                            [ngClass]="roleBadgeClasses()"
                          >
                            {{ roleBadge() }}
                          </span>
                        </div>
                      }
                      @if (showBackButton()) {
                        <button
                          class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          (click)="goBack(); menuOpen.set(false)"
                        >
                          {{ t('backToDashboard') }}
                        </button>
                      }
                      @if (showProfileButton()) {
                        <button
                          class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          (click)="goToProfile(); menuOpen.set(false)"
                        >
                          {{ t('profile') }}
                        </button>
                      }
                      <button
                        class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        (click)="logout()"
                      >
                        {{ t('logout') }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
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
  readonly #breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);
  readonly menuOpen = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        if (!result.matches) this.menuOpen.set(false);
      });
  }

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
