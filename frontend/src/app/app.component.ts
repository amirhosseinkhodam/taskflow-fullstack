import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent],
  template: `
    <div class="app-container" [class.dark]="theme.isDark()">
      <header class="app-header">
        <app-theme-toggle></app-theme-toggle>
      </header>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--background-color);
      color: var(--text-color);
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .app-header {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      background: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      box-shadow: 0 2px 4px var(--shadow-color);
    }

    main {
      flex: 1;
      padding: 24px;
    }
    `
  ]
})
export class AppComponent {
  theme = inject(ThemeService);
}