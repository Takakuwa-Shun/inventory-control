import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { Inventory, ActionType, initInventory } from './../../model/inventory';
import { Material, initMaterial } from './../../model/material';
import { Company, initCompany } from './../../model/company';
import { Location, initLocation } from './../../model/location';
import { Product, DetailProduct, initDetailProduct, convertProductToDetailProduct } from './../../model/product';
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
const NO_IMAGE_URL = './../../../assets/no-image.png';

class MaterialInput {
  type: string;
  loaded: boolean;
  show: boolean;
  showAlert: boolean;
  isSelected: boolean;
  imageSrc: string;
  listMaterial: Material[];
  latestInventory: Inventory;
  $input;

  constructor(selector: string, type: string) {
    this.type = type;
    this.loaded = false;
    this.show = false;
    this.showAlert = false;
    this.isSelected = false;
    this.listMaterial = [];
    this.imageSrc = NO_IMAGE_URL;
    this.latestInventory = initInventory();
    this.$input = $(selector);
    this.$input.val("");
  }

  public selectCompany() {
    this.isSelected = false;
    this.show = false;
    this.$input.val("");
  }

  public setImage(type: string, image: string): void {
    if(this.type === type) {
      this.imageSrc = image;
    }
  }

  public fetchLatestInventory(res: Inventory, locationList: Location[]) {
    this.latestInventory = res;
    if (this.latestInventory.locationCount === null) {
      this.latestInventory.locationCount = {};
      for(const location of locationList) {
        this.latestInventory.locationCount[location.id] = 0
      }
    }

    // 新たに倉庫が追加されていた場合
    if (locationList.length > Object.keys(this.latestInventory.locationCount).length) {
      for(const location of locationList){
        if (!Object.keys(this.latestInventory.locationCount).includes(location.id)) {
          this.latestInventory.locationCount[location.id] = 0;
        }
      }
    }
  }

  public setNoUseMaterial(): void{
    this.$input.val("");
    this.show = false;
    this.loaded = true;
    this.isSelected = false;
  }

  public checkMaterialExisting(selectedMaterial: Material): Material {
    const arrMaterialData = this.listMaterial.filter(val => val.id === selectedMaterial.id);

    if (arrMaterialData.length === 0) {
      this.$input.val(`${selectedMaterial.name} (※ 削除されたか、廃止中です)`);
      this.loaded = true;
      this.isSelected = true;
      return null;
    } else {
      this.$input.val(selectedMaterial.name);
      return arrMaterialData[0];
    }
  }

  public selectMaterial(data: Material): boolean {
    if (typeof data === 'string') {
      this.showAlert = true;
      return false;
    } else {
      this.showAlert = false;
      this.isSelected = true;
      return true;
    } 
  }


}

@Component({
  selector: 'app-manufacture-inventory',
  templateUrl: './manufacture-inventory.component.html',
  styleUrls: ['./manufacture-inventory.component.scss']
})
export class ManufactureInventoryComponent implements OnInit {

  public bottleInput: MaterialInput;
  public triggerInput: MaterialInput;
  public labelInput: MaterialInput;
  public bagInput: MaterialInput;
  public inCartonInput: MaterialInput;
  public outCartonInput: MaterialInput;

  private _companyLoaded = false;
  private _memoLoaded = false;
  private _userLoaded = false;
  private _locationLoaded = false;

  private _loginUserData: User;

  public productList: Product[];
  public memoList: string[] = []
  public companyList: Company[];
  private _locationList: Location[];

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

  public showCompanyAlert: boolean;
  public showProductAlert: boolean;

  public isCompanySelected: boolean;
  public isProductSelected: boolean;

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
    this.bottleInput = new MaterialInput('#bottle', MaterialTypeEn.bo);
    this.triggerInput = new MaterialInput('#trigger', MaterialTypeEn.tr);
    this.labelInput = new MaterialInput('#label', MaterialTypeEn.la);
    this.bagInput = new MaterialInput('#bag', MaterialTypeEn.ba);
    this.inCartonInput = new MaterialInput('#inCarton', MaterialTypeEn.inCa);
    this.outCartonInput = new MaterialInput('#outCarton', MaterialTypeEn.outCa);

    this.detailProduct = initDetailProduct();
    this.inputLocation = initLocation();
    this.inputCount = null;
    this.inCartonLot = null;
    this.outCartonLot = null;
    this.isInCeil = true;
    this.isOutCeil = true;
    this.inputMemo = '';

    this.showCompanyAlert = false;
    this.showProductAlert = false

    this.isCompanySelected = false;
    this.isProductSelected = false;

    this.imageSrc = NO_IMAGE_URL;
    $('#company').val('');
    $('#product').val('');
    $('#memo').val('');
  }


  public selectCompany(data: any) :void {
    this.imageSrc = NO_IMAGE_URL;
    this.isProductSelected = false;
    $('#product').val('');

    this.bottleInput.selectCompany();
    this.triggerInput.selectCompany();
    this.labelInput.selectCompany();
    this.bagInput.selectCompany();
    this.inCartonInput.selectCompany();
    this.outCartonInput.selectCompany();

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

  private _setImage(type: string, image: string): void {
    this.bottleInput.setImage(type, image);
    this.triggerInput.setImage(type, image);
    this.labelInput.setImage(type, image);
    this.bagInput.setImage(type, image);
    this.inCartonInput.setImage(type, image);
    this.outCartonInput.setImage(type, image);
    if(type === MaterialTypeEn.pr) {
      this.imageSrc = image;
    }
  }

  private _downloadImages(type: string, imageUrl: string) {
    this._setImage(type, NO_IMAGE_URL);
    if(imageUrl !== '') {
      this._firebaseStorageService.fecthDownloadUrl(imageUrl).subscribe((res: string) => {
        this._setImage(type, res);
      }, (err) => {
        console.log(err);
      });
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

  selectMaterial(data: Material, type: string) :void {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        const isSetBo = this.bottleInput.selectMaterial(data);
        if(isSetBo) {
          this._valueShareService.setLoading(true);
          this.detailProduct.bottleData = data;
          this._fetchLatestBottleInventory(false);
          this._downloadImages(MaterialTypeEn.bo, data.imageUrl);
        }
        break;
      case MaterialTypeEn.inCa:
      case MaterialTypeJa.inCa:
        const isSetInCa = this.inCartonInput.selectMaterial(data);
        if(isSetInCa) {
          this._valueShareService.setLoading(true);
          this.detailProduct.inCartonData = data;
          this._fetchLatestCartonInventory(false, true);
          this._downloadImages(MaterialTypeEn.inCa, data.imageUrl);
        }
        break;
      case MaterialTypeEn.outCa:
      case MaterialTypeJa.outCa:
        const isSetOutCa = this.outCartonInput.selectMaterial(data);
        if(isSetOutCa) {
          this._valueShareService.setLoading(true);
          this.detailProduct.outCartonData = data; 
          this._fetchLatestCartonInventory(false, false);
          this._downloadImages(MaterialTypeEn.outCa, data.imageUrl);
        }
        break;
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        const isSetLa = this.labelInput.selectMaterial(data);
        if(isSetLa) {
          this._valueShareService.setLoading(true);
          this.detailProduct.labelData = data; 
          this._fetchLatestLabelInventory(false);
          this._downloadImages(MaterialTypeEn.la, data.imageUrl);
        }
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        const isSetTr = this.triggerInput.selectMaterial(data);
        if(isSetTr) {
          this._valueShareService.setLoading(true);
          this.detailProduct.triggerData = data; 
          this._fetchLatestTriggerInventory(false);
          this._downloadImages(MaterialTypeEn.tr, data.imageUrl);
        }
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        const isSetBa = this.bagInput.selectMaterial(data);
        if(isSetBa) {
          this._valueShareService.setLoading(true);
          this.detailProduct.bagData = data; 
          this._fetchLatestBagInventory(false);
          this._downloadImages(MaterialTypeEn.ba, data.imageUrl);
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

    if (this.bottleInput.isSelected && this.bottleInput.latestInventory.locationCount[this.inputLocation.id] < this.inputCount){
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.bottleData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.inCartonInput.isSelected && this.inCartonInput.latestInventory.locationCount[this.inputLocation.id] < this._inCartonCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.inCartonData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.outCartonInput.isSelected && this.outCartonInput.latestInventory.locationCount[this.inputLocation.id] < this._outCartonCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.outCartonData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.labelInput.isSelected && this.labelInput.latestInventory.locationCount[this.inputLocation.id] < this.inputCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.labelData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.triggerInput.isSelected && this.triggerInput.latestInventory.locationCount[this.inputLocation.id] < this.inputCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.triggerData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.bagInput.isSelected && this.bagInput.latestInventory.locationCount[this.inputLocation.id] < this.inputCount) {
      this._valueShareService.setCompleteModal(`製造・出荷個数が多く、${this.detailProduct.bagData.name}の${this.inputLocation.name}における在庫量が足りません。`, 20000);
    } else if(this.inCartonInput.isSelected && this.outCartonInput.isSelected && this.detailProduct.inCartonData.id === this.detailProduct.outCartonData.id) {
      this._valueShareService.setCompleteModal(`${MaterialTypeJa.inCa}と${MaterialTypeJa.outCa}に同じものを使用しています`, 20000);
    } else {
      this._inputDate = new Date();
      const showDate = formatDate(this._inputDate, "yyyy/MM/dd (EEE) HH:mm", this._locale);

      let bottleBody: string = '';
      let inCartonBody: string = '';
      let outCartonBody: string = '';
      let labelBody: string = '';
      let triggerBody: string = '';
      let bagBody: string = '';

      if(this.bottleInput.show) {
        bottleBody = `
        <div class="row">
          <div class="col-4">使用ボトル名</div>
          <div class="col-8 pull-left">${this.detailProduct.bottleData.name}</div>
        </div>
        `
      }

      if(this.inCartonInput.show) {
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

      if(this.outCartonInput.show) {

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

      if(this.labelInput.show) {
        labelBody = `
        <div class="row">
          <div class="col-4">使用ラベル名</div>
          <div class="col-8 pull-left">${this.detailProduct.labelData.name}</div>
        </div>
        `
      }

      if(this.triggerInput.show) {
        triggerBody = `
        <div class="row">
          <div class="col-4">使用トリガー名</div>
          <div class="col-8 pull-left">${this.detailProduct.triggerData.name}</div>
        </div>
        `
      }

      if(this.bagInput.show) {
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
    if (this.bottleInput.isSelected) {
      bottleInventory = Object.assign({}, inventory);
      bottleInventory.id = this._afStore.createId();
      bottleInventory.targetId = this.detailProduct.bottleData.id;
      bottleInventory.targetName = this.detailProduct.bottleData.name;
      bottleInventory.arrLocationId[0] = this.inputLocation.id;
      bottleInventory.locationCount = this.bottleInput.latestInventory.locationCount;
      bottleInventory.latestPath = this.bottleInput.latestInventory.latestPath;
    }

    let inCartonInventory: Inventory = null;
    if (this.inCartonInput.isSelected) {
      inCartonInventory = Object.assign({}, inventory);
      inCartonInventory.id = this._afStore.createId();
      inCartonInventory.targetId = this.detailProduct.inCartonData.id;
      inCartonInventory.targetName = this.detailProduct.inCartonData.name;
      inCartonInventory.addCount =  this._inCartonCount * -1;
      inCartonInventory.actionDetail = `${this.detailProduct.name}の製造, ロット数: ${this.inCartonLot} (${this.isInCeil ? '切上げ' : '切捨て'})`;
      inCartonInventory.arrLocationId[0] = this.inputLocation.id;
      inCartonInventory.locationCount = this.inCartonInput.latestInventory.locationCount;
      inCartonInventory.latestPath = this.inCartonInput.latestInventory.latestPath;
    }

    let outCartonInventory: Inventory = null;
    if (this.outCartonInput.isSelected) {
      outCartonInventory = Object.assign({}, inventory);
      outCartonInventory.id = this._afStore.createId();
      outCartonInventory.targetId = this.detailProduct.outCartonData.id;
      outCartonInventory.targetName = this.detailProduct.outCartonData.name;
      outCartonInventory.addCount = this._outCartonCount * -1;
      outCartonInventory.actionDetail = `${this.detailProduct.name}の製造, ロット数: ${this.outCartonLot} (${this.isOutCeil ? '切上げ' : '切捨て'})`;
      outCartonInventory.arrLocationId[0] = this.inputLocation.id;
      outCartonInventory.locationCount = this.outCartonInput.latestInventory.locationCount;
      outCartonInventory.latestPath = this.outCartonInput.latestInventory.latestPath;
    }

    let labelInventory: Inventory = null;
    if (this.labelInput.isSelected) {
      labelInventory = Object.assign({}, inventory);
      labelInventory.id = this._afStore.createId();
      labelInventory.targetId = this.detailProduct.labelData.id;
      labelInventory.targetName = this.detailProduct.labelData.name;
      labelInventory.arrLocationId[0] = this.inputLocation.id;
      labelInventory.locationCount = this.labelInput.latestInventory.locationCount;
      labelInventory.latestPath = this.labelInput.latestInventory.latestPath;
    }

    let triggerInventory: Inventory = null;
    if (this.triggerInput.isSelected) {
      triggerInventory = Object.assign({}, inventory);
      triggerInventory.id = this._afStore.createId();
      triggerInventory.targetId = this.detailProduct.triggerData.id;
      triggerInventory.targetName = this.detailProduct.triggerData.name;
      triggerInventory.arrLocationId[0] = this.inputLocation.id;
      triggerInventory.locationCount = this.triggerInput.latestInventory.locationCount;
      triggerInventory.latestPath = this.triggerInput.latestInventory.latestPath;
    }
    
    let bagInventory: Inventory = null;
    if (this.bagInput.isSelected) {
      bagInventory = Object.assign({}, inventory);
      bagInventory.id = this._afStore.createId();
      bagInventory.targetId = this.detailProduct.bagData.id;
      bagInventory.targetName = this.detailProduct.bagData.name;
      bagInventory.arrLocationId[0] = this.inputLocation.id;
      bagInventory.locationCount = this.bagInput.latestInventory.locationCount;
      bagInventory.latestPath = this.bagInput.latestInventory.latestPath;
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
      this.imageSrc = NO_IMAGE_URL;
      this.isProductSelected = false;
      this.bottleInput.isSelected = false;
      this.triggerInput.isSelected = false;
      this.labelInput.isSelected = false;
      this.bagInput.isSelected = false;
      this.inCartonInput.isSelected = false;
      this.outCartonInput.isSelected = false;
    } else {
      this._valueShareService.setLoading(true);;
      this.showProductAlert = false;
      this.isProductSelected = true;
      this.detailProduct = convertProductToDetailProduct(data);
      this._downloadImages(MaterialTypeEn.pr, data.imageUrl);

      if (data.bottleId === null) {
        this.bottleInput.setNoUseMaterial();
      } else {
        this.bottleInput.show = true;
        if (this.bottleInput.listMaterial.length === 0) {
          this._fetchBottleList();
        } else {
          const material: Material = this.bottleInput.checkMaterialExisting(this.detailProduct.bottleData);
          if (material) {
            this.detailProduct.bottleData = material;
            this._downloadImages(MaterialTypeEn.bo, material.imageUrl);
            this._fetchLatestBottleInventory(true);
          }
        }
      }

      if (data.inCartonId === null) {
        this.inCartonInput.setNoUseMaterial();
      } else {
        this.inCartonInput.show = true;
        if (this.inCartonInput.listMaterial.length === 0) {
          this._fetchCartonList(true);
        } else {
          const material: Material = this.inCartonInput.checkMaterialExisting(this.detailProduct.inCartonData);
          if (material) {
            this.detailProduct.inCartonData = material;
            this._downloadImages(MaterialTypeEn.inCa, material.imageUrl);
            this._fetchLatestCartonInventory(true, true);
          }
        }
      }

      if (data.outCartonId === null) {
        this.outCartonInput.setNoUseMaterial();
      } else {
        this.outCartonInput.show = true;
        if (this.outCartonInput.listMaterial.length === 0) {
          this._fetchCartonList(false);
        } else {
          const material: Material = this.outCartonInput.checkMaterialExisting(this.detailProduct.outCartonData);
          if (material) {
            this.detailProduct.outCartonData = material;
            this._downloadImages(MaterialTypeEn.outCa, material.imageUrl);
            this._fetchLatestCartonInventory(true, false);
          }
        }
      }

      if (data.labelId === null) {
        this.labelInput.setNoUseMaterial();
      } else {
        this.labelInput.show = true;
        if (this.labelInput.listMaterial.length === 0) {
          this._fetchLabelList();
        } else {
          const material: Material = this.labelInput.checkMaterialExisting(this.detailProduct.labelData);
          if (material) {
            this.detailProduct.labelData = material;
            this._downloadImages(MaterialTypeEn.la, material.imageUrl);
            this._fetchLatestLabelInventory(true);
          }
        }
      }

      if (data.triggerId === null) {
        this.triggerInput.setNoUseMaterial();
      } else {
        this.triggerInput.show = true;
        if (this.triggerInput.listMaterial.length === 0) {
          this._fetchTriggerList();
        } else {
          const material: Material = this.triggerInput.checkMaterialExisting(this.detailProduct.triggerData);
          if (material) {
            this.detailProduct.triggerData = material;
            this._downloadImages(MaterialTypeEn.tr, material.imageUrl);
            this._fetchLatestTriggerInventory(true);
          }
        }
      }

      if (data.bagId === null) {
        this.bagInput.setNoUseMaterial();
      } else {
        this.bagInput.show = true;
        if (this.bagInput.listMaterial.length === 0) {
          this._fetchBagList();
        } else {
          const material: Material = this.bagInput.checkMaterialExisting(this.detailProduct.bagData);
          if (material) {
            this.detailProduct.bagData = material;
            this._downloadImages(MaterialTypeEn.ba, material.imageUrl);
            this._fetchLatestBagInventory(true);
          }
        }
      }
    }
  }

  private _fetchBottleList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleInput.listMaterial = res;
      const material: Material = this.bottleInput.checkMaterialExisting(this.detailProduct.bottleData);
      if (material) {
        this.detailProduct.bottleData = material;
        this._downloadImages(MaterialTypeEn.bo, material.imageUrl);
        this._fetchLatestBottleInventory(true);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchCartonList(isInCarton: boolean):void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.inCartonInput.listMaterial = res;
      this.outCartonInput.listMaterial = res;
      if(isInCarton) {
        const material: Material = this.inCartonInput.checkMaterialExisting(this.detailProduct.inCartonData);
        if (material) {
          this.detailProduct.inCartonData = material;
          this._downloadImages(MaterialTypeEn.inCa, material.imageUrl);
          this._fetchLatestCartonInventory(true, true);
        }
      } else {
        const material: Material = this.outCartonInput.checkMaterialExisting(this.detailProduct.outCartonData);
        if (material) {
          this.detailProduct.outCartonData = material;
          this._downloadImages(MaterialTypeEn.outCa, material.imageUrl);
          this._fetchLatestCartonInventory(true, false);
        }
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ca}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchLabelList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this.labelInput.listMaterial = res;
      const material: Material = this.labelInput.checkMaterialExisting(this.detailProduct.labelData);
      if (material) {
        this.detailProduct.labelData = material;
        this._downloadImages(MaterialTypeEn.la, material.imageUrl);
        this._fetchLatestLabelInventory(true);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.la}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchTriggerList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerInput.listMaterial = res;
      const material: Material = this.triggerInput.checkMaterialExisting(this.detailProduct.triggerData);
      if (material) {
        this.detailProduct.triggerData = material;
        this._downloadImages(MaterialTypeEn.tr, material.imageUrl);
        this._fetchLatestTriggerInventory(true);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchBagList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagInput.listMaterial = res;
      const material: Material = this.bagInput.checkMaterialExisting(this.detailProduct.bagData);
      if (material) {
        this.detailProduct.bagData = material;
        this._downloadImages(MaterialTypeEn.ba, material.imageUrl);
        this._fetchLatestBagInventory(true);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
    });
  }1

  public autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  private _fetchLatestBottleInventory(isFirst: boolean): void {
    this._inventoryService.fetchLatestInventoryByTargetId(MaterialTypeEn.bo, this.detailProduct.bottleData.id)
    .subscribe((res: Inventory) => {
      this.bottleInput.fetchLatestInventory(res, this._locationList);

      if (isFirst) {
        // ロードが終わってから表示する。
        this.bottleInput.isSelected = true;
        this.bottleInput.loaded = true;
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
        this.inCartonInput.fetchLatestInventory(res, this._locationList);
      } else {
        this.outCartonInput.fetchLatestInventory(res, this._locationList);
      }


      if (isFirst) {
        if(isInCarton) {
          // ロードが終わってから表示する。
          this.inCartonInput.isSelected = true;
          this.inCartonInput.loaded = true;
        } else {
          // ロードが終わってから表示する。
          this.outCartonInput.isSelected = true;
          this.outCartonInput.loaded = true;
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
      this.labelInput.fetchLatestInventory(res, this._locationList);

      if (isFirst) {
        // ロードが終わってから表示する。
        this.labelInput.isSelected = true;
        this.labelInput.loaded = true;
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
      this.triggerInput.fetchLatestInventory(res, this._locationList);

      if (isFirst) {
        // ロードが終わってから表示する。
        this.triggerInput.isSelected = true;
        this.triggerInput.loaded = true;
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
      this.bagInput.fetchLatestInventory(res, this._locationList);

      if (isFirst) {
        // ロードが終わってから表示する。
        this.bagInput.isSelected = true;
        this.bagInput.loaded = true;
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

    if(this.bottleInput.loaded &&
      this.outCartonInput.loaded &&
      this.inCartonInput.loaded &&
      this.labelInput.loaded &&
      this.triggerInput.loaded &&
      this.bagInput.loaded) {

        this.bottleInput.loaded = false;
        this.inCartonInput.loaded = false;
        this.outCartonInput.loaded = false;
        this.labelInput.loaded = false;
        this.triggerInput.loaded = false;
        this.bagInput.loaded = false;

        this._valueShareService.setLoading(false);;
    }
  }

  private _fetchAllDatas():void {
  
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
    if(this._memoLoaded &&
      this._locationLoaded &&
      this._companyLoaded &&
      this._userLoaded) {
        this._valueShareService.setLoading(false);;
    }
  }

  private _openConfirmModal(): void {
    $('#Modal').modal();
  };
}
