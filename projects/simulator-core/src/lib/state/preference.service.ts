import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SimulatorTheme = 'LIGHT' | 'DARK';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private readonly themeSubject =
    new BehaviorSubject<SimulatorTheme>('LIGHT');

  readonly theme$ = this.themeSubject.asObservable();

  setTheme(theme: SimulatorTheme): void {
    this.themeSubject.next(theme);
  }

  getTheme(): SimulatorTheme {
    return this.themeSubject.value;
  }
}