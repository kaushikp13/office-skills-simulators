import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { CompletionGuardService } from './completion-guard.service';
import {
  ForceFinishMessage,
  HostMessage,
  PauseMessage,
  PluginDataInMessage,
  PreferenceChangedMessage
} from './plugin-message.model';

import { PauseService } from '../state/pause.service';
import { PreferenceService } from '../state/preference.service';
import {
  ActivityValidationResult,
  ActivityValidator
} from '../validation/activity-validator.interface';

@Injectable({
  providedIn: 'root'
})
export class PluginCommunicationService<TActivity = unknown> {

  private initialized = false;

  /*
   * Optional app-specific input check (required fields only).
   * It never evaluates goals: goal validation belongs to each simulator.
   */
  private activityValidator?: ActivityValidator<TActivity>;

  private readonly activityReceivedSubject =
    new Subject<TActivity>();

  private readonly forceFinishSubject =
    new Subject<void>();

  readonly activityReceived$: Observable<TActivity> =
    this.activityReceivedSubject.asObservable();

  readonly forceFinish$: Observable<void> =
    this.forceFinishSubject.asObservable();

  constructor(
    private readonly completionGuard: CompletionGuardService,
    private readonly pauseService: PauseService,
    private readonly preferenceService: PreferenceService,
    private readonly zone: NgZone
  ) {}

  setActivityValidator(
    validator: ActivityValidator<TActivity>
  ): void {
    this.activityValidator = validator;
  }

  init(): void {

    if (this.initialized) {
      return;
    }

    this.initialized = true;

    window.addEventListener(
      'message',
      this.onMessage
    );

    this.sendPluginReady();
  }

  destroy(): void {

    if (!this.initialized) {
      return;
    }

    window.removeEventListener(
      'message',
      this.onMessage
    );

    this.initialized = false;
  }

  sendPluginReady(): void {

    window.parent.postMessage(
      {
        type: 'PLUGIN_EVENT',
        name: 'pluginReady'
      },
      '*'
    );
  }

  sendPluginError(message: string): void {

    window.parent.postMessage(
      {
        type: 'PLUGIN_EVENT',
        name: 'pluginError',
        message
      },
      '*'
    );
  }

  sendActivityCompleted(
    payload: unknown
  ): void {

    if (!this.completionGuard.canSend()) {
      return;
    }

    this.completionGuard.markSent();

    window.parent.postMessage(
      {
        type: 'PLUGIN_EVENT',
        name: 'activityCompleted',
        payload
      },
      '*'
    );
  }

  private readonly onMessage =
    (event: MessageEvent<unknown>): void => {

      this.zone.run(() => {
        this.handleMessage(event.data);
      });
    };

  private handleMessage(
    rawMessage: unknown
  ): void {

    if (
      typeof rawMessage !== 'object' ||
      rawMessage === null ||
      !('type' in rawMessage)
    ) {
      return;
    }

    const message =
      rawMessage as HostMessage<TActivity>;

    switch (message.type) {

      case 'PLUGIN_DATA_IN':
        this.handlePluginDataIn(message);
        break;

      case 'PAUSE':
        this.handlePause(message);
        break;

      case 'FORCE_FINISH':
        this.handleForceFinish(message);
        break;

      case 'PREFERENCE_CHANGED':
        this.handlePreferenceChanged(message);
        break;

      default:
        // Client contract:
        // unknown messages must be ignored.
        break;
    }
  }

  private handlePluginDataIn(
    message: PluginDataInMessage<TActivity>
  ): void {

    const validation =
      this.validateActivity(message.payload);

    if (!validation.valid) {

      // Invalid input: report it and do not start an activity.
      this.sendPluginError(
        validation.reason ??
        'PLUGIN_DATA_IN payload is invalid.'
      );

      return;
    }

    this.completionGuard.resetForNewActivity();

    this.applyInitialTheme(message.payload);

    this.activityReceivedSubject.next(
      message.payload
    );
  }

  private validateActivity(
    payload: unknown
  ): ActivityValidationResult {

    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return {
        valid: false,
        reason:
          'PLUGIN_DATA_IN payload must be an object.'
      };
    }

    return this.activityValidator
      ? this.activityValidator.validate(payload)
      : { valid: true };
  }

  /*
   * The activity carries the initial LIGHT/DARK theme.
   * PREFERENCE_CHANGED keeps working afterwards.
   */
  private applyInitialTheme(
    payload: unknown
  ): void {

    const theme =
      (payload as { theme?: unknown }).theme;

    if (theme === 'LIGHT' || theme === 'DARK') {
      this.preferenceService.setTheme(theme);
    }
  }

  private handlePause(
    message: PauseMessage
  ): void {

    this.pauseService.setPaused(
      message.payload.pause
    );
  }

  private handleForceFinish(
    _message: ForceFinishMessage
  ): void {

    this.forceFinishSubject.next();
  }

  private handlePreferenceChanged(
    message: PreferenceChangedMessage
  ): void {

    if (
      message.payload.type === 'theme'
    ) {
      this.preferenceService.setTheme(
        message.payload.value
      );
    }
  }
}