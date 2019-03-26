import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './../../model/user';
import { AuthService } from './../../service/auth-service/auth.service';
import { UserService } from './../../service/user-service/user.service';
declare const $;

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {

  public loading = true;

  public completeBody: string; 
  public completeBtnType: string;

  public listUser: User[];
  public csvListUser: User[] = [{
    uid: '担当者コード',
    displayName: '担当者名',
    email: 'メールアドレス',
  }];

  private _currentUser: User;

  constructor(
    private _router: Router,
    private _userService: UserService,
    private _authService: AuthService,
  ) { }

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
      this.csvListUser = this.csvListUser.concat(this.listUser);
      this.loading = false;
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goDetail(id: string) {
    if (this._currentUser === undefined) {
      this.completeBody = '※ データのロードに時間がかかっています。しばらく待ってからもう一度クリックしてください。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    } else {
      if (this._currentUser.uid.toString() === id.toString()) {
        this._router.navigate(['/user/detail/' + id]);
      } else {
        this.completeBody = '※ 他人の詳細なので表示できません。';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      }
    }
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
