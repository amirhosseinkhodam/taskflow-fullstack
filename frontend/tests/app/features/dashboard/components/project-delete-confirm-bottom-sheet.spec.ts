import { TestBed } from '@angular/core/testing';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectDeleteConfirmBottomSheetComponent } from '../../../../../src/app/features/dashboard/components/project-delete-confirm-bottom-sheet';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { createMockLanguageService } from '../../../../support/language';

describe('ProjectDeleteConfirmBottomSheetComponent', () => {
  let bottomSheetRefSpy: { dismiss: jest.Mock };
  let languageServiceSpy: ReturnType<typeof createMockLanguageService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    bottomSheetRefSpy = { dismiss: jest.fn() };
    languageServiceSpy = createMockLanguageService('en');

    await TestBed.configureTestingModule({
      imports: [ProjectDeleteConfirmBottomSheetComponent, NoopAnimationsModule],
      providers: [
        { provide: MatBottomSheetRef, useValue: bottomSheetRefSpy },
        { provide: LanguageService, useValue: languageServiceSpy },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: { undoneCount: 2 } },
      ],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(
      ProjectDeleteConfirmBottomSheetComponent,
    );
    fixture.detectChanges();
    return fixture;
  }

  it('is ltr for English', () => {
    const fixture = render();

    expect(
      fixture.nativeElement.querySelector('div[dir]').getAttribute('dir'),
    ).toBe('ltr');
  });

  it('is rtl for Persian', () => {
    languageServiceSpy.currentLanguage.set('fa');
    const fixture = render();

    expect(
      fixture.nativeElement.querySelector('div[dir]').getAttribute('dir'),
    ).toBe('rtl');
  });

  it('wraps the title, description and undone-task warning', () => {
    languageServiceSpy.currentLanguage.set('fa');
    const fixture = render();

    const wrapper = fixture.nativeElement.querySelector('div[dir="rtl"]');
    expect(wrapper.querySelector('h3')).toBeTruthy();
    expect(wrapper.querySelectorAll('p').length).toBe(2);
  });

  it('still dismisses with true on confirm', () => {
    const fixture = render();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button',
      ) as ArrayLike<HTMLButtonElement>,
    );
    buttons.find((b) => b.textContent?.includes('delete'))!.click();

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalledWith(true);
  });

  it('still dismisses with false on cancel', () => {
    const fixture = render();
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button',
      ) as ArrayLike<HTMLButtonElement>,
    );
    buttons.find((b) => b.textContent?.includes('cancel'))!.click();

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalledWith(false);
  });
});
