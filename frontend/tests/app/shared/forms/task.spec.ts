import { TestBed } from '@angular/core/testing';
import { TaskFormService } from '../../../../src/app/shared/forms/task';

describe('TaskFormService', () => {
  let service: TaskFormService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [TaskFormService] });
    service = TestBed.inject(TaskFormService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should return form with required fields', () => {
    const form = service.form;
    expect(form).toBeTruthy();
    expect(form.get('title')).toBeTruthy();
    expect(form.get('description')).toBeTruthy();
    expect(form.get('projectId')).toBeTruthy();
    expect(form.get('assigneeEmail')).toBeTruthy();
  });

  it('should reset form with given projectId', () => {
    service.resetForm(3);
    const value = service.form.value;
    expect(value).toEqual({
      title: '',
      projectId: 3,
      description: '',
      assigneeEmail: '',
    });
  });

  it('should patch form for edit', () => {
    service.patchForEdit('My Task', 2, 'Description', 'user@example.com');
    const value = service.form.value;
    expect(value).toEqual({
      title: 'My Task',
      projectId: 2,
      description: 'Description',
      assigneeEmail: 'user@example.com',
    });
  });
});
