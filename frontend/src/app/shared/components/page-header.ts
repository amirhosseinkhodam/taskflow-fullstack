import { BreakpointObserver } from '@angular/cdk/layout';
import { NgClass } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language';
import { ButtonComponent } from './button';
import { LanguageToggleComponent } from './language-toggle';
import { ThemeToggleComponent } from './theme-toggle';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    NgClass,
    ButtonComponent,
    LanguageToggleComponent,
    ThemeToggleComponent,
    MatMenuModule,
  ],
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
              <app-button variant="secondary" (buttonClick)="onLogout()">
                {{ t('logout') }}
              </app-button>
            } @else {
              <button
                [matMenuTriggerFor]="mobileMenu"
                class="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
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
              </button>
              <mat-menu #mobileMenu="matMenu">
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
                  <button mat-menu-item (click)="goBack()">
                    {{ t('backToDashboard') }}
                  </button>
                }
                @if (showProfileButton()) {
                  <button mat-menu-item (click)="goToProfile()">
                    {{ t('profile') }}
                  </button>
                }
                <button
                  mat-menu-item
                  (click)="onLogout()"
                  class="!text-red-600"
                >
                  {{ t('logout') }}
                </button>
              </mat-menu>
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
  readonly logoutEvent = output<void>({ alias: 'logout' });

  readonly #languageService = inject(LanguageService);
  readonly #router = inject(Router);
  readonly #breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
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

  onLogout(): void {
    this.logoutEvent.emit();
    this.#router.navigate(['/login']);
  }
}
