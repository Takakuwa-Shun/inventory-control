import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { Inventory, ActionType, initInventory } from './../../model/inventory';
import { Material } from './../../model/material';
import { Location, initLocation } from './../../model/location';
import { Product, DetailProduct, initDetailProduct } from './../../model/product';
import { Memo } from './../../model/memo';
import { User } from '../../model/user';
import { MaterialTypeJa, MaterialTypeEn } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { MemoService } from './../../service/memo-service/memo.service';
import { ProductService } from './../../service/product-service/product.service';
import { LocationService } from './../../service/location-service/location.service';
import { InventoryService } from './../../service/inventory-service/inventory.service';
import { AuthService } from './../../service/auth-service/auth.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { AngularFirestore } from 'angularfire2/firestore';
declare const $;

@Component({
  selector: 'app-manufacture-inventory',
  templateUrl: './manufacture-inventory.component.html',
  styleUrls: ['./manufacture-inventory.component.scss']
})
export class ManufactureInventoryComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public loading = true;
  private _bottleLoaded = false;
  private _cartonLoaded = false;
  private _labelLoaded = false;
  private _triggerLoaded = false;
  private _bagLoaded = false;
  private _productLoaded = false;
  private _memoLoaded = false;
  private _userLoaded = false;
  private _locationLoaded = false;

  private _isTimeoutError: boolean;
  private _timer;

  private _loginUserData: User;

  public bottleLists: Material[];
  public cartonLists: Material[];
  public labelLists: Material[];
  public triggerLists: Material[];
  public bagLists: Material[];
  public productList: Product[];
  public memoList: string[] = [];
  public locationList: Location[];

  public latestBottleInventory: Inventory;
  public latestCartonInventory: Inventory;
  public latestLabelInventory: Inventory;
  public latestTriggerInventory: Inventory;
  public latestBagInventory: Inventory;

  public detailProduct: DetailProduct;
  public inputCount: number;
  public inputMemo: string;
  public inputDate: Date;

  public selectedBottleLocation: Location;
  public selectedCartonLocation: Location;
  public selectedLabelLocation: Location;
  public selectedTriggerLocation: Location;
  public selectedBagLocation: Location;

  public showProductAlert: boolean;
  public showBagAlert: boolean;
  public showBottleAlert: boolean;
  public showCartonAlert: boolean;
  public showLabelAlert: boolean;
  public showTriggerAlert: boolean;
  public showBagLocationAlert: boolean;
  public showBottleLocationAlert: boolean;
  public showCartonLocationAlert: boolean;
  public showLabelLocationAlert: boolean;
  public showTriggerLocationAlert: boolean;

  public isProductSelected: boolean;
  public isBagSelected: boolean;
  public isBottleSelected: boolean;
  public isCartonSelected: boolean;
  public isLabelSelected: boolean;
  public isTriggerSelected: boolean;
  public isBagLocationSelected: boolean;
  public isBottleLocationSelected: boolean;
  public isCartonLocationSelected: boolean;
  public isLabelLocationSelected: boolean;
  public isTriggerLocationSelected: boolean;

  public imageSrc: string;

  public readonly countPattern: string = '^[1-9][0-9]*$';

  public readonly confirmTitle = '入力確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  public completeBody: string; 
  public completeBtnType: string;

  constructor(
    private _inventoryService: InventoryService,
    private _locationService: LocationService,
    private _materialService: MaterialService,
    private _productService: ProductService,
    private _memoService: MemoService,
    private _firebaseStorageService: FirebaseStorageService,
    private _afStore: AngularFirestore,
    private _authService: AuthService,
    @Inject(LOCALE_ID) private _locale: string
  ) { }

  ngOnInit() {
    this.formInit();
    this._fetchAllDatas();
  }

  formInit() :void {
    this.detailProduct = initDetailProduct();
    this.latestBottleInventory = initInventory();
    this.latestCartonInventory = initInventory();
    this.latestLabelInventory = initInventory();
    this.latestTriggerInventory = initInventory();
    this.latestBagInventory = initInventory();
    this.selectedBottleLocation = initLocation();
    this.selectedCartonLocation = initLocation();
    this.selectedLabelLocation = initLocation();
    this.selectedTriggerLocation = initLocation();
    this.selectedBagLocation = initLocation();
    this.inputCount = null;
    this.inputMemo = '';

    this.showProductAlert = false
    this.showBottleAlert = false;
    this.showCartonAlert = false;
    this.showLabelAlert = false;
    this.showTriggerAlert = false;
    this.showBagLocationAlert = false;
    this.showBottleLocationAlert = false;
    this.showCartonLocationAlert = false;
    this.showLabelLocationAlert = false;
    this.showTriggerLocationAlert = false;
    this.showBagLocationAlert = false;

    this.isProductSelected = false;
    this.isBottleSelected = false;
    this.isCartonSelected = false;
    this.isLabelSelected = false;
    this.isTriggerSelected = false;
    this.isBagLocationSelected = false;
    this.isBottleLocationSelected = false;
    this.isCartonLocationSelected = false;
    this.isLabelLocationSelected = false;
    this.isTriggerLocationSelected = false;
    this.isBagLocationSelected = false;

    this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
    $('#product').val('');
    $('#bottle').val("");
    $('#carton').val("");
    $('#label').val("");
    $('#trigger').val("");
    $('#bag').val("");
    $('#bottle-location').val("");
    $('#carton-location').val("");
    $('#label-location').val("");
    $('#trigger-location').val("");
    $('#bag-location').val("");
    $('#memo').val('');
  }

  selectMaterial(data: any, type: string) :void {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        if (typeof data === 'string') {
          this.showBottleAlert = true;
          this.isBottleSelected = false;
        } else {
          this.loading = true;
          this.showBottleAlert = false;
          this.detailProduct.bottleData = data; 
          this.isBottleSelected = true;
          this._fetchLatestBottleInventory(false);
        }
        break;
      case MaterialTypeEn.ca:
      case MaterialTypeJa.ca:
        if (typeof data === 'string') {
          this.showCartonAlert = true;
          this.isCartonSelected = false;
        } else {
          this.loading = true;
          this.showCartonAlert = false;
          this.detailProduct.cartonData = data; 
          this.isCartonSelected = true;
          this._fetchLatestCartonInventory(false);
          break;
        }
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        if (typeof data === 'string') {
          this.showLabelAlert = true;
          this.isLabelSelected = false;
        } else {
          this.loading = true;
          this.showLabelAlert = false;
          this.detailProduct.labelData = data; 
          this.isLabelSelected = true;
          this._fetchLatestLabelInventory(false);
        }
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        if (typeof data === 'string') {
          this.showTriggerAlert = true;
          this.isTriggerSelected = false;
        } else {
          this.loading = true;
          this.showTriggerAlert = false;
          this.detailProduct.triggerData = data; 
          this.isTriggerSelected = true;
          this._fetchLatestTriggerInventory(false);
        }
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        if (typeof data === 'string') {
          this.showBagAlert = true;
          this.isBagSelected = false;
        } else {
          this.loading = true;
          this.showBagAlert = false;
          this.detailProduct.bagData = data; 
          this.isBagSelected = true;
          this._fetchLatestBagInventory(false);
        }
        break;
      default:
        console.error('typeおかしいよ？ : ' + type);
    }
  }

  selectLocation(data: any, type: string) :void {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        if (typeof data === 'string') {
          this.showBottleLocationAlert = true;
          this.isBottleLocationSelected = false;
        } else {
          this.selectedBottleLocation = data;
          this.showBottleLocationAlert = false;
          this.isBottleLocationSelected = true;
        }
        break;
      case MaterialTypeEn.ca:
      case MaterialTypeJa.ca:
        if (typeof data === 'string') {
          this.showCartonLocationAlert = true;
          this.isCartonLocationSelected = false;
        } else {
          this.selectedCartonLocation = data;
          this.showCartonLocationAlert = false;
          this.isCartonLocationSelected = true;
          break;
        }
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        if (typeof data === 'string') {
          this.showLabelLocationAlert = true;
          this.isLabelLocationSelected = false;
        } else {
          this.selectedLabelLocation = data;
          this.showLabelLocationAlert = false;
          this.isLabelLocationSelected = true;
        }
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        if (typeof data === 'string') {
          this.showTriggerLocationAlert = true;
          this.isTriggerLocationSelected = false;
        } else {
          this.selectedTriggerLocation = data;
          this.showTriggerLocationAlert = false;
          this.isTriggerLocationSelected = true;
        }
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        if (typeof data === 'string') {
          this.showBagLocationAlert = true;
          this.isBagLocationSelected = false;
        } else {
          this.selectedBagLocation = data;
          this.showBagLocationAlert = false;
          this.isBagLocationSelected = true;
        }
        break;
      default:
        console.error('typeおかしいよ？ : ' + type);
    }
  }

  public confirmRegister() {
    this.inputCount = Number(this.inputCount);
    if (this._isTimeoutError) {
      this.completeBody = '各倉庫の最新情報を取得してから一定時間経過しました。最初からやり直して下さい。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    } else if (this.latestBottleInventory.locationCount[this.selectedBottleLocation.id] < this.inputCount){
      this.completeBody = `製造・出荷個数が多く、${this.detailProduct.bottleData.name}の${this.selectedBottleLocation.name}における在庫量が足りません。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    } else if(this.latestCartonInventory.locationCount[this.selectedCartonLocation.id] < this.inputCount) {
      this.completeBody = `製造・出荷個数が多く、${this.detailProduct.cartonData.name}の${this.selectedCartonLocation.name}における在庫量が足りません。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    } else if(this.latestLabelInventory.locationCount[this.selectedLabelLocation.id] < this.inputCount) {
      this.completeBody = `製造・出荷個数が多く、${this.detailProduct.labelData.name}の${this.selectedLabelLocation.name}における在庫量が足りません。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    } else if(this.latestTriggerInventory.locationCount[this.selectedTriggerLocation.id] < this.inputCount) {
      this.completeBody = `製造・出荷個数が多く、${this.detailProduct.triggerData.name}の${this.selectedTriggerLocation.name}における在庫量が足りません。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    } else if(this.latestBagInventory.locationCount[this.selectedBagLocation.id] < this.inputCount) {
      this.completeBody = `製造・出荷個数が多く、${this.detailProduct.bagData.name}の${this.selectedBagLocation.name}における在庫量が足りません。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    } else {
      this.inputDate = new Date();
      const showDate = formatDate(this.inputDate, "yyyy/MM/dd (EEE) HH:mm", this._locale);
      this.confirmBody = `
      <div class="container-fluid">
        <p>以下の内容で登録してもよろしいでしょうか？</p>
        <div class="row">
          <div class="col-4">商品名</div>
          <div class="col-8 pull-left">${this.detailProduct.name}</div>
        </div>
        <div class="row">
          <div class="col-4">使用ボトル名</div>
          <div class="col-8 pull-left">${this.detailProduct.bottleData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">使用カートン名</div>
          <div class="col-8 pull-left">${this.detailProduct.cartonData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">使用ラベル名</div>
          <div class="col-8 pull-left">${this.detailProduct.labelData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">使用トリガー名</div>
          <div class="col-8 pull-left">${this.detailProduct.triggerData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">使用詰め替え袋名</div>
          <div class="col-8 pull-left">${this.detailProduct.bagData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">ボトル倉庫</div>
          <div class="col-8 pull-left">${this.selectedBottleLocation.name}</div>
        </div>
        <div class="row">
          <div class="col-4">カートン倉庫</div>
          <div class="col-8 pull-left">${this.selectedCartonLocation.name}</div>
        </div>
        <div class="row">
          <div class="col-4">ラベル倉庫</div>
          <div class="col-8 pull-left">${this.selectedLabelLocation.name}</div>
        </div>
        <div class="row">
          <div class="col-4">トリガー倉庫</div>
          <div class="col-8 pull-left">${this.selectedTriggerLocation.name}</div>
        </div>
        <div class="row">
          <div class="col-4">詰め替え袋倉庫</div>
          <div class="col-8 pull-left">${this.selectedBagLocation.name}</div>
        </div>
        <div class="row">
          <div class="col-4">製造・出荷個数</div>
          <div class="col-8 pull-left">${this.inputCount}</div>
        </div>
        <div class="row">
          <div class="col-4">作業項目</div>
          <div class="col-8 pull-left">${ActionType.manufacture}</div>
        </div>
        <div class="row">
          <div class="col-4">作業詳細</div>
          <div class="col-8 pull-left">${this.detailProduct.name}の製造</div>
        </div>
        <div class="row">
          <div class="col-4">備考</div>
          <div class="col-8 pull-left">${this.inputMemo}</div>
        </div>
        <div class="row">
          <div class="col-4">作業従事者名</div>
          <div class="col-8 pull-left">${this._loginUserData.displayName}</div>
        </div>
        <div class="row">
          <div class="col-4">日時</div>
          <div class="col-8 pull-left">${showDate}</div>
        </div>
      </div>`;

      this._openConfirmModal();
    }
  }

  public submit(): void {
    this.loading = true;
    const inventory: Inventory = initInventory();
    inventory.userId = this._loginUserData.uid;
    inventory.date = this.inputDate;
    inventory.memo = this.inputMemo;
    inventory.addCount = Number(this.inputCount) * -1;
    inventory.actionType = ActionType.manufacture;
    inventory.actionDetail = `${this.detailProduct.name}の製造`;

    const bottleInventory: Inventory = Object.assign({}, inventory);
    bottleInventory.id = this._afStore.createId();
    bottleInventory.targetId = this.detailProduct.bottleData.id;
    bottleInventory.targetName = this.detailProduct.bottleData.name;
    bottleInventory.locationId = this.selectedBottleLocation.id;
    bottleInventory.sumCount = this.latestBottleInventory.sumCount + inventory.addCount;
    bottleInventory.locationCount = Object.assign({}, this.latestBottleInventory.locationCount);
    bottleInventory.locationCount[bottleInventory.locationId] += inventory.addCount;

    const cartonInventory: Inventory = Object.assign({}, inventory);
    cartonInventory.id = this._afStore.createId();
    cartonInventory.targetId = this.detailProduct.cartonData.id;
    cartonInventory.targetName = this.detailProduct.cartonData.name;
    cartonInventory.locationId = this.selectedCartonLocation.id;
    cartonInventory.sumCount = this.latestCartonInventory.sumCount + inventory.addCount;
    cartonInventory.locationCount = Object.assign({}, this.latestCartonInventory.locationCount);
    cartonInventory.locationCount[cartonInventory.locationId] += inventory.addCount;

    const labelInventory: Inventory = Object.assign({}, inventory);
    labelInventory.id = this._afStore.createId();
    labelInventory.targetId = this.detailProduct.labelData.id;
    labelInventory.targetName = this.detailProduct.labelData.name;
    labelInventory.locationId = this.selectedLabelLocation.id;
    labelInventory.sumCount = this.latestLabelInventory.sumCount + inventory.addCount;
    labelInventory.locationCount = Object.assign({}, this.latestLabelInventory.locationCount);
    labelInventory.locationCount[labelInventory.locationId] += inventory.addCount;

    const triggerInventory: Inventory = Object.assign({}, inventory);
    triggerInventory.id = this._afStore.createId();
    triggerInventory.targetId = this.detailProduct.triggerData.id;
    triggerInventory.targetName = this.detailProduct.triggerData.name;
    triggerInventory.locationId = this.selectedTriggerLocation.id;
    triggerInventory.sumCount = this.latestTriggerInventory.sumCount + inventory.addCount;
    triggerInventory.locationCount = Object.assign({}, this.latestTriggerInventory.locationCount);
    triggerInventory.locationCount[triggerInventory.locationId] += inventory.addCount;
    
    const bagInventory: Inventory = Object.assign({}, inventory);
    bagInventory.id = this._afStore.createId();
    bagInventory.targetId = this.detailProduct.bagData.id;
    bagInventory.targetName = this.detailProduct.bagData.name;
    bagInventory.locationId = this.selectedBagLocation.id;
    bagInventory.sumCount = this.latestBagInventory.sumCount + inventory.addCount;
    bagInventory.locationCount = Object.assign({}, this.latestBagInventory.locationCount);
    bagInventory.locationCount[bagInventory.locationId] += inventory.addCount;

    const boLimit = Number(this.detailProduct.bottleData.limitCount);
    const caLimit = Number(this.detailProduct.cartonData.limitCount);
    const laLimit = Number(this.detailProduct.labelData.limitCount);
    const trLimit = Number(this.detailProduct.triggerData.limitCount);
    const baLimit = Number(this.detailProduct.bagData.limitCount);

    this._inventoryService.productManufacture(
      bottleInventory, cartonInventory, labelInventory, triggerInventory, bagInventory,
      boLimit, caLimit, laLimit, trLimit, baLimit)
    .subscribe(() => {
      this.completeBody = '登録が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this._openCompleteModal();
    }, (err) => {
      console.error(err);
      this.completeBody = '※ 登録に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  public selectProduct(data: Product) :void {
    if (typeof data === 'string') {
      this.showProductAlert = true;
      this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
      this.isProductSelected = false;
      this.isBottleSelected = false;
      this.isCartonSelected = false;
      this.isLabelSelected = false;
      this.isTriggerSelected = false;
      this.isBagLocationSelected = false;
      this.isBottleLocationSelected = false;
      this.isCartonLocationSelected = false;
      this.isLabelLocationSelected = false;
      this.isTriggerLocationSelected = false;
      this.isBagLocationSelected = false;
    } else {
      this.loading = true;
      this.showProductAlert = false;
      this.isProductSelected = true;
      this.detailProduct.id = data.id;
      this.detailProduct.name = data.name;
      this.detailProduct.nameKana = data.nameKana;
      this.detailProduct.lot = data.lot;
      this.detailProduct.imageUrl = data.imageUrl;
      this.detailProduct.bottleData.id = data.bottleId;
      this.detailProduct.bottleData.name = data.bottleName;
      this.detailProduct.cartonData.id = data.cartonId;
      this.detailProduct.cartonData.name = data.cartonName;
      this.detailProduct.labelData.id = data.labelId;
      this.detailProduct.labelData.name = data.labelName;
      this.detailProduct.triggerData.id = data.triggerId;
      this.detailProduct.triggerData.name = data.triggerName;
      this.detailProduct.bagData.id = data.bagId;
      this.detailProduct.bagData.name = data.bagName;
      this.detailProduct.companyData.id = data.companyId;
      this.detailProduct.companyData.name = data.companyName;

      this.isBottleSelected = true;
      this.isCartonSelected = true;
      this.isLabelSelected = true;
      this.isTriggerSelected = true;
      this.isBagSelected = true;

      $('#bottle').val(data.bottleName);
      $('#carton').val(data.cartonName);
      $('#label').val(data.labelName);
      $('#trigger').val(data.triggerName);
      $('#bag').val(data.bagName);

      this._fetchLatestBottleInventory(true);
      this._fetchLatestCartonInventory(true);
      this._fetchLatestLabelInventory(true);
      this._fetchLatestTriggerInventory(true);
      this._fetchLatestBagInventory(true);

      if (data.imageUrl) {
        this._firebaseStorageService.fecthDownloadUrl(data.imageUrl).subscribe((res: string) => {
          this.imageSrc = res;
        }, (err) => {
          console.error(err);
          this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
          this.completeBody = '※ 画像の取得に失敗しました。';
          this.completeBtnType = 'btn-danger';
          this._openCompleteModal();
        });
      } else {
        this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
      }
    }
  }

  public autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  private _fetchLatestBottleInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.bo, this.detailProduct.bottleData.id)
    .subscribe((res: Inventory) => {
      this.latestBottleInventory = res;
      if (this.latestBottleInventory.id === '') {
        this.latestBottleInventory.locationCount = {};
        for(const location of this.locationList) {
          this.latestBottleInventory.locationCount[location.id] = 0
        }
      }
      if (isFirst) {
        this.selectLocation(this.locationList[0], MaterialTypeEn.bo);
        $('#bottle-location').val(this.selectedBottleLocation.name);
        this._bottleLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {

      //  timerをセットする
      clearTimeout(this._timer);
      this._isTimeoutError = false;
      this._timer = setTimeout(() => {
        this._isTimeoutError = true;
      }, 3 * 60 * 1000);

        this.loading = false;
      }
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  private _fetchLatestCartonInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.ca, this.detailProduct.cartonData.id)
    .subscribe((res: Inventory) => {
      this.latestCartonInventory = res;
      if (this.latestCartonInventory.id === '') {
        this.latestCartonInventory.locationCount = {};
        for(const location of this.locationList) {
          this.latestCartonInventory.locationCount[location.id] = 0
        }
      }
      if (isFirst) {
        this.selectLocation(this.locationList[0], MaterialTypeEn.ca);
        $('#carton-location').val(this.selectedCartonLocation.name);
        this._cartonLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {

       //  timerをセットする
       clearTimeout(this._timer);
       this._isTimeoutError = false;
       this._timer = setTimeout(() => {
         this._isTimeoutError = true;
       }, 3 * 60 * 1000);

        this.loading = false;
      }
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  private _fetchLatestLabelInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.la, this.detailProduct.labelData.id)
    .subscribe((res: Inventory) => {
      this.latestLabelInventory = res;
      if (this.latestLabelInventory.id === '') {
        this.latestLabelInventory.locationCount = {};
        for(const location of this.locationList) {
          this.latestLabelInventory.locationCount[location.id] = 0
        }
      }
      if (isFirst) {
        this.selectLocation(this.locationList[0], MaterialTypeEn.la);
        $('#label-location').val(this.selectedLabelLocation.name);
        this._labelLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {

      //  timerをセットする
      clearTimeout(this._timer);
      this._isTimeoutError = false;
      this._timer = setTimeout(() => {
        this._isTimeoutError = true;
      }, 3 * 60 * 1000);

        this.loading = false;
      }
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  private _fetchLatestTriggerInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.tr, this.detailProduct.triggerData.id)
    .subscribe((res: Inventory) => {
      this.latestTriggerInventory = res;
      if (this.latestTriggerInventory.id === '') {
        this.latestTriggerInventory.locationCount = {};
        for(const location of this.locationList) {
          this.latestTriggerInventory.locationCount[location.id] = 0
        }
      }
      if (isFirst) {
        this.selectLocation(this.locationList[0], MaterialTypeEn.tr);
        $('#trigger-location').val(this.selectedTriggerLocation.name);
        this._triggerLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {

      //  timerをセットする
      clearTimeout(this._timer);
      this._isTimeoutError = false;
      this._timer = setTimeout(() => {
        this._isTimeoutError = true;
      }, 3 * 60 * 1000);

        this.loading = false;
      }
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  private _fetchLatestBagInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.ba, this.detailProduct.bagData.id)
    .subscribe((res: Inventory) => {
      this.latestBagInventory = res;
      if (this.latestBagInventory.id === '') {
        this.latestBagInventory.locationCount = {};
        for(const location of this.locationList) {
          this.latestBagInventory.locationCount[location.id] = 0
        }
      }
      if (isFirst) {
        this.selectLocation(this.locationList[0], MaterialTypeEn.ba);
        $('#bag-location').val(this.selectedBagLocation.name);
        this._bagLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {

      //  timerをセットする
      clearTimeout(this._timer);
      this._isTimeoutError = false;
      this._timer = setTimeout(() => {
        this._isTimeoutError = true;
      }, 3 * 60 * 1000);

        this.loading = false;
      }
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  private _checkLatestInventoryLoaded() {

    if(this._bottleLoaded &&
      this._cartonLoaded &&
      this._labelLoaded &&
      this._triggerLoaded &&
      this._bagLoaded) {

        //  timerをセットする
        this._timer = setTimeout(() => {
          this._isTimeoutError = true;
        }, 3 * 60 * 1000);

        this._bottleLoaded = false;
        this._cartonLoaded = false;
        this._labelLoaded = false;
        this._triggerLoaded = false;
        this._bagLoaded = false;

        this.loading = false;
    }
  }

  private _fetchAllDatas():void {

    this._productService.fetchAllProducts().subscribe((res: Product[]) => {
      this.productList = res;
      this._productLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = '※ 商品データの取得に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleLists = res;
      this._bottleLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.bo}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.cartonLists = res;
      this._cartonLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.ca}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this.labelLists = res;
      this._labelLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.la}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerLists = res;
      this._triggerLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.tr}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagLists = res;
      this._bagLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.ba}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._memoService.fetchAllMemos().subscribe((res: Memo[]) => {
      res.forEach((m: Memo) => {
        this.memoList.push(m.content);
      });
      this._memoLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ 備考一覧のデータの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._authService.user.subscribe((user: User) => {
      this._loginUserData = user;
      this._userLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ログイン中のユーザー情報の取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });

    this._locationService.fetchLocations().subscribe((res) => {
      this.locationList = res;
      this._locationLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ 倉庫のデータの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this._openCompleteModal();
    });
  }

  private _checkLoaded() {
    if(this._productLoaded &&
      this._bottleLoaded &&
      this._cartonLoaded &&
      this._labelLoaded &&
      this._triggerLoaded &&
      this._bagLoaded &&
      this._memoLoaded &&
      this._locationLoaded &&
      this._userLoaded) {
        this._bottleLoaded = false;
        this._cartonLoaded = false;
        this._labelLoaded = false;
        this._triggerLoaded = false;
        this._bagLoaded = false;

        this.loading = false;
    }
  }

  private _openConfirmModal(): void {
    $('#Modal').modal();
  };

  private _openCompleteModal(): void {
    this.loading = false;
    $('#CompleteModal').modal();

    setTimeout(() =>{
      this._closeCompleteModal();
    },10000);
  };

  private _closeCompleteModal(): void {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#CompleteModal').modal('hide');
  }

}
