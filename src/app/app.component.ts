import { Component, OnInit } from '@angular/core';
import { ValueShareService } from './service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  public loading: boolean = false;

  public completeBody: string; 
  public completeBtnType: string;

  constructor(
    private _valueShareService: ValueShareService
  ){
  }

  ngOnInit () {
    this._setLocading();
    this._setCompleteModal();
  }

  private _setLocading(): void {
    this._valueShareService.loadingSubject.subscribe((res: boolean) => {
      this.loading = res;
    })
  }

  private _setCompleteModal(): void {
    this._valueShareService.completeModalSubject.subscribe((res: string[]) => {
      this.completeBody = res[0];
      this.completeBtnType = res[1];
      this._openCompleteModal(Number(res[2]));
    });
  }

  private _openCompleteModal(timeoutMs: number): void {
    this._valueShareService.setLoading(false);;
    $('#CompleteModal').modal();

    setTimeout(() =>{
      this._closeCompleteModal();
    },timeoutMs);
  };

  private _closeCompleteModal(): void {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#CompleteModal').modal('hide');
  }
}
