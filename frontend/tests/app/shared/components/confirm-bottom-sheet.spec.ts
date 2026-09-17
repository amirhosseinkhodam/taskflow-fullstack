import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmBottomSheetComponent } from '../../../../src/app/shared/components/confirm-bottom-sheet';
import { LanguageService } from '../../../../src/app/shared/services/language';
import { createMockLanguageService } from '../../../support/language';

describe('ConfirmBottomSheetComponent', () => {
  let bottomSheetRefSpy: { dismiss: jest.Mock };
  let languageServiceSpy: ReturnType<typeof createMockLanguageService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    bottomSheetRefSpy = { dismiss: jest.fn() };
    languageServiceSpy = createMockLanguageService('en', {
      confirmDeleteTask: 'Confirm Delete',
      confirmDeleteMessage: 'Are you sure you want to delete?',
      cancel: 'Cancel',
      delete: 'Delete',
    });

    await TestBed.configureTestingModule({
      imports: [ConfirmBottomSheetComponent, NoopAnimationsModule],
      providers: [
        { provide: MatBottomSheetRef, useValue: bottomSheetRefSpy },
        { provide: LanguageService, useValue: languageServiceSpy },
      ],
    }).compileComponents();
  });

  it('renders title and content', () => {
    const fixture = TestBed.createComponent(ConfirmBottomSheetComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirm Delete');
    expect(fixture.nativeElement.textContent).toContain(
      'Are you sure you want to delete?',
    );
  });

  it('renders confirm and cancel buttons', () => {
    const fixture = TestBed.createComponent(ConfirmBottomSheetComponent);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    const cancelButton = buttons.find(
      (b) => b.nativeElement.textContent.trim() === 'Cancel',
    );
    const deleteButton = buttons.find(
      (b) => b.nativeElement.textContent.trim() === 'Delete',
    );
    expect(cancelButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
  });

  it('calls bottomSheetRef.dismiss(true) on confirm', () => {
    const fixture = TestBed.createComponent(ConfirmBottomSheetComponent);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const deleteButton = buttons.find(
      (b) => b.nativeElement.textContent.trim() === 'Delete',
    );
    deleteButton!.nativeElement.click();
    fixture.detectChanges();

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalledWith(true);
  });

  it('calls bottomSheetRef.dismiss(false) on cancel', () => {
    const fixture = TestBed.createComponent(ConfirmBottomSheetComponent);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelButton = buttons.find(
      (b) => b.nativeElement.textContent.trim() === 'Cancel',
    );
    cancelButton!.nativeElement.click();
    fixture.detectChanges();

    expect(bottomSheetRefSpy.dismiss).toHaveBeenCalledWith(false);
  });

  describe('text direction', () => {
    function render() {
      const fixture = TestBed.createComponent(ConfirmBottomSheetComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('is ltr for English', () => {
      const fixture = render();

      const wrapper = fixture.nativeElement.querySelector('div[dir]');
      expect(wrapper.getAttribute('dir')).toBe('ltr');
    });

    it('is rtl for Persian', () => {
      languageServiceSpy.currentLanguage.set('fa');
      const fixture = render();

      const wrapper = fixture.nativeElement.querySelector('div[dir]');
      expect(wrapper.getAttribute('dir')).toBe('rtl');
    });

    it('wraps both the title and the description', () => {
      languageServiceSpy.currentLanguage.set('fa');
      const fixture = render();

      const wrapper = fixture.nativeElement.querySelector('div[dir="rtl"]');
      expect(wrapper.querySelector('h3')).toBeTruthy();
      expect(wrapper.querySelector('p')).toBeTruthy();
    });

    it('flips when the language changes at runtime', () => {
      const fixture = render();
      expect(
        fixture.nativeElement.querySelector('div[dir]').getAttribute('dir'),
      ).toBe('ltr');

      languageServiceSpy.currentLanguage.set('fa');
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('div[dir]').getAttribute('dir'),
      ).toBe('rtl');
    });

    it('does not mutate the document direction', () => {
      const before = document.documentElement.getAttribute('dir');
      languageServiceSpy.currentLanguage.set('fa');
      render();

      expect(document.documentElement.getAttribute('dir')).toBe(before);
    });
  });
});
