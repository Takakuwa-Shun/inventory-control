import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/service/user-service/user.service';
import { AuthService } from './../../service/auth-service/auth.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-detail-user',
  templateUrl: './detail-user.component.html',
  styleUrls: ['./detail-user.component.css']
})
export class DetailUserComponent implements OnInit {

  public user: User;
  public registerUser: User;

  public readonly emailPattern: string = "^[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+(\.[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+)*@[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+(\.[\w!#%&'/=~`\*\+\?\{\}\^\$\-\|]+)*$";

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '修正';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public readonly deleteBody = '本当に削除してもよろしいですか？';;
  public readonly deleteBtn = '削除';
  private _uid: string;

  constructor(
    private _route : ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _authService: AuthService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
  }

  ngOnInit() {
    this._uid = this._route.snapshot.paramMap.get('uid');

    this._authService.user.subscribe((user: User) => {
      if (user.uid !== this._uid) {
        this.goBack();
      }
    });
    this.user = {
      uid: null,
      displayName: null,
      email: null,
    }
    this.registerUser = {
      uid: null,
      displayName: null,
      email: null,
    }
    this.fetchUserDetail();
  }

  private fetchUserDetail() :void {
    this._userService.fetchDetailUser(this._uid).subscribe((res: User) => {
      if (res) {
        this.user = res;
        this.registerUser = Object.assign({}, this.user);
        this._valueShareService.setLoading(false);;
      }  else {
        this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録を修正しますか？</p>
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
    const user: User = {
      uid: this._uid,
      displayName: this.registerUser.displayName.trim(),
      email: this.registerUser.email.trim(),
    }

    this._authService.changeEmail(user.email).subscribe(() => {
      this.saveUser(user);
    },(err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 修正に失敗しました。一度ログアウトしてから再度お試し下さい', 20000);
    });
  }

  private saveUser(user: User): void {
    this._userService.saveUser(user).subscribe((res) => {
      this._valueShareService.setCompleteModal('修正が完了しました。', 5000, 'btn-outline-success');

      this.user = this.registerUser;
      this.registerUser = Object.assign({}, this.user);
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 修正に失敗しました。一度ログアウトしてから再度お試し下さい', 20000);
    });
  }

  delete(): void {
    this._userService.deleteUser(this.user.uid).subscribe((res) => {
      this._valueShareService.setCompleteModal('削除が完了しました。5秒後に自動的に一覧へ遷移します。', 5000, 'btn-outline-success');

      setTimeout(() => {
        this.goBack();
      },5000);
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 削除に失敗しました。');
    });
  }

  goBack(): void {
    this._router.navigate(['/user/list']);
  }
}
