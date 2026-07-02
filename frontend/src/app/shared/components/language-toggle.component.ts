import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, LanguageOption } from '../services/language.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="language-switch"
      (click)="toggle()"
      [class.dark]="theme.isDark()"
      [attr.aria-label]="'Switch language (' + currentLanguage.nativeName + ')'"
      type="button"
    >
      <span class="language-text">{{ currentLanguage.nativeName }}</span>
      <span class="language-icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="18"
          height="18"
        >
          <path
            d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
          />
        </svg>
      </span>
    </button>
  `,
  styles: [
    `
      .language-switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 9999px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        color: #334155;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          color 0.2s ease;
        -webkit-tap-highlight-color: transparent;
        white-space: nowrap;
      }

      .language-switch.dark {
        background: #1e293b;
        border-color: #334155;
        color: #e2e8f0;
      }

      .language-switch:hover {
        background: #e2e8f0;
      }

      .language-switch.dark:hover {
        background: #334155;
      }

      .language-switch:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .language-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        transition: transform 0.3s ease;
      }

      .language-switch.dark .language-icon {
        color: #94a3b8;
      }

      .language-switch:hover .language-icon {
        transform: rotate(180deg);
      }

      @media (max-width: 640px) {
        .language-text {
          display: none;
        }
        .language-switch {
          padding: 8px;
        }
      }
    `,
  ],
})
export class LanguageToggleComponent {
  readonly #languageService = inject(LanguageService);
  readonly theme = inject(ThemeService);

  get currentLanguage(): LanguageOption {
    return this.#languageService.getCurrentLanguageOption();
  }

  toggle(): void {
    this.#languageService.toggle();
  }
}
