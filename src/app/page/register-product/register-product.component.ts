import { Component, OnInit } from '@angular/core';
import { Product, DetailProduct, initDetailProduct } from '../../model/product';
import { Company } from './../../model/company';
import { Material, initMaterial } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-register-product',
  templateUrl: './register-product.component.html',
  styleUrls: ['./register-product.component.css']
})
export class RegisterProductComponent implements OnInit {
  private _cartonLoaded = false;
  private _labelLoaded = false;
  private _companyLoaded = false;

  public registerProduct: DetailProduct;

  public bottleLists: Material[] = [];
  public cartonLists: Material[];
  public labelLists: Material[];
  public triggerLists: Material[] = [];
  public bagLists: Material[] = [];
  public companyLists: Company[];

  public isBagSelected: boolean;
  public isBottleSelected: boolean;
  public isInCartonSelected: boolean;
  public isOutCartonSelected: boolean;
  public isLabelSelected: boolean;
  public isTriggerSelected: boolean;
  public isCompanySelected: boolean;

  public showBagAlert: boolean;
  public showBottleAlert: boolean;
  public showInCartonAlert: boolean;
  public showOutCartonAlert: boolean;
  public showLabelAlert: boolean;
  public showTriggerAlert: boolean;
  public showCompanyAlert: boolean;

  public isBody: boolean;
  public isRefill: boolean;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';
  public readonly countPattern: string = '^[1-9][0-9]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  public isInitInputImage: boolean;
  private _selectedImage: File;

  constructor (
    private _materialService: MaterialService,
    private _companyService: CompanyService,
    private _firebaseStorageService: FirebaseStorageService,
    private _productService: ProductService,
    private _valueShareService: ValueShareService,
    private _afStore: AngularFirestore
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this._fetchBaseDatas();
    this.formInit();
  }

  createBody(){
    const fileName = this._selectedImage ? this._selectedImage.name : '未選択';

    if (this.registerProduct.bottleData.id === '') {
      this.registerProduct.bottleData.id = null;
      this.registerProduct.bottleData.name = '-';
    }

    if (this.registerProduct.inCartonData.id === '') {
      this.registerProduct.inCartonData.id = null;
      this.registerProduct.inCartonData.name = '-';
    }

    if (this.registerProduct.outCartonData.id === '') {
      this.registerProduct.outCartonData.id = null;
      this.registerProduct.outCartonData.name = '-';
    }

    if (this.registerProduct.labelData.id === '') {
      this.registerProduct.labelData.id = null;
      this.registerProduct.labelData.name = '-';
    }

    if (this.registerProduct.triggerData.id === '') {
      this.registerProduct.triggerData.id = null;
      this.registerProduct.triggerData.name = '-';
    }

    if (this.registerProduct.bagData.id === '') {
      this.registerProduct.bagData.id = null;
      this.registerProduct.bagData.name = '-';
    }

    if (this.registerProduct.companyData.id === '') {
      this.registerProduct.companyData.id = null;
      this.registerProduct.companyData.name = '-';
    }

    let body: string;

    if(this.isBody) {
      body = `
      <div class="row">
        <div class="col-4">ボトル</div>
        <div class="col-8 pull-left">${this.registerProduct.bottleData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">トリガー</div>
        <div class="col-8 pull-left">${this.registerProduct.triggerData.name}</div>
      </div>`
    } else {
      body = `
      <div class="row">
        <div class="col-4">詰め替え袋</div>
        <div class="col-8 pull-left">${this.registerProduct.bagData.name}</div>
      </div>`
    }

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">得意先</div>
        <div class="col-8 pull-left">${this.registerProduct.companyData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerProduct.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerProduct.nameKana}</div>
      </div>
      ${body}
      <div class="row">
        <div class="col-4">ラベル</div>
        <div class="col-8 pull-left">${this.registerProduct.labelData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">内側カートン</div>
        <div class="col-8 pull-left">${this.registerProduct.inCartonData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">外側カートン</div>
        <div class="col-8 pull-left">${this.registerProduct.outCartonData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">画像</div>
        <div class="col-8 pull-left">${fileName}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this._valueShareService.setLoading(true);

    const product: Product = {
      id: this._afStore.createId(),
      name: this.registerProduct.name.trim(),
      nameKana: this.registerProduct.nameKana.trim(),
      imageUrl: '',
      companyId: this.registerProduct.companyData.id,
      companyName: this.registerProduct.companyData.name,
      bottleId: this.registerProduct.bottleData.id,
      bottleName: this.registerProduct.bottleData.name,
      inCartonId: this.registerProduct.inCartonData.id,
      inCartonName: this.registerProduct.inCartonData.name,
      outCartonId: this.registerProduct.outCartonData.id,
      outCartonName: this.registerProduct.outCartonData.name,
      labelId: this.registerProduct.labelData.id,
      labelName: this.registerProduct.labelData.name,
      triggerId: this.registerProduct.triggerData.id,
      triggerName: this.registerProduct.triggerData.name,
      bagId: this.registerProduct.bagData.id,
      bagName: this.registerProduct.bagData.name,
    }

    if (this._selectedImage === undefined) {
      this._saveProduct(product);
    } else {
      const filePath = this._productService.getFilePath(this._selectedImage, new Date);
      product.imageUrl = filePath;
      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {
        this._saveProduct(product);
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
      });
    }
  }

  private _saveProduct(product: Product) {
    this._productService.saveProduct(product).subscribe(() =>{
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  formInit() :void {
    this.registerProduct = initDetailProduct();

    this.isBody = false;
    this.isRefill = false;

    this.isBottleSelected = false;
    this.isInCartonSelected = false;
    this.isOutCartonSelected = false;
    this.isLabelSelected = false;
    this.isTriggerSelected = false;
    this.isBagSelected = false;
    this.isCompanySelected = false;
  
    this.showBottleAlert = false;
    this.showInCartonAlert = false;
    this.showOutCartonAlert = false;
    this.showLabelAlert = false;
    this.showTriggerAlert = false;
    this.showBagAlert = false;
    this.showCompanyAlert = false;

    $('#bottle').val("");
    $('#inCarton').val("");
    $('#outCarton').val("");
    $('#label').val("");
    $('#trigger').val("");
    $('#bag').val("");
    $('#company').val("");

    this._selectedImage = undefined;
    this.isInitInputImage = true;
  }

  public changeIsBody(isBody: boolean) {
    if(isBody) {
      if(this.bottleLists.length === 0 || this.triggerLists.length === 0) {
        this._valueShareService.setLoading(true);
        this._fetchBodyDatas();
      } else {
        this._initBodyInput();
      }
    } else {
      if(this.bagLists.length === 0) {
        this._valueShareService.setLoading(true);
        this._fetchBagDatas();
      } else {
        this._initRefillInput();
      }
    }
  }

  autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  selectMaterial(data: any, type: string) :void {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        if (typeof data === 'string') {
          this.showBottleAlert = true;
        } else {
          this.showBottleAlert = false;
          this.registerProduct.bottleData = data; 
          this.isBottleSelected = true;
        }
        break;
      case MaterialTypeEn.inCa:
      case MaterialTypeJa.inCa:
        if (typeof data === 'string') {
          this.showInCartonAlert = true;
        } else {
          this.showInCartonAlert = false;
          this.registerProduct.inCartonData = data; 
          this.isInCartonSelected = true;
        }
      break;
      case MaterialTypeEn.outCa:
      case MaterialTypeJa.outCa:
        if (typeof data === 'string') {
          this.showOutCartonAlert = true;
        } else {
          this.showOutCartonAlert = false;
          this.registerProduct.outCartonData = data; 
          this.isOutCartonSelected = true;
        }
        break;
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        if (typeof data === 'string') {
          this.showLabelAlert = true;
        } else {
          this.showLabelAlert = false;
          this.registerProduct.labelData = data; 
          this.isLabelSelected = true;
        }
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        if (typeof data === 'string') {
          this.showTriggerAlert = true;
        } else {
          this.showTriggerAlert = false;
          this.registerProduct.triggerData = data; 
          this.isTriggerSelected = true;
        }
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        if (typeof data === 'string') {
          this.showBagAlert = true;
        } else {
          this.showBagAlert = false;
          this.registerProduct.bagData = data; 
          this.isBagSelected = true;
        }
        break;
      case 'company':
      case '得意先':
        if (typeof data === 'string') {
          this.showCompanyAlert = true;
        } else {
          this.showCompanyAlert = false;
          this.registerProduct.companyData = data; 
          this.isCompanySelected = true;
        }
        break;
      default:
        console.error('typeおかしいよ？ : ' + type);
    }
  }

  public imageLoadFailed() {
    this._valueShareService.setCompleteModal('※ 画像の読み込みに失敗しました。');
  }

  public selectImage(file: File) {
    this._selectedImage = file;
    this.isInitInputImage = false;
  }

  private _fetchBodyDatas():void {
    let bottleLoaded = false;
    let triggerLoaded = false;

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleLists = res;
      bottleLoaded = true;
      if(triggerLoaded) {
        this._initBodyInput();
        this._valueShareService.setLoading(false);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerLists = res;
      triggerLoaded = true;
      if(bottleLoaded) {
        this._initBodyInput();
        this._valueShareService.setLoading(false);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
    });
  }

  private _initBodyInput(): void {
    this.isBody = true;
    this.isRefill = false;
    this.showBagAlert = false;
    this.registerProduct.bagData = initMaterial(); 
    this.isBagSelected = false;
  }


  private _initRefillInput(): void {
    this.isBody = false;
    this.isRefill = true;
    this.showBottleAlert = false;
    this.registerProduct.bottleData = initMaterial(); 
    this.isBottleSelected = false;
  
    this.showTriggerAlert = false;
    this.registerProduct.triggerData = initMaterial(); 
    this.isTriggerSelected = false;
  }

  private _fetchBagDatas():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagLists = res;
      this._initRefillInput();
      this._valueShareService.setLoading(false);
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchBaseDatas():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.cartonLists = res;
      this._cartonLoaded = true;
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

    this._companyService.fetchCompanies().subscribe((res: Company[]) => {
      this.companyLists = res;
      this._companyLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ 得意先データの取得に失敗しました。`, 10000);
    });
  }

  private _checkLoaded() {
    if (this._cartonLoaded && this._labelLoaded &&  this._companyLoaded) {
      this._valueShareService.setLoading(false);
    }
  }
}
