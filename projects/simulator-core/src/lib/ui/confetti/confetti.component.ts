import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'lib-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.scss']
})
export class ConfettiComponent implements OnChanges, OnDestroy {

  static readonly DURATION_MS = 2500;

  /*
   * Flip to true to play the animation once (about 2-3 seconds).
   */
  @Input()
  play = false;

  visible = false;

  readonly pieces = Array.from({ length: 60 }, (_, i) => i);

  private timer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['play'] && this.play) {
      this.visible = true;

      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.visible = false;
      }, ConfettiComponent.DURATION_MS);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  left(i: number): number {
    return (i * 37) % 100;
  }

  delay(i: number): number {
    return ((i * 13) % 10) / 10;
  }

  color(i: number): string {
    const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
    return colors[i % colors.length];
  }
}
