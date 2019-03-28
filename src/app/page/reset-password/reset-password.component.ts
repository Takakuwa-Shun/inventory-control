import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../service/auth-service/auth.service';
import { Router } from '@angular/router';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public mailAddress: string;
  public readonly confirmTitle = 'メール送信先確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '送信';

  constructor(
    private _router: Router,
    private _valueShareService: ValueShareService,
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
    this._valueShareService.setLoading(true);
    this._authService.sendResetPasswordEmail(this.mailAddress)
      .subscribe(() => {
        this._valueShareService.setCompleteModal('※ メールを送信しました。', 10000, 'btn-outline-success');
        setTimeout(() =>{
          this._router.navigate(['/login']);
        },10000);
      },(err) => {
        console.log(err);
        this._valueShareService.setCompleteModal('※ メールの送信に失敗しました。※ 未登録の場合は送信できません。', 20000);
      });
  }
}
