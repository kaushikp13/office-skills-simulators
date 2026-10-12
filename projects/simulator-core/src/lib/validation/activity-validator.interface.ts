export interface ActivityValidationResult {
  valid: boolean;
  reason?: string;
}

export interface ActivityValidator<T> {
  validate(
    activity: unknown
  ): ActivityValidationResult;

  isActivity(
    activity: unknown
  ): activity is T;
}