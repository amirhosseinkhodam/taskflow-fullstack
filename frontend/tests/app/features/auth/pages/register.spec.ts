import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { RegisterComponent } from '../../../../../src/app/features/auth/pages/register';
import { AuthStore } from '../../../../../src/app/features/auth/store/auth';
import { RegisterFormService } from '../../../../../src/app/features/auth/forms/register';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { ThemeService } from '../../../../../src/app/shared/services/theme';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;

  const mockTranslate = (key: string) => key;

  const mockLanguageService = {
    translate: mockTranslate,
    currentLanguage: signal('en'),
    getCurrentLanguageOption: jest.fn().mockReturnValue({
      code: 'en',
      name: 'English',
      nativeName: 'English',
      rtl: false,
    }),
  };

  const mockAuthStore = {
    error: signal<string | null>(null),
    isLoading: signal(false),
    register: jest.fn(),
  };

  const mockThemeService = {
    isDark: signal(false),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockAuthStore.error.set(null);
    mockAuthStore.isLoading.set(false);
    mockAuthStore.register.mockClear();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: RegisterFormService, useClass: RegisterFormService },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  it('renders register form with email and password fields', () => {
    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type="email"]',
    );
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type="password"]',
    );
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  it('renders a submit button', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(button).toBeTruthy();
  });

  it('displays error from store when auth.error() has value', () => {
    mockAuthStore.error.set('Email already registered');
    fixture.detectChanges();

    const errorEl: HTMLElement =
      fixture.nativeElement.querySelector('.bg-red-50');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Email already registered');
  });

  it('disables submit button when auth.isLoading() is true', () => {
    mockAuthStore.isLoading.set(true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(button.disabled).toBe(true);
  });
});
