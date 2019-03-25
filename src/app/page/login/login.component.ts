import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../service/auth-service/auth.service';
import { UserService } from 'src/app/service/user-service/user.service';
import { User } from './../../model/user';
import { Router } from '@angular/router';
declare const $;

interface Login {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loading = false;

  public login: Login;
  
  public completeBody: string; 
  public completeBtnType: string;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _userService:  UserService,
    ) { }

  ngOnInit() {
    this.login = {
      email: null,
      password: null
    }
  }

  submit(): void {
    this.loading = true;
    this._authService.login(this.login.email, this.login.password)
      .subscribe((credential: firebase.auth.UserCredential) => {
        this._userService.fetchDetailUser(credential.user.uid).subscribe((res: User) => {
          if (res) {
            if (res.email !== credential.user.email) {
              res.email = credential.user.email;
              this._userService.saveUser(res).subscribe(() =>{
                this.loading = false;
                this._router.navigate(['/inventory/list']);
              },(err) => {
                console.error(err);
                this.completeBody = '※ ログインには成功しましたが、担当者の登録データに誤りがあります。自分の担当者データを更新して下さい';
                this.completeBtnType = 'btn-danger';
                this.openCompleteModal();

                setTimeout(() => {
                  this._router.navigate(['/inventory/list']);
                }, 4000);
              });
            } else {
              this.loading = false;
              this._router.navigate(['/inventory/list']);
            }
          }
        });
      },(err) => {
        console.log(err);
        this.completeBody = '※ ログインに失敗しました。';
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
