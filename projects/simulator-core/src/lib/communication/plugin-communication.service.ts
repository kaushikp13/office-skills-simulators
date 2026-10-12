import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

import {
  ForceFinishMessage,
  HostMessage,
  PauseMessage,
  PluginDataInMessage,
  PreferenceChangedMessage
} from './plugin-message.model';

import { CompletionGuardService } from './completion-guard.service';
import { PauseService } from '../state/pause.service';
import { PreferenceService } from '../state/preference.service';

@Injectable({
  providedIn: 'root'
})
export class PluginCommunicationService<TActivity = unknown> {
  private initialized = false;

  private readonly activityReceivedSubject =
    new Subject<TActivity>();

  private readonly forceFinishSubject =
    new Subject<void>();

  readonly activityReceived$ =
    this.activityReceivedSubject.asObservable();

  readonly forceFinish$ =
    this.forceFinishSubject.asObservable();

  constructor(
    private readonly completionGuard: CompletionGuardService,
    private readonly pauseService: PauseService,
    private readonly preferenceService: PreferenceService,
    private readonly zone: NgZone
  ) {}

  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    window.addEventListener('message', this.onMessage);

    this.sendPluginReady();
  }

  destroy(): void {
    window.removeEventListener('message', this.onMessage);
    this.initialized = false;
  }

  private readonly onMessage = (event: MessageEvent): void => {
    this.zone.run(() => {
      this.handleMessage(event.data as HostMessage<TActivity>);
    });
  };

  private handleMessage(message: HostMessage<TActivity>): void {
    if (!message || typeof message !== 'object' || !('type' in message)) {
      return;
    }

    switch (message.type) {
      case 'PLUGIN_DATA_IN':
        this.handlePluginData(message);
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
        break;
    }
  }

  private handlePluginData(
    message: PluginDataInMessage<TActivity>
  ): void {
    this.completionGuard.reset();
    this.activityReceivedSubject.next(message.payload);
  }

  private handlePause(message: PauseMessage): void {
    this.pauseService.setPaused(message.payload.pause);
  }

  private handleForceFinish(
    _message: ForceFinishMessage
  ): void {
    this.forceFinishSubject.next();
  }

  private handlePreferenceChanged(
    message: PreferenceChangedMessage
  ): void {
    if (message.payload.type === 'theme') {
      this.preferenceService.setTheme(message.payload.value);
    }
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

  sendPluginError(reason: string): void {
    window.parent.postMessage(
      {
        type: 'PLUGIN_EVENT',
        name: 'pluginError',
        message: reason
      },
      '*'
    );
  }

  sendActivityCompleted(payload: unknown): void {
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
}