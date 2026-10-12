import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  LearningTask
} from './task-state.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private tasks: LearningTask[] = [];

  private currentIndex = 0;

  private passedTasks =
    new Set<number>();

  private readonly currentIndexSubject =
    new BehaviorSubject<number>(0);

  readonly currentIndex$: Observable<number> =
    this.currentIndexSubject.asObservable();

  start(
    tasks: LearningTask[]
  ): void {

    this.tasks = [...tasks];

    this.currentIndex = 0;

    this.passedTasks.clear();

    this.currentIndexSubject.next(0);
  }

  getCurrentTask():
    LearningTask | null {

    return (
      this.tasks[this.currentIndex] ??
      null
    );
  }

  passCurrentTask(): {
    finished: boolean;
    nextTask: LearningTask | null;
  } {

    if (
      this.tasks.length === 0
    ) {
      return {
        finished: true,
        nextTask: null
      };
    }

    this.passedTasks.add(
      this.currentIndex
    );

    const lastTask =
      this.currentIndex >=
      this.tasks.length - 1;

    if (lastTask) {

      return {
        finished: true,
        nextTask: null
      };
    }

    this.currentIndex++;

    this.currentIndexSubject.next(
      this.currentIndex
    );

    return {
      finished: false,
      nextTask: this.getCurrentTask()
    };
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTasksPassed(): number {
    return this.passedTasks.size;
  }

  getTasksTotal(): number {
    return this.tasks.length;
  }

  isPassed(
    index: number
  ): boolean {

    return this.passedTasks.has(index);
  }

  reset(): void {

    this.tasks = [];

    this.currentIndex = 0;

    this.passedTasks.clear();

    this.currentIndexSubject.next(0);
  }
}