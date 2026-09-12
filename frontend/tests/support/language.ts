import { signal } from '@angular/core';
import type {
  Language,
  LanguageOptionModel,
} from '../../src/app/shared/services/language';

const LANGUAGES: LanguageOptionModel[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', rtl: true },
];

export function createMockLanguageService(
  initial: Language = 'en',
  phrases: Record<string, string> = {},
) {
  const currentLanguage = signal<Language>(initial);

  return {
    languages: LANGUAGES,
    currentLanguage,
    translate: jest.fn((key: string) => phrases[key] ?? key),
    toggle: jest.fn(() => {
      currentLanguage.set(currentLanguage() === 'en' ? 'fa' : 'en');
    }),
    getLanguageOption: (code: Language) =>
      LANGUAGES.find((l) => l.code === code),
    getCurrentLanguageOption: () =>
      LANGUAGES.find((l) => l.code === currentLanguage()) ?? LANGUAGES[0],
  };
}
