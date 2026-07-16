import { TestBed } from '@angular/core/testing';
import { PasswordFormService } from './password';

describe('PasswordFormService', () => {
  let service: PasswordFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should be invalid in initial state', () => {
    expect(service.form.valid).toBe(false);
  });

  it('should be valid with matching passwords of sufficient length', () => {
    service.form.patchValue({
      newPassword: 'secret123',
      confirmPassword: 'secret123',
    });
    expect(service.form.valid).toBe(true);
  });

  it('should be invalid with mismatched passwords', () => {
    service.form.patchValue({
      newPassword: 'secret123',
      confirmPassword: 'different',
    });
    expect(service.form.valid).toBe(false);
    expect(service.form.errors?.['passwordsMismatch']).toBe(true);
  });

  it('should be invalid with short password', () => {
    service.form.patchValue({
      newPassword: 'ab',
      confirmPassword: 'ab',
    });
    expect(service.form.valid).toBe(false);
    expect(service.form.get('newPassword')?.errors?.['minlength']).toBeTruthy();
  });

  it('should reset form values', () => {
    service.form.patchValue({
      newPassword: 'secret123',
      confirmPassword: 'secret123',
    });
    service.resetForm();
    expect(service.form.value).toEqual({
      newPassword: '',
      confirmPassword: '',
    });
  });
});
