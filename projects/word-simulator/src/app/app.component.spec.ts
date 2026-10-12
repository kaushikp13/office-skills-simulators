import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { SimulatorCoreModule } from 'simulator-core';

describe('AppComponent (Phase 2 shared learning UI)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let postMessageSpy: jasmine.Spy;

  const lesson = {
    instruction: 'Make the word "really" bold.',
    startingDocument: '<p>I really like pizza.</p>',
    goals: [{ type: 'textStyle', text: 'really', bold: true }],
    assetBaseUrl: './assets/',
    theme: 'LIGHT'
  };

  const el = (): HTMLElement => fixture.nativeElement;
  const q = (selector: string): HTMLElement | null => el().querySelector(selector);

  /* Host -> app message, delivered synchronously like the real listener. */
  const send = (data: unknown): void => {
    window.dispatchEvent(new MessageEvent('message', { data }));
    fixture.detectChanges();
  };

  const sendActivity = (payload: unknown = lesson): void =>
    send({ type: 'PLUGIN_DATA_IN', payload });

  const click = (selector: string): void => {
    (q(selector) as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  const check = (): void => click('.task-card__check');

  /* Temporary rule: first check is incorrect, second is correct. */
  const passTask = (): void => {
    check();
    check();
  };

  const events = (name: string): Array<Record<string, unknown>> =>
    postMessageSpy.calls
      .allArgs()
      .map(args => args[0] as Record<string, unknown>)
      .filter(message => message?.['name'] === name);

  const completions = (): Array<Record<string, unknown>> => events('activityCompleted');

  const mascotState = (): string | null =>
    q('lib-mascot .mascot')?.getAttribute('data-state') ?? null;

  beforeEach(async () => {
    postMessageSpy = spyOn(window.parent, 'postMessage');

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [SimulatorCoreModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the Word simulator app', () => {
    expect(component).toBeTruthy();
  });

  it('sends pluginReady once the listener is active', () => {
    expect(events('pluginReady').length).toBe(1);
  });

  describe('Phase 1 diagnostics', () => {
    it('are not part of the normal UI', () => {
      sendActivity();

      expect(el().textContent).not.toContain('Phase 1');
      expect(el().textContent).not.toContain('PLUGIN_DATA_IN');
      expect(q('pre')).toBeNull();
    });
  });

  describe('assessment mode', () => {
    it('is not part of the Word app: no progress column, tasks array ignored', () => {
      sendActivity({
        ...lesson,
        mode: 'assessment',
        tasks: [{ instruction: 'a' }, { instruction: 'b' }]
      });

      expect(q('lib-assessment-progress')).toBeNull();
      expect(q('.task-card__single-instruction')?.textContent)
        .toContain('Make the word "really" bold.');
    });
  });

  describe('PLUGIN_DATA_IN validation', () => {
    it('sends pluginError for a missing required field and starts no activity', () => {
      const { instruction, ...incomplete } = lesson;

      sendActivity(incomplete);

      expect(events('pluginError').length).toBe(1);
      expect(events('pluginError')[0]['message']).toContain('instruction');
      expect(q('lib-task-card')).toBeNull();
    });

    it('sends pluginError for a payload that is not an object', () => {
      sendActivity('not an activity');

      expect(events('pluginError').length).toBe(1);
      expect(q('lib-task-card')).toBeNull();
    });

    it('keeps a running activity when a later payload is invalid', () => {
      sendActivity();
      check();

      sendActivity({ nope: true });

      expect(events('pluginError').length).toBe(1);
      expect(q('.feedback.incorrect')).not.toBeNull();
    });

    it('starts normally for a valid activity and sends no error', () => {
      sendActivity();

      expect(events('pluginError').length).toBe(0);
      expect(q('lib-task-card')).not.toBeNull();
    });
  });

  describe('task card and feedback', () => {
    it('shows no task card before an activity arrives', () => {
      expect(q('lib-task-card')).toBeNull();
    });

    it('shows the task card with Check My Work once the activity arrives', () => {
      sendActivity();

      expect(q('.task-card__single-instruction')?.textContent)
        .toContain('Make the word "really" bold.');
      expect(q('.task-card__check')?.textContent).toContain('Check My Work');
      expect(mascotState()).toBe('normal');
    });

    it('shows the default incorrect message and keeps retries available', () => {
      sendActivity();
      check();

      expect(q('.feedback.incorrect')?.textContent?.trim()).toBe('Not quite right. Try again.');
      expect(mascotState()).toBe('incorrect');
      expect(q('.task-card__check')).not.toBeNull();
      expect(completions().length).toBe(0);
    });

    it('shows correct feedback, mascot and confetti, then Continue', () => {
      sendActivity();
      passTask();

      expect(q('.feedback.correct')?.textContent).toContain("Well done! You've got this!");
      expect(mascotState()).toBe('correct');
      expect(q('lib-confetti .confetti')).not.toBeNull();
      expect(q('.continue-button')).not.toBeNull();
      expect(q('.task-card__check')).toBeNull();
    });
  });

  describe('Show Me How follows the Word input contract', () => {
    it('is hidden when no hintGif is supplied', () => {
      sendActivity();

      expect(q('.task-card__show-how')).toBeNull();
    });

    it('is hidden for an empty hintGif', () => {
      sendActivity({ ...lesson, hintGif: '  ' });

      expect(q('.task-card__show-how')).toBeNull();
    });

    it('is offered when hintGif is supplied', () => {
      sendActivity({ ...lesson, hintGif: 'bold-demo.gif' });

      expect(q('.task-card__show-how')).not.toBeNull();
    });

    it('only raises an event: no state change, no completion', () => {
      sendActivity({ ...lesson, hintGif: 'bold-demo.gif' });
      const handler = spyOn(component, 'onShowMeHow').and.callThrough();
      spyOn(console, 'log');

      click('.task-card__show-how');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(component.taskState?.status).toBe('active');
      expect(completions().length).toBe(0);
    });
  });

  describe('Continue and activityCompleted', () => {
    it('does not offer Continue before success', () => {
      sendActivity();
      expect(q('.continue-button')).toBeNull();

      check();
      expect(q('.continue-button')).toBeNull();
    });

    it('ignores Continue when the task has not been passed', () => {
      sendActivity();
      check();

      component.onContinue();

      expect(completions().length).toBe(0);
    });

    it('sends activityCompleted only after Continue on a passed task', () => {
      sendActivity();
      passTask();

      expect(completions().length).toBe(0);

      click('.continue-button');

      expect(completions().length).toBe(1);
      expect(completions()[0]['payload']).toEqual({ completed: true });
    });

    it('sends activityCompleted exactly once per activity', () => {
      sendActivity();
      passTask();

      click('.continue-button');
      click('.continue-button');
      component.onContinue();
      send({ type: 'FORCE_FINISH' });

      expect(completions().length).toBe(1);
    });

    it('allows a completion again for the next activity', () => {
      sendActivity();
      passTask();
      click('.continue-button');

      sendActivity();
      passTask();
      click('.continue-button');

      expect(completions().length).toBe(2);
    });

    it('FORCE_FINISH before success reports completed: false, once', () => {
      sendActivity();

      send({ type: 'FORCE_FINISH' });
      send({ type: 'FORCE_FINISH' });

      expect(completions().length).toBe(1);
      expect(completions()[0]['payload']).toEqual({ completed: false });
    });
  });

  describe('Pause / Resume', () => {
    it('disables the shared controls while paused and restores them on resume', () => {
      sendActivity({ ...lesson, hintGif: 'bold-demo.gif' });

      send({ type: 'PAUSE', payload: { pause: true } });

      expect(q('.simulator-shell')?.classList).toContain('frozen');
      expect((q('.task-card__check') as HTMLButtonElement).disabled).toBeTrue();
      expect((q('.task-card__show-how') as HTMLButtonElement).disabled).toBeTrue();

      component.onCheckWork();
      fixture.detectChanges();
      expect(q('.feedback.incorrect')).toBeNull();

      send({ type: 'PAUSE', payload: { pause: false } });

      expect(q('.simulator-shell')?.classList).not.toContain('frozen');
      expect((q('.task-card__check') as HTMLButtonElement).disabled).toBeFalse();
    });

    it('disables Continue while paused and keeps state', () => {
      sendActivity();
      passTask();

      send({ type: 'PAUSE', payload: { pause: true } });

      expect((q('.continue-button') as HTMLButtonElement).disabled).toBeTrue();
      component.onContinue();
      expect(completions().length).toBe(0);

      send({ type: 'PAUSE', payload: { pause: false } });
      click('.continue-button');

      expect(completions().length).toBe(1);
    });
  });

  describe('Light / Dark theme on shared UI', () => {
    const cardBackground = (): string =>
      getComputedStyle(q('.task-card') as HTMLElement).backgroundColor;

    it('applies the activity theme when PLUGIN_DATA_IN arrives', () => {
      sendActivity({ ...lesson, theme: 'DARK' });

      expect(q('.simulator-shell')?.classList).toContain('theme-dark');
      expect(cardBackground()).toBe('rgb(32, 33, 36)');
    });

    it('PREFERENCE_CHANGED still switches the theme afterwards', () => {
      sendActivity({ ...lesson, theme: 'DARK' });

      send({
        type: 'PREFERENCE_CHANGED',
        payload: { type: 'theme', value: 'LIGHT' }
      });

      expect(q('.simulator-shell')?.classList).not.toContain('theme-dark');
      expect(cardBackground()).toBe('rgb(255, 255, 255)');

      send({
        type: 'PREFERENCE_CHANGED',
        payload: { type: 'theme', value: 'DARK' }
      });

      expect(cardBackground()).toBe('rgb(32, 33, 36)');
    });
  });
});
