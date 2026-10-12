import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  LearningTask
} from '../../activity/task-state.model';

@Component({
  selector: 'lib-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {

  @Input()
  task!: LearningTask;

  @Input()
  checking = false;

  @Input()
  disabled = false;

  @Output()
  checkWork =
    new EventEmitter<void>();

  @Output()
  showHow =
    new EventEmitter<void>();

  onCheckWork(): void {

    if (
      this.disabled ||
      this.checking
    ) {
      return;
    }

    this.checkWork.emit();
  }

  onShowHow(): void {

    if (this.disabled) {
      return;
    }

    this.showHow.emit();
  }
}