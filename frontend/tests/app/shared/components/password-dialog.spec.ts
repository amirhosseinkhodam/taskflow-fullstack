import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PasswordDialogComponent } from '../../../../src/app/shared/components/password-dialog';
import { PasswordFormService } from '../../../../src/app/shared/forms/password';
import { LanguageService } from '../../../../src/app/shared/services/language';
import { createMockLanguageService } from '../../../support/language';

describe('PasswordDialogComponent', () => {
  let dialogRefSpy: { close: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    dialogRefSpy = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [PasswordDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { requireCurrentPassword: true },
        },
        { provide: LanguageService, useValue: createMockLanguageService() },
      ],
    }).compileComponents();

    TestBed.inject(PasswordFormService).resetForm();
  });

  function typePasswords() {
    TestBed.inject(PasswordFormService).form.setValue({
      currentPassword: 'oldSecret',
      newPassword: 'newSecret1!',
      confirmPassword: 'newSecret1!',
    });
  }

  it('closes with the entered passwords when saved', () => {
    const fixture = TestBed.createComponent(PasswordDialogComponent);
    fixture.detectChanges();
    typePasswords();

    fixture.componentInstance.onSave();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      currentPassword: 'oldSecret',
      newPassword: 'newSecret1!',
    });
  });

  it('does not close when the form is invalid', () => {
    const fixture = TestBed.createComponent(PasswordDialogComponent);
    fixture.detectChanges();

    fixture.componentInstance.onSave();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('clears the shared form when dismissed via cancel', () => {
    const fixture = TestBed.createComponent(PasswordDialogComponent);
    fixture.detectChanges();
    typePasswords();

    fixture.componentInstance.onCancel();
    fixture.destroy();

    expect(TestBed.inject(PasswordFormService).form.getRawValue()).toEqual({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  });

  it('clears the shared form when dismissed without cancel (ESC or backdrop)', () => {
    const fixture = TestBed.createComponent(PasswordDialogComponent);
    fixture.detectChanges();
    typePasswords();

    fixture.destroy();

    expect(TestBed.inject(PasswordFormService).form.getRawValue()).toEqual({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  });

  it('does not leave a stale mismatch error for the next opening', () => {
    const svc = TestBed.inject(PasswordFormService);
    const fixture = TestBed.createComponent(PasswordDialogComponent);
    fixture.detectChanges();

    svc.form.setValue({
      currentPassword: 'old',
      newPassword: 'aaaaaa',
      confirmPassword: 'bbbbbb',
    });
    svc.form.markAllAsTouched();
    expect(svc.form.hasError('passwordsMismatch')).toBe(true);

    fixture.destroy();

    expect(svc.form.hasError('passwordsMismatch')).toBe(false);
    expect(svc.form.touched).toBe(false);
  });
});
