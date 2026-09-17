import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from '../../../../../src/app/features/dashboard/pages/dashboard';
import { DashboardService } from '../../../../../src/app/features/dashboard/services/dashboard';
import { AuthStore } from '../../../../../src/app/features/auth/store/auth';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { NotificationService } from '../../../../../src/app/shared/services/notification';
import { ThemeService } from '../../../../../src/app/shared/services/theme';
import { createMockLanguageService } from '../../../../support/language';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  const mockDashboardService = {
    getProjects: jest.fn().mockReturnValue(of([])),
    getTasks: jest
      .fn()
      .mockReturnValue(of({ data: [], totalPages: 1, total: 0 })),
  };

  const mockAuth = {
    isAdmin: jest.fn().mockReturnValue(true),
    logout: jest.fn(),
  };

  async function render(): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        NoopAnimationsModule,
        MatDialogModule,
        MatBottomSheetModule,
      ],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: AuthStore, useValue: mockAuth },
        { provide: LanguageService, useValue: createMockLanguageService() },
        { provide: ThemeService, useValue: { isDark: signal(false) } },
        { provide: NotificationService, useValue: { show: jest.fn() } },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: false, breakpoints: {} }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  }

  function projectListCard(): HTMLElement {
    const child = fixture.nativeElement.querySelector('app-project-list');
    expect(child).toBeTruthy();
    return child.closest('app-card');
  }

  function contentDivOf(card: HTMLElement): HTMLElement {
    const div = card.querySelector(':scope > div');
    expect(div).toBeTruthy();
    return div as HTMLElement;
  }

  beforeEach(async () => {
    mockAuth.isAdmin.mockReturnValue(true);
    await render();
  });

  it('sizes the div directly inside the card, capped from sm up only', () => {
    const classes = contentDivOf(projectListCard()).className;

    expect(classes).toContain('sm:h-112');
    expect(classes).toContain('max-h-112');
    expect(classes).toContain('overflow-y-auto');
    expect(classes.split(/\s+/)).not.toContain('h-112');
  });

  it('wraps the project list in the sized div', () => {
    const sized = contentDivOf(projectListCard());

    expect(sized.querySelector('app-project-list')).toBeTruthy();
  });

  it('keeps the sizing off the card host element', () => {
    const classes = projectListCard().className;

    expect(classes).not.toContain('h-112');
    expect(classes).not.toContain('overflow-y-auto');
  });

  it('leaves every other card at its natural height', () => {
    const target = projectListCard();
    const otherCards = Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-card',
      ) as ArrayLike<HTMLElement>,
    ).filter((card) => card !== target);

    expect(otherCards.length).toBeGreaterThan(0);
    otherCards.forEach((card) => {
      const classes = `${card.className} ${contentDivOf(card).className}`;
      expect(classes).not.toContain('h-112');
      expect(classes).not.toContain('overflow-y-auto');
    });
  });

  it('does not cap any card for a non-admin without a project list', async () => {
    mockAuth.isAdmin.mockReturnValue(false);
    await render();

    expect(fixture.nativeElement.querySelector('app-project-list')).toBeNull();
    Array.from(
      fixture.nativeElement.querySelectorAll(
        'app-card',
      ) as ArrayLike<HTMLElement>,
    ).forEach((card) => {
      const classes = `${card.className} ${contentDivOf(card).className}`;
      expect(classes).not.toContain('h-112');
    });
  });
});
