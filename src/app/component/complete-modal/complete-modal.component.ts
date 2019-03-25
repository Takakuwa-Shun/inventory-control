import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
declare const $;

@Component({
  selector: 'app-complete-modal',
  templateUrl: './complete-modal.component.html',
  styleUrls: ['./complete-modal.component.css']
})
export class CompleteModalComponent implements OnInit {

  @Input() body: string;
  @Input() btnType: string = 'btn-outline-success';
  @Output() action = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  submit(): void {
    this.action.emit(true);
  }
}
