export interface ValidationResult {
  valid: boolean;

  failedGoals?: unknown[];

  message?: string;
}