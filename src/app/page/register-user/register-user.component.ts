import { Component, OnInit } from '@angular/core';
import { UserRegister, User } from '../../model/user';
import { AuthService } from './../../service/auth-service/auth.service'
import { UserService } from './../../service/user-service/user.service'
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {
  public showPassword: boolean;

  public registerUser: UserRegister;

  public readonly emailPattern: string = "^[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+(\.[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+)*@[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+(\.[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+)*$";
  public readonly passwordPattern: string = '^[\\x00-\\x7F]{8,50}$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  constructor(
    private _authService: AuthService,
    private _valueShareService: ValueShareService,
    private _userService: UserService
    ) { }

  ngOnInit() {
    this.formInit();
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerUser.displayName}</div>
      </div>
      <div class="row">
        <div class="col-4">メールアドレス</div>
        <div class="col-8 pull-left">${this.registerUser.email}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this._valueShareService.setLoading(true);
    const name = this.registerUser.displayName;
    this._authService.siginUp(this.registerUser).subscribe((res: firebase.auth.UserCredential) => {
      const user: User = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: name,
      }
      this._userService.saveUser(user).subscribe(() => {
        this._valueShareService.setCompleteModal('登録が完了しました。現在、新規登録ユーザーとしてログイン中です。', 20000, 'btn-outline-success');
      }, (err) => {
        console.log(err);
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
      });
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  formInit(): void {
    this.showPassword = false;
    this.registerUser = {
      uid: null,
      displayName: null,
      email: null,
      password: null,
    };
  }
}
