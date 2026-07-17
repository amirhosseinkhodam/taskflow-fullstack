import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { ProjectDeleteConfirmComponent } from '../../../../../src/app/features/dashboard/components/project-delete-confirm';

describe('ProjectDeleteConfirmComponent', () => {
  let fixture: ComponentFixture<ProjectDeleteConfirmComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  const mockDialogRef = {
    close: jest.fn(),
  };

  function setup(undoneCount: number) {
    mockDialogRef.close.mockClear();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProjectDeleteConfirmComponent, NoopAnimationsModule],
      providers: [
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { undoneCount } },
      ],
    });

    fixture = TestBed.createComponent(ProjectDeleteConfirmComponent);
    fixture.detectChanges();
  }

  it('should show undone count when > 0', () => {
    setup(2);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('projectHasUndoneTasks');
    expect(text).toContain('2');
  });

  it('should not show undone count when 0', () => {
    setup(0);

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('projectHasUndoneTasks');
  });

  it('should close dialog with true on confirm', () => {
    setup(1);

    fixture.componentInstance.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    setup(1);

    fixture.componentInstance.onCancel();

    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
