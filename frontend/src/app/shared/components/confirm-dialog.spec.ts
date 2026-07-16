import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent } from './confirm-dialog';
import { LanguageService } from '../services/language';

describe('ConfirmDialogComponent', () => {
  let dialogRefSpy: { close: jest.Mock };
  let languageServiceSpy: { translate: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    dialogRefSpy = { close: jest.fn() };
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
      imports: [ConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: LanguageService, useValue: languageServiceSpy },
      ],
    }).compileComponents();
  });

  it('renders title and content', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirm Delete');
    expect(fixture.nativeElement.textContent).toContain(
      'Are you sure you want to delete?',
    );
  });

  it('renders confirm and cancel buttons', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
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

  it('calls dialogRef.close(true) on confirm', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const deleteButton = buttons.find(
      (b) => b.nativeElement.textContent.trim() === 'Delete',
    );
    deleteButton!.nativeElement.click();
    fixture.detectChanges();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('calls dialogRef.close(false) on cancel', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelButton = buttons.find(
      (b) => b.nativeElement.textContent.trim() === 'Cancel',
    );
    cancelButton!.nativeElement.click();
    fixture.detectChanges();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });
});
