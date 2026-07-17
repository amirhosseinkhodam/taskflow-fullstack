import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LanguageToggleComponent } from '../../../../src/app/shared/components/language-toggle';
import {
  LanguageService,
  LanguageOptionModel,
} from '../../../../src/app/shared/services/language';
import { ThemeService } from '../../../../src/app/shared/services/theme';

describe('LanguageToggleComponent', () => {
  let languageServiceSpy: {
    toggle: jest.Mock;
    getCurrentLanguageOption: jest.Mock;
  };
  let themeServiceSpy: { isDark: jest.Mock; toggle: jest.Mock };
  let currentLanguageOption: LanguageOptionModel;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    currentLanguageOption = {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      rtl: false,
    };
    languageServiceSpy = {
      toggle: jest.fn(),
      getCurrentLanguageOption: jest
        .fn()
        .mockReturnValue(currentLanguageOption),
    };
    themeServiceSpy = {
      isDark: jest.fn().mockReturnValue(false),
      toggle: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LanguageToggleComponent],
      providers: [
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
      ],
    }).compileComponents();
  });

  it('renders a toggle button', () => {
    const fixture = TestBed.createComponent(LanguageToggleComponent);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button'));
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.nativeElement.type).toBe('button');
  });

  it('calls languageService.toggle() on click', () => {
    const fixture = TestBed.createComponent(LanguageToggleComponent);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button'));
    buttonEl.nativeElement.click();
    fixture.detectChanges();

    expect(languageServiceSpy.toggle).toHaveBeenCalled();
  });

  it('displays current language native name', () => {
    const fixture = TestBed.createComponent(LanguageToggleComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('English');
  });
});
