export type PluginEventName =
  | 'pluginReady'
  | 'activityCompleted'
  | 'pluginError';

export interface PluginEventMessage<T = unknown> {
  type: 'PLUGIN_EVENT';
  name: PluginEventName;
  payload?: T;
  message?: string;
}

export interface PluginDataInMessage<T = unknown> {
  type: 'PLUGIN_DATA_IN';
  payload: T;
}

export interface PauseMessage {
  type: 'PAUSE';
  payload: {
    pause: boolean;
  };
}

export interface ForceFinishMessage {
  type: 'FORCE_FINISH';
}

export interface PreferenceChangedMessage {
  type: 'PREFERENCE_CHANGED';
  payload: {
    type: 'theme';
    value: 'LIGHT' | 'DARK';
  };
}

export type HostMessage<T = unknown> =
  | PluginDataInMessage<T>
  | PauseMessage
  | ForceFinishMessage
  | PreferenceChangedMessage;