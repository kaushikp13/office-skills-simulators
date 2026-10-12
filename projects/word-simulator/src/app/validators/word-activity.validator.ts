import {
  ActivityValidationResult,
  ActivityValidator
} from 'simulator-core';

/*
 * The Word activity input contract (required fields plus the optional
 * fields this phase reads). Other optional fields are ignored for now.
 */
export interface WordActivity {
  instruction: string;
  startingDocument: string;
  goals: unknown[];
  assetBaseUrl: string;
  theme: 'LIGHT' | 'DARK';
  hintGif?: string;
}

/*
 * Lightweight PLUGIN_DATA_IN check: required fields only.
 * It does NOT evaluate goals; goal validation is a later phase.
 */
export class WordActivityValidator implements ActivityValidator<WordActivity> {

  validate(activity: unknown): ActivityValidationResult {
    if (typeof activity !== 'object' || activity === null) {
      return { valid: false, reason: 'PLUGIN_DATA_IN payload must be an object.' };
    }

    const data = activity as Record<string, unknown>;

    if (typeof data['instruction'] !== 'string' || data['instruction'].trim() === '') {
      return { valid: false, reason: 'Missing required field: instruction (non-empty string).' };
    }

    if (typeof data['startingDocument'] !== 'string') {
      return { valid: false, reason: 'Missing required field: startingDocument (HTML string).' };
    }

    if (!Array.isArray(data['goals'])) {
      return { valid: false, reason: 'Missing required field: goals (array).' };
    }

    if (typeof data['assetBaseUrl'] !== 'string') {
      return { valid: false, reason: 'Missing required field: assetBaseUrl (string).' };
    }

    if (data['theme'] !== 'LIGHT' && data['theme'] !== 'DARK') {
      return { valid: false, reason: "Missing or invalid required field: theme ('LIGHT' or 'DARK')." };
    }

    if (
      data['hintGif'] !== undefined &&
      typeof data['hintGif'] !== 'string'
    ) {
      return { valid: false, reason: 'Invalid field: hintGif must be a filename string.' };
    }

    return { valid: true };
  }

  isActivity(activity: unknown): activity is WordActivity {
    return this.validate(activity).valid;
  }
}
