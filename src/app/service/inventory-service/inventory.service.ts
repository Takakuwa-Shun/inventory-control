import { Injectable } from '@angular/core';
import { Inventory, initInventory } from '../../model/inventory';
import { EmailService } from './../email-service/email.service';
import { MaterialTypeEn, MaterialTypeJa } from '../../model/material-type';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private static readonly CollectionPath = {
    bo: 'bottleInventories',
    ca: 'cartonInventories',
    la: 'labelInventories',
    tr: 'triggerInventories',
    ba: 'bagInventories',
  }

  constructor(
    private _afStore: AngularFirestore,
    private _emailService: EmailService,
    ) { }

    private _getCollectionPath(type: string): string{  
      switch (type) {
        case MaterialTypeEn.bo:
        case MaterialTypeJa.bo:
          return InventoryService.CollectionPath.bo;
        case MaterialTypeEn.ca:
        case MaterialTypeJa.ca:
          return InventoryService.CollectionPath.ca;
        case MaterialTypeEn.la:
        case MaterialTypeJa.la:
          return InventoryService.CollectionPath.la;
        case MaterialTypeEn.tr:
        case MaterialTypeJa.tr:
          return InventoryService.CollectionPath.tr;
        case MaterialTypeEn.ba:
        case MaterialTypeJa.ba:
          return InventoryService.CollectionPath.ba;
        default:
          console.log('typeおかしいよ : ' + type);
          return null;
      }

    }

    public productManufacture(
      bottleInventory: Inventory, cartonInventory, labelInventory: Inventory, triggerInventory: Inventory, bagInventory: Inventory,
      bottleLimitCount: Number, cartonLimitCount: Number, labelLimitCount: Number, triggerLimitCount: Number, bagLimitCount: Number, 
      ): Observable<void> {

      // ボトルの在庫量チェック 
      if (bottleInventory.sumCount < bottleLimitCount) {
        this._emailService.alertFewMaterialInventory(bottleInventory.targetName, bottleInventory.sumCount);
      }

      // カートンの在庫量チェック 
      if (cartonInventory.sumCount < cartonLimitCount) {
        this._emailService.alertFewMaterialInventory(cartonInventory.targetName, cartonInventory.sumCount);
      }

      // ラベルの在庫量チェック 
      if (labelInventory.sumCount < labelLimitCount) {
        this._emailService.alertFewMaterialInventory(labelInventory.targetName, labelInventory.sumCount);
      }

      // トリガーの在庫量チェック 
      if (triggerInventory.sumCount < triggerLimitCount) {
        this._emailService.alertFewMaterialInventory(triggerInventory.targetName, triggerInventory.sumCount);
      }

      // 詰め替え袋の在庫量チェック 
      if (bagInventory.sumCount < bagLimitCount) {
        this._emailService.alertFewMaterialInventory(bagInventory.targetName, bagInventory.sumCount);
      }

      const batch = this._afStore.firestore.batch();

      const bottlePath = this._getCollectionPath(MaterialTypeEn.bo);
      const cartonPath = this._getCollectionPath(MaterialTypeEn.ca);
      const labelPath = this._getCollectionPath(MaterialTypeEn.la);
      const triggerPath = this._getCollectionPath(MaterialTypeEn.tr);
      const bagPath = this._getCollectionPath(MaterialTypeEn.ba);

      const refBottleInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(bottlePath).doc(bottleInventory.id);
      const refCartonInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(cartonPath).doc(cartonInventory.id);
      const refLabelInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(labelPath).doc(labelInventory.id);
      const refTriggerInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(triggerPath).doc(triggerInventory.id);
      const refBagInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(bagPath).doc(bagInventory.id);

      batch.set(refBottleInventory, bottleInventory);
      batch.set(refCartonInventory, cartonInventory);
      batch.set(refLabelInventory, labelInventory);
      batch.set(refTriggerInventory, triggerInventory);
      batch.set(refBagInventory, bagInventory);

      return from(batch.commit());
    }

    public moveInventory(inventoryBefore: Inventory, inventoryAfter: Inventory, type: string): Observable<void> {

      const batch = this._afStore.firestore.batch();

      const collectionPath = this._getCollectionPath(type);
      if (collectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const refInventoryBefore: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionPath).doc(inventoryBefore.id);
      const refInventoryAfter: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionPath).doc(inventoryAfter.id);

      batch.set(refInventoryBefore, inventoryBefore);
      batch.set(refInventoryAfter, inventoryAfter);

      return from(batch.commit());
    }

    public checkAndSaveInventory(inventory: Inventory, type: string, limitCount: number): Observable<void> {

      if (inventory.sumCount < limitCount) {
        this._emailService.alertFewMaterialInventory(inventory.targetName, inventory.sumCount);
      }

      return this.saveInventory(inventory, type);
    }
  
    public saveInventory(inventory: Inventory, type: string): Observable<void> {

      const collectionPath = this._getCollectionPath(type);
      if (collectionPath === null) {
        return new Observable(observer => observer.error());
      }

      // const refNewInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionPath).doc(inventory.id);

      // return from(this._afStore.firestore.runTransaction((transaction: firebase.firestore.Transaction) => {
      //   const refLatestInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionPath)
      //   return transaction.get(refLatestInventory).then((doc: firebase.firestore.DocumentSnapshot) => {
      //     if (doc.exists) {
      //       const latestInventory = doc.data() as Inventory;
      //       console.log(latestInventory);

      //       const newInvetory = Object.assign({}, inventory);
      //       newInvetory.sumCount = latestInventory.sumCount + newInvetory.addCount;
      //       newInvetory.locationCount = Object.assign({}, latestInventory.locationCount);
      //       newInvetory.locationCount[newInvetory.locationId] += newInvetory.addCount;

      //       console.log(inventory);
      //       console.log(newInvetory);
      //       transaction.set(refNewInventory, newInvetory);            
      //     } else {
      //       console.log('なし');
      //       console.log(doc);
      //     }
      //   });

      // }));

      const docInventory: AngularFirestoreDocument<Inventory> = this._afStore.doc(`${collectionPath}/${inventory.id}`);
      return from(docInventory.set(inventory));
    }

    public deleteInventory(inventoryId: string, type: string): Observable<void> {

      const collectionPath = this._getCollectionPath(type);
      if (collectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const docInventory: AngularFirestoreDocument<Inventory> = this._afStore.doc(`${collectionPath}/${inventoryId}`);
      return from(docInventory.delete());
    }

    public fetchLatestInventoryByTargetId(type: string, targetId: string): Observable<Inventory> {
      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.orderBy('date', 'desc').where('targetId', '==', targetId).limit(1);
      }
      return this._fetchInventories(type, queryFn, null).pipe(
        map((list: Inventory[]) => {
          if (list.length > 0) {
            return list[0];
          } else {
            const firstInventory: Inventory = initInventory();
            return firstInventory;
          }
        })
      );
    }

    public fetchInventoryListsByTargetIdAndDate(type: string, targetId: string, startDate: Date, endDate: Date, filteredLocationId?: string): Observable<Inventory[]> {
      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate);
      }

      return this._fetchInventories(type, queryFn, filteredLocationId);
    }

    private _fetchInventories(type: string, queryFn?: QueryFn, filteredLocationId?: string): Observable<Inventory[]> {

      const collectionPath = this._getCollectionPath(type);
      if (collectionPath === null) {
        return new Observable(observer => observer.error());
      }

      let collectionInventory: AngularFirestoreCollection<Inventory>;
      if (queryFn) {
        collectionInventory = this._afStore.collection(`${collectionPath}/`, queryFn);
      } else {
        collectionInventory = this._afStore.collection(`${collectionPath}/`);
      }
      return collectionInventory.get().pipe(
        map((querySnapshot: firebase.firestore.QuerySnapshot) => {
          let list: Inventory[] = [];
          querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
            if (doc.exists) {
              const data = doc.data() as Inventory;
              if (filteredLocationId === null || data.locationId === filteredLocationId) {
                list.push(data);
              }
            }
          });
          return list;
        })
      );
    }
}
