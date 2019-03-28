import { Injectable } from '@angular/core';
import { Inventory, initInventory, ActionType } from '../../model/inventory';
import { LatestInventory } from '../../model/latest-inventory';
import { EmailService } from './../email-service/email.service';
import { ValueShareService } from './../value-share-service/value-share.service';
import { MaterialTypeEn, MaterialTypeJa } from '../../model/material-type';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from 'angularfire2/firestore';

interface Batch {
  data: Inventory,
  newRef: firebase.firestore.DocumentReference,
  latestRef: firebase.firestore.DocumentReference
}

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
    private _valueShareService: ValueShareService,
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
      bottleInventory: Inventory, inCartonInventory: Inventory, outCartonInventory: Inventory, labelInventory: Inventory, triggerInventory: Inventory, bagInventory: Inventory,
      bottleLimitCount: Number, inCartonLimitCount: Number, outCartonLimitCount: Number, labelLimitCount: Number, triggerLimitCount: Number, bagLimitCount: Number, 
      ): Observable<void> {

      let arrBatch: Batch[] = [];

      if (bottleInventory !== null) {
        const arrBottlePath = this._getCollectionPath(MaterialTypeEn.bo);
        const refNewBottleInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrBottlePath[0]).doc(bottleInventory.id);
        const refLatestBottleInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrBottlePath[1]).doc(bottleInventory.latestPath);

        const batch: Batch = {
          data: Object.assign({}, bottleInventory),
          newRef: refNewBottleInventory,
          latestRef: refLatestBottleInventory
        }
        arrBatch.push(batch);

        // ボトルの在庫量チェック 
        if (bottleInventory.sumCount < bottleLimitCount) {
          this._emailService.alertFewMaterialInventory(bottleInventory.targetName, bottleInventory.sumCount);
        }
      }

      if (inCartonInventory !== null) {
        const arrInCartonPath = this._getCollectionPath(MaterialTypeEn.ca);
        const refNewInCartonInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrInCartonPath[0]).doc(inCartonInventory.id);
        const refLatestInCartonInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrInCartonPath[1]).doc(inCartonInventory.latestPath);

        const batch: Batch = {
          data: Object.assign({}, inCartonInventory),
          newRef: refNewInCartonInventory,
          latestRef: refLatestInCartonInventory
        }
        arrBatch.push(batch);

        // 内側カートンの在庫量チェック 
        if (inCartonInventory.sumCount < inCartonLimitCount) {
          this._emailService.alertFewMaterialInventory(inCartonInventory.targetName, inCartonInventory.sumCount);
        }
      }

      if (outCartonInventory !== null) {
        const arrOutCartonPath = this._getCollectionPath(MaterialTypeEn.ca);
        const refNewOutCartonInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrOutCartonPath[0]).doc(outCartonInventory.id);
        const refLatestOutCartonInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrOutCartonPath[1]).doc(outCartonInventory.latestPath);

        const batch: Batch = {
          data: Object.assign({}, outCartonInventory),
          newRef: refNewOutCartonInventory,
          latestRef: refLatestOutCartonInventory
        }
        arrBatch.push(batch);

        // 外側カートンの在庫量チェック 
        if (outCartonInventory.sumCount < outCartonLimitCount) {
          this._emailService.alertFewMaterialInventory(outCartonInventory.targetName, outCartonInventory.sumCount);
        }
      }

      if (labelInventory !== null) {
        const arrLabelPath = this._getCollectionPath(MaterialTypeEn.la);
        const refNewLabelInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrLabelPath[0]).doc(labelInventory.id);
        const refLatestLabelInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrLabelPath[1]).doc(labelInventory.latestPath);

        const batch: Batch = {
          data: Object.assign({}, labelInventory),
          newRef: refNewLabelInventory,
          latestRef: refLatestLabelInventory
        }
        arrBatch.push(batch);

        // ラベルの在庫量チェック 
        if (labelInventory.sumCount < labelLimitCount) {
          this._emailService.alertFewMaterialInventory(labelInventory.targetName, labelInventory.sumCount);
        }
      }

      if (triggerInventory !== null) {
        const arrTriggerPath = this._getCollectionPath(MaterialTypeEn.tr);
        const refNewTriggerInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrTriggerPath[0]).doc(triggerInventory.id);
        const refLatestTriggerInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrTriggerPath[1]).doc(triggerInventory.latestPath);

        const batch: Batch = {
          data: Object.assign({}, triggerInventory),
          newRef: refNewTriggerInventory,
          latestRef: refLatestTriggerInventory
        }
        arrBatch.push(batch);

        // トリガーの在庫量チェック 
        if (triggerInventory.sumCount < triggerLimitCount) {
          this._emailService.alertFewMaterialInventory(triggerInventory.targetName, triggerInventory.sumCount);
        }
      }

      if (bagInventory !== null) {
        const arrBagPath = this._getCollectionPath(MaterialTypeEn.ba);
        const refNewBagInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrBagPath[0]).doc(bagInventory.id);
        const refLatestBagInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrBagPath[1]).doc(bagInventory.latestPath);

        const batch: Batch = {
          data: Object.assign({}, bagInventory),
          newRef: refNewBagInventory,
          latestRef: refLatestBagInventory
        }
        arrBatch.push(batch);

        // 詰め替え袋の在庫量チェック 
        if (bagInventory.sumCount < bagLimitCount) {
          this._emailService.alertFewMaterialInventory(bagInventory.targetName, bagInventory.sumCount);
        }
      }

      return from(this._afStore.firestore.runTransaction<any>((transaction: firebase.firestore.Transaction) => {
        const arrPromise: Promise<void>[] = [];

        for (const batch of arrBatch) {
          const t = transaction.get(batch.latestRef).then((doc: firebase.firestore.DocumentSnapshot) => {
            const newInventory = batch.data;
            if(doc.exists) {
              const latestInventory = doc.data() as LatestInventory;

              // locationCountに初期値がない場合
              if(latestInventory.locationCount === null) {
                latestInventory.locationCount = {};
                for(const key of Object.keys(newInventory.locationCount)) {
                  latestInventory.locationCount[key] = 0;
                }
              }

              // 新たに倉庫が追加されていた場合
              if (Object.keys(newInventory.locationCount).length > Object.keys(latestInventory.locationCount).length) {
                for(const key of Object.keys(newInventory.locationCount)){
                  if (!Object.keys(latestInventory.locationCount).includes(key)) {
                    latestInventory.locationCount[key] = 0;
                  }
                }
              }

              if (latestInventory.sumCount < newInventory.addCount * -1){
                return Promise.reject(`※ ${newInventory.targetName}に関して、入力中にデータの更新が行われたため、総計よりも引かれる在庫量の方が多くなっています。`);
              }

              if (latestInventory.locationCount[newInventory.arrLocationId[0]] < newInventory.addCount * -1){
                return Promise.reject(`※ ${newInventory.targetName}に関して、入力中にデータの更新が行われたため、工場の在庫量よりも引かれる在庫量の方が多くなっています。`);
              }

              latestInventory.sumCount += newInventory.addCount;
              latestInventory.locationCount[newInventory.arrLocationId[0]] += newInventory.addCount;

              newInventory.sumCount = latestInventory.sumCount;
              newInventory.locationCount = latestInventory.locationCount;

              transaction.set(batch.newRef, newInventory);
              transaction.set(batch.latestRef, latestInventory);
            }else {
              return Promise.reject(`※ ${newInventory.targetName}に関して、在庫データの初期化が完了していないため、保存に失敗しました。`);
            }
          });
          arrPromise.push(t);
        }

        return Promise.all(arrPromise);
      }));
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

      const newInventory: Inventory = Object.assign({}, inventory);

      const refNewInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionPath[0]).doc(newInventory.id);

      return from(this._afStore.firestore.runTransaction((transaction: firebase.firestore.Transaction) => {
        let refLatestInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionPath[1]).doc(newInventory.latestPath);
        return transaction.get(refLatestInventory).then((doc: firebase.firestore.DocumentSnapshot) => {
          let latestInventory: LatestInventory;
          if (doc.exists) {
            latestInventory = doc.data() as LatestInventory;

            // locationCountに初期値がない場合
            if(latestInventory.locationCount === null) {
              latestInventory.locationCount = {};
              for(const key of Object.keys(newInventory.locationCount)) {
                latestInventory.locationCount[key] = 0;
              }
            }

            // 新たに倉庫が追加されていた場合
            if (Object.keys(newInventory.locationCount).length > Object.keys(latestInventory.locationCount).length) {
              for(const key of Object.keys(newInventory.locationCount)){
                if (!Object.keys(latestInventory.locationCount).includes(key)) {
                  latestInventory.locationCount[key] = 0;
                }
              }
            }

            if (newInventory.addCount < 0) {
              if (latestInventory.sumCount < newInventory.addCount * -1){
                return Promise.reject("※ 入力中にデータの更新が行われたため、総計よりも引かれる在庫量の方が多くなっています。");
              }

              if (latestInventory.locationCount[newInventory.arrLocationId[0]] < newInventory.addCount * -1){
                return Promise.reject("※ 入力中にデータの更新が行われたため、指定倉庫の在庫量よりも引かれる在庫量の方が多くなっています。");
              }
            }
            
            if(newInventory.actionType === ActionType.move) {
              if (latestInventory.locationCount[newInventory.arrLocationId[0]] < newInventory.addCount){
                return Promise.reject("※ 入力中にデータの更新が行われたため、移動前倉庫の在庫量よりも引かれる在庫量の方が多くなっています。");
              }
              latestInventory.locationCount[newInventory.arrLocationId[0]] -= newInventory.addCount;
              latestInventory.locationCount[newInventory.arrLocationId[1]] += newInventory.addCount;
            } else {
              latestInventory.sumCount += newInventory.addCount;
              latestInventory.locationCount[newInventory.arrLocationId[0]] += newInventory.addCount;
            }

            newInventory.sumCount = latestInventory.sumCount;
            newInventory.locationCount = latestInventory.locationCount;
          } else {
            return Promise.reject("※ 在庫データの初期化が完了していないため、保存に失敗しました。");
          }
          transaction.set(refNewInventory, newInventory);
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
          if(result.latestPath === '') {
            const latestId = this._afStore.createId();
            result.latestPath = latestId;
            this._initLatestInventory(arrCollectionPath[1], targetId, latestId);
          }
          return result;
        })
      );
    }

    private _initLatestInventory(collectionPath: string, targetId: string, latestId: string): void {
      this._valueShareService.setLoading(true);

      const latestInventory: LatestInventory = {
        id: latestId,
        targetId: targetId,
        sumCount: 0,
        locationCount: null,
      }

      const doc: AngularFirestoreDocument<LatestInventory> = this._afStore.doc(`${collectionPath}/${latestId}`);
      from(doc.set(latestInventory)).subscribe(() => {
        this._valueShareService.setLoading(false);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal('在庫データの初期化に失敗しました。お手数ですが、もう一度最初からお願いいたします。', 20000);
      })
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
              if (filteredLocationId === null || data.arrLocationId.includes(filteredLocationId)) {
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
