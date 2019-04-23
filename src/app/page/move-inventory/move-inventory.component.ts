import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { Inventory, ActionType, initInventory } from './../../model/inventory';
import { Material } from './../../model/material';
import { Location, initLocation } from './../../model/location';
import { Memo } from './../../model/memo';
import { User } from '../../model/user';
import { MaterialTypeJa, MaterialTypeEn } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { LocationService } from './../../service/location-service/location.service';
import { MemoService } from './../../service/memo-service/memo.service';
import { InventoryService } from './../../service/inventory-service/inventory.service';
import { AuthService } from './../../service/auth-service/auth.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-move-inventory',
  templateUrl: './move-inventory.component.html',
  styleUrls: ['./move-inventory.component.scss']
})
export class MoveInventoryComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  private _locationLoaded = false;
  private _memoLoaded = false;
  private _userLoaded = false;

  private _loginUserData: User;

  public registerInventory: Inventory;
  private readonly _typeDefault = '資材タイプを選択してください';
  public readonly materialType =  [this._typeDefault, MaterialTypeJa.bo, MaterialTypeJa.tr, MaterialTypeJa.la, MaterialTypeJa.ba, MaterialTypeJa.ca];
  public selectType: string;
  public isSelectedType: boolean;

  private _bottleLists: Material[];
  private _cartonLists: Material[];
  private _labelLists: Material[];
  private _triggerLists: Material[];
  private _bagLists: Material[];
  public searchList:  Material[];
  public locationList: Location[];
  public memoList: string[] = [];

  public targetSearchPlaceholder: string;
  public targetNoMatchFoundText: string;
  public showMaterialAlert: boolean;
  public isMaterialSelected: boolean;
  public showLocationBeforeAlert: boolean;
  public showLocationAfterAlert: boolean;
  public isLocationBeforeSelected: boolean;
  public isLocationAfterSelected: boolean;
  public selectedLocationBefore: Location;
  public selectedLocationAfter: Location;
  public locationPlaceholder: string;

  public imageSrc: string;

  public readonly countPattern: string = '^[1-9][0-9]*$';
  public readonly typePattern: string = '^(?!.*' + this._typeDefault + ').*$';

  public readonly confirmTitle = '入力確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  constructor(
    private _inventoryService: InventoryService,
    private _materialService: MaterialService,
    private _locationService: LocationService,
    private _memoService: MemoService,
    private _firebaseStorageService: FirebaseStorageService,
    private _afStore: AngularFirestore,
    private _authService: AuthService,
    private _valueShareService: ValueShareService,
    @Inject(LOCALE_ID) private _locale: string
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.formInit();
    this._fetchAllLocations();
    this._fetchAllMemos();
    this._fetchMyselfData();
  }

  formInit() :void {
    this.registerInventory = initInventory();
    this.registerInventory.addCount = null;

    this.targetSearchPlaceholder = '先に資材タイプを選択してください。';
    this.targetNoMatchFoundText = '検索できません。先に資材タイプを選択してください。';
    this.locationPlaceholder = '先に資材を選択して下さい';
    this.isSelectedType = false;
    this.selectType = this._typeDefault;
    this.showMaterialAlert = false
    this.isMaterialSelected = false;
    this.showLocationBeforeAlert = false;
    this.showLocationAfterAlert = false;
    this.isLocationBeforeSelected = false;
    this.isLocationAfterSelected = false;
    this.imageSrc = MoveInventoryComponent.NO_IMAGE_URL;
    this.selectedLocationBefore = initLocation();
    this.selectedLocationAfter = initLocation();
    $('#material').val('');
    $('#location-before').val('');
    $('#location-after').val('');
    $('#memo').val('');
  }

  public confirmRegister() {
    const addCount = Number(this.registerInventory.addCount);
    if (this.registerInventory.sumCount < addCount){
      this._valueShareService.setCompleteModal('移動個数が総在庫量よりも多いです。', 20000);
    } else if(this.registerInventory.locationCount[this.selectedLocationBefore.id] < addCount) {
      this._valueShareService.setCompleteModal('移動個数が移動前倉庫の在庫量よりも多いです', 20000);
    } else if(this.selectedLocationBefore.id === this.selectedLocationAfter.id) {
      this._valueShareService.setCompleteModal('移動前と移動後の倉庫が同じです', 20000);
    } else {
      const date = new Date();
      const showDate = formatDate(date, "yyyy/MM/dd (EEE) HH:mm", this._locale);
      this.registerInventory.date = date;
      this.confirmBody = `
      <div class="container-fluid">
        <p>以下の内容で登録してもよろしいでしょうか？</p>
        <div class="row">
          <div class="col-4">日時</div>
          <div class="col-8 pull-left">${showDate}</div>
        </div>
        <div class="row">
          <div class="col-4">作業従事者名</div>
          <div class="col-8 pull-left">${this._loginUserData.displayName}</div>
        </div>
        <div class="row">
          <div class="col-4">資材名</div>
          <div class="col-8 pull-left">${this.registerInventory.targetName}</div>
        </div>
        <div class="row">
          <div class="col-4">移動個数</div>
          <div class="col-8 pull-left">${this.registerInventory.addCount}</div>
        </div>
        <div class="row">
          <div class="col-4">作業項目</div>
          <div class="col-8 pull-left">${ActionType.move}</div>
        </div>
        <div class="row">
          <div class="col-4">作業詳細</div>
          <div class="col-8 pull-left">${this.selectedLocationBefore.name} → ${this.selectedLocationAfter.name}</div>
        </div>
        <div class="row">
          <div class="col-4">備考</div>
          <div class="col-8 pull-left">${this.registerInventory.memo}</div>
        </div>
      </div>`;

      this._openConfirmModal();
    }
  }

  public submit(): void {
    this._valueShareService.setLoading(true);
    this.registerInventory.id = this._afStore.createId();
    this.registerInventory.userName = this._loginUserData.displayName;
    this.registerInventory.actionType = ActionType.move;
    this.registerInventory.actionDetail = `${this.selectedLocationBefore.name} → ${this.selectedLocationAfter.name}`;
    this.registerInventory.addCount = Number(this.registerInventory.addCount);
    this.registerInventory.arrLocationId = [this.selectedLocationBefore.id, this.selectedLocationAfter.id];

    this._inventoryService.saveInventory(this.registerInventory, this.selectType).subscribe(() => {
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err: string) => {
      console.error(err);
      if(typeof err === 'string' && err.startsWith('※')) {
        this._valueShareService.setCompleteModal(err, 20000);
      } else {
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
      }
    });
  }

  public selectMaterial(data: Material) :void {
    if (typeof data === 'string') {
      this.showMaterialAlert = true;
      this.imageSrc = MoveInventoryComponent.NO_IMAGE_URL;
      this.isMaterialSelected = false;

      this.isLocationAfterSelected = false;
      this.isLocationBeforeSelected = false;
      $('#location-before').val('');
      $('#location-after').val('');
      this.locationPlaceholder = '先に資材を選択して下さい';
    } else {
      this._valueShareService.setLoading(true);
      this.showMaterialAlert = false;
      this.registerInventory.targetId = data.id;
      this.registerInventory.targetName = data.name;
      this.isMaterialSelected = true;

      this.isLocationAfterSelected = false;
      this.isLocationBeforeSelected = false;
      $('#location-before').val('');
      $('#location-after').val('');
      this.locationPlaceholder = '倉庫名を検索してください';

      this._fetchLatestInventory();
      if (data.imageUrl) {
        this._firebaseStorageService.fecthDownloadUrl(data.imageUrl).subscribe((res: string) => {
          this.imageSrc = MoveInventoryComponent.NO_IMAGE_URL;
          this.imageSrc = res;
        }, (err) => {
          console.error(err);
          this.imageSrc = MoveInventoryComponent.NO_IMAGE_URL;
          this._valueShareService.setCompleteModal('※ 画像の取得に失敗しました。', 10000);
        });
      } else {
        this.imageSrc = MoveInventoryComponent.NO_IMAGE_URL;
      }
    }
  }

  public autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  public changeType(): void {
    this.imageSrc = '';
    this.imageSrc = MoveInventoryComponent.NO_IMAGE_URL;
    this.isMaterialSelected = false;
    this.registerInventory.targetId = null;
    this.registerInventory.targetName = null;
    $('#material').val('');

    switch(this.selectType) {
      case MaterialTypeJa.bo:
        this.isSelectedType = true;
        this.targetSearchPlaceholder = `${MaterialTypeJa.bo}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.bo}はありません。`;
        return this._fetchAllBottles();
      case MaterialTypeJa.ca:
        this.isSelectedType = true;
        this.targetSearchPlaceholder = `${MaterialTypeJa.ca}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.ca}はありません。`;
        return this._fetchAllCartons();
      case MaterialTypeJa.la:
        this.isSelectedType = true;
        this.targetSearchPlaceholder = `${MaterialTypeJa.la}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.la}はありません。`;
        return this._fetchAllLabels();
      case MaterialTypeJa.tr:
        this.isSelectedType = true;
        this.targetSearchPlaceholder = `${MaterialTypeJa.tr}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.tr}はありません。`;
        return this._fetchAllTriggers();
      case MaterialTypeJa.ba:
        this.isSelectedType = true;
        this.targetSearchPlaceholder = `${MaterialTypeJa.ba}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.ba}はありません。`;
        return this._fetchAllBags();
      default:
        this.isSelectedType = false;
        this.targetSearchPlaceholder = '先に資材タイプを選択してください。';
        this.targetNoMatchFoundText = '検索できません。先に資材タイプを選択してください。';
    }
  }

  public selectLocationBefore(data: Location): void {
    if (typeof data === 'string') {
      this.showLocationBeforeAlert = true;
    } else {
      this.showLocationBeforeAlert = false;
      this.selectedLocationBefore = data;
      this.isLocationBeforeSelected = true;
    }
  }

  public selectLocationAfter(data: Location): void {
    if (typeof data === 'string') {
      this.showLocationAfterAlert = true;
    } else {
      this.showLocationAfterAlert = false;
      this.selectedLocationAfter = data;
      this.isLocationAfterSelected = true;
    }
  }

  private _fetchLatestInventory(): void {
    this._inventoryService.fetchLatestInventoryByTargetId(this.selectType, this.registerInventory.targetId)
    .subscribe((res: Inventory) => {
      const latestInventory = res;
      this.registerInventory.sumCount = res.sumCount;
      this.registerInventory.latestPath = res.latestPath;

      if (latestInventory.locationCount === null) {
        latestInventory.locationCount = {};
        this.locationList.forEach((l: Location) => {
          latestInventory.locationCount[l.id] = 0;
        });
      }

      // 新たに倉庫が追加されていた場合
      if (this.locationList.length > Object.keys(latestInventory.locationCount).length) {
        for(const location of this.locationList){
          if (!Object.keys(latestInventory.locationCount).includes(location.id)) {
            latestInventory.locationCount[location.id] = 0;
          }
        }
      }
      this.registerInventory.locationCount = latestInventory.locationCount;

      this._valueShareService.setLoading(false);
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。', 5000);
    });
  }

  private _fetchAllBottles():void {
    if(this._bottleLists) {
      this.searchList = this._bottleLists;
    } else {
      this._valueShareService.setLoading(true);
      this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.bo).subscribe((res: Material[]) => {
        this._bottleLists = res;
        this.searchList = this._bottleLists;
        this._valueShareService.setLoading(false);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllCartons():void {
    if (this._cartonLists) {
      this.searchList = this._cartonLists;
    } else {
      this._valueShareService.setLoading(true);
      this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ca).subscribe((res: Material[]) => {
        this._cartonLists = res;
        this.searchList = this._cartonLists;
        this._valueShareService.setLoading(false);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ca}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllLabels():void {
    if (this._labelLists) {
      this.searchList = this._labelLists;
    } else {
      this._valueShareService.setLoading(true);
      this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.la).subscribe((res: Material[]) => {
        this._labelLists = res;
        this.searchList = this._labelLists;
        this._valueShareService.setLoading(false);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.la}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllTriggers():void {
    if(this._triggerLists) {
      this.searchList = this._triggerLists;
    } else {
      this._valueShareService.setLoading(true);
      this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.tr).subscribe((res: Material[]) => {
        this._triggerLists = res;
        this.searchList = this._triggerLists;
        this._valueShareService.setLoading(false);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllBags():void {
    if(this._bagLists) {
      this.searchList = this._bagLists;
    } else {
      this._valueShareService.setLoading(true);
      this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ba).subscribe((res: Material[]) => {
        this._bagLists = res;
        this.searchList = this._bagLists;
        this._valueShareService.setLoading(false);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllLocations():void {
    this._locationService.fetchLocations().subscribe((res) => {
      this.locationList = res;
      this._locationLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ 倉庫のデータの取得に失敗しました。`, 10000);
    });
  }

  private _fetchAllMemos():void {
    this._memoService.fetchAllMemos().subscribe((res: Memo[]) => {
        res.forEach((m: Memo) => {
          this.memoList.push(m.content);
        });
        this._memoLoaded = true; 
        this._checkLoaded();
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ 備考一覧のデータの取得に失敗しました。`, 10000);
      });
  }

  private _fetchMyselfData():void {
    this._authService.user.subscribe((user: User) => {
      this._loginUserData = user;
      this._userLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ログイン中のユーザー情報の取得に失敗しました。`, 10000);
    });
  }

  private _checkLoaded() {
    if (this._locationLoaded && this._memoLoaded && this._userLoaded) {
      this._valueShareService.setLoading(false);
    }
  }

  private _openConfirmModal(): void {
    $('#Modal').modal();
  };
}
