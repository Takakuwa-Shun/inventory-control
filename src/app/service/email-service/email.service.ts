import { Injectable } from '@angular/core';
import { UserService } from './../user-service/user.service';
import { AuthService } from './../auth-service/auth.service';
import { User } from './../../model/user';
import { environment } from './../../../environments/environment';
import { ValueShareService } from './../value-share-service/value-share.service';
declare var Email;

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private static readonly TOKEN = environment.smtp.token;
  private static readonly from = environment.smtp.from;

  constructor(
    private _valueShareService: ValueShareService, 
    private _userService: UserService,
    private _authService: AuthService,
  ) { }

  private _mailList: string[];
  private _loginUser: User;

  public notifyBackupCreated(type: string, days: number, dataCount: number): void {
    if(this._mailList && this._mailList.length > 0) {
      this._checkAuthLoaded(type, days, dataCount, this._mailList);
    } else {
      this._userService.getUserEmailList().subscribe((mailList: string[]) => {
        this._mailList = mailList;
        this._checkAuthLoaded(type, days, dataCount, this._mailList);
      },(err) => {
        console.error(err);
        this._valueShareService.setCompleteModal("メールの送信に失敗しました", 10000);
      });
    }
  }

  private _checkAuthLoaded(type: string, days: number, dataCount: number, mailList: string[]):void {
    if (this._loginUser) {
      this._setnotifyBackupCreatedMessage(type, days, dataCount, mailList, this._loginUser.displayName);
    } else {
      this._authService.user.subscribe((u: User) => {
        this._loginUser = u;
        this._setnotifyBackupCreatedMessage(type, days, dataCount, mailList, this._loginUser.displayName);
      },(err) => {
        console.error(err);
        this._valueShareService.setCompleteModal("メールの送信に失敗しました", 10000);
      });
    }
  }

  private _setnotifyBackupCreatedMessage(type: string, days: number, dataCount: number, mailList: string[], userName: string): void {
    const subject = `【在庫管理】 ${userName}がバックアップを作成しました。`;
    const body = 
    `<p>在庫管理アプリです。</p>
     <p>バックアップの作成が行われました。</p>
    <ul>
      <li>作成者 : ${userName}</li>
      <li>種類 : ${type}/li>
      <li>選択期間 : ${days}日分</li>
      <li>バックアップデータ総数 : ${dataCount}件</li>
    </ul>
    <br>
    <hr>
    <p>抗菌マイスター株式会社　在庫管理アプリ</p>
    <p>※ このメールは自動送信です。返信しないで下さい。</p>`;

    const msg = `バックアップを作成したため、メールを送信しました。`;
    let mailSent = false;
    for (const mail of mailList) {
      if(mailSent) {
        this._sendEmail(mail, subject, body);
      } else {
        mailSent = true;
        this._sendEmail(mail, subject, body, msg);
      }
    };
  }

  public alertFewMaterialInventory(name: string, inventoryCount: number) {
    if(this._mailList && this._mailList.length > 0) {
      this._setAlertFewMaterialInventoryMessage(name, inventoryCount, this._mailList);
    } else {
      this._userService.getUserEmailList().subscribe((mailList: string[]) => {
        this._mailList = mailList;
        this._setAlertFewMaterialInventoryMessage(name, inventoryCount, mailList);
      });
    }
  }

  private _setAlertFewMaterialInventoryMessage(name: string, inventoryCount: number, mailList: string[]): void {
    const subject = '【在庫管理】　資材在庫が少なくなってきました。';
    const body = 
    `<p>在庫管理アプリです。</p>
     <p>次の資材在庫が少なくなりました。<br>
    資材の調達をお勧めします。</p>
    <ul>
      <li>資材名　 : ${name}</li>
      <li>在庫数量 : ${inventoryCount}</li>
    </ul>
    <br>
    <hr>
    <p>抗菌マイスター株式会社　在庫管理アプリ</p>
    <p>※ このメールは自動送信です。返信しないで下さい。</p>`;

    const msg = '資材在庫が少なくなったため、メールを送信しました。';
    let mailSent = false;
    for (const mail of mailList) {
      if(mailSent) {
        this._sendEmail(mail, subject, body);
      } else {
        mailSent = true;
        this._sendEmail(mail, subject, body, msg);
      }
    };
  }

  private _sendEmail(mailAddress: string, subject: string, body: string, successMsg?: string) {

    Email.send({
      SecureToken : EmailService.TOKEN,
      To : mailAddress,
      From : EmailService.from,
      Subject : subject,
      Body : body
    }).then((msg: string) => {
      if (msg === 'OK') {
        console.log(`email send to ${mailAddress}`);
        if(successMsg) {
          this._valueShareService.setCompleteModal(successMsg, 10000, 'btn-outline-success');
        }
      } else {
        this._valueShareService.setCompleteModal("メールの送信に失敗しました", 10000);
      }
    });
  }
}
