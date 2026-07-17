import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { of } from 'rxjs';
import { DashboardStore } from '../../../../../src/app/features/dashboard/store/dashboard';
import { DashboardService } from '../../../../../src/app/features/dashboard/services/dashboard';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';

const mockDashboardService = {
  getHealth: jest.fn().mockReturnValue(of({ status: 'ok' })),
  getProjects: jest.fn().mockReturnValue(of([])),
  getTasks: jest
    .fn()
    .mockReturnValue(
      of({ data: [], total: 0, page: 1, limit: 5, totalPages: 1 }),
    ),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  updateTaskStatus: jest.fn(),
  reorderTasks: jest.fn(),
  deleteTask: jest.fn(),
  getTask: jest.fn(),
};

const mockProjects: ProjectModel[] = [
  {
    id: 1,
    name: 'Project A',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 2,
    name: 'Project B',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
  },
];

const mockTasks: TaskModel[] = [
  {
    id: 10,
    title: 'Task 1',
    description: 'desc',
    status: 'pending',
    projectId: 1,
    position: 1,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    userId: 1,
  },
  {
    id: 20,
    title: 'Task 2',
    description: 'desc',
    status: 'done',
    projectId: 2,
    position: 2,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    userId: 1,
  },
];

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDashboardService.getHealth.mockReturnValue(of({ status: 'ok' }));
    mockDashboardService.getProjects.mockReturnValue(of([]));
    mockDashboardService.getTasks.mockReturnValue(
      of({ data: [], total: 0, page: 1, limit: 5, totalPages: 1 }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    });

    store = TestBed.inject(DashboardStore);
  });

  it('should have correct initial state', () => {
    expect(store.projects()).toEqual([]);
    expect(store.tasks()).toEqual([]);
    expect(store.filter()).toEqual({});
    expect(store.page()).toBe(1);
    expect(store.totalPages()).toBe(1);
    expect(store.totalTasks()).toBe(0);
    expect(store.editingTaskId()).toBeNull();
    expect(store.editingProjectId()).toBeNull();
    expect(store.message()).toBe('');
    expect(store.isLoading()).toBe(false);
    expect(store.healthStatus()).toBe('ok');
  });

  it('hasProjects should be false when projects is empty', () => {
    expect(store.hasProjects()).toBe(false);
  });

  it('hasProjects should be true when projects exist', () => {
    patchState(store, { projects: mockProjects });
    expect(store.hasProjects()).toBe(true);
  });

  it('firstProjectId should be 0 when projects is empty', () => {
    expect(store.firstProjectId()).toBe(0);
  });

  it('firstProjectId should return first project id', () => {
    patchState(store, { projects: mockProjects });
    expect(store.firstProjectId()).toBe(1);
  });

  it('editingTask should be null when no task is being edited', () => {
    expect(store.editingTask()).toBeNull();
  });

  it('editingTask should return the matching task', () => {
    patchState(store, { tasks: mockTasks, editingTaskId: 10 });
    expect(store.editingTask()).toEqual(mockTasks[0]);
  });

  it('editingTask should return null if editingTaskId does not match', () => {
    patchState(store, { tasks: mockTasks, editingTaskId: 999 });
    expect(store.editingTask()).toBeNull();
  });

  it('currentFilters should include page and limit', () => {
    const filters = store.currentFilters();
    expect(filters.page).toBe(1);
    expect(filters.limit).toBe(5);
    expect(filters.projectId).toBeUndefined();
    expect(filters.status).toBeUndefined();
    expect(filters.searchTerm).toBeUndefined();
  });

  it('currentFilters should reflect filter state', () => {
    patchState(store, {
      filter: { projectId: 1, status: 'done', searchTerm: 'test' },
      page: 3,
    });
    const filters = store.currentFilters();
    expect(filters.projectId).toBe(1);
    expect(filters.status).toBe('done');
    expect(filters.searchTerm).toBe('test');
    expect(filters.page).toBe(3);
    expect(filters.limit).toBe(5);
  });

  it('startEdit should set editingTaskId', () => {
    store.startEdit(mockTasks[0]);
    expect(store.editingTaskId()).toBe(10);
  });

  it('cancelEdit should clear editingTaskId', () => {
    patchState(store, { editingTaskId: 10 });
    store.cancelEdit();
    expect(store.editingTaskId()).toBeNull();
  });

  it('startEditProject should set editingProjectId', () => {
    store.startEditProject(mockProjects[0]);
    expect(store.editingProjectId()).toBe(1);
  });

  it('cancelEditProject should clear editingProjectId', () => {
    patchState(store, { editingProjectId: 1 });
    store.cancelEditProject();
    expect(store.editingProjectId()).toBeNull();
  });

  it('setFilter should update filter and reset page to 1', () => {
    patchState(store, { page: 5 });
    mockDashboardService.getTasks.mockReturnValue(
      of({ data: mockTasks, total: 2, page: 1, limit: 5, totalPages: 1 }),
    );

    store.setFilter({ projectId: 1, status: 'done' });

    expect(store.filter()).toEqual({ projectId: 1, status: 'done' });
    expect(store.page()).toBe(1);
    expect(store.tasks()).toEqual(mockTasks);
    expect(mockDashboardService.getTasks).toHaveBeenCalled();
  });

  it('setPage should update page and reload tasks', () => {
    mockDashboardService.getTasks.mockReturnValue(
      of({ data: mockTasks, total: 10, page: 2, limit: 5, totalPages: 2 }),
    );

    store.setPage(2);

    expect(store.page()).toBe(2);
    expect(store.tasks()).toEqual(mockTasks);
    expect(store.totalPages()).toBe(2);
    expect(store.totalTasks()).toBe(10);
  });

  it('onInit should call loadHealth and loadAll', () => {
    expect(mockDashboardService.getHealth).toHaveBeenCalled();
    expect(mockDashboardService.getProjects).toHaveBeenCalled();
  });

  it('loadHealth should update healthStatus on success', () => {
    mockDashboardService.getHealth.mockReturnValue(of({ status: 'degraded' }));

    store.loadHealth();

    expect(store.healthStatus()).toBe('degraded');
  });

  it('loadProjects should update projects and isLoading', () => {
    mockDashboardService.getProjects.mockReturnValue(of(mockProjects));

    store.loadProjects();

    expect(store.projects()).toEqual(mockProjects);
    expect(store.isLoading()).toBe(false);
  });
});
