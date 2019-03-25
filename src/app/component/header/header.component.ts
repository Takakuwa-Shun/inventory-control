import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './../../service/auth-service/auth.service';
import { User } from '../../model/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public login: boolean = false;
  public user: User;

  constructor(
    private _authService: AuthService,
  ) { }

  ngOnInit() {
    this._authService.user.subscribe((user: User) => {
      console.log(user);
      if(user) {
        this.login = true;
        this.user = user;
      }
    });
  }

  ngOnDestroy() {
    console.log('ログアウト');
    this.logout();
  }

  logout(): void {
    this.login = false;
    this._authService.logout();
  }
}
