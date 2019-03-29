import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Observable, of, from} from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { User } from '../../model/user';
import { UserRegister } from '../../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  // _afAuth;
  public user: Observable<User | null>;

  constructor(
    private _router: Router,
    private _afAuth: AngularFireAuth,
    private _afStore: AngularFirestore,
  ) { 
    this.user = this._afAuth.authState.pipe(
      switchMap((user: firebase.User) => {
        if (user) {
          return this._afStore.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  public changeEmail(email: string): Observable<void> {
    return from(this._afAuth.auth.currentUser.updateEmail(email));
  }

  public siginUp(reUser: UserRegister): Observable<firebase.auth.UserCredential> {
    return from(this._afAuth.auth.createUserWithEmailAndPassword(reUser.email, reUser.password));
  }

  public login(email: string, password: string): Observable<firebase.auth.UserCredential> {
    return from(this._afAuth.auth.signInWithEmailAndPassword(email, password));
  }

  public sendResetPasswordEmail(email: string): Observable<void> {
    return from(this._afAuth.auth.sendPasswordResetEmail(email));
  }

  // public googleLogin() {
  //   const provider = new firebase.auth.GoogleAuthProvider();
  //   return this._afAuth.auth.signInWithPopup(provider)
  //   .then((credential: firebase.auth.UserCredential) => {
  //     console.log(credential.user);
  //     return this._updateUserData(credential.user);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // }

  public logout(): void {
    this._afAuth.auth.signOut()
      .then(() => {
        this._router.navigate(['/login']);
      });
  }
}
