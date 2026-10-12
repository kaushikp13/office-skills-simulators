import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompletionGuardService {

  private completionSent = false;

  canSend(): boolean {
    return !this.completionSent;
  }

  markSent(): void {
    this.completionSent = true;
  }

  resetForNewActivity(): void {
    this.completionSent = false;
  }

  hasSent(): boolean {
    return this.completionSent;
  }
}