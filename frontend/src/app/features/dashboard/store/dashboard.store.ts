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
import { ApiService } from '../../../core/services/api.service';
import type { ProjectModel } from '@shared/types/project.model';
import type { TaskModel } from '@shared/types/task.model';

interface DashboardStateModel {
  projects: ProjectModel[];
  tasks: TaskModel[];
  selectedProjectId: number;
  taskTitle: string;
  taskDescription: string;
  editingTaskId: number | null;
  message: string;
  isLoading: boolean;
  healthStatus: string;
}

const initialState: DashboardStateModel = {
  projects: [],
  tasks: [],
  selectedProjectId: 0,
  taskTitle: '',
  taskDescription: '',
  editingTaskId: null,
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
  withMethods((store, apiService = inject(ApiService)) => {
    const loadHealth = rxMethod<void>(
      pipe(
        switchMap(() =>
          apiService.getHealth().pipe(
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
          apiService.getProjects().pipe(
            tapResponse({
              next: (projects) => {
                const selectedProjectId =
                  store.selectedProjectId() || (projects[0]?.id ?? 0);
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
          apiService.getTasks(store.selectedProjectId() || undefined).pipe(
            tapResponse({
              next: (tasks) => patchState(store, { tasks, isLoading: false }),
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
          apiService.getProjects().pipe(
            tapResponse({
              next: (projects) => {
                const selectedProjectId =
                  store.selectedProjectId() || (projects[0]?.id ?? 0);
                patchState(store, { projects, selectedProjectId });
                apiService.getTasks(selectedProjectId || undefined).subscribe({
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
          apiService.createProject(name).pipe(
            tapResponse({
              next: (project) => {
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

    const setTaskTitle = (title: string) =>
      patchState(store, { taskTitle: title });
    const setTaskDescription = (desc: string) =>
      patchState(store, { taskDescription: desc });
    const setSelectedProjectId = (id: number) => {
      patchState(store, { selectedProjectId: id });
      apiService.getTasks(id || undefined).subscribe({
        next: (tasks) => patchState(store, { tasks }),
        error: () => patchState(store, { message: 'couldNotLoadTasks' }),
      });
    };
    const startEdit = (task: TaskModel) =>
      patchState(store, {
        editingTaskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
      });
    const cancelEdit = () =>
      patchState(store, {
        editingTaskId: null,
        taskTitle: '',
        taskDescription: '',
      });

    const saveTask = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          const title = store.taskTitle().trim();
          const projectId = store.selectedProjectId();
          if (!title || !projectId) {
            return [];
          }
          if (store.editingTaskId()) {
            return apiService
              .updateTask(
                store.editingTaskId()!,
                title,
                store.taskDescription(),
              )
              .pipe(
                tapResponse({
                  next: () => {
                    patchState(store, {
                      taskTitle: '',
                      taskDescription: '',
                      editingTaskId: null,
                      isLoading: false,
                      message: 'taskUpdated',
                    });
                    apiService.getTasks(projectId || undefined).subscribe({
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
          return apiService
            .createTask(title, store.taskDescription(), projectId)
            .pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    taskTitle: '',
                    taskDescription: '',
                    isLoading: false,
                    message: 'taskCreated',
                  });
                  apiService.getTasks(projectId || undefined).subscribe({
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
          apiService.reorderTasks(tasks.map((t) => t.id)).pipe(
            tapResponse({
              next: () => patchState(store, { tasks }),
              error: () =>
                apiService
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
          apiService
            .updateTaskStatus(
              task.id,
              task.status === 'done' ? 'pending' : 'done',
            )
            .pipe(
              tapResponse({
                next: () =>
                  apiService
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
          apiService.deleteTask(task.id).pipe(
            tapResponse({
              next: () =>
                apiService
                  .getTasks(store.selectedProjectId() || undefined)
                  .subscribe({
                    next: (tasks) => patchState(store, { tasks }),
                    error: () =>
                      patchState(store, { message: 'couldNotLoadTasks' }),
                  }),
              error: () => patchState(store, { message: 'couldNotDeleteTask' }),
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
      setTaskTitle,
      setTaskDescription,
      setSelectedProjectId,
      startEdit,
      cancelEdit,
      saveTask,
      reorderTasks,
      toggleTask,
      deleteTask,
    };
  }),
  withHooks({
    onInit(store) {
      store.loadHealth();
      store.loadAll();
    },
  }),
);
