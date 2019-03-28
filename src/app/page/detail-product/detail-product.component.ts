import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { Company, initCompany } from './../../model/company';
import { Product, DetailProduct, convertDetailProductToProduct, initDetailProduct } from './../../model/product';
import { Material, initMaterial } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
declare const $;

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.css']
})
export class DetailProductComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public loading = true;
  private _bottleLoaded = false;
  private _cartonLoaded = false;
  private _labelLoaded = false;
  private _triggerLoaded = false;
  private _bagLoaded = false;
  private _companyLoaded = false;

  public bottleLists: Material[];
  public cartonLists: Material[];
  public labelLists: Material[];
  public triggerLists: Material[];
  public bagLists: Material[];
  public companyLists: Company[];

  public showBottleAlert: boolean = false;
  public showCartonAlert: boolean = false;
  public showLabelAlert: boolean = false;
  public showTriggerAlert: boolean = false;
  public showBagAlert: boolean = false;
  public showCompanyAlert: boolean = false;

  public isBagSelected: boolean = false;
  public isBottleSelected: boolean = false;
  public isCartonSelected: boolean = false;
  public isLabelSelected: boolean = false;
  public isTriggerSelected: boolean = false;
  public isCompanySelected: boolean = false;

  public product: Product;
  public registerProduct: DetailProduct;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';
  public readonly countPattern: string = '^[1-9][0-9]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '修正';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public readonly deleteBody = '本当に削除してもよろしいですか？';;
  public readonly deleteBtn = '削除';

  public completeBody: string;
  public completeBtnType: string;
  private _deleted: boolean = false;

  public imageSrc: string = DetailProductComponent.NO_IMAGE_URL;
  public isInitInputImage: boolean;
  public _selectedImage: File;

  constructor(
    private route: ActivatedRoute,
    private _materialService: MaterialService,
    private _companyService: CompanyService,
    private _firebaseStorageService: FirebaseStorageService,
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit() {
    this.registerProduct = initDetailProduct();
    this.product = convertDetailProductToProduct(this.registerProduct);
    this._fetchAllDatas();
    this.isInitInputImage = true;
  }

  private _fetchAllDatas():void {

    this._materialService.fetchMaterialLists(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleLists = res;
      this._bottleLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.bo}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.cartonLists = res;
      this._cartonLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.ca}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this.labelLists = res;
      this._labelLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.la}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerLists = res;
      this._triggerLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.tr}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagLists = res;
      this._bagLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.ba}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._companyService.fetchCompanies().subscribe((res: Company[]) => {
      this.companyLists = res;
      this._companyLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ 得意先データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  private _checkLoaded() {
    if (this._bottleLoaded && this._cartonLoaded && this._labelLoaded && this._triggerLoaded && this._bagLoaded && this._companyLoaded) {
      this._fetchProductDetail();
    }
  }

  private _fetchProductDetail() :void {
    const productId = this.route.snapshot.paramMap.get('id');
    this.productService.fetchProductById(productId).subscribe((res: Product) => {
      this.product = res;

      let bottleData: Material = initMaterial();
      if (this.product.bottleId !== null) {
        const arrBottleData = this.bottleLists.filter(val => val.id === this.product.bottleId);
        if (arrBottleData.length === 0) {
          this.product.bottleId = null;
          this.product.bottleName += ' (※ 削除されました)';
        } else {
          bottleData = arrBottleData[0];
          this.isBottleSelected = true;
        }
      }

      let cartonData: Material = initMaterial();
      if (this.product.cartonId !== null) {
        const arrCartonData = this.cartonLists.filter(val => val.id === this.product.cartonId);
        if (arrCartonData.length === 0) {
          this.product.cartonId = null;
          this.product.cartonName += ' (※ 削除されました)';
        } else {
          cartonData = arrCartonData[0];
          this.isCartonSelected = true;
        }
      }

      let labelData: Material = initMaterial();
      if (this.product.labelId !== null) {
        const arrLabelData = this.labelLists.filter(val => val.id === this.product.labelId);
        if (arrLabelData.length === 0) {
          this.product.labelId = null;
          this.product.labelName += ' (※ 削除されました)';
        } else {
          labelData = arrLabelData[0];
          this.isLabelSelected = true;
        }
      }

      let triggerData: Material = initMaterial();
      if (this.product.triggerId !== null) {
        const arrTriggerData = this.triggerLists.filter(val => val.id === this.product.triggerId);
        if (arrTriggerData.length === 0) {
          this.product.triggerId = null;
          this.product.triggerName += ' (※ 削除されました)';
        } else {
          triggerData = arrTriggerData[0];
          this.isTriggerSelected = true;
        }
      }

      let bagData: Material = initMaterial();
      if (this.product.bagId !== null) {
        const arrBagData = this.bagLists.filter(val => val.id === this.product.bagId);
        if (arrBagData.length === 0) {
          this.product.bagId = null;
          this.product.bagName += ' (※ 削除されました)';
        } else {
          bagData = arrBagData[0];
          this.isBagSelected = true;
        }
      }

      let companyData: Company = initCompany();
      if (this.product.companyId !== null) {
        const arrCompanyData = this.companyLists.filter(val => val.id === this.product.companyId);
        if (arrCompanyData.length === 0) {
          this.product.companyId = null;
          this.product.companyName += ' (※ 削除されました)';
        } else {
          companyData = arrCompanyData[0];
          this.isCompanySelected = true;
        }
      }

      this.registerProduct = {
        id: this.product.id,
        name: this.product.name,
        nameKana: this.product.nameKana,
        lot: this.product.lot,
        imageUrl: this.product.imageUrl,
        bottleData: bottleData,
        cartonData: cartonData,
        labelData: labelData,
        triggerData: triggerData,
        bagData: bagData,
        companyData: companyData,
      }

      if (this.product.imageUrl !== '') {
        this._firebaseStorageService.fecthDownloadUrl(this.product.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }
      this.loading = false;
    }, (err) => {
      console.error(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  createBody(){
    const fileName = this._selectedImage ? this._selectedImage.name : '未選択';

    if (this.registerProduct.bottleData.id === '') {
      this.registerProduct.bottleData.id = null;
      this.registerProduct.bottleData.name = '-';
    }

    if (this.registerProduct.cartonData.id === '') {
      this.registerProduct.cartonData.id = null;
      this.registerProduct.cartonData.name = '-';
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

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録を修正しますか？</p>
      <div class="row">
        <div class="col-4">コード</div>
        <div class="col-8 pull-left">${this.product.id}</div>
      </div>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerProduct.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerProduct.nameKana}</div>
      </div>
      <div class="row">
        <div class="col-4">ボトル名</div>
        <div class="col-8 pull-left">${this.registerProduct.bottleData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">カートン名</div>
        <div class="col-8 pull-left">${this.registerProduct.cartonData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">ラベル名</div>
        <div class="col-8 pull-left">${this.registerProduct.labelData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">トリガー名</div>
        <div class="col-8 pull-left">${this.registerProduct.triggerData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">詰め替え袋名</div>
        <div class="col-8 pull-left">${this.registerProduct.bagData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">得意先名</div>
        <div class="col-8 pull-left">${this.registerProduct.companyData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">ロット数</div>
        <div class="col-8 pull-left">${this.registerProduct.lot}</div>
      </div>
      <div class="row">
        <div class="col-4">画像</div>
        <div class="col-8 pull-left">>${fileName}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this.loading = true;
    const editProduct: Product = convertDetailProductToProduct(this.registerProduct);

    if (this._selectedImage === undefined) {
      editProduct.imageUrl = '';
      this._saveProduct(editProduct);
    } else {
      const filePath = this.productService.getFilePath(this._selectedImage, new Date);
      this.registerProduct.imageUrl = filePath;
      editProduct.imageUrl = filePath;

      if(this.product.imageUrl !== '') {
        this._firebaseStorageService.deleteFile(this.product.imageUrl).subscribe(() => {

        }, (err) => {
          console.log(err);
          this.completeBody = '※ 変更前の画像の削除に失敗しました。';
          this.completeBtnType = 'btn-danger';
          this.openCompleteModal();
        });
      }

      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {
        this._saveProduct(editProduct);

        this._firebaseStorageService.fecthDownloadUrl(editProduct.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }, (err) => {
        console.error(err);
        this.completeBody = '※ 登録に失敗しました。';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      });
    }
  }

  private _saveProduct(product: Product) {
    this.productService.saveProduct(product).subscribe(() =>{
      this.product = convertDetailProductToProduct(this.registerProduct);

      this.completeBody = '登録が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();
    }, (err) => {
      console.error(err);
      this.completeBody = '※ 登録に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  delete(): void {
    this.loading = true;
    this.productService.deleteProductById(this.product.id).subscribe(() => {
      if(this.product.imageUrl !== '') {
        this._firebaseStorageService.deleteFile(this.product.imageUrl).subscribe(() => {
          this._deleted = true;
          this.completeBody = '削除が完了しました。';
          this.completeBtnType = 'btn-outline-success';
          this.openCompleteModal();
    
          setTimeout(() =>{
            this.backToList();
          },3000);
        }, (err) => {
          console.log(err);
          this.completeBody = '※ 画像の削除に失敗しました。';
          this.completeBtnType = 'btn-danger';
          this.openCompleteModal();
        });
      } else {
        this._deleted = true;
        this.completeBody = '削除が完了しました。';
        this.completeBtnType = 'btn-outline-success';
        this.openCompleteModal();
  
        setTimeout(() =>{
          this.backToList();
        },3000);
      }
    }, (err) => {
      console.error(err);
      this.completeBody = '※ 削除に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });


  }

  public imageLoadFailed() {
    this.completeBody = '※ 画像の読み込みに失敗しました。';
    this.completeBtnType = 'btn-danger';
    this.openCompleteModal();
  }

  public selectImage(file: File) {
    this._selectedImage = file;
    this.isInitInputImage = false;
  }

  goBack(): void {
    this.router.navigate(['/product/list']);
  }

  backToList(): void {
    if (this._deleted) {
      this._deleted = false;
      this.goBack();
    }
  }

  public cancelMaterialSelected(type: string) {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        this.registerProduct.bottleData = initMaterial();
        this.isBottleSelected = false;
        $('#bottle').val("");
        break;
      case MaterialTypeEn.ca:
      case MaterialTypeJa.ca:
        this.registerProduct.cartonData = initMaterial();
        this.isCartonSelected = false;
        $('#carton').val("");
        break;
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        this.registerProduct.labelData = initMaterial();
        this.isLabelSelected = false;
        $('#label').val("");
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        this.registerProduct.triggerData = initMaterial();
        this.isTriggerSelected = false;
        $('#trigger').val("");
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        this.registerProduct.bagData = initMaterial();
        this.isBagSelected = false;
        $('#bag').val("");
        break;
      case 'company':
      case '得意先':
        this.registerProduct.companyData = initCompany();
        this.isCompanySelected = false;
        $('company').val("");
        break;
      default:
        console.error('typeおかしいよ？ : ' + type);
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
      case MaterialTypeEn.ca:
      case MaterialTypeJa.ca:
        if (typeof data === 'string') {
          this.showCartonAlert = true;
        } else {
          this.showCartonAlert = false;
          this.registerProduct.cartonData = data;
          this.isCartonSelected = true;
          break;
        }
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

  private openCompleteModal(): void {
    this.loading = false;
    $('#CompleteModal').modal();

    setTimeout(() =>{
      this.closeCompleteModal();
    },3000);
  };

  private closeCompleteModal(): void {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#CompleteModal').modal('hide');
  }
}