import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  PauseService,
  PluginCommunicationService,
  PreferenceService,
  SimulatorTheme
} from 'simulator-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  paused = false;
  theme: SimulatorTheme = 'LIGHT';

  activityReceived = false;
  activityJson = '';

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly communication: PluginCommunicationService,
    private readonly pauseService: PauseService,
    private readonly preferenceService: PreferenceService
  ) {}

  ngOnInit(): void {

    /*
     * Start communication with parent iframe host.
     * This sends pluginReady.
     */
    this.communication.init();

    /*
     * Receive PLUGIN_DATA_IN.
     */
    this.subscriptions.add(
      this.communication.activityReceived$.subscribe(activity => {

        console.log('PLUGIN_DATA_IN received:', activity);

        this.activityReceived = true;

        this.activityJson = JSON.stringify(
          activity,
          null,
          2
        );
      })
    );

    /*
     * Watch PAUSE / RESUME.
     */
    this.subscriptions.add(
      this.pauseService.paused$.subscribe(paused => {

        console.log('Pause changed:', paused);

        this.paused = paused;
      })
    );

    /*
     * Watch theme changes.
     */
    this.subscriptions.add(
      this.preferenceService.theme$.subscribe(theme => {

        console.log('Theme changed:', theme);

        this.theme = theme;
      })
    );

    /*
     * Handle FORCE_FINISH.
     */
    this.subscriptions.add(
      this.communication.forceFinish$.subscribe(() => {

        console.log('FORCE_FINISH received');

        this.communication.sendActivityCompleted({
          completed: false
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.communication.destroy();
  }
}