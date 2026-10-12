import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompletionGuardService {
  private sent = false;

  canSend(): boolean {
    return !this.sent;
  }

  markSent(): void {
    this.sent = true;
  }

  reset(): void {
    this.sent = false;
  }

  hasSent(): boolean {
    return this.sent;
  }
}