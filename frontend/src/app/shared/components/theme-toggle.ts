import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-switch"
      (click)="theme.toggle()"
      [class.dark]="theme.isDark()"
      role="switch"
      [attr.aria-checked]="theme.isDark()"
      aria-label="Toggle dark mode"
    >
      <span class="track">
        <span class="icon sun">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
          >
            <path
              d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-3a1 1 0 001-1V1a1 1 0 00-2 0v2a1 1 0 001 1zm0 18a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1zm9-9a1 1 0 00-1-1h-2a1 1 0 000 2h2a1 1 0 001-1zM4 12a1 1 0 00-1-1H1a1 1 0 000 2h2a1 1 0 001-1zm14.07-6.36a1 1 0 00.7-.29l1.42-1.42a1 1 0 10-1.42-1.42l-1.42 1.42a1 1 0 00.72 1.71zM5.64 18.36a1 1 0 00-.7.29l-1.42 1.42a1 1 0 101.42 1.42l1.42-1.42a1 1 0 00-.72-1.71zM19.78 18.36a1 1 0 00.71-.29 1 1 0 000-1.42l-1.42-1.42a1 1 0 10-1.42 1.42l1.42 1.42a1 1 0 00.71.29zM5.64 5.64a1 1 0 00-.71-.29 1 1 0 00-.71.29l-1.42 1.42a1 1 0 101.42 1.42l1.42-1.42a1 1 0 000-1.42z"
            />
          </svg>
        </span>
        <span class="icon moon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
          >
            <path
              d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.14 8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.35-1.05z"
            />
          </svg>
        </span>
        <span class="thumb"></span>
      </span>
    </button>
  `,
  styles: [
    `
      .theme-switch {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      .track {
        position: relative;
        display: flex;
        align-items: center;
        width: 64px;
        height: 36px;
        border-radius: 9999px;
        background: linear-gradient(135deg, #7dd3fc, #38bdf8);
        transition: background 0.4s ease;
        overflow: hidden;
      }

      .dark .track {
        background: linear-gradient(135deg, #1e293b, #334155);
      }

      .icon {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        z-index: 1;
        transition:
          opacity 0.3s ease,
          transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .sun {
        top: 9px;
        left: 7px;
        color: #fbbf24;
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .dark .sun {
        opacity: 0;
        transform: rotate(90deg) scale(0.5);
      }

      .moon {
        top: 9px;
        right: 7px;
        color: #e2e8f0;
        opacity: 0;
        transform: rotate(-90deg) scale(0.5);
      }

      .dark .moon {
        opacity: 1;
        transform: rotate(0deg) scale(1);
      }

      .thumb {
        position: absolute;
        top: 6px;
        left: 4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition:
          transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          background 0.4s ease;
      }

      .dark .thumb {
        transform: translateX(32px);
        background: #475569;
      }

      .theme-switch:hover .thumb {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      }

      .theme-switch:focus-visible .track {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `,
  ],
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}
