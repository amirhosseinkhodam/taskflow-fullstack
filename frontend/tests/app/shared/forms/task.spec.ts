import { TestBed } from '@angular/core/testing';
import { TaskFormService } from '../../../../src/app/shared/forms/task';

describe('TaskFormService', () => {
  let service: TaskFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should be invalid in initial state', () => {
    expect(service.form.valid).toBe(false);
  });

  it('should be valid with title and projectId', () => {
    service.form.patchValue({ title: 'test', projectId: 1 });
    expect(service.form.valid).toBe(true);
  });

  it('should patch all fields via patchForEdit', () => {
    service.patchForEdit('Old', 2, 'desc');
    expect(service.form.value).toEqual({
      title: 'Old',
      projectId: 2,
      description: 'desc',
    });
  });

  it('should reset form with given projectId', () => {
    service.form.patchValue({
      title: 'something',
      projectId: 1,
      description: 'x',
    });
    service.resetForm(3);
    expect(service.form.value).toEqual({
      title: '',
      projectId: 3,
      description: '',
    });
  });
});
