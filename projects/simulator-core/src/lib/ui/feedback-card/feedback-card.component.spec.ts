import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackCardComponent } from './feedback-card.component';

describe('FeedbackCardComponent', () => {
  let component: FeedbackCardComponent;
  let fixture: ComponentFixture<FeedbackCardComponent>;

  const message = (): string | undefined =>
    fixture.nativeElement.querySelector('.feedback__message')?.textContent?.trim();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackCardComponent]
    });
    fixture = TestBed.createComponent(FeedbackCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders nothing without a status', () => {
    expect(fixture.nativeElement.querySelector('.feedback')).toBeNull();
  });

  it('incorrect without a hint shows the default message', () => {
    component.status = 'incorrect';
    fixture.detectChanges();

    expect(message()).toBe('Not quite right. Try again.');
  });

  it('incorrect with a hint shows the hint instead of the default', () => {
    component.status = 'incorrect';
    component.hint = 'Select the word first.';
    fixture.detectChanges();

    expect(message()).toBe('Select the word first.');
    expect(fixture.nativeElement.textContent).not.toContain('Not quite right');
  });

  it('correct shows the success message and ignores the hint', () => {
    component.status = 'correct';
    component.hint = 'Select the word first.';
    fixture.detectChanges();

    expect(message()).toBe("Well done! You've got this!");
    expect(fixture.nativeElement.textContent).not.toContain('Select the word first.');
  });
});
