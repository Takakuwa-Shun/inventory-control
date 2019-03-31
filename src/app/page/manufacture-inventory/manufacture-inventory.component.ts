import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { Inventory, ActionType, initInventory } from './../../model/inventory';
import { Material } from './../../model/material';
import { Company, initCompany } from './../../model/company';
import { Location, initLocation } from './../../model/location';
import { Product, DetailProduct, initDetailProduct } from './../../model/product';
import { Memo } from './../../model/memo';
import { User } from '../../model/user';
import { MaterialTypeJa, MaterialTypeEn } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { MemoService } from './../../service/memo-service/memo.service';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { LocationService } from './../../service/location-service/location.service';
import { InventoryService } from './../../service/inventory-service/inventory.service';
import { AuthService } from './../../service/auth-service/auth.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-manufacture-inventory',
  templateUrl: './manufacture-inventory.component.html',
  styleUrls: ['./manufacture-inventory.component.scss']
})
export class ManufactureInventoryComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  private _companyLoaded = false;
  private _bottleLoaded = false;
  private _inCartonLoaded = false;
  private _outCartonLoaded = false;
  private _labelLoaded = false;
  private _triggerLoaded = false;
  private _bagLoaded = false;
  private _memoLoaded = false;
  private _userLoaded = false;
  private _locationLoaded = false;

  private _loginUserData: User;

  public bottleLists: Material[];
  public cartonLists: Material[];
  public labelLists: Material[];
  public triggerLists: Material[];
  public bagLists: Material[];
  public productList: Product[];
  public memoList: string[] = [];
  public companyList: Company[];
  private _locationList: Location[];

  public latestBottleInventory: Inventory;
  public latestInCartonInventory: Inventory;
  public latestOutCartonInventory: Inventory;
  public latestLabelInventory: Inventory;
  public latestTriggerInventory: Inventory;
  public latestBagInventory: Inventory;

  public detailProduct: DetailProduct;
  public inputCount: number;
  public inputMemo: string;
  public inputLocation: Location;
  public inCartonLot: number;
  public outCartonLot: number;
  public isInCeil: boolean;
  public isOutCeil: boolean;
  private _inCartonCount: number;
  private _outCartonCount: number;
  private _inputDate: Date;

  public showBag: boolean;
  public showBottle: boolean;
  public showInCarton: boolean;
  public showOutCarton: boolean;
  public showLabel: boolean;
  public showTrigger: boolean;

  public showCompanyAlert: boolean;
  public showProductAlert: boolean;
  public showBagAlert: boolean;
  public showBottleAlert: boolean;
  public showInCartonAlert: boolean;
  public showOutCartonAlert: boolean;
  public showLabelAlert: boolean;
  public showTriggerAlert: boolean;

  public isCompanySelected: boolean;
  public isProductSelected: boolean;
  public isBagSelected: boolean;
  public isBottleSelected: boolean;
  public isInCartonSelected: boolean;
  public isOutCartonSelected: boolean;
  public isLabelSelected: boolean;
  public isTriggerSelected: boolean;

  public imageSrc: string;

  public readonly countPattern: string = '^[1-9][0-9]*$';

  public readonly confirmTitle = '入力確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  constructor(
    private _companyService: CompanyService,
    private _inventoryService: InventoryService,
    private _locationService: LocationService,
    private _materialService: MaterialService,
    private _productService: ProductService,
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
    this._formInit();
    this._fetchAllDatas();
  }

  private _formInit() :void {
    this.detailProduct = initDetailProduct();
    this.latestBottleInventory = initInventory();
    this.latestInCartonInventory = initInventory();
    this.latestOutCartonInventory = initInventory();
    this.latestLabelInventory = initInventory();
    this.latestTriggerInventory = initInventory();
    this.latestBagInventory = initInventory();
    this.inputLocation = initLocation();
    this.inputCount = null;
    this.inCartonLot = null;
    this.outCartonLot = null;
    this.isInCeil = true;
    this.isOutCeil = true;
    this.inputMemo = '';

    this.showBottle = false;
    this.showInCarton = false;
    this.showOutCarton = false;
    this.showLabel = false;
    this.showTrigger = false;
    this.showBag = false;

    this.showCompanyAlert = false;
    this.showProductAlert = false
    this.showBottleAlert = false;
    this.showInCartonAlert = false;
    this.showOutCartonAlert = false;
    this.showLabelAlert = false;
    this.showTriggerAlert = false;
    this.showBagAlert = false;

    this.isCompanySelected = false;
    this.isProductSelected = false;
    this.isBottleSelected = false;
    this.isInCartonSelected = false;
    this.isOutCartonSelected = false;
    this.isLabelSelected = false;
    this.isTriggerSelected = false;
    this.isBagSelected = false;

    this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
    $('#company').val('');
    $('#product').val('');
    $('#bottle').val("");
    $('#inCarton').val("");
    $('#outCarton').val("");
    $('#label').val("");
    $('#trigger').val("");
    $('#bag').val("");
    $('#memo').val('');
  }


  public selectCompany(data: any) :void {
    this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
    this.isProductSelected = false;
    this.isBottleSelected = false;
    this.isInCartonSelected = false;
    this.isOutCartonSelected = false;
    this.isLabelSelected = false;
    this.isTriggerSelected = false;
    this.showBottle = false;
    this.showInCarton = false;
    this.showOutCarton = false;
    this.showLabel = false;
    this.showTrigger = false;
    this.showBag = false;
    $('#product').val('');
    $('#bottle').val("");
    $('#inCarton').val("");
    $('#outCarton').val("");
    $('#label').val("");
    $('#trigger').val("");
    $('#bag').val("");

    if (typeof data === 'string') {
      this.showCompanyAlert = true;
    } else {
      this._valueShareService.setLoading(true);
      this.showCompanyAlert = false;
      this.detailProduct.companyData = data;
      this.isCompanySelected = true;
      this._fetchProductList();
    }
  }

  private _fetchProductList() {
    this._productService.fetchProductListFilteringCompany(this.detailProduct.companyData.id)
    .subscribe((res: Product[]) => {
      this.productList = res;
      this._valueShareService.setLoading(false);
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ 商品のデータの取得に失敗しました。`, 10000);
    });
  }

  selectMaterial(data: any, type: string) :void {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        if (typeof data === 'string') {
          this.showBottleAlert = true;
        } else {
          this._valueShareService.setLoading(true);;
          this.showBottleAlert = false;
          this.detailProduct.bottleData = data; 
          this.isBottleSelected = true;
          this._fetchLatestBottleInventory(false);
        }
        break;
      case MaterialTypeEn.inCa:
      case MaterialTypeJa.inCa:
        if (typeof data === 'string') {
          this.showInCartonAlert = true;
        } else {
          this._valueShareService.setLoading(true);;
          this.showInCartonAlert = false;
          this.detailProduct.inCartonData = data; 
          this.isInCartonSelected = true;
          this._fetchLatestCartonInventory(false, true);
        } 
        break;
      case MaterialTypeEn.outCa:
      case MaterialTypeJa.outCa:
        if (typeof data === 'string') {
          this.showOutCartonAlert = true;
        } else {
          this._valueShareService.setLoading(true);;
          this.showOutCartonAlert = false;
          this.detailProduct.outCartonData = data; 
          this.isOutCartonSelected = true;
          this._fetchLatestCartonInventory(false, false);
        }
        break;
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        if (typeof data === 'string') {
          this.showLabelAlert = true;
        } else {
          this._valueShareService.setLoading(true);;
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
        } else {
          this._valueShareService.setLoading(true);;
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
        } else {
          this._valueShareService.setLoading(true);;
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

  public confirmRegister() {
    this.inputCount = Number(this.inputCount);

    if (this.inCartonLot === null) {
      this.inCartonLot = 1;
    }

    if (this.outCartonLot === null) {
      this.outCartonLot = 1;
    }

    this._inCartonCount = this.isInCeil ? Math.ceil(this.inputCount / Number(this.inCartonLot)) : Math.floor(this.inputCount / Number(this.inCartonLot));
    this._outCartonCount = this.isOutCeil ? Math.ceil(this.inputCount / Number(this.outCartonLot)) : Math.floor(this.inputCount / Number(this.outCartonLot));

    if (this.isBottleSelected && this.latestBottleInventory.locationCount[this.inputLocation.id] < this.inputCount){
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.bottleData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.isInCartonSelected && this.latestInCartonInventory.locationCount[this.inputLocation.id] < this._inCartonCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.inCartonData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.isOutCartonSelected && this.latestOutCartonInventory.locationCount[this.inputLocation.id] < this._outCartonCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.outCartonData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.isLabelSelected && this.latestLabelInventory.locationCount[this.inputLocation.id] < this.inputCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.labelData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.isTriggerSelected && this.latestTriggerInventory.locationCount[this.inputLocation.id] < this.inputCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.triggerData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.isBagSelected && this.latestBagInventory.locationCount[this.inputLocation.id] < this.inputCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.bagData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else {
      this._inputDate = new Date();
      const showDate = formatDate(this._inputDate, "yyyy/MM/dd (EEE) HH:mm", this._locale);

      let bottleBody: string = '';
      let inCartonBody: string = '';
      let outCartonBody: string = '';
      let labelBody: string = '';
      let triggerBody: string = '';
      let bagBody: string = '';

      if(this.showBottle) {
        bottleBody = `
        <div class="row">
          <div class="col-4">使用ボトル名</div>
          <div class="col-8 pull-left">${this.detailProduct.bottleData.name}</div>
        </div>
        `
      }

      if(this.showInCarton) {
        inCartonBody = `
        <hr>
        <div class="row">
          <div class="col-4">使用内側カートン名</div>
          <div class="col-8 pull-left">${this.detailProduct.inCartonData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">内側カートンロット数</div>
          <div class="col-8 pull-left">${this.inCartonLot}</div>
        </div>
        <div class="row">
          <div class="col-4">内側カートン使用数</div>
          <div class="col-8 pull-left">${this._inCartonCount}</div>
        </div>
        `
      }

      if(this.showOutCarton) {

        outCartonBody = `
        <hr>
        <div class="row">
          <div class="col-4">使用外側カートン名</div>
          <div class="col-8 pull-left">${this.detailProduct.outCartonData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">外側カートンロット数</div>
          <div class="col-8 pull-left">${this.outCartonLot}</div>
        </div>
        <div class="row">
          <div class="col-4">外側カートン使用数</div>
          <div class="col-8 pull-left">${this._outCartonCount}</div>
        </div>
        `
      }

      if(this.showLabel) {
        labelBody = `
        <div class="row">
          <div class="col-4">使用ラベル名</div>
          <div class="col-8 pull-left">${this.detailProduct.labelData.name}</div>
        </div>
        `
      }

      if(this.showTrigger) {
        triggerBody = `
        <div class="row">
          <div class="col-4">使用トリガー名</div>
          <div class="col-8 pull-left">${this.detailProduct.triggerData.name}</div>
        </div>
        `
      }

      if(this.showBag) {
        bagBody = `
        <div class="row">
          <div class="col-4">使用詰め替え袋名</div>
          <div class="col-8 pull-left">${this.detailProduct.bagData.name}</div>
        </div>
        `
      }

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
          <div class="col-4">得意先名</div>
          <div class="col-8 pull-left">${this.detailProduct.companyData.name}</div>
        </div>
        <div class="row">
          <div class="col-4">商品名</div>
          <div class="col-8 pull-left">${this.detailProduct.name}</div>
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
        <hr>
        ${bottleBody}
        ${triggerBody}
        ${labelBody}
        ${bagBody}
        ${inCartonBody}
        ${outCartonBody}
      </div>`;

      this._openConfirmModal();
    }
  }

  public submit(): void {
    this._valueShareService.setLoading(true);;
    const inventory: Inventory = initInventory();
    inventory.userName = this._loginUserData.displayName;
    inventory.date = this._inputDate;
    inventory.memo = this.inputMemo;
    inventory.addCount = Number(this.inputCount) * -1;
    inventory.actionType = ActionType.manufacture;
    inventory.actionDetail = `${this.detailProduct.name}の製造`;

    let bottleInventory: Inventory = null;
    if (this.isBottleSelected) {
      bottleInventory = Object.assign({}, inventory);
      bottleInventory.id = this._afStore.createId();
      bottleInventory.targetId = this.detailProduct.bottleData.id;
      bottleInventory.targetName = this.detailProduct.bottleData.name;
      bottleInventory.arrLocationId[0] = this.inputLocation.id;
      bottleInventory.locationCount = this.latestBottleInventory.locationCount;
      bottleInventory.latestPath = this.latestBottleInventory.latestPath;
    }

    let inCartonInventory: Inventory = null;
    if (this.isInCartonSelected) {
      inCartonInventory = Object.assign({}, inventory);
      inCartonInventory.id = this._afStore.createId();
      inCartonInventory.targetId = this.detailProduct.inCartonData.id;
      inCartonInventory.targetName = this.detailProduct.inCartonData.name;
      inCartonInventory.addCount =  this._inCartonCount * -1;
      inCartonInventory.actionDetail = `${this.detailProduct.name}の製造, ロット数: ${this.inCartonLot} (${this.isInCeil ? '切上げ' : '切捨て'})`;
      inCartonInventory.arrLocationId[0] = this.inputLocation.id;
      inCartonInventory.locationCount = this.latestInCartonInventory.locationCount;
      inCartonInventory.latestPath = this.latestInCartonInventory.latestPath;
    }

    let outCartonInventory: Inventory = null;
    if (this.isOutCartonSelected) {
      outCartonInventory = Object.assign({}, inventory);
      outCartonInventory.id = this._afStore.createId();
      outCartonInventory.targetId = this.detailProduct.outCartonData.id;
      outCartonInventory.targetName = this.detailProduct.outCartonData.name;
      outCartonInventory.addCount = this._outCartonCount * -1;
      outCartonInventory.actionDetail = `${this.detailProduct.name}の製造, ロット数: ${this.outCartonLot} (${this.isOutCeil ? '切上げ' : '切捨て'})`;
      outCartonInventory.arrLocationId[0] = this.inputLocation.id;
      outCartonInventory.locationCount = this.latestOutCartonInventory.locationCount;
      outCartonInventory.latestPath = this.latestOutCartonInventory.latestPath;
    }

    let labelInventory: Inventory = null;
    if (this.isLabelSelected) {
      labelInventory = Object.assign({}, inventory);
      labelInventory.id = this._afStore.createId();
      labelInventory.targetId = this.detailProduct.labelData.id;
      labelInventory.targetName = this.detailProduct.labelData.name;
      labelInventory.arrLocationId[0] = this.inputLocation.id;
      labelInventory.locationCount = this.latestLabelInventory.locationCount;
      labelInventory.latestPath = this.latestLabelInventory.latestPath;
    }

    let triggerInventory: Inventory = null;
    if (this.isTriggerSelected) {
      triggerInventory = Object.assign({}, inventory);
      triggerInventory.id = this._afStore.createId();
      triggerInventory.targetId = this.detailProduct.triggerData.id;
      triggerInventory.targetName = this.detailProduct.triggerData.name;
      triggerInventory.arrLocationId[0] = this.inputLocation.id;
      triggerInventory.locationCount = this.latestTriggerInventory.locationCount;
      triggerInventory.latestPath = this.latestTriggerInventory.latestPath;
    }
    
    let bagInventory: Inventory = null;
    if (this.isBagSelected) {
      bagInventory = Object.assign({}, inventory);
      bagInventory.id = this._afStore.createId();
      bagInventory.targetId = this.detailProduct.bagData.id;
      bagInventory.targetName = this.detailProduct.bagData.name;
      bagInventory.arrLocationId[0] = this.inputLocation.id;
      bagInventory.locationCount = this.latestBagInventory.locationCount;
      bagInventory.latestPath = this.latestBagInventory.latestPath;
    }

    const boLimit = Number(this.detailProduct.bottleData.limitCount);
    const inCaLimit = Number(this.detailProduct.inCartonData.limitCount);
    const outCaLimit = Number(this.detailProduct.outCartonData.limitCount);
    const laLimit = Number(this.detailProduct.labelData.limitCount);
    const trLimit = Number(this.detailProduct.triggerData.limitCount);
    const baLimit = Number(this.detailProduct.bagData.limitCount);

    this._inventoryService.productManufacture(
      bottleInventory, inCartonInventory, outCartonInventory, labelInventory, triggerInventory, bagInventory,
      boLimit, inCaLimit,outCaLimit, laLimit, trLimit, baLimit)
    .subscribe(() => {
      this._formInit();
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err: string) => {
      console.error(err);
      if(err.startsWith('※')) {
        this._valueShareService.setCompleteModal(err, 20000);
      } else {
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
      }
    });
  }

  public selectProduct(data: Product) :void {
    if (typeof data === 'string') {
      this.showProductAlert = true;
      this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
      this.isProductSelected = false;
      this.isBottleSelected = false;
      this.isInCartonSelected = false;
      this.isOutCartonSelected = false;
      this.isLabelSelected = false;
      this.isTriggerSelected = false;
    } else {
      this._valueShareService.setLoading(true);;
      this.showProductAlert = false;
      this.isProductSelected = true;
      this.detailProduct.id = data.id;
      this.detailProduct.name = data.name;
      this.detailProduct.nameKana = data.nameKana;
      this.detailProduct.imageUrl = data.imageUrl;
      this.detailProduct.companyData.id = data.companyId;
      this.detailProduct.companyData.name = data.companyName;

      const arrBottleData = this.bottleLists.filter(val => val.id === data.bottleId);
      if (arrBottleData.length === 0) {
        this._bottleLoaded = true;

        this.isBottleSelected = false;
        if (data.bottleId === null) {
          $('#bottle').val("");
          this.showBottle = false;
        } else {
          $('#bottle').val(`${data.bottleName} (※ 削除されたか、廃止中です)`);
          this.showBottle = true;
        }
      } else {
        this.showBottle = true;
        this.detailProduct.bottleData = arrBottleData[0];
        $('#bottle').val(data.bottleName);
        this._fetchLatestBottleInventory(true);
      }

      const arrInCartonData = this.cartonLists.filter(val => val.id === data.inCartonId);
      if (arrInCartonData.length === 0) {
        this._inCartonLoaded = true;

        this.isInCartonSelected = false;
        if (data.inCartonId === null) {
          $('#carton').val("");
          this.showInCarton = false;
        } else {
          $('#carton').val(`${data.inCartonName} (※ 削除されたか、廃止中です)`);
          this.showInCarton = true;
        }
      } else {
        this.showInCarton = true;
        this.detailProduct.inCartonData = arrInCartonData[0];
        $('#inCarton').val(data.inCartonName);
        this._fetchLatestCartonInventory(true, true);
      }

      const arrOutCartonData = this.cartonLists.filter(val => val.id === data.outCartonId);
      if (arrOutCartonData.length === 0) {
        this._outCartonLoaded = true;

        this.isOutCartonSelected = false;
        if (data.outCartonId === null) {
          $('#carton').val("");
          this.showOutCarton = false;
        } else {
          this.showOutCarton = true;
          $('#carton').val(`${data.outCartonName} (※ 削除されたか、廃止中です)`);
        }
      } else {
        this.showOutCarton = true;
        this.detailProduct.outCartonData = arrOutCartonData[0];
        $('#outCarton').val(data.outCartonName);
        this._fetchLatestCartonInventory(true, false);
      }

      const arrLabelData = this.labelLists.filter(val => val.id === data.labelId);
      if (arrLabelData.length === 0) {
        this._labelLoaded = true;

        this.isLabelSelected = false;
        if (data.labelId === null) {
          $('#label').val("");
          this.showLabel = false;
        } else {
          this.showLabel = true;
          $('#label').val(`${data.labelName} (※ 削除されたか、廃止中です)`);
        }
      } else {
        this.showLabel = true;
        this.detailProduct.labelData = arrLabelData[0];
        $('#label').val(data.labelName);
        this._fetchLatestLabelInventory(true);
      }

      const arrTriggerData = this.triggerLists.filter(val => val.id === data.triggerId);
      if (arrTriggerData.length === 0) {
        this._triggerLoaded = true;

        this.isTriggerSelected = false;
        if (data.triggerId === null) {
          $('#trigger').val("");
          this.showTrigger = false;
        } else {
          $('#trigger').val(`${data.triggerName} (※ 削除されたか、廃止中です)`);
          this.showTrigger = true;
        }
      } else {
        this.showTrigger = true;
        this.detailProduct.triggerData = arrTriggerData[0];
        $('#trigger').val(data.triggerName);
        this._fetchLatestTriggerInventory(true);
      }

      const arrBagData = this.bagLists.filter(val => val.id === data.bagId);
      if (arrBagData.length === 0) {
        this._bagLoaded = true;

        this.isBagSelected = false;
        if (data.bagId === null) {
          this.showBag = false;
          $('#bag').val("");
        } else {
          this.showBag = true;
          $('#bag').val(`${data.bagName} (※ 削除されたか、廃止中です)`);
        }
      } else {
        this.showBag = true;
        this.detailProduct.bagData = arrBagData[0];
        $('#bag').val(data.bagName);
        this._fetchLatestBagInventory(true);
      }

      if (data.imageUrl) {
        this._firebaseStorageService.fecthDownloadUrl(data.imageUrl).subscribe((res: string) => {
          this.imageSrc = res;
        }, (err) => {
          console.error(err);
          this.imageSrc = ManufactureInventoryComponent.NO_IMAGE_URL;
          this._valueShareService.setCompleteModal('※ 画像の取得に失敗しました。', 5000);
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
      if (this.latestBottleInventory.locationCount === null) {
        this.latestBottleInventory.locationCount = {};
        for(const location of this._locationList) {
          this.latestBottleInventory.locationCount[location.id] = 0
        }
      }

      // 新たに倉庫が追加されていた場合
      if (this._locationList.length > Object.keys(this.latestBottleInventory.locationCount).length) {
        for(const location of this._locationList){
          if (!Object.keys(this.latestBottleInventory.locationCount).includes(location.id)) {
            this.latestBottleInventory.locationCount[location.id] = 0;
          }
        }
      }

      if (isFirst) {
        // ロードが終わってから表示する。
        this.isBottleSelected = true;

        this._bottleLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {
        this._valueShareService.setLoading(false);;
      }

    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。', 5000);
    });
  }

  private _fetchLatestCartonInventory(isFirst: boolean, isInCarton: boolean): void {

    const id = isInCarton ? this.detailProduct.inCartonData.id : this.detailProduct.outCartonData.id;

    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.ca, id).subscribe((res: Inventory) => {
      if(isInCarton) {
        this.latestInCartonInventory = res;
        if (this.latestInCartonInventory.locationCount === null) {
          this.latestInCartonInventory.locationCount = {};
          for(const location of this._locationList) {
            this.latestInCartonInventory.locationCount[location.id] = 0
          }
        }

        // 新たに倉庫が追加されていた場合
        if (this._locationList.length > Object.keys(this.latestInCartonInventory.locationCount).length) {
          for(const location of this._locationList){
            if (!Object.keys(this.latestInCartonInventory.locationCount).includes(location.id)) {
              this.latestInCartonInventory.locationCount[location.id] = 0;
            }
          }
        }
      } else {
        this.latestOutCartonInventory = res;
        if (this.latestOutCartonInventory.locationCount === null) {
          this.latestOutCartonInventory.locationCount = {};
          for(const location of this._locationList) {
            this.latestOutCartonInventory.locationCount[location.id] = 0
          }
        }

        // 新たに倉庫が追加されていた場合
        if (this._locationList.length > Object.keys(this.latestOutCartonInventory.locationCount).length) {
          for(const location of this._locationList){
            if (!Object.keys(this.latestOutCartonInventory.locationCount).includes(location.id)) {
              this.latestOutCartonInventory.locationCount[location.id] = 0;
            }
          }
        }
      }


      if (isFirst) {
        if(isInCarton) {
          // ロードが終わってから表示する。
          this.isInCartonSelected = true;

          this._inCartonLoaded = true;
        } else {
          // ロードが終わってから表示する。
          this.isOutCartonSelected = true;

          this._outCartonLoaded = true;
        }
        this._checkLatestInventoryLoaded();
      } else {
        this._valueShareService.setLoading(false);;
      }

    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。', 5000);
    });
  }

  private _fetchLatestLabelInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.la, this.detailProduct.labelData.id)
    .subscribe((res: Inventory) => {
      this.latestLabelInventory = res;
      if (this.latestLabelInventory.locationCount === null) {
        this.latestLabelInventory.locationCount = {};
        for(const location of this._locationList) {
          this.latestLabelInventory.locationCount[location.id] = 0
        }
      }

      // 新たに倉庫が追加されていた場合
      if (this._locationList.length > Object.keys(this.latestLabelInventory.locationCount).length) {
        for(const location of this._locationList){
          if (!Object.keys(this.latestLabelInventory.locationCount).includes(location.id)) {
            this.latestLabelInventory.locationCount[location.id] = 0;
          }
        }
      }

      if (isFirst) {
        // ロードが終わってから表示する。
        this.isLabelSelected = true;

        this._labelLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {
        this._valueShareService.setLoading(false);;
      }

    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。', 5000);
    });
  }

  private _fetchLatestTriggerInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.tr, this.detailProduct.triggerData.id)
    .subscribe((res: Inventory) => {
      this.latestTriggerInventory = res;
      if (this.latestTriggerInventory.locationCount === null) {
        this.latestTriggerInventory.locationCount = {};
        for(const location of this._locationList) {
          this.latestTriggerInventory.locationCount[location.id] = 0
        }
      }

      // 新たに倉庫が追加されていた場合
      if (this._locationList.length > Object.keys(this.latestTriggerInventory.locationCount).length) {
        for(const location of this._locationList){
          if (!Object.keys(this.latestTriggerInventory.locationCount).includes(location.id)) {
            this.latestTriggerInventory.locationCount[location.id] = 0;
          }
        }
      }

      if (isFirst) {
        // ロードが終わってから表示する。
        this.isTriggerSelected = true;

        this._triggerLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {
        this._valueShareService.setLoading(false);;
      }

    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。', 5000);
    });
  }

  private _fetchLatestBagInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.ba, this.detailProduct.bagData.id)
    .subscribe((res: Inventory) => {
      this.latestBagInventory = res;
      if (this.latestBagInventory.locationCount === null) {
        this.latestBagInventory.locationCount = {};
        for(const location of this._locationList) {
          this.latestBagInventory.locationCount[location.id] = 0
        }
      }

      // 新たに倉庫が追加されていた場合
      if (this._locationList.length > Object.keys(this.latestBagInventory.locationCount).length) {
        for(const location of this._locationList){
          if (!Object.keys(this.latestBagInventory.locationCount).includes(location.id)) {
            this.latestBagInventory.locationCount[location.id] = 0;
          }
        }
      }

      if (isFirst) {
        // ロードが終わってから表示する。
        this.isBagSelected = true;

        this._bagLoaded = true;
        this._checkLatestInventoryLoaded();
      } else {
        this._valueShareService.setLoading(false);;
      }

    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。', 5000);
    });
  }

  private _checkLatestInventoryLoaded() {

    if(this._bottleLoaded &&
      this._outCartonLoaded &&
      this._inCartonLoaded &&
      this._labelLoaded &&
      this._triggerLoaded &&
      this._bagLoaded) {

        this._bottleLoaded = false;
        this._inCartonLoaded = false;
        this._outCartonLoaded = false;
        this._labelLoaded = false;
        this._triggerLoaded = false;
        this._bagLoaded = false;

        this._valueShareService.setLoading(false);;
    }
  }

  private _fetchAllDatas():void {

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleLists = res;
      this._bottleLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.cartonLists = res;
      this._inCartonLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ca}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this.labelLists = res;
      this._labelLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.la}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerLists = res;
      this._triggerLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagLists = res;
      this._bagLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
    });

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

    this._authService.user.subscribe((user: User) => {
      this._loginUserData = user;
      this._userLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ログイン中のユーザー情報の取得に失敗しました。`, 10000);
    });

    this._locationService.fetchLocations().subscribe((res) => {
      this._locationList = res;
      this.inputLocation = this._locationList.filter(val => val.isFactory)[0];
      this._locationLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ 倉庫のデータの取得に失敗しました。`, 10000);
    });

    this._companyService.fetchCompanies().subscribe((res) => {
      this.companyList = res;

      const noCompany: Company = {
        id: null,
        name: '得意先なし',
        nameKana: ''
      };
      this.companyList.push(noCompany);
      this._companyLoaded = true; 
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ 得意先のデータの取得に失敗しました。`, 10000);
    });
  }

  private _checkLoaded() {
    if(this._bottleLoaded &&
      this._inCartonLoaded &&
      this._labelLoaded &&
      this._triggerLoaded &&
      this._bagLoaded &&
      this._memoLoaded &&
      this._locationLoaded &&
      this._companyLoaded &&
      this._userLoaded) {
        this._bottleLoaded = false;
        this._inCartonLoaded = false;
        this._labelLoaded = false;
        this._triggerLoaded = false;
        this._bagLoaded = false;

        this._valueShareService.setLoading(false);;
    }
  }

  private _openConfirmModal(): void {
    $('#Modal').modal();
  };
}
