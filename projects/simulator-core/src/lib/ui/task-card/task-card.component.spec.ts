import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskCardComponent]
    });
    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = {
      title: 'Test task',
      instructions: ['Do the thing.'],
      goals: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits checkWork when Check My Work is clicked', () => {
    let emitted = false;
    component.checkWork.subscribe(() => (emitted = true));

    fixture.nativeElement.querySelector('.task-card__check').click();

    expect(emitted).toBeTrue();
  });
});
