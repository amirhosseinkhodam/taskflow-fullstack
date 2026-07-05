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
import { TaskFormService } from '../forms/task';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';
import type { UpdateProjectRequestModel } from '../../../shared/models/api';

interface DashboardStateModel {
  projects: ProjectModel[];
  tasks: TaskModel[];
  selectedProjectId: number;
  editingTaskId: number | null;
  editingProjectId: number | null;
  message: string;
  isLoading: boolean;
  healthStatus: string;
}

const initialState: DashboardStateModel = {
  projects: [],
  tasks: [],
  selectedProjectId: 0,
  editingTaskId: null,
  editingProjectId: null,
  message: '',
  isLoading: false,
  healthStatus: 'checking',
};

export const DashboardStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    hasProjects: computed(() => store.projects().length > 0),
    firstProjectId: computed(() => store.projects()[0]?.id ?? 0),
  })),
  withMethods(
    (
      store,
      dashboardService = inject(DashboardService),
      taskForm = inject(TaskFormService),
    ) => {
      const loadHealth = rxMethod<void>(
        pipe(
          switchMap(() =>
            dashboardService.getHealth().pipe(
              tapResponse({
                next: (health) =>
                  patchState(store, { healthStatus: health.status }),
                error: () => patchState(store, { healthStatus: 'offline' }),
              }),
            ),
          ),
        ),
      );

      const loadProjects = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            dashboardService.getProjects().pipe(
              tapResponse({
                next: (projects) => {
                  const selectedProjectId =
                    store.selectedProjectId() || (projects[0]?.id ?? 0);
                  taskForm.patchProjectId(selectedProjectId);
                  patchState(store, {
                    projects,
                    selectedProjectId,
                    isLoading: false,
                  });
                },
                error: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      );

      const loadTasks = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            dashboardService
              .getTasks(store.selectedProjectId() || undefined)
              .pipe(
                tapResponse({
                  next: (tasks) =>
                    patchState(store, { tasks, isLoading: false }),
                  error: () => patchState(store, { isLoading: false }),
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
                  const selectedProjectId =
                    store.selectedProjectId() || (projects[0]?.id ?? 0);
                  taskForm.patchProjectId(selectedProjectId);
                  patchState(store, { projects, selectedProjectId });
                  dashboardService
                    .getTasks(selectedProjectId || undefined)
                    .subscribe({
                      next: (tasks) =>
                        patchState(store, { tasks, isLoading: false }),
                      error: () => patchState(store, { isLoading: false }),
                    });
                },
                error: () => patchState(store, { isLoading: false }),
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
                  taskForm.patchProjectId(project.id);
                  patchState(store, {
                    projects: [...store.projects(), project],
                    selectedProjectId: project.id,
                    isLoading: false,
                    message: 'projectCreated',
                  });
                },
                error: () =>
                  patchState(store, {
                    isLoading: false,
                    message: 'couldNotCreateProject',
                  }),
              }),
            ),
          ),
        ),
      );

      const setSelectedProjectId = (id: number) => {
        taskForm.patchProjectId(id);
        patchState(store, { selectedProjectId: id });
        dashboardService.getTasks(id || undefined).subscribe({
          next: (tasks) => patchState(store, { tasks }),
          error: () => patchState(store, { message: 'couldNotLoadTasks' }),
        });
      };

      const startEdit = (task: TaskModel) => {
        taskForm.patchForEdit(task.title, task.projectId, task.description);
        patchState(store, { editingTaskId: task.id });
      };

      const cancelEdit = () => {
        const projectId = store.selectedProjectId();
        taskForm.resetForm(projectId);
        patchState(store, { editingTaskId: null });
      };

      const saveTask = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            const { title, projectId, description } =
              taskForm.form.getRawValue();
            if (!title?.trim() || !projectId) {
              return [];
            }
            if (store.editingTaskId()) {
              return dashboardService
                .updateTask(store.editingTaskId()!, {
                  title,
                  description,
                })
                .pipe(
                  tapResponse({
                    next: () => {
                      const pid = store.selectedProjectId();
                      taskForm.resetForm(pid);
                      patchState(store, {
                        editingTaskId: null,
                        isLoading: false,
                        message: 'taskUpdated',
                      });
                      dashboardService.getTasks(pid || undefined).subscribe({
                        next: (tasks) => patchState(store, { tasks }),
                        error: () =>
                          patchState(store, { message: 'couldNotLoadTasks' }),
                      });
                    },
                    error: () =>
                      patchState(store, {
                        isLoading: false,
                        message: 'couldNotUpdateTask',
                      }),
                  }),
                );
            }
            return dashboardService
              .createTask({ title, description: description ?? '', projectId })
              .pipe(
                tapResponse({
                  next: () => {
                    const pid = store.selectedProjectId();
                    taskForm.resetForm(pid);
                    patchState(store, {
                      isLoading: false,
                      message: 'taskCreated',
                    });
                    dashboardService.getTasks(pid || undefined).subscribe({
                      next: (tasks) => patchState(store, { tasks }),
                      error: () =>
                        patchState(store, { message: 'couldNotLoadTasks' }),
                    });
                  },
                  error: () =>
                    patchState(store, {
                      isLoading: false,
                      message: 'couldNotCreateTask',
                    }),
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
                  dashboardService
                    .getTasks(store.selectedProjectId() || undefined)
                    .subscribe({
                      next: (tasks) => patchState(store, { tasks }),
                      error: () =>
                        patchState(store, { message: 'couldNotLoadTasks' }),
                    }),
              }),
            ),
          ),
        ),
      );

      const toggleTask = rxMethod<TaskModel>(
        pipe(
          switchMap((task) =>
            dashboardService
              .updateTaskStatus(
                task.id,
                task.status === 'done' ? 'pending' : 'done',
              )
              .pipe(
                tapResponse({
                  next: () =>
                    dashboardService
                      .getTasks(store.selectedProjectId() || undefined)
                      .subscribe({
                        next: (tasks) => patchState(store, { tasks }),
                        error: () =>
                          patchState(store, { message: 'couldNotLoadTasks' }),
                      }),
                  error: () =>
                    patchState(store, { message: 'couldNotUpdateTaskStatus' }),
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
                  dashboardService
                    .getTasks(store.selectedProjectId() || undefined)
                    .subscribe({
                      next: (tasks) => patchState(store, { tasks }),
                      error: () =>
                        patchState(store, { message: 'couldNotLoadTasks' }),
                    }),
                error: () =>
                  patchState(store, { message: 'couldNotDeleteTask' }),
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
                    message: 'projectUpdated',
                  });
                },
                error: () =>
                  patchState(store, {
                    isLoading: false,
                    message: 'couldNotUpdateProject',
                  }),
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
                  const selectedProjectId =
                    store.selectedProjectId() === project.id
                      ? (remaining[0]?.id ?? 0)
                      : store.selectedProjectId();
                  taskForm.patchProjectId(selectedProjectId);
                  patchState(store, {
                    projects: remaining,
                    selectedProjectId,
                    editingProjectId: null,
                    message: 'projectDeleted',
                  });
                  dashboardService
                    .getTasks(selectedProjectId || undefined)
                    .subscribe({
                      next: (tasks) => patchState(store, { tasks }),
                      error: () =>
                        patchState(store, { message: 'couldNotLoadTasks' }),
                    });
                },
                error: () =>
                  patchState(store, { message: 'couldNotDeleteProject' }),
              }),
            ),
          ),
        ),
      );

      return {
        loadHealth,
        loadProjects,
        loadTasks,
        loadAll,
        createProject,
        startEditProject,
        cancelEditProject,
        updateProject,
        deleteProject,
        setSelectedProjectId,
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
      store.loadHealth();
      store.loadAll();
    },
  }),
);
