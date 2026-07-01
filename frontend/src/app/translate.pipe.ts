import { Pipe, PipeTransform, inject, ChangeDetectorRef, effect, DestroyRef } from '@angular/core';
import { LanguageService } from './language.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);
  private lastLang = this.languageService.currentLanguage();

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    const destroyRef = inject(DestroyRef);
    const e = effect(() => {
      const lang = this.languageService.currentLanguage();
      if (lang !== this.lastLang) {
        this.lastLang = lang;
        cdr.markForCheck();
      }
    });
    destroyRef.onDestroy(() => e.destroy());
  }

  transform(key: string): string {
    return this.languageService.translate(key);
  }
}
