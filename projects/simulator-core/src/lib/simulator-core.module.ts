import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskCardComponent } from './ui/task-card/task-card.component';
import { FeedbackCardComponent } from './ui/feedback-card/feedback-card.component';
import { AssessmentProgressComponent } from './ui/assessment-progress/assessment-progress.component';
import { MascotComponent } from './ui/mascot/mascot.component';
import { ConfettiComponent } from './ui/confetti/confetti.component';

const UI_COMPONENTS = [
  TaskCardComponent,
  FeedbackCardComponent,
  AssessmentProgressComponent,
  MascotComponent,
  ConfettiComponent
];

@NgModule({
  declarations: [
    ...UI_COMPONENTS
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ...UI_COMPONENTS
  ]
})
export class SimulatorCoreModule { }
