import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import {
  ActivityEngineService,
  LearningTask,
  MascotState,
  PauseService,
  PluginCommunicationService,
  PreferenceService,
  SimulatorTheme,
  TaskState
} from 'simulator-core';

import {
  WordActivity,
  WordActivityValidator
} from './validators/word-activity.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  paused = false;
  theme: SimulatorTheme = 'LIGHT';

  taskState: TaskState | null = null;
  confettiPlay = false;

  /*
   * TEMPORARY: real Word validation belongs to Phase 3.
   * Check My Work alternates incorrect -> correct -> incorrect ...
   * only to prove the shared learning UI and state machine.
   */
  private checkClicks = 0;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly communication: PluginCommunicationService,
    private readonly pauseService: PauseService,
    private readonly preferenceService: PreferenceService,
    private readonly engine: ActivityEngineService
  ) {}

  get mascotState(): MascotState {
    switch (this.taskState?.status) {
      case 'incorrect':
        return 'incorrect';
      case 'correct':
      case 'completed':
        return 'correct';
      default:
        return 'normal';
    }
  }

  ngOnInit(): void {

    /*
     * Invalid PLUGIN_DATA_IN is rejected with pluginError before it
     * reaches this component.
     */
    this.communication.setActivityValidator(
      new WordActivityValidator()
    );

    /*
     * Start communication with parent iframe host.
     * This sends pluginReady.
     */
    this.communication.init();

    /*
     * Receive a validated PLUGIN_DATA_IN.
     */
    this.subscriptions.add(
      this.communication.activityReceived$.subscribe(activity => {
        this.checkClicks = 0;
        this.confettiPlay = false;

        this.engine.startTask(
          this.toTask(activity as WordActivity)
        );
      })
    );

    /*
     * Mirror the engine state for the template.
     */
    this.subscriptions.add(
      this.engine.state$.subscribe(state => {
        this.taskState = state;
        this.confettiPlay = state?.status === 'correct';
      })
    );

    /*
     * Watch PAUSE / RESUME.
     */
    this.subscriptions.add(
      this.pauseService.paused$.subscribe(paused => {
        this.paused = paused;
      })
    );

    /*
     * Watch theme changes (initial theme and PREFERENCE_CHANGED).
     */
    this.subscriptions.add(
      this.preferenceService.theme$.subscribe(theme => {
        this.theme = theme;
      })
    );

    /*
     * Handle FORCE_FINISH: report the current result through the same
     * guarded completion path as Continue.
     */
    this.subscriptions.add(
      this.communication.forceFinish$.subscribe(() => {
        const status = this.engine.getCurrentState()?.status;

        this.communication.sendActivityCompleted({
          completed: status === 'correct' || status === 'completed'
        });
      })
    );
  }

  onCheckWork(): void {
    const status = this.taskState?.status;

    if (
      this.paused ||
      (status !== 'active' && status !== 'incorrect')
    ) {
      return;
    }

    this.checkClicks++;

    if (this.checkClicks % 2 === 1) {
      this.engine.markIncorrect();
    } else {
      this.engine.markCorrect();
    }
  }

  /*
   * Continue is only valid after success.
   */
  onContinue(): void {
    if (
      this.paused ||
      this.taskState?.status !== 'correct'
    ) {
      return;
    }

    this.engine.markCompleted();

    this.communication.sendActivityCompleted({
      completed: true
    });
  }

  onShowMeHow(): void {
    // Placeholder: playing the supplied hintGif arrives in a later phase.
    console.log('Show me how requested (not implemented yet)');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.communication.destroy();
  }

  private toTask(activity: WordActivity): LearningTask {
    return {
      title: 'Complete the task',
      instructions: [activity.instruction],
      goals: activity.goals,

      // Word input contract: "Show me how" exists only when hintGif is supplied.
      showMeHow:
        typeof activity.hintGif === 'string' &&
        activity.hintGif.trim() !== ''
    };
  }
}
