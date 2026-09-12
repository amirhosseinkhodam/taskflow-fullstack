import { TestBed } from '@angular/core/testing';
import { ApplicationRef, signal } from '@angular/core';
import { AdaptiveDateAdapter } from '../../../../src/app/shared/adapters/adaptive-date-adapter';
import { LanguageService } from '../../../../src/app/shared/services/language';

describe('AdaptiveDateAdapter', () => {
  let adapter: AdaptiveDateAdapter;

  const mockLanguageService = {
    translate: jest.fn().mockImplementation((key: string) => key),
    currentLanguage: signal<'en' | 'fa'>('en'),
    languages: [],
  };

  const gregorian = new Date(2024, 0, 15);

  const setLanguage = (lang: 'en' | 'fa') => {
    mockLanguageService.currentLanguage.set(lang);
    TestBed.inject(ApplicationRef).tick();
  };

  beforeEach(() => {
    mockLanguageService.currentLanguage.set('en');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: mockLanguageService },
        AdaptiveDateAdapter,
      ],
    });

    adapter = TestBed.inject(AdaptiveDateAdapter);
  });

  describe('language-driven locale changes', () => {
    it('emits localeChanges when the language is toggled', () => {
      const emissions = jest.fn();
      adapter.localeChanges.subscribe(emissions);

      setLanguage('fa');

      expect(emissions).toHaveBeenCalledTimes(1);
    });

    it('emits localeChanges on each subsequent toggle', () => {
      const emissions = jest.fn();
      adapter.localeChanges.subscribe(emissions);

      setLanguage('fa');
      setLanguage('en');

      expect(emissions).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatting', () => {
    it('formats a date as Gregorian in English', () => {
      expect(adapter.format(gregorian, 'yyyy/MM/dd')).toBe('2024/01/15');
    });

    it('formats the same date as Jalali in Persian', () => {
      setLanguage('fa');

      expect(adapter.format(gregorian, 'yyyy/MM/dd')).toBe('1402/10/25');
    });
  });

  describe('date part extraction', () => {
    it('reports Gregorian parts in English', () => {
      expect(adapter.getYear(gregorian)).toBe(2024);
      expect(adapter.getMonth(gregorian)).toBe(0);
      expect(adapter.getDate(gregorian)).toBe(15);
    });

    it('reports Jalali parts in Persian', () => {
      setLanguage('fa');

      expect(adapter.getYear(gregorian)).toBe(1402);
      expect(adapter.getMonth(gregorian)).toBe(9);
      expect(adapter.getDate(gregorian)).toBe(25);
    });
  });

  describe('createDate', () => {
    it('treats parts as Gregorian in English', () => {
      expect(adapter.createDate(2024, 0, 15)).toEqual(gregorian);
    });

    it('treats parts as Jalali in Persian', () => {
      setLanguage('fa');

      expect(adapter.createDate(1402, 9, 25)).toEqual(gregorian);
    });

    it('round-trips a date through Jalali parts', () => {
      setLanguage('fa');

      const roundTripped = adapter.createDate(
        adapter.getYear(gregorian),
        adapter.getMonth(gregorian),
        adapter.getDate(gregorian),
      );

      expect(roundTripped).toEqual(gregorian);
    });
  });

  describe('toIso8601', () => {
    it('always serializes to a Gregorian ISO date', () => {
      expect(adapter.toIso8601(gregorian)).toBe('2024-01-15');

      setLanguage('fa');

      expect(adapter.toIso8601(gregorian)).toBe('2024-01-15');
    });
  });

  describe('calendar metadata', () => {
    it('starts the week on Sunday in English and Saturday in Persian', () => {
      expect(adapter.getFirstDayOfWeek()).toBe(0);

      setLanguage('fa');

      expect(adapter.getFirstDayOfWeek()).toBe(6);
    });

    it('reports the number of days in the current calendar month', () => {
      expect(adapter.getNumDaysInMonth(gregorian)).toBe(31);

      setLanguage('fa');

      expect(adapter.getNumDaysInMonth(gregorian)).toBe(30);
    });
  });
});
