import { Injectable } from '@angular/core';
import { Inventory, initInventory, ActionType } from '../../model/inventory';
import { LatestInventory } from '../../model/latest-inventory';
import { EmailService } from './../email-service/email.service';
import { MaterialService } from './../material-service/material.service';
import { ValueShareService } from './../value-share-service/value-share.service';
import { MaterialTypeEn, MaterialTypeJa } from '../../model/material-type';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from '@angular/fire/firestore';

interface Batch {
  type: string,
  inventory: Inventory,
  limit: number,
  newRef: firebase.firestore.DocumentReference,
  latestRef: firebase.firestore.DocumentReference
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

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
    private _materialService: MaterialService
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

    public deleteMaterialAndAllInventoris(materialId: string, type: string) : Observable<void> {

      const batch = this._afStore.firestore.batch();

      // 資材そのものの削除
      const collectionMaterialPath = this._materialService.getCollectionPath(type);
      if (collectionMaterialPath === null) {
        return new Observable(observer => observer.error());
      }
  
      const ref: firebase.firestore.DocumentReference = this._afStore.firestore.collection(collectionMaterialPath).doc(materialId);
      batch.delete(ref);

      // 資材在庫の削除
      const arrCollectionInventoryPath = this._getCollectionPath(type);
      if (arrCollectionInventoryPath === null) {
        return new Observable(observer => observer.error());
      }

      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.where('targetId', '==', materialId);
      }

      const collectionInventory: AngularFirestoreCollection<Inventory> = this._afStore.collection(`${arrCollectionInventoryPath[0]}/`, queryFn);

      return new Observable(observer => {
        collectionInventory.get().subscribe((querySnapshot: firebase.firestore.QuerySnapshot) => {
          let isLatestDeleted = false;
          querySnapshot.forEach((doc: firebase.firestore.DocumentSnapshot) => {
            if (doc.exists) {
              const ref: firebase.firestore.DocumentReference = doc.ref;
              batch.delete(ref);

              if(!isLatestDeleted) {
                const inventory: Inventory = doc.data() as Inventory;
                const refLatest: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionInventoryPath[1]).doc(inventory.latestPath);
                batch.delete(refLatest);
                isLatestDeleted = true;
              }
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

    private _setBatch(arrBatch: Batch[], typeEn: string, inventory: Inventory, limit: number): void {
      if (inventory !== null) {
        const path = this._getCollectionPath(typeEn);
        if(path !== null) {
          const refNewInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(path[0]).doc(inventory.id);
          const refLatestInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(path[1]).doc(inventory.latestPath);

          const batch: Batch = {
            type: typeEn,
            limit: limit,
            inventory: Object.assign({}, inventory),
            newRef: refNewInventory,
            latestRef: refLatestInventory
          }
          arrBatch.push(batch);
        }  
      }
    }

    public productManufacture(
      bottleInventory: Inventory, inCartonInventory: Inventory, outCartonInventory: Inventory, labelInventory: Inventory, triggerInventory: Inventory, bagInventory: Inventory,
      bottleLimitCount: number, inCartonLimitCount: number, outCartonLimitCount: number, labelLimitCount: number, triggerLimitCount: number, bagLimitCount: number, 
      ): Observable<void> {

      const arrBatch: Batch[] = [];

      this._setBatch(arrBatch, MaterialTypeEn.bo, bottleInventory, bottleLimitCount);
      this._setBatch(arrBatch, MaterialTypeEn.inCa, inCartonInventory, inCartonLimitCount);
      this._setBatch(arrBatch, MaterialTypeEn.outCa, outCartonInventory, outCartonLimitCount);
      this._setBatch(arrBatch, MaterialTypeEn.la, labelInventory, labelLimitCount);
      this._setBatch(arrBatch, MaterialTypeEn.tr, triggerInventory, triggerLimitCount);
      this._setBatch(arrBatch, MaterialTypeEn.ba, bagInventory, bagLimitCount);

      return from(this._afStore.firestore.runTransaction<any>(
        (transaction: firebase.firestore.Transaction) => {
          const arrPromise: Promise<void>[] = [];

          for (const batch of arrBatch) {
            const t = transaction.get(batch.latestRef).then((doc: firebase.firestore.DocumentSnapshot) => {
              if(doc.exists) {
                const latestInventory = doc.data() as LatestInventory;

                // locationCountを確認
                this._confirmLocationCount(latestInventory, batch.inventory);

                if (latestInventory.sumCount < Math.abs(batch.inventory.addCount)){
                  return Promise.reject(`※ ${batch.inventory.targetName}に関して、入力中にデータの更新が行われたため、総計よりも引かれる在庫量の方が多くなっています。`);
                }

                if (latestInventory.locationCount[batch.inventory.arrLocationId[0]] < Math.abs(batch.inventory.addCount)){
                  return Promise.reject(`※ ${batch.inventory.targetName}に関して、入力中にデータの更新が行われたため、工場の在庫量よりも引かれる在庫量の方が多くなっています。`);
                }

                latestInventory.sumCount += batch.inventory.addCount;
                latestInventory.locationCount[batch.inventory.arrLocationId[0]] += batch.inventory.addCount;

                batch.inventory.sumCount = latestInventory.sumCount;
                batch.inventory.locationCount = latestInventory.locationCount;
                batch.inventory.date = new Date();

                transaction.set(batch.newRef, batch.inventory);
                transaction.set(batch.latestRef, latestInventory);
              } else {
                return Promise.reject(`※ ${batch.inventory.targetName}に関して、在庫データの初期化が完了していないため、保存に失敗しました。`);
              }
            });
            arrPromise.push(t);
          }

          return Promise.all(arrPromise);
        })
      ).pipe(
        tap(() => {
          for (const b of arrBatch) {
            if (b.inventory.sumCount < b.limit) {
              this._emailService.alertFewMaterialInventory(b.inventory.targetName, b.inventory.sumCount);
            }
          }
        })
      )
    }

    private _confirmLocationCount(latestInventory: LatestInventory, inventory: Inventory): void {
      // locationCountに初期値がない場合
      if(latestInventory.locationCount === null) {
        latestInventory.locationCount = {};
        for(const key of Object.keys(inventory.locationCount)) {
          latestInventory.locationCount[key] = 0;
        }
      }

      // 新たに倉庫が追加されていた場合
      if (Object.keys(inventory.locationCount).length > Object.keys(latestInventory.locationCount).length) {
        for(const key of Object.keys(inventory.locationCount)){
          if (!Object.keys(latestInventory.locationCount).includes(key)) {
            latestInventory.locationCount[key] = 0;
          }
        }
      }
    }


    public saveInventory(inventory: Inventory, type: string, check: boolean = false, limitCount?: number): Observable<void> {

      const arrCollectionPath = this._getCollectionPath(type);
      if (arrCollectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const newInventory: Inventory = Object.assign({}, inventory);

      return from(this._afStore.firestore.runTransaction<any>(
        (transaction: firebase.firestore.Transaction) => {
          const refNewInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionPath[0]).doc(newInventory.id);
          let refLatestInventory: firebase.firestore.DocumentReference = this._afStore.firestore.collection(arrCollectionPath[1]).doc(newInventory.latestPath);
          return transaction.get(refLatestInventory).then((doc: firebase.firestore.DocumentSnapshot) => {
            if (doc.exists) {
              const latestInventory: LatestInventory = doc.data() as LatestInventory;

              // locationCountを確認
              this._confirmLocationCount(latestInventory, newInventory);

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
              newInventory.date = new Date();

              transaction.set(refNewInventory, newInventory);
              transaction.set(refLatestInventory, latestInventory);
            } else {
              return Promise.reject("※ 在庫データの初期化が完了していないため、保存に失敗しました。");
            }
          });
        })
      ).pipe(
        tap(() => {
          if (check) {
            if (newInventory.sumCount < limitCount) {
              this._emailService.alertFewMaterialInventory(newInventory.targetName, newInventory.sumCount);
            }
          }
        })
      );
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

    public fetchFollowingInventoryLists(isNext: boolean, type: string, targetId: string, startDate: Date, endDate: Date, limit: number, filteredLocationId?: string): Observable<Inventory[]> {
      const queryFn: QueryFn = (ref: CollectionReference) => {
        if (isNext) {
          return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate).startAfter(this._endOfDocSnapshot).limit(limit);
        } else {
          return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate).endBefore(this._startOfDocSnapshot).limit(limit);
        }
      }

      return this._fetchInventories(type, queryFn, filteredLocationId);
    }

    public fetchInventoryListsByTargetIdAndDate(type: string, targetId: string, startDate: Date, endDate: Date, limit: number, filteredLocationId?: string): Observable<Inventory[]> {
      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.orderBy('date', 'desc').where('targetId', '==', targetId).where('date', '>=', startDate).where('date', '<=', endDate).limit(limit);
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

    public fetchBackupInventory(type: string, days: number): Observable<Object> {
      const arrCollectionPath = this._getCollectionPath(type);
      if (arrCollectionPath === null) {
        return new Observable(observer => observer.error());
      }

      const startDate: Date = new Date();
      startDate.setDate(startDate.getDate() - days);

      const queryFn: QueryFn = (ref: CollectionReference) => {
        return ref.orderBy('date', 'desc').where('date', '>=', startDate);
      }

      const collectionInventory: AngularFirestoreCollection<Inventory> = this._afStore.collection(`${arrCollectionPath[0]}/`, queryFn);

      return collectionInventory.get().pipe(
        map((querySnapshot: firebase.firestore.QuerySnapshot) => {
          const result: Object = {};
          querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
            if (doc.exists) {
              const data = doc.data() as Inventory;

              if (result.hasOwnProperty(data.targetId)) {
                const arr: Inventory[] = result[data.targetId];
                arr.push(data);
                result[data.targetId] = arr;
              } else {
                result[data.targetId] = [data];
              }
            }
          });
          return result;
        })
      );

    }
}
