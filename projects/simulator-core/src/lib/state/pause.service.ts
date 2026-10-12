import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PauseService {
  private readonly pausedSubject = new BehaviorSubject<boolean>(false);

  readonly paused$ = this.pausedSubject.asObservable();

  setPaused(paused: boolean): void {
    this.pausedSubject.next(paused);
  }

  isPaused(): boolean {
    return this.pausedSubject.value;
  }
}