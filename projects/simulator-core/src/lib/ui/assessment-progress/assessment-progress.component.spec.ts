import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentProgressComponent } from './assessment-progress.component';

describe('AssessmentProgressComponent', () => {
  let component: AssessmentProgressComponent;
  let fixture: ComponentFixture<AssessmentProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssessmentProgressComponent]
    });
    fixture = TestBed.createComponent(AssessmentProgressComponent);
    component = fixture.componentInstance;
    component.total = 3;
    fixture.detectChanges();
  });

  const states = () => component.steps.map(step => step.state);

  it('renders one circle per task', () => {
    expect(fixture.nativeElement.querySelectorAll('.progress__step').length).toBe(3);
  });

  it('marks the first task current and the rest upcoming', () => {
    expect(states()).toEqual(['current', 'upcoming', 'upcoming']);
  });

  it('marks earlier tasks passed and the current task current', () => {
    component.currentIndex = 1;
    expect(states()).toEqual(['passed', 'current', 'upcoming']);
  });

  it('marks the current task passed once it is passed', () => {
    component.currentIndex = 1;
    component.currentPassed = true;
    expect(states()).toEqual(['passed', 'passed', 'upcoming']);
  });

  it('is display-only: clicking a circle changes nothing', () => {
    const before = states();

    fixture.nativeElement.querySelectorAll('.progress__step')[2].click();
    fixture.detectChanges();

    expect(states()).toEqual(before);
  });
});
