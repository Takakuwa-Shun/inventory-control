import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from 'angularfire2/firestore';
import { User } from './../../model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _afStore: AngularFirestore
    ) { }

  public getUserEmailList(): Observable<string[]>{
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('displayName', 'asc');
    }
    const collectionUser: AngularFirestoreCollection<User> = this._afStore.collection('users/', queryFn);
    return collectionUser.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: string[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            const user: User = doc.data() as User;
            list.push(user.email);
          }
        });
        return list;
      })
    );
  }

  public fetchAllUsers(): Observable<User[]> {
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('displayName', 'asc');
    }
    const collectionUser: AngularFirestoreCollection<User> = this._afStore.collection('users/', queryFn);
    return collectionUser.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: User[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            list.push(doc.data() as User);
          }
        });
        return list;
      })
    );
  }

  public fetchDetailUser(uid: string): Observable<User> {
    const docUser: AngularFirestoreDocument<User> = this._afStore.doc(`users/${uid}`);
    return docUser.get().pipe(
      map((doc: firebase.firestore.QueryDocumentSnapshot) => {
        if (doc.exists) {
          return doc.data() as User;
        } else {
          return null;
        }
      })
    );
  }

  public saveUser(user: User): Observable<void> {
    console.log('saveUser');
    const docUser: AngularFirestoreDocument<User> = this._afStore.doc(`users/${user.uid}`);
    return from(docUser.set(user));
  }

  public deleteUser(uid: string): Observable<void> {
    const docUser: AngularFirestoreDocument<User> = this._afStore.doc(`users/${uid}`);
    return from(docUser.delete());
  }
}
