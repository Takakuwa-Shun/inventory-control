import { Injectable } from '@angular/core';
import { UserService } from './../user-service/user.service';
declare var Email;

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private static readonly TOKEN = '693086b4-5c29-45c0-9a5c-86007b01278e';
  private static readonly from = 'antimicrobialmeister@gmail.com';

  constructor(
    private _userService: UserService,
  ) { }

  public alertFewMaterialInventory(name: string, inventoryCount: number) {
    this._userService.getUserEmailList().subscribe((mailList: string[]) => {
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

      mailList.forEach((mail: string) => {
        this._sendEmail(mail, subject, body);
      });
    });

  }

  private _sendEmail(mailAddress: string, subject: string, body: string) {

    Email.send({
      SecureToken : EmailService.TOKEN,
      To : mailAddress,
      From : EmailService.from,
      Subject : subject,
      Body : body
    }).then((msg: string) => {
      console.log('email sent');
      if (msg !== 'OK') {
        console.error(msg);
      }
    });
  }
}
