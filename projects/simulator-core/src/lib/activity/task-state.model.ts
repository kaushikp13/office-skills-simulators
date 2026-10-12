export type TaskStatus =
  | 'idle'
  | 'active'
  | 'incorrect'
  | 'correct'
  | 'completed';

export interface LearningTask {
  explanation?: string;

  title: string;

  instructions: string[];

  hint?: string;

  showMeHow?: boolean;

  goals: unknown[];
}

export interface TaskState {
  task: LearningTask;

  index: number;

  total: number;

  status: TaskStatus;

  attempts: number;
}