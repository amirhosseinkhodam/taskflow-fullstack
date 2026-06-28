import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  isDark = signal(this.loadTheme());

  toggle(): void {
    this.isDark.update((dark) => {
      const newTheme = !dark;
      localStorage.setItem(this.STORAGE_KEY, newTheme ? 'dark' : 'light');
      return newTheme;
    });
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      return saved === 'dark';
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    localStorage.setItem(this.STORAGE_KEY, prefersDark ? 'dark' : 'light');
    return prefersDark;
  }
}