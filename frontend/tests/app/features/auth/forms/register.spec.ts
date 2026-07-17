import { TestBed } from '@angular/core/testing';
import { RegisterFormService } from '../../../../../src/app/features/auth/forms/register';

describe('RegisterFormService', () => {
  let service: RegisterFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should be invalid in initial state', () => {
    expect(service.form.valid).toBe(false);
  });

  it('should be valid with name, email and password', () => {
    service.form.patchValue({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret',
    });
    expect(service.form.valid).toBe(true);
  });

  it('should reset form values to empty', () => {
    service.form.patchValue({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret',
    });
    service.resetForm();
    expect(service.form.value).toEqual({
      name: '',
      email: '',
      password: '',
    });
  });
});
