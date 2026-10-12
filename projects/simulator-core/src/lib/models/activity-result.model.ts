export interface WordActivityResult {
  completed: boolean;
}

export interface MultiTaskActivityResult {
  completed: boolean;
  tasksPassed: number;
  tasksTotal: number;
}

export type ActivityResult =
  | WordActivityResult
  | MultiTaskActivityResult;