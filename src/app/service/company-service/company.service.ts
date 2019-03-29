import { Injectable } from '@angular/core';
import { Observable, from} from 'rxjs';
import { map } from 'rxjs/operators';
import { Company } from './../../model/company';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from '@angular/fire/firestore';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(
    private _afStore: AngularFirestore
    ) { }

  fetchCompanies(): Observable<Company[]> {
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('nameKana', 'asc');
    }
    const collectionCompany: AngularFirestoreCollection<Company> = this._afStore.collection('companies/', queryFn);
    return collectionCompany.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: Company[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            list.push(doc.data() as Company);
          }
        });
        return list;
      })
    );
  }

  fetchDetailCompany(id: string): Observable<Company> {
    const docCompany: AngularFirestoreDocument<Company> = this._afStore.doc(`companies/${id}`);
    return docCompany.get().pipe(
      map((doc: firebase.firestore.QueryDocumentSnapshot) => {
        if (doc.exists) {
          return doc.data() as Company;
        } else {
          return null;
        }
      })
    );
  }

  saveCompany(company: Company): Observable<void> {
    const docCompany: AngularFirestoreDocument<Company> = this._afStore.doc(`companies/${company.id}`);
    return from(docCompany.set(company));
  }

  deleteCompany(id: string): Observable<void> {
    const docCompany: AngularFirestoreDocument<Company> = this._afStore.doc(`companies/${id}`);
    return from(docCompany.delete());
  }
}
