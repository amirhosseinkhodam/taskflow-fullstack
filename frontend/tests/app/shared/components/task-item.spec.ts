import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TaskItemComponent } from '../../../../src/app/shared/components/task-item';
import { DashboardService } from '../../../../src/app/features/dashboard/services/dashboard';
import { LanguageService } from '../../../../src/app/shared/services/language';
import { MatDialog } from '@angular/material/dialog';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';

describe('TaskItemComponent', () => {
  let fixture: ComponentFixture<TaskItemComponent>;

  const mockTask: TaskModel = {
    id: 1,
    title: 'Test Task',
    description: 'A description',
    status: 'pending',
    projectId: 1,
    position: 0,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    userId: 1,
    creatorName: 'John',
  };

  const mockProjects: ProjectModel[] = [
    { id: 1, name: 'Project A', createdAt: '', updatedAt: '' },
  ];

  const mockDashboardService = {
    updateTaskStatus: jest.fn().mockReturnValue(of({})),
    getTask: jest.fn().mockReturnValue(of(mockTask)),
    deleteTask: jest.fn().mockReturnValue(of(undefined)),
  };

  const mockLanguageService = {
    translate: jest.fn().mockImplementation((key: string) => key),
    currentLanguage: signal('en'),
    languages: [],
  };

  const mockDialog = {
    open: jest.fn().mockReturnValue({
      afterClosed: () => of(false),
    }),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockDashboardService.updateTaskStatus.mockClear();
    mockDashboardService.getTask.mockClear();
    mockDashboardService.deleteTask.mockClear();
    mockDialog.open.mockClear();

    await TestBed.configureTestingModule({
      imports: [TaskItemComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    fixture.componentRef.setInput('task', mockTask);
    fixture.componentRef.setInput('projects', mockProjects);
    fixture.detectChanges();
  });

  it('renders task title and description', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Test Task');
    expect(text).toContain('A description');
  });

  it('renders project name from projects list', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Project A');
  });

  it('applies line-through class when status is done', () => {
    const doneTask = { ...mockTask, status: 'done' };
    fixture.componentRef.setInput('task', doneTask);
    fixture.detectChanges();

    const h3 = fixture.nativeElement.querySelector('h3');
    expect(h3.classList.contains('line-through')).toBe(true);
  });

  it('shows creator name when showCreatorBadge is true', () => {
    fixture.componentRef.setInput('showCreatorBadge', true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('John');
  });

  it('does not show creator name when showCreatorBadge is false', () => {
    fixture.componentRef.setInput('showCreatorBadge', false);
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll(
      '.bg-indigo-100, .bg-indigo-900\\/30',
    );
    expect(badges.length).toBe(0);
  });

  it('shows noDescription when description is empty', () => {
    const noDescTask = { ...mockTask, description: '' };
    fixture.componentRef.setInput('task', noDescTask);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('noDescription');
  });

  it('shows detail link when showDetailLink is true', () => {
    fixture.componentRef.setInput('showDetailLink', true);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[ng-reflect-router-link]',
    );
    expect(link).toBeTruthy();
  });

  it('hides detail link when showDetailLink is false', () => {
    fixture.componentRef.setInput('showDetailLink', false);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[ng-reflect-router-link]',
    );
    expect(link).toBeFalsy();
  });

  it('shows edit button when showEditButton is true', () => {
    fixture.componentRef.setInput('showEditButton', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const editText = Array.from(buttons).find((b: Element) =>
      b.textContent?.includes('edit'),
    );
    expect(editText).toBeTruthy();
  });

  it('edit button emits edit output with task', () => {
    fixture.componentRef.setInput('showEditButton', true);
    fixture.detectChanges();

    let emittedTask: TaskModel | undefined;
    fixture.componentInstance.edit.subscribe((t) => (emittedTask = t));

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const editBtn = Array.from(buttons).find((b: Element) =>
      b.textContent?.includes('edit'),
    ) as HTMLButtonElement;
    editBtn.click();
    fixture.detectChanges();

    expect(emittedTask).toEqual(mockTask);
  });

  it('toggle button calls dashboardService.updateTaskStatus', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const toggleBtn = Array.from(buttons).find((b: Element) =>
      b.textContent?.includes('toggle'),
    ) as HTMLButtonElement;
    toggleBtn.click();

    expect(mockDashboardService.updateTaskStatus).toHaveBeenCalledWith(
      1,
      'done',
    );
  });
});
