import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../service/auth-service/auth.service';
import { Router } from '@angular/router';
declare const $;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public loading = false;
  public mailAddress: string;
  public completeBody: string; 
  public completeBtnType: string;
  public readonly confirmTitle = 'メール送信先確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '送信';

  constructor(
    private _router: Router,
    private _authService: AuthService
  ) { }

  ngOnInit() {
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の宛先に送信してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">宛先</div>
        <div class="col-8 pull-left">${this.mailAddress}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this._authService.sendResetPasswordEmail(this.mailAddress)
      .subscribe(() => {
        this.completeBody = '※ メールを送信しました。';
        this.completeBtnType = 'btn-outline-success';
        this.openCompleteModal();
        setTimeout(() =>{
          this._router.navigate(['/login']);
        },3000);
      },(err) => {
        console.log(err);
        this.completeBody = '※ メールの送信に失敗しました。※ 未登録の場合は送信できません。';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      });
  }

  private openCompleteModal(): void {
    this.loading = false;
    $('#CompleteModal').modal();

    setTimeout(() =>{
      this.closeCompleteModal();
    },3000);
  };

  private closeCompleteModal(): void {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#CompleteModal').modal('hide');
  }

}
