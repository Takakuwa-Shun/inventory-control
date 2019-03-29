import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from './../../model/location';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from '@angular/fire/firestore';
import { firestore } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private _afStore: AngularFirestore
    ) { }

  fetchLocations(): Observable<Location[]> {
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('nameKana', 'asc');
    }
    const collectionLocation: AngularFirestoreCollection<Location> = this._afStore.collection('locations/', queryFn); 
    return collectionLocation.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: Location[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            list.push(doc.data() as Location);
          }
        });
        return list;
      })
    );
  }

  fetchDetailLocation(id: string): Observable<Location> {
    const docLocation: AngularFirestoreDocument<Location> = this._afStore.doc(`locations/${id}`);
    return docLocation.get().pipe(
      map((doc: firebase.firestore.QueryDocumentSnapshot) => {
        if (doc.exists) {
          return doc.data() as Location;
        } else {
          return null;
        }
      })
    );
  }

  saveLocation(location: Location): Observable<void> {
    const docLocation: AngularFirestoreDocument<Location> = this._afStore.doc(`locations/${location.id}`);
    return from(docLocation.set(location));
  }

  deleteLocation(id: string): Observable<void> {
    const docLocation: AngularFirestoreDocument<Location> = this._afStore.doc(`locations/${id}`);
    return from(docLocation.delete());
  }
}
