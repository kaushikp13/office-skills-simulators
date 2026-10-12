import { TestBed } from '@angular/core/testing';

import { PluginCommunicationService } from './plugin-communication.service';
import { PreferenceService } from '../state/preference.service';
import { PauseService } from '../state/pause.service';
import { ActivityValidator } from '../validation/activity-validator.interface';

describe('PluginCommunicationService', () => {
  let service: PluginCommunicationService;
  let preferences: PreferenceService;
  let postMessageSpy: jasmine.Spy;
  let received: unknown[];

  const send = (data: unknown): void => {
    window.dispatchEvent(new MessageEvent('message', { data }));
  };

  const sent = (name: string): Array<Record<string, unknown>> =>
    postMessageSpy.calls
      .allArgs()
      .map(args => args[0] as Record<string, unknown>)
      .filter(message => message?.['name'] === name);

  /* Requires `instruction` to be a string, like a real app validator would. */
  const instructionValidator: ActivityValidator<{ instruction: string }> = {
    validate: activity => {
      const value = (activity as { instruction?: unknown }).instruction;

      return typeof value === 'string'
        ? { valid: true }
        : { valid: false, reason: 'instruction is required.' };
    },
    isActivity: (activity): activity is { instruction: string } =>
      typeof (activity as { instruction?: unknown })?.instruction === 'string'
  };

  beforeEach(() => {
    postMessageSpy = spyOn(window.parent, 'postMessage');

    service = TestBed.inject(PluginCommunicationService);
    preferences = TestBed.inject(PreferenceService);

    received = [];
    service.activityReceived$.subscribe(activity => received.push(activity));

    service.init();
  });

  afterEach(() => service.destroy());

  it('sends pluginReady once, even if init() is called again', () => {
    service.init();

    expect(sent('pluginReady').length).toBe(1);
  });

  describe('PLUGIN_DATA_IN validation', () => {
    it('accepts an object payload when no app validator is set', () => {
      send({ type: 'PLUGIN_DATA_IN', payload: { anything: true } });

      expect(received.length).toBe(1);
      expect(sent('pluginError').length).toBe(0);
    });

    [undefined, null, 'text', 42, ['array']].forEach(payload => {
      it(`rejects ${JSON.stringify(payload)} with pluginError and starts nothing`, () => {
        send({ type: 'PLUGIN_DATA_IN', payload });

        expect(received.length).toBe(0);
        expect(sent('pluginError').length).toBe(1);
        expect(sent('pluginError')[0]['message']).toContain('must be an object');
      });
    });

    it('uses the app validator and reports its reason', () => {
      service.setActivityValidator(instructionValidator);

      send({ type: 'PLUGIN_DATA_IN', payload: { goals: [] } });

      expect(received.length).toBe(0);
      expect(sent('pluginError').length).toBe(1);
      expect(sent('pluginError')[0]['message']).toBe('instruction is required.');
    });

    it('starts the activity when the app validator accepts it', () => {
      service.setActivityValidator(instructionValidator);

      send({ type: 'PLUGIN_DATA_IN', payload: { instruction: 'Do it.' } });

      expect(received.length).toBe(1);
      expect(sent('pluginError').length).toBe(0);
    });

    it('invalid input does not reset the completion guard', () => {
      service.setActivityValidator(instructionValidator);

      send({ type: 'PLUGIN_DATA_IN', payload: { instruction: 'Do it.' } });
      service.sendActivityCompleted({ completed: true });

      send({ type: 'PLUGIN_DATA_IN', payload: { nope: true } });
      service.sendActivityCompleted({ completed: true });

      expect(sent('activityCompleted').length).toBe(1);
    });
  });

  describe('theme', () => {
    it('applies the activity theme when PLUGIN_DATA_IN arrives', () => {
      expect(preferences.getTheme()).toBe('LIGHT');

      send({ type: 'PLUGIN_DATA_IN', payload: { theme: 'DARK' } });

      expect(preferences.getTheme()).toBe('DARK');
    });

    it('ignores an unsupported theme value', () => {
      send({ type: 'PLUGIN_DATA_IN', payload: { theme: 'PURPLE' } });

      expect(preferences.getTheme()).toBe('LIGHT');
      expect(received.length).toBe(1);
    });

    it('does not change the theme when the payload is rejected', () => {
      service.setActivityValidator(instructionValidator);

      send({ type: 'PLUGIN_DATA_IN', payload: { theme: 'DARK' } });

      expect(preferences.getTheme()).toBe('LIGHT');
    });

    it('PREFERENCE_CHANGED still works afterwards', () => {
      send({ type: 'PLUGIN_DATA_IN', payload: { theme: 'DARK' } });

      send({
        type: 'PREFERENCE_CHANGED',
        payload: { type: 'theme', value: 'LIGHT' }
      });

      expect(preferences.getTheme()).toBe('LIGHT');
    });
  });

  describe('other host messages', () => {
    it('PAUSE toggles the pause state', () => {
      const pause = TestBed.inject(PauseService);

      send({ type: 'PAUSE', payload: { pause: true } });
      expect(pause.isPaused()).toBeTrue();

      send({ type: 'PAUSE', payload: { pause: false } });
      expect(pause.isPaused()).toBeFalse();
    });

    it('FORCE_FINISH emits forceFinish$', () => {
      let count = 0;
      service.forceFinish$.subscribe(() => count++);

      send({ type: 'FORCE_FINISH' });

      expect(count).toBe(1);
    });

    it('ignores unknown messages', () => {
      send({ type: 'SOMETHING_ELSE' });
      send('not an object');
      send(null);

      expect(received.length).toBe(0);
      expect(sent('pluginError').length).toBe(0);
    });
  });

  describe('activityCompleted guard', () => {
    it('sends once per activity and again after a new valid activity', () => {
      send({ type: 'PLUGIN_DATA_IN', payload: {} });
      service.sendActivityCompleted({ completed: true });
      service.sendActivityCompleted({ completed: true });

      expect(sent('activityCompleted').length).toBe(1);

      send({ type: 'PLUGIN_DATA_IN', payload: {} });
      service.sendActivityCompleted({ completed: true });

      expect(sent('activityCompleted').length).toBe(2);
    });
  });
});
