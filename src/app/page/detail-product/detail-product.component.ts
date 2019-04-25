import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { Company, initCompany } from './../../model/company';
import { Product, DetailProduct, convertDetailProductToProduct, initDetailProduct, convertProductToDetailProduct } from './../../model/product';
import { Material, initMaterial } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.css']
})
export class DetailProductComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public showEditCompany: boolean;
  public showEditBottle: boolean;
  public showEditTrigger: boolean;
  public showEditLabel: boolean;
  public showEditBag: boolean;
  public showEditInCarton: boolean;
  public showEditOutCarton: boolean;

  public bottleLists: Material[] = []; 
  public cartonLists: Material[] = [];
  public labelLists: Material[] = [];
  public triggerLists: Material[] = [];
  public bagLists: Material[] = [];
  public companyLists: Company[] = [];

  public showBottleAlert: boolean = false;
  public showInCartonAlert: boolean = false;
  public showOutCartonAlert: boolean = false;
  public showLabelAlert: boolean = false;
  public showTriggerAlert: boolean = false;
  public showBagAlert: boolean = false;
  public showCompanyAlert: boolean = false;

  public showBottleDeletedAlert: boolean = false;
  public showInCartonDeletedAlert: boolean = false;
  public showOutCartonDeletedAlert: boolean = false;
  public showLabelDeletedAlert: boolean = false;
  public showTriggerDeletedAlert: boolean = false;
  public showBagDeletedAlert: boolean = false;
  public showCompanyDeletedAlert: boolean = false;

  public isBagSelected: boolean = false;
  public isBottleSelected: boolean = false;
  public isInCartonSelected: boolean = false;
  public isOutCartonSelected: boolean = false;
  public isLabelSelected: boolean = false;
  public isTriggerSelected: boolean = false;
  public isCompanySelected: boolean = false;

  public product: Product;
  public registerProduct: DetailProduct;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';
  public readonly countPattern: string = '^[1-9][0-9]{0,8}$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '修正';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public readonly deleteBody = '本当に削除してもよろしいですか？';
  public readonly deleteBtn = '削除';

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
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
  }

  ngOnInit() {
    this._formInit();
    this._fetchProductDetail();
    this.registerProduct = initDetailProduct();
    this.product = convertDetailProductToProduct(this.registerProduct);
    this.isInitInputImage = true;
  }

  private _formInit() {
    this.showEditBottle = false;
    this.showEditTrigger = false;
    this.showEditLabel = false;
    this.showEditBag = false;
    this.showEditInCarton = false;
    this.showEditOutCarton = false;
    this.showEditCompany = false;
  }

  public getData(type: string) {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        if (this.bottleLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchBottleList();
        } else {
          this.showEditBottle = true;
        }
        break;
      case MaterialTypeEn.inCa:
      case MaterialTypeJa.inCa:
        if (this.cartonLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchCartonList(true);
        } else {
          this.showEditInCarton = true;
        }
        break;
      case MaterialTypeEn.outCa:
      case MaterialTypeJa.outCa:
        if (this.cartonLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchCartonList(false);
        } else {
          this.showEditOutCarton = true;
        }
        break;
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        if (this.labelLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchLabelList();
        } else {
          this.showEditLabel = true;
        }
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        if (this.triggerLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchTriggerList();
        } else {
          this.showEditTrigger = true;
        }
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        if (this.bagLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchBagList();
        } else {
          this.showEditBag = true;
        }
        break;
      case 'company':
      case '得意先':
        if (this.companyLists.length === 0) {
          this._valueShareService.setLoading(true);
          this._fetchCompanyList();
        } else {
          this.showEditCompany = true;
        }
        break;
      default:
        console.error('typeおかしいよ？ : ' + type);
    }
  }

  private _fetchBottleList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleLists = res;
      this._valueShareService.setLoading(false);
      this.showEditBottle = true;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchCartonList(isInCarton: boolean):void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.cartonLists = res;
      this._valueShareService.setLoading(false);
      if(isInCarton) {
        this.showEditInCarton = true;
      } else {
        this.showEditOutCarton = true;
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ca}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchLabelList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this.labelLists = res;
      this._valueShareService.setLoading(false);
      this.showEditLabel = true;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.la}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchTriggerList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerLists = res;
      this._valueShareService.setLoading(false);
      this.showEditTrigger = true;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchBagList():void {
    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagLists = res;
      this._valueShareService.setLoading(false);
      this.showEditBag = true;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
    });
  }

  private _fetchCompanyList():void {
    this._companyService.fetchCompanies().subscribe((res: Company[]) => {
      this.companyLists = res;
      this.showEditCompany = true;
      this._valueShareService.setLoading(false);
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 得意先データの取得に失敗しました。');
    });
  }

  private _fetchProductDetail() :void {
    const productId = this.route.snapshot.paramMap.get('id');
    this.productService.fetchProductById(productId).subscribe((res: Product) => {
      this.product = res;
      this.registerProduct = convertProductToDetailProduct(res);

      if (this.product.imageUrl !== '') {
        this._firebaseStorageService.fecthDownloadUrl(this.product.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }
      this._valueShareService.setLoading(false);

      if(res.bottleId) {
        this._checkExisting(this.registerProduct.bottleData, MaterialTypeEn.bo);
      }

      if(res.inCartonId) {
        this._checkExisting(this.registerProduct.inCartonData, MaterialTypeEn.inCa);
      }

      if(res.outCartonId) {
        this._checkExisting(this.registerProduct.outCartonData, MaterialTypeEn.outCa);
      }

      if(res.triggerId) {
        this._checkExisting(this.registerProduct.triggerData, MaterialTypeEn.tr);
      }

      if(res.labelId) {
        this._checkExisting(this.registerProduct.labelData, MaterialTypeEn.la);
      }

      if(res.bagId) {
        this._checkExisting(this.registerProduct.bagData, MaterialTypeEn.ba);
      }

    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  private _checkExisting(material: Material, type: string) {
    this._materialService.fetchMaterialById(material.id, type).subscribe((res: Material) => {
      switch(type){
        case MaterialTypeEn.bo:
        case MaterialTypeJa.bo:
        if(res) {
          this.showBottleDeletedAlert = false;
          this.product.bottleName = this.registerProduct.bottleData.name;
        } else {
          this._valueShareService.setCompleteModal('設定しているボトルは削除されています！', 10000);
          this.product.bottleName = this.product.bottleName + '(※ 削除されています!)';
          this.showBottleDeletedAlert = true;
        }
          break;
        case MaterialTypeEn.inCa:
        case MaterialTypeJa.inCa:
        if(res) {
          this.showInCartonDeletedAlert = false;
          this.product.inCartonName = this.registerProduct.inCartonData.name;
        } else {
          this._valueShareService.setCompleteModal('設定している内側カートンは削除されています！', 10000);
          this.product.inCartonName = this.product.inCartonName + '(※ 削除されています!)';
          this.showInCartonDeletedAlert = true;
        }
          break;
        case MaterialTypeEn.outCa:
        case MaterialTypeJa.outCa:
        if(res) {
          this.showOutCartonDeletedAlert = false;
          this.product.outCartonName = this.registerProduct.outCartonData.name;
        } else {
          this._valueShareService.setCompleteModal('設定している外側カートンは削除されています！', 10000);
          this.product.outCartonName = this.product.outCartonName + '(※ 削除されています!)';
          this.showOutCartonDeletedAlert = true;
        }
          break;
        case MaterialTypeEn.la:
        case MaterialTypeJa.la:
        if(res) {
          this.showLabelDeletedAlert = false;
          this.product.labelName = this.registerProduct.labelData.name;
        } else {
          this._valueShareService.setCompleteModal('設定しているラベルは削除されています！', 10000);
          this.product.labelName = this.product.labelName + '(※ 削除されています!)';
          this.showLabelDeletedAlert = true;
        }
          break;
        case MaterialTypeEn.tr:
        case MaterialTypeJa.tr:
        if(res) {
          this.showTriggerDeletedAlert = false;
          this.product.triggerName = this.registerProduct.triggerData.name;
        } else {
          this._valueShareService.setCompleteModal('設定しているトリガーは削除されています！', 10000);
          this.product.triggerName = this.product.triggerName + '(※ 削除されています!)';
          this.showTriggerDeletedAlert = true;
        }
          break;
        case MaterialTypeEn.ba:
        case MaterialTypeJa.ba:
        if(res) {
          this.showBagDeletedAlert = false;
          this.product.bagName = this.registerProduct.bagData.name;
        } else {
          this._valueShareService.setCompleteModal('設定している詰め替え袋は削除されています！', 10000);
          this.product.bagName = this.product.bagName + '(※ 削除されています!)';
          this.showBagDeletedAlert = true;
        }
          break;
        default:
          console.error('typeおかしいよ？ : ' + type);
      }
      
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${material.name}データの取得に失敗しました。`, 10000);
    });
  }

  createBody(){
    const fileName = this._selectedImage ? this._selectedImage.name : '修正なし';

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

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録を修正しますか？</p>
      <div class="row">
        <div class="col-4">得意先名</div>
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
      <div class="row">
        <div class="col-4">ボトル名</div>
        <div class="col-8 pull-left">${this.registerProduct.bottleData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">トリガー名</div>
        <div class="col-8 pull-left">${this.registerProduct.triggerData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">ラベル名</div>
        <div class="col-8 pull-left">${this.registerProduct.labelData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">詰め替え袋名</div>
        <div class="col-8 pull-left">${this.registerProduct.bagData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">内側カートン名</div>
        <div class="col-8 pull-left">${this.registerProduct.inCartonData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">外側カートン名</div>
        <div class="col-8 pull-left">${this.registerProduct.outCartonData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">画像</div>
        <div class="col-8 pull-left">${fileName}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this._valueShareService.setLoading(true);;
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
          this._valueShareService.setCompleteModal('※ 変更前の画像の削除に失敗しました。');
        });
      }

      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {
        this._saveProduct(editProduct);

        this._firebaseStorageService.fecthDownloadUrl(editProduct.imageUrl, true).subscribe((url) => {
          this.imageSrc = url;
        });
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
      });
    }
  }

  private _saveProduct(product: Product, successMsg?: string, errMsg?: string) {
    this.productService.saveProduct(product).subscribe(() =>{
      this.product = convertDetailProductToProduct(this.registerProduct);

      if(successMsg) {
        this._valueShareService.setCompleteModal(successMsg, 5000, 'btn-outline-success');
      } else {
        this._valueShareService.setCompleteModal('修正が完了しました。', 5000, 'btn-outline-success');
      }

      if(this.showBottleDeletedAlert) {
        this._checkExisting(this.registerProduct.bottleData, MaterialTypeEn.bo);
      }

      if(this.showInCartonDeletedAlert) {
        this._checkExisting(this.registerProduct.inCartonData, MaterialTypeEn.inCa);
      }

      if(this.showOutCartonDeletedAlert) {
        this._checkExisting(this.registerProduct.outCartonData, MaterialTypeEn.outCa);
      }

      if(this.showTriggerDeletedAlert) {
        this._checkExisting(this.registerProduct.triggerData, MaterialTypeEn.tr);
      }

      if(this.showLabelDeletedAlert) {
        this._checkExisting(this.registerProduct.labelData, MaterialTypeEn.la);
      }

      if(this.showBagDeletedAlert) {
        this._checkExisting(this.registerProduct.bagData, MaterialTypeEn.ba);
      }

      this._formInit();
    }, (err) => {
      console.error(err);
      if(errMsg) {
        this._valueShareService.setCompleteModal(errMsg);
      } else {
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
      }
      this._formInit();
    });
  }

  public deleteImage() {
    this._valueShareService.setLoading(true);
    if(this.product.imageUrl !== '') {
      this._firebaseStorageService.deleteFile(this.product.imageUrl).subscribe(() => {
        this.imageSrc = DetailProductComponent.NO_IMAGE_URL;
        this.product.imageUrl = '';
        this._saveProduct(this.product, '※ 画像を削除しました。', '※ 画像の削除に失敗しました。');
      }, (err) => {
        console.log(err);
        this._valueShareService.setCompleteModal('※ 画像の削除に失敗しました。');
      });
    }
  }

  delete(): void {
    this._valueShareService.setLoading(true);
    this.productService.deleteProductById(this.product.id).subscribe(() => {
      if(this.product.imageUrl !== '') {
        this._firebaseStorageService.deleteFile(this.product.imageUrl).subscribe(() => {
          this._valueShareService.setCompleteModal('削除が完了しました。', 5000, 'btn-outline-success');
    
          setTimeout(() =>{
            this.goBack();
          },5000);
        }, (err) => {
          console.log(err);
          this._valueShareService.setCompleteModal('※ 画像の削除に失敗しました。', 5000);
        });
      } else {
        this._valueShareService.setCompleteModal('削除が完了しました。5秒後に自動的に一覧へ遷移します。', 5000, 'btn-outline-success');
  
        setTimeout(() =>{
          this.goBack();
        },5000);
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 削除に失敗しました。');
    });
  }

  public imageLoadFailed() {
    this._valueShareService.setCompleteModal('※ 画像の読み込みに失敗しました。', 5000);
  }

  public selectImage(file: File) {
    this._selectedImage = file;
    this.isInitInputImage = false;
  }

  goBack(): void {
    this.router.navigate(['/product/list']);
  }

  public cancelMaterialSelected(type: string) {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        this.registerProduct.bottleData = initMaterial();
        this.isBottleSelected = false;
        $('#bottle').val("");
        break;
      case MaterialTypeEn.inCa:
      case MaterialTypeJa.inCa:
        this.registerProduct.inCartonData = initMaterial();
        this.isInCartonSelected = false;
        $('#inCarton').val("");
        break;
      case MaterialTypeEn.outCa:
      case MaterialTypeJa.outCa:
        this.registerProduct.outCartonData = initMaterial();
        this.isOutCartonSelected = false;
        $('#outCarton').val("");
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
}