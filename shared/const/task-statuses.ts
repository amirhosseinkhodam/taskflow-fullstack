export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];
