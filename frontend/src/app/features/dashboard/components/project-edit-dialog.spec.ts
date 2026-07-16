import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../../shared/services/language';
import { ProjectEditDialogComponent } from './project-edit-dialog';

describe('ProjectEditDialogComponent', () => {
  let fixture: ComponentFixture<ProjectEditDialogComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  const mockDialogRef = {
    close: jest.fn(),
  };

  beforeEach(async () => {
    mockDialogRef.close.mockClear();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProjectEditDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Old Project' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectEditDialogComponent);
    fixture.detectChanges();
  });

  it('should initialize with data name', () => {
    expect(fixture.componentInstance.projectName).toBe('Old Project');
  });

  it('should disable save button when name is empty', () => {
    fixture.componentInstance.projectName = '   ';
    fixture.detectChanges();

    const saveButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[mat-raised-button]',
    );
    expect(saveButton.disabled).toBe(true);
  });

  it('should close dialog with name on confirm', () => {
    fixture.componentInstance.projectName = 'Renamed';
    fixture.detectChanges();

    fixture.componentInstance.onConfirm();

    expect(mockDialogRef.close).toHaveBeenCalledWith({ name: 'Renamed' });
  });

  it('should close dialog with null on cancel', () => {
    fixture.componentInstance.onCancel();

    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });
});
