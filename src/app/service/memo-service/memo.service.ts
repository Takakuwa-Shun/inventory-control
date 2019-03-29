import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Memo } from './../../model/memo';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MemoService {

  constructor(
    private _afStore: AngularFirestore
    ) { }

  fetchAllMemos(): Observable<Memo[]> {
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('content', 'asc');
    }
    const collectionMemo: AngularFirestoreCollection<Memo> = this._afStore.collection('memos/', queryFn);
    return collectionMemo.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: Memo[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            list.push(doc.data() as Memo);
          }
        });
        return list;
      })
    );
  }

  registerMemo(content: string): Observable<void> {
    const memo: Memo = {
      id: this._afStore.createId(),
      content: content
    }
    const docMemo: AngularFirestoreDocument<Memo> = this._afStore.doc(`memos/${memo.id}`);
    return from(docMemo.set(memo));
  }

  updateMemo(memo: Memo): Observable<void> {
    const docMemo: AngularFirestoreDocument<Memo> = this._afStore.doc(`memos/${memo.id}`);
    return from(docMemo.set(memo));
  }

  deleteMemo(id: string): Observable<void> {
    const docMemo: AngularFirestoreDocument<Memo> = this._afStore.doc(`memos/${id}`);
    return from(docMemo.delete());
  }
}
