import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  LearningTask,
  TaskState
} from './task-state.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityEngineService {

  private readonly stateSubject =
    new BehaviorSubject<TaskState | null>(null);

  readonly state$ =
    this.stateSubject.asObservable();

  startTask(
    task: LearningTask,
    index = 0,
    total = 1
  ): void {

    this.stateSubject.next({
      task,
      index,
      total,
      status: 'active',
      attempts: 0
    });
  }

  markIncorrect(): void {

    const state = this.stateSubject.value;

    if (!state) {
      return;
    }

    this.stateSubject.next({
      ...state,
      status: 'incorrect',
      attempts: state.attempts + 1
    });
  }

  markCorrect(): void {

    const state = this.stateSubject.value;

    if (!state) {
      return;
    }

    this.stateSubject.next({
      ...state,
      status: 'correct',
      attempts: state.attempts + 1
    });
  }

  markCompleted(): void {

    const state = this.stateSubject.value;

    if (!state) {
      return;
    }

    this.stateSubject.next({
      ...state,
      status: 'completed'
    });
  }

  getCurrentState(): TaskState | null {
    return this.stateSubject.value;
  }

  reset(): void {
    this.stateSubject.next(null);
  }
}