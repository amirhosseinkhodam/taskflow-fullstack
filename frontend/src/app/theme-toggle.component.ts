import { Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './theme.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="theme-toggle-wrapper" (click)="$event.stopPropagation()">
      <mat-slide-toggle
        [checked]="theme.isDark()"
        (change)="theme.toggle()"
        color="primary"
        class="theme-slide-toggle"
      >
        <div class="toggle-icons">
          <mat-icon class="light-icon" [class.hidden]="!theme.isDark()">light_mode</mat-icon>
          <mat-icon class="dark-icon" [class.hidden]="theme.isDark()">dark_mode</mat-icon>
        </div>
        <span class="toggle-text">
          {{ theme.isDark() ? 'Dark Mode' : 'Light Mode' }}
        </span>
      </mat-slide-toggle>
    </div>
  `,
  styles: [
    `
    .theme-toggle-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
    }

    .theme-slide-toggle {
      height: 24px;
    }

    .toggle-icons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 40px;
      height: 24px;
    }

    mat-icon {
      width: 18px !important;
      height: 18px !important;
      font-size: 18px !important;
      transition: opacity 0.3s ease, color 0.3s ease;
    }

    .light-icon {
      color: #fbbf24;
    }

    .dark-icon {
      color: #60a5fa;
    }

    .hidden {
      opacity: 0;
      pointer-events: none;
    }

    :global(.dark) .light-icon {
      color: #e2e8f0;
    }

    :global(.dark) .dark-icon {
      color: #cbd5e1;
    }

    :global(.mat-mdc-slide-toggle-thumb) {
      transition: background-color 0.3s ease;
    }

    :global(.dark) .mat-mdc-slide-toggle-thumb {
      background-color: var(--primary-color) !important;
    }

    :global(.dark) .mat-mdc-slide-toggle-bar {
      background-color: var(--border-color) !important;
    }
    `
  ]
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}