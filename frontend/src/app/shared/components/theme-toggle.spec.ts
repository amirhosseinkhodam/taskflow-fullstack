import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemeToggleComponent } from './theme-toggle';
import { ThemeService } from '../services/theme';

describe('ThemeToggleComponent', () => {
  let themeServiceSpy: { isDark: jest.Mock; toggle: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    themeServiceSpy = {
      isDark: jest.fn().mockReturnValue(false),
      toggle: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeServiceSpy }],
    }).compileComponents();
  });

  it('renders a toggle button', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button'));
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.nativeElement.getAttribute('role')).toBe('switch');
  });

  it('calls theme.toggle() on click', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('button'));
    buttonEl.nativeElement.click();
    fixture.detectChanges();

    expect(themeServiceSpy.toggle).toHaveBeenCalled();
  });
});
