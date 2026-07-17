import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmBottomSheetComponent } from '../../../../src/app/shared/components/confirm-bottom-sheet';
import { LanguageService } from '../../../../src/app/shared/services/language';

describe('ConfirmBottomSheetComponent', () => {
  let bottomSheetRefSpy: { dismiss: jest.Mock };
  let languageServiceSpy: { translate: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    bottomSheetRefSpy = { dismiss: jest.fn() };
    languageServiceSpy = { translate: jest.fn() };
    languageServiceSpy.translate.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        confirmDeleteTask: 'Confirm Delete',
        confirmDeleteMessage: 'Are you sure you want to delete?',
        cancel: 'Cancel',
        delete: 'Delete',
      };
      return map[key] ?? key;
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
});
