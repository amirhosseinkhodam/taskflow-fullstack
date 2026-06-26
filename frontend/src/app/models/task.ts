export type TaskStatus = 'pending' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: number;
}
