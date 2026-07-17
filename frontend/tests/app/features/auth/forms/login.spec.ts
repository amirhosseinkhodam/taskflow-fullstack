import { TestBed } from '@angular/core/testing';
import { LoginFormService } from '../../../../../src/app/features/auth/forms/login';

describe('LoginFormService', () => {
  let service: LoginFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should be invalid in initial state', () => {
    expect(service.form.valid).toBe(false);
  });

  it('should be valid with email and password', () => {
    service.form.patchValue({ email: 'test@example.com', password: 'secret' });
    expect(service.form.valid).toBe(true);
  });

  it('should reset form values to empty', () => {
    service.form.patchValue({ email: 'test@example.com', password: 'secret' });
    service.resetForm();
    expect(service.form.value).toEqual({ email: '', password: '' });
    expect(service.form.valid).toBe(false);
  });
});
