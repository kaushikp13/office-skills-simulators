/*
 * Public API Surface of simulator-core
 */

export * from './lib/simulator-core.module';

export * from './lib/communication/plugin-message.model';
export * from './lib/communication/plugin-communication.service';
export * from './lib/communication/completion-guard.service';

export * from './lib/state/pause.service';
export * from './lib/state/preference.service';
export * from './lib/state/simulator-state.service';

export * from './lib/models/activity-result.model';

export * from './lib/activity/task-state.model';
export * from './lib/activity/activity-engine.service';
export * from './lib/activity/assessment.service';

export * from './lib/validation/validation-result.model';
export * from './lib/validation/activity-validator.interface';

export * from './lib/ui/task-card/task-card.component';
export * from './lib/ui/feedback-card/feedback-card.component';
export * from './lib/ui/assessment-progress/assessment-progress.component';
export * from './lib/ui/mascot/mascot.component';
export * from './lib/ui/confetti/confetti.component';
