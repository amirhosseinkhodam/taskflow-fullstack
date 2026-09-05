import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { DashboardService } from '../services/dashboard';
import { NotificationService } from '../../../shared/services/notification';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel, TaskFilterModel } from '@shared/types/task';
import type { UpdateProjectRequestModel } from '../../../shared/models/api';
import type { TaskStatus } from '../../../shared/models/task';

interface DashboardStateModel {
  projects: ProjectModel[];
  tasks: TaskModel[];
  filter: TaskFilterModel;
  page: number;
  totalPages: number;
  totalTasks: number;
  editingTaskId: number | null;
  editingProjectId: number | null;
  isLoading: boolean;
}

const initialState: DashboardStateModel = {
  projects: [],
  tasks: [],
  filter: {},
  page: 1,
  totalPages: 1,
  totalTasks: 0,
  editingTaskId: null,
  editingProjectId: null,
  isLoading: false,
};

const TASKS_PER_PAGE = 5;

export const DashboardStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    hasProjects: computed(() => store.projects().length > 0),
    firstProjectId: computed(() => store.projects()[0]?.id ?? 0),
    editingTask: computed(() => {
      const id = store.editingTaskId();
      if (!id) return null;
      return store.tasks().find((t) => t.id === id) ?? null;
    }),
    currentFilters: computed<TaskFilterModel>(() => ({
      projectId: store.filter().projectId,
      status: store.filter().status,
      searchTerm: store.filter().searchTerm,
      page: store.page(),
      limit: TASKS_PER_PAGE,
    })),
  })),
  withMethods(
    (
      store,
      dashboardService = inject(DashboardService),
      notification = inject(NotificationService),
    ) => {
      const loadProjects = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            dashboardService.getProjects().pipe(
              tapResponse({
                next: (projects) => {
                  patchState(store, {
                    projects,
                    isLoading: false,
                  });
                },
                error: () => {
                  patchState(store, { isLoading: false });
                  notification.show('error', 'couldNotLoadProjects');
                },
              }),
            ),
          ),
        ),
      );

      const loadTasks = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            dashboardService.getTasks(store.currentFilters()).pipe(
              tapResponse({
                next: (response) =>
                  patchState(store, {
                    tasks: response.data,
                    totalPages: response.totalPages,
                    totalTasks: response.total,
                    page: response.page,
                    isLoading: false,
                  }),
                error: () => {
                  patchState(store, { isLoading: false });
                  notification.show('error', 'couldNotLoadProjects');
                },
              }),
            ),
          ),
        ),
      );

      const loadAll = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            dashboardService.getProjects().pipe(
              tapResponse({
                next: (projects) => {
                  patchState(store, { projects });
                  dashboardService.getTasks(store.currentFilters()).subscribe({
                    next: (response) =>
                      patchState(store, {
                        tasks: response.data,
                        totalPages: response.totalPages,
                        totalTasks: response.total,
                        page: response.page,
                        isLoading: false,
                      }),
                    error: () => {
                      patchState(store, { isLoading: false });
                      notification.show('error', 'couldNotLoadProjects');
                    },
                  });
                },
                error: () => {
                  patchState(store, { isLoading: false });
                  notification.show('error', 'couldNotLoadProjects');
                },
              }),
            ),
          ),
        ),
      );

      const createProject = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((name) =>
            dashboardService.createProject(name).pipe(
              tapResponse({
                next: (project) => {
                  patchState(store, {
                    projects: [...store.projects(), project],
                    isLoading: false,
                  });
                  notification.show('success', 'projectCreated');
                },
                error: () => {
                  notification.show('error', 'couldNotLoadTasks');
                },
              }),
            ),
          ),
        ),
      );

      const setFilter = (filter: TaskFilterModel) => {
        patchState(store, { filter, page: 1 });
        dashboardService.getTasks(store.currentFilters()).subscribe({
          next: (response) =>
            patchState(store, {
              tasks: response.data,
              totalPages: response.totalPages,
              totalTasks: response.total,
              page: response.page,
            }),
          error: () => {
            notification.show('error', 'couldNotLoadTasks');
          },
        });
      };

      const setPage = (page: number) => {
        patchState(store, { page });
        dashboardService.getTasks(store.currentFilters()).subscribe({
          next: (response) =>
            patchState(store, {
              tasks: response.data,
              totalPages: response.totalPages,
              totalTasks: response.total,
              page: response.page,
            }),
          error: () => {
            notification.show('error', 'couldNotLoadTasks');
          },
        });
      };

      const startEdit = (task: TaskModel) => {
        patchState(store, { editingTaskId: task.id });
      };

      const cancelEdit = () => {
        patchState(store, { editingTaskId: null });
      };

      const saveTask = rxMethod<{
        title: string;
        description: string;
        projectId: number;
        assigneeEmail?: string;
      }>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((value) => {
            if (!value.title?.trim() || !value.projectId) {
              return [];
            }
            if (store.editingTaskId()) {
              const updatePayload: {
                title: string;
                description: string;
                assigneeEmail?: string;
              } = {
                title: value.title,
                description: value.description,
              };
              if (value.assigneeEmail) {
                updatePayload.assigneeEmail = value.assigneeEmail;
              }
              return dashboardService
                .updateTask(store.editingTaskId()!, updatePayload)
                .pipe(
                  tapResponse({
                    next: () => {
                      patchState(store, {
                        editingTaskId: null,
                        isLoading: false,
                      });
                      notification.show('success', 'taskUpdated');
                      dashboardService
                        .getTasks(store.currentFilters())
                        .subscribe({
                          next: (response) =>
                            patchState(store, {
                              tasks: response.data,
                              totalPages: response.totalPages,
                              totalTasks: response.total,
                              page: response.page,
                            }),
                          error: () =>
                            notification.show('error', 'couldNotLoadTasks'),
                        });
                    },
                    error: () => {
                      patchState(store, {
                        isLoading: false,
                      });
                      notification.show('error', 'couldNotUpdateTask');
                    },
                  }),
                );
            }
            return dashboardService
              .createTask({
                title: value.title,
                description: value.description ?? '',
                projectId: value.projectId,
                assigneeEmail: value.assigneeEmail,
              })
              .pipe(
                tapResponse({
                  next: () => {
                    patchState(store, {
                      isLoading: false,
                    });
                    notification.show('success', 'taskCreated');
                    dashboardService
                      .getTasks(store.currentFilters())
                      .subscribe({
                        next: (response) =>
                          patchState(store, {
                            tasks: response.data,
                            totalPages: response.totalPages,
                            totalTasks: response.total,
                            page: response.page,
                          }),
                        error: () =>
                          notification.show('error', 'couldNotLoadTasks'),
                      });
                  },
                  error: () => {
                    patchState(store, {
                      isLoading: false,
                    });
                    notification.show('error', 'couldNotCreateTask');
                  },
                }),
              );
          }),
        ),
      );

      const reorderTasks = rxMethod<TaskModel[]>(
        pipe(
          switchMap((tasks) =>
            dashboardService.reorderTasks(tasks.map((t) => t.id)).pipe(
              tapResponse({
                next: () => patchState(store, { tasks }),
                error: () =>
                  dashboardService.getTasks(store.currentFilters()).subscribe({
                    next: (response) =>
                      patchState(store, { tasks: response.data }),
                    error: () => {
                      notification.show('error', 'couldNotLoadTasks');
                    },
                  }),
              }),
            ),
          ),
        ),
      );

      const toggleTask = rxMethod<{ task: TaskModel; status: string }>(
        pipe(
          switchMap(({ task, status }) =>
            dashboardService
              .updateTaskStatus(task.id, status as TaskStatus)
              .pipe(
                tapResponse({
                  next: () =>
                    dashboardService
                      .getTasks(store.currentFilters())
                      .subscribe({
                        next: (response) =>
                          patchState(store, { tasks: response.data }),
                        error: () => {
                          notification.show('error', 'couldNotLoadTasks');
                        },
                      }),
                  error: () => {
                    notification.show('error', 'couldNotUpdateTaskStatus');
                  },
                }),
              ),
          ),
        ),
      );

      const deleteTask = rxMethod<TaskModel>(
        pipe(
          switchMap((task) =>
            dashboardService.deleteTask(task.id).pipe(
              tapResponse({
                next: () =>
                  dashboardService.getTasks(store.currentFilters()).subscribe({
                    next: (response) =>
                      patchState(store, { tasks: response.data }),
                    error: () => {
                      notification.show('error', 'couldNotLoadTasks');
                    },
                  }),
                error: () => {
                  notification.show('error', 'couldNotDeleteTask');
                },
              }),
            ),
          ),
        ),
      );

      const startEditProject = (project: ProjectModel) => {
        patchState(store, { editingProjectId: project.id });
      };

      const cancelEditProject = () => {
        patchState(store, { editingProjectId: null });
      };

      const updateProject = rxMethod<UpdateProjectRequestModel>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((value) => {
            const projectId = store.editingProjectId();
            if (!projectId) {
              return [];
            }
            return dashboardService.updateProject(projectId, value).pipe(
              tapResponse({
                next: (updatedProject) => {
                  const updated = store
                    .projects()
                    .map((p) => (p.id === projectId ? updatedProject : p));
                  patchState(store, {
                    projects: updated,
                    editingProjectId: null,
                    isLoading: false,
                  });
                  notification.show('success', 'projectUpdated');
                },
                error: () => {
                  patchState(store, {
                    isLoading: false,
                  });
                  notification.show('error', 'couldNotUpdateProject');
                },
              }),
            );
          }),
        ),
      );

      const deleteProject = rxMethod<ProjectModel>(
        pipe(
          switchMap((project) =>
            dashboardService.deleteProject(project.id).pipe(
              tapResponse({
                next: () => {
                  const remaining = store
                    .projects()
                    .filter((p) => p.id !== project.id);
                  patchState(store, {
                    projects: remaining,
                    editingProjectId: null,
                  });
                  notification.show('success', 'projectDeleted');
                  dashboardService.getTasks(store.currentFilters()).subscribe({
                    next: (response) =>
                      patchState(store, { tasks: response.data }),
                    error: () => {
                      notification.show('error', 'couldNotLoadTasks');
                    },
                  });
                },
                error: () => {
                  notification.show('error', 'couldNotDeleteProject');
                },
              }),
            ),
          ),
        ),
      );

      return {
        loadProjects,
        loadTasks,
        loadAll,
        createProject,
        startEditProject,
        cancelEditProject,
        updateProject,
        deleteProject,
        setFilter,
        setPage,
        startEdit,
        cancelEdit,
        saveTask,
        reorderTasks,
        toggleTask,
        deleteTask,
      };
    },
  ),
  withHooks({
    onInit(store) {
      store.loadAll();
    },
  }),
);
