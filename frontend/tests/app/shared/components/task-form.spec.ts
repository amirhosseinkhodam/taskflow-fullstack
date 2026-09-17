import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskFormComponent } from '../../../../src/app/shared/components/task-form';
import { TaskFormService } from '../../../../src/app/shared/forms/task';
import { LanguageService } from '../../../../src/app/shared/services/language';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;

  const mockProjects: ProjectModel[] = [
    { id: 1, name: 'Project A', createdAt: '', updatedAt: '' },
    { id: 2, name: 'Project B', createdAt: '', updatedAt: '' },
  ];

  const mockLanguageService = {
    translate: jest.fn().mockImplementation((key: string) => key),
    currentLanguage: signal<'en' | 'fa'>('en'),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [{ provide: LanguageService, useValue: mockLanguageService }],
    }).compileComponents();

    TestBed.inject(TaskFormService).resetForm();
    fixture = TestBed.createComponent(TaskFormComponent);
    fixture.componentRef.setInput('projects', mockProjects);
    fixture.detectChanges();
  });

  it('renders form with title, project select, description, and submit button', () => {
    const titleInput = fixture.nativeElement.querySelector(
      'app-input[formcontrolname="title"]',
    );
    const select = fixture.nativeElement.querySelector(
      'app-select[formcontrolname="projectId"]',
    );
    const textarea = fixture.nativeElement.querySelector(
      'app-textarea[formcontrolname="description"]',
    );
    const submitBtn = fixture.nativeElement.querySelector(
      'app-button[type="submit"]',
    );

    expect(titleInput).toBeTruthy();
    expect(select).toBeTruthy();
    expect(textarea).toBeTruthy();
    expect(submitBtn).toBeTruthy();
  });

  it('hides project select when showProjectSelect is false', () => {
    fixture.componentRef.setInput('showProjectSelect', false);
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector(
      'app-select[formcontrolname="projectId"]',
    );
    expect(select).toBeFalsy();
  });

  it('submit emits submitTask with form values', () => {
    let emittedValue:
      | {
          title: string;
          description: string;
          projectId: number;
          assigneeEmail?: string;
        }
      | undefined;
    fixture.componentInstance.submitTask.subscribe((v) => (emittedValue = v));

    fixture.componentInstance.form.patchValue({
      title: 'New Task',
      projectId: 1,
      description: 'Some description',
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'app-button[type="submit"] button',
    );
    submitBtn.click();
    fixture.detectChanges();

    expect(emittedValue).toEqual({
      title: 'New Task',
      projectId: 1,
      description: 'Some description',
      assigneeEmail: '',
    });
  });

  it('clears every field including the project select after a successful submit', () => {
    fixture.componentInstance.form.patchValue({
      title: 'New Task',
      projectId: 1,
      description: 'Some description',
      assigneeEmail: 'user@example.com',
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'app-button[type="submit"] button',
    );
    submitBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      title: '',
      projectId: null,
      description: '',
      assigneeEmail: '',
    });
  });

  it('leaves the cleared project select showing its placeholder, not a clear icon', () => {
    fixture.componentInstance.form.patchValue({
      title: 'New Task',
      projectId: 1,
    });
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector(
      'app-button[type="submit"] button',
    );
    submitBtn.click();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector(
      'app-select[formcontrolname="projectId"] ng-select',
    );
    expect(select.querySelector('.ng-placeholder')).toBeTruthy();
    expect(select.querySelector('.ng-value')).toBeFalsy();
    expect(select.querySelector('.ng-clear-wrapper')).toBeFalsy();
  });

  it('shows no cancel button outside edit mode', () => {
    fixture.componentInstance.form.patchValue({ title: 'Typing a new task' });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-button[type="button"] button'),
    ).toBeNull();
  });

  it('cancel button emits cancelEdit while editing', () => {
    fixture.componentRef.setInput('editingTask', {
      id: 7,
      title: 'Edit me',
      description: '',
      status: 'pending',
      projectId: 1,
      position: 0,
      createdAt: '',
      updatedAt: '',
      userId: 1,
    } as TaskModel);
    fixture.detectChanges();

    let cancelled = false;
    fixture.componentInstance.cancelEdit.subscribe(() => (cancelled = true));

    const cancelBtn = fixture.nativeElement.querySelector(
      'app-button[type="button"] button',
    );
    cancelBtn.click();
    fixture.detectChanges();

    expect(cancelled).toBe(true);
  });

  describe('submitting without a project selected', () => {
    function submit() {
      const submitBtn = fixture.nativeElement.querySelector(
        'app-button[type="submit"] button',
      );
      submitBtn.click();
      fixture.detectChanges();
    }

    it('treats the placeholder projectId of 0 as invalid', () => {
      fixture.componentInstance.form.patchValue({
        title: 'A task',
        projectId: 0,
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.form.invalid).toBe(true);
    });

    it('does not emit submitTask', () => {
      let emitted = false;
      fixture.componentInstance.submitTask.subscribe(() => (emitted = true));

      fixture.componentInstance.form.patchValue({
        title: 'A task',
        projectId: 0,
      });
      fixture.detectChanges();
      submit();

      expect(emitted).toBe(false);
    });

    it('shows a validation message so the button does not look broken', () => {
      fixture.componentInstance.form.patchValue({
        title: 'A task',
        projectId: 0,
      });
      fixture.detectChanges();
      submit();

      const messages = Array.from(
        fixture.nativeElement.querySelectorAll(
          'app-form-field',
        ) as ArrayLike<HTMLElement>,
      ).map((f) => f.textContent?.trim());

      expect(messages).toContain('validationRequired');
    });

    it('shows no validation message on a pristine untouched form', () => {
      const fields = fixture.nativeElement.querySelectorAll('app-form-field');

      expect(fields.length).toBeGreaterThan(0);
      Array.from(fields as ArrayLike<HTMLElement>).forEach((f) =>
        expect(f.textContent?.trim()).toBe(''),
      );
    });

    it('keeps what the user typed instead of silently clearing it', () => {
      fixture.componentInstance.form.patchValue({
        title: 'Do not lose me',
        description: 'Nor me',
        projectId: 0,
      });
      fixture.detectChanges();
      submit();

      expect(fixture.componentInstance.form.getRawValue()).toMatchObject({
        title: 'Do not lose me',
        description: 'Nor me',
      });
    });
  });

  it('offers only real projects in the select, never a 0 placeholder option', () => {
    expect(fixture.componentInstance.projectOptions()).toEqual([
      { value: 1, label: 'Project A' },
      { value: 2, label: 'Project B' },
    ]);
  });
});
