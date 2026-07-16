import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AdminPanelComponent } from './admin-panel';
import { AdminStore } from '../store/admin';
import { PasswordFormService } from '../forms/password';
import { AuthStore } from '../../auth/store/auth';
import { LanguageService } from '../../../shared/services/language';
import { ThemeService } from '../../../shared/services/theme';
import type { UserModel } from '../models/admin';

describe('AdminPanelComponent', () => {
  let fixture: ComponentFixture<AdminPanelComponent>;

  const mockTranslate = (key: string) => key;

  const mockStore = {
    users: signal<UserModel[]>([]),
    message: signal(''),
    isLoading: signal(false),
    passwordChangeUserId: signal<number | null>(null),
    userCount: signal(0),
    loadUsers: jest.fn(),
    deleteUser: jest.fn(),
    updateUserRole: jest.fn(),
    startPasswordChange: jest.fn(),
    cancelPasswordChange: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockAuth = {
    user: signal<{
      id: number;
      email: string;
      name: string;
      role: string;
    } | null>({
      id: 1,
      email: 'admin@test.com',
      name: 'Admin',
      role: 'admin',
    }),
    isAdmin: signal(true),
    logout: jest.fn(),
  };

  const mockPasswordForm = {
    form: {
      invalid: false,
      touched: false,
      get: jest.fn().mockReturnValue({
        hasError: jest.fn().mockReturnValue(false),
        touched: false,
      }),
      hasError: jest.fn().mockReturnValue(false),
    },
    resetForm: jest.fn(),
  };

  const mockThemeService = {
    isDark: signal(false),
  };

  beforeEach(async () => {
    try { TestBed.resetTestingModule(); } catch { /* CDK HighContrastModeDetector teardown error */ }
    mockStore.users.set([]);
    mockStore.message.set('');
    mockStore.isLoading.set(false);
    mockStore.passwordChangeUserId.set(null);
    mockStore.userCount.set(0);
    mockStore.loadUsers.mockClear();
    mockStore.deleteUser.mockClear();
    mockStore.updateUserRole.mockClear();
    mockStore.startPasswordChange.mockClear();
    mockStore.cancelPasswordChange.mockClear();
    mockStore.changePassword.mockClear();

    mockAuth.user.set({
      id: 1,
      email: 'admin@test.com',
      name: 'Admin',
      role: 'admin',
    });
    mockAuth.isAdmin.set(true);
    mockAuth.logout.mockClear();

    mockPasswordForm.resetForm.mockClear();

    await TestBed.configureTestingModule({
      imports: [
        AdminPanelComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatBottomSheetModule,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockAuth },
        { provide: PasswordFormService, useValue: mockPasswordForm },
        {
          provide: LanguageService,
          useValue: {
            translate: mockTranslate,
            currentLanguage: signal('en'),
            getCurrentLanguageOption: jest.fn().mockReturnValue({ code: 'en', name: 'English', nativeName: 'English', rtl: false }),
            toggle: jest.fn(),
            setLanguage: jest.fn(),
          },
        },
        { provide: ThemeService, useValue: mockThemeService },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
          },
        },
      ],
    })
      .overrideComponent(AdminPanelComponent, {
        remove: { providers: [AdminStore] },
        add: { providers: [{ provide: AdminStore, useValue: mockStore }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render admin panel heading', () => {
    const heading: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('adminPanel');
  });

  it('should render user table with column headers', () => {
    const headers: HTMLElement[] = fixture.nativeElement.querySelectorAll('th');
    const headerTexts = Array.from(headers).map((h) => h.textContent?.trim());
    expect(headerTexts).toContain('email');
    expect(headerTexts).toContain('name');
    expect(headerTexts).toContain('role');
    expect(headerTexts).toContain('actions');
  });

  it('should show noUsers message when users list is empty', () => {
    const emptyRow: HTMLElement =
      fixture.nativeElement.querySelector('td[colspan="4"]');
    expect(emptyRow).toBeTruthy();
    expect(emptyRow.textContent).toContain('noUsers');
  });

  it('should render user rows when users are provided', () => {
    const users: UserModel[] = [
      { id: 2, email: 'user1@test.com', name: 'User One', role: 'user' },
      { id: 3, email: 'user2@test.com', name: 'User Two', role: 'admin' },
    ];
    mockStore.users.set(users);
    mockStore.userCount.set(users.length);
    fixture.detectChanges();

    const rows: HTMLElement[] =
      fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    const emails = fixture.nativeElement.querySelectorAll('td:first-child');
    const emailTexts = Array.from(emails).map((e) => e.textContent?.trim());
    expect(emailTexts).toContain('user1@test.com');
    expect(emailTexts).toContain('user2@test.com');
  });

  it('should call store.loadUsers on init', () => {
    expect(mockStore.loadUsers).toHaveBeenCalled();
  });

  it('should call auth.logout when logout button is clicked', () => {
    const buttons: HTMLButtonElement[] =
      fixture.nativeElement.querySelectorAll('button');
    const logoutButton = Array.from(buttons).find((b) =>
      b.textContent?.trim() === 'logout',
    );
    logoutButton?.click();
    expect(mockAuth.logout).toHaveBeenCalled();
  });

  it('should display users count', () => {
    const users: UserModel[] = [
      { id: 2, email: 'user1@test.com', name: 'User One', role: 'user' },
    ];
    mockStore.users.set(users);
    mockStore.userCount.set(1);
    fixture.detectChanges();

    const countEl: HTMLElement = fixture.nativeElement.querySelector(
      '.text-sm.text-slate-500',
    );
    expect(countEl).toBeTruthy();
    expect(countEl.textContent).toContain('1');
  });

  it('should render back to dashboard button', () => {
    const backButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[routerLink="/"]',
    );
    expect(backButton).toBeTruthy();
  });

  it('should render role badge for current user', () => {
    const roleBadge: HTMLElement =
      fixture.nativeElement.querySelector('span.inline-flex');
    expect(roleBadge).toBeTruthy();
    expect(roleBadge.textContent).toContain('role');
  });
});
