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

  it('should reset every field including the project select', () => {
    service.patchForEdit('My Task', 3, 'Description', 'user@example.com');

    service.resetForm();

    expect(service.form.value).toEqual({
      title: '',
      projectId: null,
      description: '',
      assigneeEmail: '',
    });
  });

  it('should treat a reset project select as invalid', () => {
    service.patchForEdit('My Task', 3, 'Description');

    service.resetForm();

    expect(service.form.controls.projectId.invalid).toBe(true);
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
