import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Material } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from './../../model/material-type'
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from '@angular/fire/firestore';
import { FirebaseStorageService } from './../firebase-storage-service/firebase-storage.service';
import { InventoryService } from './../inventory-service/inventory.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  private static readonly CollectionPath = {
    bo: 'bottles',
    ca: 'cartons',
    la: 'labels',
    tr: 'triggers',
    ba: 'bags',
  }

  constructor(
    private _inventoryService: InventoryService,
    private _firebaseStorageService: FirebaseStorageService,
    private _afStore: AngularFirestore,
    @Inject(LOCALE_ID) private _locale: string
    ) { }


  private _getCollectionPath(type: string): string{  
    switch (type) {
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        return MaterialService.CollectionPath.bo;
      case MaterialTypeEn.ca:
      case MaterialTypeJa.ca:
        return MaterialService.CollectionPath.ca;
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        return MaterialService.CollectionPath.la;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        return MaterialService.CollectionPath.tr;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        return MaterialService.CollectionPath.ba;
      default:
        console.log('typeおかしいよ : ' + type);
        return null;
    }

  }

  // saveMaterialWithImage(material: Material, imageFile: File): Observable<void> {
    // const reader: FileReader = new FileReader();
    // reader.readAsBinaryString(imageFile);
    // return new Observable(observer => {
    //   fromEvent(reader,'load').subscribe(() => {
    //     this._googleDriveService.saveImageFile(reader.result, imageFile.name, imageFile.type)
    //       .subscribe((googleResponse: HttpResponse<any>) => {
    //         if (googleResponse.status.toString() === '200') {
    //           const imageId = googleResponse.body.id
    //           _material.imageId = imageId;
    //           this.saveMaterial(_material).subscribe((response) => {
    //             observer.next(response);
    //             observer.complete();
    //           }, (err: HttpResponse<string>) => {
    //             console.log('バックエンド処理失敗');
    //             console.log(err);
    //             this._deleteMaterialImage(imageId);
    //             observer.error(err);
    //           });
    //         } else {
    //           console.log('google drive 保存失敗');
    //           console.log(googleResponse);
    //           observer.error(googleResponse);
    //         }
    //       }, (err: HttpResponse<string>) => {
    //         console.log('google drive 保存失敗');
    //         console.log(err);
    //         observer.error(err);
    //       });
    //   });
    // });
  // }

  public getFilePath(imageFile: File, date: Date): string {
    const dateImp = formatDate(date, "yyyyMMdd_HHmm", this._locale);
    return `images/material/${imageFile.name}_${dateImp}`;
  }

  public fetchMaterialLists(type: string): Observable<Material[]> {
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('nameKana', 'asc');
    }

    const collectionPath = this._getCollectionPath(type);
    if (collectionPath === null) {
      return new Observable(observer => observer.error());
    }

    let collection: AngularFirestoreCollection<Material>;
    if (queryFn) {
      collection = this._afStore.collection(`${collectionPath}/`, queryFn);
    } else {
      collection = this._afStore.collection(`${collectionPath}/`);
    }
    return collection.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: Material[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            list.push(doc.data() as Material);
          }
        });
        return list;
      })
    );
  }

  public fetchMaterialById(materialId: string, type: string): Observable<Material> {

    const collectionPath = this._getCollectionPath(type);
    if (collectionPath === null) {
      return new Observable(observer => observer.error());
    }

    const doc: AngularFirestoreDocument<Material> = this._afStore.doc(`${collectionPath}/${materialId}`);
    return doc.get().pipe(
      map((doc: firebase.firestore.QueryDocumentSnapshot) => {
        if (doc.exists) {
          return doc.data() as Material;
        } else {
          return null;
        }
      })
    );
  }

  public saveMaterial(material: Material): Observable<void> {

    const collectionPath = this._getCollectionPath(material.type);
    if (collectionPath === null) {
      return new Observable(observer => observer.error());
    }

    const doc: AngularFirestoreDocument<Material> = this._afStore.doc(`${collectionPath}/${material.id}`);
    return from(doc.set(material));
  }

  public saveMaterialFromArr(arrMaterial: Material[]): Observable<void> {

    const batch = this._afStore.firestore.batch();

    arrMaterial.forEach((material: Material) => {
      const collectionPath = this._getCollectionPath(material.type);
      if (collectionPath !== null) {
        const ref: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionPath).doc(material.id);
        batch.set(ref, material);
      }
    });

    return from(batch.commit());
  }

  public deleteMaterial(materialId: string, type: string): Observable<void> {

    const collectionPath = this._getCollectionPath(type);
    if (collectionPath === null) {
      return new Observable(observer => observer.error());
    }

    const batch = this._afStore.firestore.batch();

    const ref: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionPath).doc(materialId);
    batch.delete(ref);

    return this._inventoryService.deleteAllInventoris(batch, materialId, type);
  }
}
