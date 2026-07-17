import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { LoginComponent } from './login';
import { AuthStore } from '../store/auth';
import { LoginFormService } from '../forms/login';
import { LanguageService } from '../../../shared/services/language';
import { ThemeService } from '../../../shared/services/theme';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;

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
    login: jest.fn(),
  };

  const mockThemeService = {
    isDark: signal(false),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockAuthStore.error.set(null);
    mockAuthStore.isLoading.set(false);
    mockAuthStore.login.mockClear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: LoginFormService, useClass: LoginFormService },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('renders login form with email and password fields', () => {
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
    mockAuthStore.error.set('Invalid credentials');
    fixture.detectChanges();

    const errorEl: HTMLElement =
      fixture.nativeElement.querySelector('.bg-red-50');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Invalid credentials');
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
