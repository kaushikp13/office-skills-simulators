import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimulatorStateService<T = unknown> {
  private readonly activitySubject =
    new BehaviorSubject<T | null>(null);

  readonly activity$ = this.activitySubject.asObservable();

  setActivity(activity: T): void {
    this.activitySubject.next(activity);
  }

  clear(): void {
    this.activitySubject.next(null);
  }

  getActivity(): T | null {
    return this.activitySubject.value;
  }
}