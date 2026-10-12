import {
  Component,
  Input
} from '@angular/core';


@Component({
  selector: 'lib-feedback-card',
  templateUrl: './feedback-card.component.html',
  styleUrls: ['./feedback-card.component.scss']
})
export class FeedbackCardComponent {

  @Input()
  status: 'incorrect' | 'correct' | null = null;

  @Input()
  hint?: string;

}