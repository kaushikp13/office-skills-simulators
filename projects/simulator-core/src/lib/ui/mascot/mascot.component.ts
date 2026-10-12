import { Component, Input } from '@angular/core';

export type MascotState = 'normal' | 'incorrect' | 'correct';

@Component({
  selector: 'lib-mascot',
  templateUrl: './mascot.component.html',
  styleUrls: ['./mascot.component.scss']
})
export class MascotComponent {

  /*
   * Placeholder graphic until the client supplies the real mascot.
   */
  @Input()
  state: MascotState = 'normal';

}
