import { TestBed } from '@angular/core/testing';

import { AssessmentService } from './assessment.service';
import { LearningTask } from './task-state.model';

describe('AssessmentService', () => {
  let service: AssessmentService;

  const task = (title: string): LearningTask => ({
    title,
    instructions: [title],
    goals: []
  });

  const tasks = [task('One'), task('Two'), task('Three')];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssessmentService);
    service.start(tasks);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts on the first task', () => {
    expect(service.getCurrentIndex()).toBe(0);
    expect(service.getCurrentTask()?.title).toBe('One');
    expect(service.getTasksTotal()).toBe(3);
    expect(service.getTasksPassed()).toBe(0);
  });

  it('progresses strictly in order', () => {
    const first = service.passCurrentTask();
    expect(first.finished).toBeFalse();
    expect(first.nextTask?.title).toBe('Two');

    const second = service.passCurrentTask();
    expect(second.finished).toBeFalse();
    expect(second.nextTask?.title).toBe('Three');

    const third = service.passCurrentTask();
    expect(third.finished).toBeTrue();
    expect(third.nextTask).toBeNull();

    expect(service.getTasksPassed()).toBe(3);
  });

  it('has no way to go back or skip ahead', () => {
    const api = service as unknown as Record<string, unknown>;

    ['previous', 'back', 'goTo', 'skip', 'next'].forEach(name => {
      expect(api[name]).toBeUndefined();
    });
  });

  it('does not count a task as passed before it is passed', () => {
    service.passCurrentTask();

    expect(service.isPassed(0)).toBeTrue();
    expect(service.isPassed(1)).toBeFalse();
  });

  it('start() resets a previous assessment', () => {
    service.passCurrentTask();
    service.start(tasks);

    expect(service.getCurrentIndex()).toBe(0);
    expect(service.getTasksPassed()).toBe(0);
  });
});
