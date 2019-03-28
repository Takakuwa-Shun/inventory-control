import { Injectable } from '@angular/core';
import { Inventory, initInventory, ActionType } from '../../model/inventory';
import { LatestInventory } from '../../model/latest-inventory';
import { EmailService } from './../email-service/email.service';
import { MaterialTypeEn, MaterialTypeJa } from '../../model/material-type';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private static readonly LIMIT = 100;

  private _startOfDocSnapshot: firebase.firestore.DocumentSnapshot;
  private _endOfDocSnapshot: firebase.firestore.DocumentSnapshot;

  private static readonly CollectionPath = {
    bo: 'bottleInventories',
    ca: 'cartonInventories',
    la: 'labelInventories',
    tr: 'triggerInventories',
    ba: 'bagInventories',
    boLatest: 'bottleLatestInventories',
    caLatest: 'cartonLatestInventories',
    laLatest: 'labelLatestInventories',
    trLatest: 'triggerLatestInventories',
    baLatest: 'bagLatestInventories',
  }

  constructor(
    private _afStore: AngularFirestore,
    private _emailService: EmailService,
    ) { }

    private _getCollectionPath(type: string): string[]{  
      switch (type) {
        case MaterialTypeEn.bo:
        case MaterialTypeJa.bo:
          return [InventoryService.CollectionPath.bo, InventoryService.CollectionPath.boLatest];
        case MaterialTypeEn.ca:
        case MaterialTypeJa.ca:
          return [InventoryService.CollectionPath.ca, InventoryService.CollectionPath.caLatest];
        case MaterialTypeEn.la:
        case MaterialTypeJa.la:
          return [InventoryService.CollectionPath.la, InventoryService.CollectionPath.laLatest];
        case MaterialTypeEn.tr:
        case MaterialTypeJa.tr:
          return [InventoryService.CollectionPath.tr, InventoryService.CollectionPath.trLatest];
        case MaterialTypeEn.ba:
        case MaterialTypeJa.ba:
          return [InventoryService.CollectionPath.ba, InventoryService.CollectionPath.baLatest];
        default:
          console.log('typeおかしいよ : ' + type);
          return null;
      }
    }

    public deleteAllInventoris(batch: firebase.firestore.WriteBatch, targetId: string, type: string): Observable<void> {

      const arrCollectionPath = this._getCollectionPath(type);
      if (arrCollectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.where('targetId', '==', targetId);
      }

      const collectionInventory: AngularFirestoreCollection<Inventory> = this._afStore.collection(`${arrCollectionPath[0]}/`, queryFn);

      return new Observable(observer => {
        collectionInventory.get().subscribe((querySnapshot: firebase.firestore.QuerySnapshot) => {
          querySnapshot.forEach((doc: firebase.firestore.DocumentSnapshot) => {
            if (doc.exists) {
              const ref: firebase.firestore.DocumentReference = doc.ref;
              batch.delete(ref);
            }
          });
          from(batch.commit()).subscribe(() => {
            observer.next();
            observer.complete();
          },(err) =>{
            observer.error(err);
          })
        })
      });
    }

    public productManufacture(
      bottleInventory: Inventory, cartonInventory, labelInventory: Inventory, triggerInventory: Inventory, bagInventory: Inventory,
      bottleLimitCount: Number, cartonLimitCount: Number, labelLimitCount: Number, triggerLimitCount: Number, bagLimitCount: Number, 
      ): Observable<void> {

      const batch = this._afStore.firestore.batch();

      if (bottleInventory !== null) {
        const arrBottlePath = this._getCollectionPath(MaterialTypeEn.bo);
        const refBottleInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrBottlePath[0]).doc(bottleInventory.id);
        batch.set(refBottleInventory, bottleInventory);

        // ボトルの在庫量チェック 
        if (bottleInventory.sumCount < bottleLimitCount) {
          this._emailService.alertFewMaterialInventory(bottleInventory.targetName, bottleInventory.sumCount);
        }
      }

      if (cartonInventory !== null) {
        const arrCartonPath = this._getCollectionPath(MaterialTypeEn.ca);
        const refCartonInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCartonPath[0]).doc(cartonInventory.id);
        batch.set(refCartonInventory, cartonInventory);

        // カートンの在庫量チェック 
        if (cartonInventory.sumCount < cartonLimitCount) {
          this._emailService.alertFewMaterialInventory(cartonInventory.targetName, cartonInventory.sumCount);
        }
      }

      if (labelInventory !== null) {
        const arrLabelPath = this._getCollectionPath(MaterialTypeEn.la);
        const refLabelInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrLabelPath[0]).doc(labelInventory.id);
        batch.set(refLabelInventory, labelInventory);

        // ラベルの在庫量チェック 
        if (labelInventory.sumCount < labelLimitCount) {
          this._emailService.alertFewMaterialInventory(labelInventory.targetName, labelInventory.sumCount);
        }
      }

      if (triggerInventory !== null) {
        const arrTriggerPath = this._getCollectionPath(MaterialTypeEn.tr);
        const refTriggerInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrTriggerPath[0]).doc(triggerInventory.id);
        batch.set(refTriggerInventory, triggerInventory);

        // トリガーの在庫量チェック 
        if (triggerInventory.sumCount < triggerLimitCount) {
          this._emailService.alertFewMaterialInventory(triggerInventory.targetName, triggerInventory.sumCount);
        }
      }

      if (bagInventory !== null) {
        const arrBagPath = this._getCollectionPath(MaterialTypeEn.ba);
        const refBagInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrBagPath[0]).doc(bagInventory.id);
        batch.set(refBagInventory, bagInventory);

        // 詰め替え袋の在庫量チェック 
        if (bagInventory.sumCount < bagLimitCount) {
          this._emailService.alertFewMaterialInventory(bagInventory.targetName, bagInventory.sumCount);
        }
      }

      return from(batch.commit());
    }

    public checkAndSaveInventory(inventory: Inventory, type: string, limitCount: number): Observable<void> {

      if (inventory.sumCount < limitCount) {
        this._emailService.alertFewMaterialInventory(inventory.targetName, inventory.sumCount);
      }

      return this.saveInventory(inventory, type);
    }
  
    public saveInventory(inventory: Inventory, type: string): Observable<void> {

      const arrCollectionPath = this._getCollectionPath(type);
      if (arrCollectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const refNewInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionPath[0]).doc(inventory.id);

      return from(this._afStore.firestore.runTransaction((transaction: firebase.firestore.Transaction) => {
        let refLatestInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionPath[1]).doc(inventory.latestPath);
        return transaction.get(refLatestInventory).then((doc: firebase.firestore.DocumentSnapshot) => {
          let latestInventory: LatestInventory;
          if (doc.exists) {
            latestInventory = doc.data() as LatestInventory;
            console.log(latestInventory);

            if (inventory.addCount < 0) {
              if (latestInventory.sumCount < inventory.addCount * -1){
                return Promise.reject("総計よりも引かれる在庫量の方が多いです。");
              }

              if (latestInventory.locationCount[inventory.arrLocationId[0]] < inventory.addCount * -1){
                return Promise.reject("指定倉庫の在庫量よりも引かれる在庫量の方が多いです。");
              }
            }
            
            if(inventory.actionType === ActionType.move) {
              if (latestInventory.locationCount[inventory.arrLocationId[0]] < inventory.addCount){
                return Promise.reject("移動前倉庫の在庫量よりも引かれる在庫量の方が多いです。");
              }
              latestInventory.locationCount[inventory.arrLocationId[0]] -= inventory.addCount;
              latestInventory.locationCount[inventory.arrLocationId[1]] += inventory.addCount;
            } else {
              latestInventory.sumCount += inventory.addCount;
              latestInventory.locationCount[inventory.arrLocationId[0]] += inventory.addCount;
            }

            inventory.sumCount = latestInventory.sumCount;
            inventory.locationCount = latestInventory.locationCount;
          } else {
            const latestId = this._afStore.createId();

            latestInventory = {
              id: latestId,
              targetId: inventory.targetId,
              sumCount: inventory.sumCount,
              locationCount: inventory.locationCount
            }
            inventory.latestPath = latestId;
            refLatestInventory = this._afStore.firestore.collection(arrCollectionPath[1]).doc(latestId);
          }
          transaction.set(refNewInventory, inventory);
          transaction.set(refLatestInventory, latestInventory);
        });
      }));
    }

    public fetchLatestInventoryByTargetId(type: string, targetId: string): Observable<Inventory> {

      const arrCollectionPath = this._getCollectionPath(type);
      if (arrCollectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.where('targetId', '==', targetId).limit(1);
      }

      const collectionInventory: AngularFirestoreCollection<Inventory> = this._afStore.collection(`${arrCollectionPath[1]}/`, queryFn);
      return collectionInventory.get().pipe(
        map((querySnapshot: firebase.firestore.QuerySnapshot) => {
          const result: Inventory = initInventory();
          querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
            if (doc.exists) {
              const data = doc.data() as LatestInventory;
              result.sumCount = data.sumCount;
              result.locationCount = data.locationCount;
              result.latestPath = data.id;
            }
          });
          if(result.latestPath = '') {
            this._initLatestInventory(arrCollectionPath[1], targetId);
          }
          return result;
        })
      );
    }

    private _initLatestInventory(collectionPath: string, targetId: string) {

      const latestInventory: LatestInventory = {
        id: '',
        targetId: targetId,
        sumCount: 0,
        locationCount: null
      }

      const doc: AngularFirestoreDocument<LatestInventory> = this._afStore.doc(`${collectionPath}/${latestInventory.id}`);
      return from(doc.set(latestInventory));
    }

    public fetchFollowingInventoryLists(isNext: boolean, type: string, targetId: string, startDate: Date, endDate: Date, filteredLocationId?: string): Observable<Inventory[]> {
      const queryFn: QueryFn = (ref: CollectionReference) => {
        if (isNext) {
          return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate).startAfter(this._endOfDocSnapshot).limit(InventoryService.LIMIT);
        } else {
          return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate).endBefore(this._startOfDocSnapshot).limit(InventoryService.LIMIT);
        }
      }

      return this._fetchInventories(type, queryFn, filteredLocationId);
    }

    public fetchInventoryListsByTargetIdAndDate(type: string, targetId: string, startDate: Date, endDate: Date, filteredLocationId?: string): Observable<Inventory[]> {
      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate).limit(InventoryService.LIMIT);
      }

      return this._fetchInventories(type, queryFn, filteredLocationId);
    }

    private _fetchInventories(type: string, queryFn?: QueryFn, filteredLocationId?: string): Observable<Inventory[]> {

      const arrCollectionPath = this._getCollectionPath(type);
      if (arrCollectionPath === null) {
        return new Observable(observer => observer.error());
      }

      let collectionInventory: AngularFirestoreCollection<Inventory>;
      if (queryFn) {
        collectionInventory = this._afStore.collection(`${arrCollectionPath[0]}/`, queryFn);
      } else {
        collectionInventory = this._afStore.collection(`${arrCollectionPath[0]}/`);
      }
      return collectionInventory.get().pipe(
        map((querySnapshot: firebase.firestore.QuerySnapshot) => {
          let list: Inventory[] = [];
          querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
            if (doc.exists) {
              const data = doc.data() as Inventory;
              if (filteredLocationId === null || data.arrLocationId.findIndex(val => val === filteredLocationId) !== -1) {
                list.push(data);
              }
            }
            const arrDoc = querySnapshot.docs;
            if (arrDoc.length > 0) {
              this._startOfDocSnapshot = arrDoc[0];
              this._endOfDocSnapshot = arrDoc[arrDoc.length - 1];
            }
          });
          return list;
        })
      );
    }
}
