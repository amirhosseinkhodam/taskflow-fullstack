import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LocalizedDatePipe } from '../../../../src/app/shared/pipes/localized-date';
import { LanguageService } from '../../../../src/app/shared/services/language';

describe('LocalizedDatePipe', () => {
  let pipe: LocalizedDatePipe;

  const mockLanguageService = {
    translate: (key: string) => key,
    currentLanguage: signal<'en' | 'fa'>('en'),
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    });
    pipe = TestBed.runInInjectionContext(() => new LocalizedDatePipe());
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(pipe.transform(undefined as unknown as string)).toBe('');
  });

  it('formats a valid date string', () => {
    const result = pipe.transform('2024-01-15T10:30:00Z');

    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });
});
