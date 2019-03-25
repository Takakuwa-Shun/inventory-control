import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from './../../service/auth-service/auth.service';
import { User } from '../../model/user';

@Injectable({
  providedIn: 'root'
})
export class LoginedGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _authService: AuthService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return this._authService.user.pipe(
        take(1),
        map((user: User) => !!user), // userが取得できた場合はtrueを返す
        tap((loggedIn: boolean) => {
          if (loggedIn) {
            this._router.navigate(['/inventory/list']);
          }
        })
      );
  }
}
