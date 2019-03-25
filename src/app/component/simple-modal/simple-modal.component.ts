import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-simple-modal',
  templateUrl: './simple-modal.component.html',
  styleUrls: ['./simple-modal.component.css']
})
export class SimpleModalComponent implements OnInit {

  @Input() body: string;
  @Input() btn: string;
  @Input() btnType: string;
  @Input() modalId: string;
  @Output() action = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  submit(): void {
    this.action.emit(true);
  }

}
