import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskFormComponent } from '../../../../src/app/shared/components/task-form';
import { LanguageService } from '../../../../src/app/shared/services/language';
import type { ProjectModel } from '@shared/types/project';

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

  it('cancel button emits cancelEdit', () => {
    fixture.componentInstance.form.patchValue({ title: 'Edit me' });
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
});
