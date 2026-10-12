import { Component, Input } from '@angular/core';

export type ProgressStepState = 'passed' | 'current' | 'upcoming';

export interface ProgressStep {
  number: number;
  state: ProgressStepState;
}

/*
 * Display-only vertical progress column for assessment mode.
 * It has no click handlers on purpose: learners cannot skip or go back.
 */
@Component({
  selector: 'lib-assessment-progress',
  templateUrl: './assessment-progress.component.html',
  styleUrls: ['./assessment-progress.component.scss']
})
export class AssessmentProgressComponent {

  @Input()
  total = 0;

  /* Zero-based index of the task being worked on. */
  @Input()
  currentIndex = 0;

  /* True once the current task has been passed (before auto-advance). */
  @Input()
  currentPassed = false;

  get steps(): ProgressStep[] {
    return Array.from({ length: this.total }, (_, index) => ({
      number: index + 1,
      state: this.stateFor(index)
    }));
  }

  private stateFor(index: number): ProgressStepState {
    if (index < this.currentIndex) {
      return 'passed';
    }

    if (index === this.currentIndex) {
      return this.currentPassed ? 'passed' : 'current';
    }

    return 'upcoming';
  }
}
