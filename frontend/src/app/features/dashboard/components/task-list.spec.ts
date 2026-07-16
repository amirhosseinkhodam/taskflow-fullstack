import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from '../../../shared/services/language';
import { DashboardService } from '../services/dashboard';
import { TaskListComponent } from './task-list';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';

describe('TaskListComponent', () => {
  let fixture: ComponentFixture<TaskListComponent>;

  const mockLanguageService = {
    translate: (key: string) => key,
  };

  const mockDashboardService = {
    updateTaskStatus: jest.fn(),
    deleteTask: jest.fn(),
    getTask: jest.fn(),
  };

  const mockDialog = {
    open: jest.fn(),
  };

  const mockProjects: ProjectModel[] = [
    {
      id: 1,
      name: 'Project A',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  ];

  const mockTasks: TaskModel[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      projectId: 1,
      position: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      userId: 1,
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TaskListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
  });

  function setInput(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
  }

  it('should show "No tasks" message when tasks is empty', () => {
    setInput('tasks', []);
    setInput('projects', mockProjects);
    fixture.detectChanges();

    const emptyMsg = fixture.nativeElement.querySelector('p');
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.textContent).toContain('noTasksYet');
  });

  it('should render task items when tasks are provided', () => {
    setInput('tasks', mockTasks);
    setInput('projects', mockProjects);
    fixture.detectChanges();

    const articles = fixture.nativeElement.querySelectorAll('article');
    expect(articles.length).toBe(mockTasks.length);
  });
});
