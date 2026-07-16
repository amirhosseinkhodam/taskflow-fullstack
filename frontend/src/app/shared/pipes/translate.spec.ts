import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate';
import { LanguageService } from '../services/language';

describe('TranslatePipe', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('transforms known key to English translation', () => {
    const pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
    expect(pipe.transform('logout')).toBe('Logout');
  });

  it('returns new language translation after language change', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation();

    const languageService = TestBed.inject(LanguageService);
    const pipe = TestBed.runInInjectionContext(() => new TranslatePipe());

    expect(pipe.transform('logout')).toBe('Logout');

    languageService.setLanguage('fa');
    expect(pipe.transform('logout')).toBe('خروج');
  });
});
