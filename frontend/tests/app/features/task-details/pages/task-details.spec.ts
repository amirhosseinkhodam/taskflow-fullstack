import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TaskDetailsPageComponent } from '../../../../../src/app/features/task-details/pages/task-details';
import { DashboardService } from '../../../../../src/app/features/dashboard/services/dashboard';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';

describe('TaskDetailsPageComponent', () => {
  let fixture: ComponentFixture<TaskDetailsPageComponent>;

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
    getProjects: jest.fn().mockReturnValue(of(mockProjects)),
    getTask: jest.fn().mockReturnValue(of(mockTask)),
    updateTask: jest.fn().mockReturnValue(of(mockTask)),
    updateTaskStatus: jest.fn().mockReturnValue(of({})),
    deleteTask: jest.fn().mockReturnValue(of(undefined)),
  };

  const mockLanguageService = {
    translate: jest.fn().mockImplementation((key: string) => key),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1'),
      },
    },
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockDashboardService.getProjects.mockClear();
    mockDashboardService.getTask.mockClear();
    mockDashboardService.updateTask.mockClear();
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('1');

    await TestBed.configureTestingModule({
      imports: [TaskDetailsPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsPageComponent);
    fixture.detectChanges();
  });

  it('component instantiates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has expected signals defined', () => {
    const component = fixture.componentInstance;
    expect(component.task).toBeDefined();
    expect(component.projects).toBeDefined();
    expect(component.loading).toBeDefined();
    expect(component.error).toBeDefined();
    expect(component.isEditing).toBeDefined();
    expect(component.editingTask).toBeDefined();
  });

  it('loads task and projects on init', () => {
    expect(mockDashboardService.getProjects).toHaveBeenCalled();
    expect(mockDashboardService.getTask).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.task()).toEqual(mockTask);
    expect(fixture.componentInstance.projects()).toEqual(mockProjects);
  });

  it('sets loading to false after data loads', () => {
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('sets error signal when getTask fails', async () => {
    mockDashboardService.getTask.mockReturnValue(
      throwError(() => new Error('Not found')),
    );

    const freshFixture = TestBed.createComponent(TaskDetailsPageComponent);
    freshFixture.detectChanges();

    expect(freshFixture.componentInstance.error()).toBe(true);
  });
});
