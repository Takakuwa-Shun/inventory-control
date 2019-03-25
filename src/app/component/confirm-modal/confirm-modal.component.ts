import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent implements OnInit {

  @Input() title: string;
  @Input() bodyHtml: string;
  @Input() btnAction: string;
  @Input() btnCancel: string;
  @Output() action = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  confirm(): void {
    this.action.emit(true);
  }

}
