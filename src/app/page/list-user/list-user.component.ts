import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './../../model/user';
import { AuthService } from './../../service/auth-service/auth.service';
import { UserService } from './../../service/user-service/user.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {

  public listUser: User[];

  private _currentUser: User;

  constructor(
    private _router: Router,
    private _userService: UserService,
    private _authService: AuthService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.fetchAllUsers();
    this._authService.user.subscribe((user: User) => {
      this._currentUser = user;
    },(err) => {
      console.error(err);
    });
  }

  private fetchAllUsers(): void {
    this._userService.fetchAllUsers().subscribe((res: User[]) => {
      this.listUser = res;
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  goDetail(id: string) {
    if (this._currentUser === undefined) {
      this._valueShareService.setCompleteModal('※ データのロードに時間がかかっています。しばらく待ってからもう一度クリックしてください。', 10000);
    } else {
      if (this._currentUser.uid.toString() === id.toString()) {
        this._router.navigate(['/user/detail/' + id]);
      } else {
        this._valueShareService.setCompleteModal('※ 他人の詳細なので表示できません。', 5000);
      }
    }
  }
}
