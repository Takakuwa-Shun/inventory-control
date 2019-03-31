import { Component, OnInit} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Product, initDetailProduct, DetailProduct, convertDetailProductToProduct } from './../../model/product';
import { Company } from './../../model/company';
import { Material } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from './../../model/material-type';
import { AngularFirestore } from '@angular/fire/firestore';
import { MaterialService } from './../../service/material-service/material.service';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-register-product-from-file',
  templateUrl: './register-product-from-file.component.html',
  styleUrls: ['./register-product-from-file.component.scss']
})
export class RegisterProductFromFileComponent implements OnInit {

  private _bottleLoaded = false;
  private _cartonLoaded = false;
  private _labelLoaded = false;
  private _triggerLoaded = false;
  private _bagLoaded = false;
  private _companyLoaded = false;

  private _bottleLists: Material[];
  private _cartonLists: Material[];
  private _labelLists: Material[];
  private _triggerLists: Material[];
  private _bagLists: Material[];
  private _companyLists: Company[];

  private readonly _kanaRegExp: RegExp = /^[ -~-ぁ-ん-ー]*$/;

  public csvDataSrc: SafeUrl;
  public csvFileName: string;
  private _registerProducts: Product[];

  public confirmBodyHtml: string;
  public confirmActionBtn: string;

  public showConfirm: boolean;
  private _confirmCount: number;

  private _showError: boolean;
  private _errorMsg: string;

  constructor(
    private _sanitizer: DomSanitizer,
    private _materialService: MaterialService,
    private _companyService: CompanyService,
    private _productService: ProductService,
    private _valueShareService: ValueShareService,
    private _afStore: AngularFirestore
  ) { }

  ngOnInit() {
    this._fetchAllDatas();
    this._setFormatCsv();
    this._formInit();
  }

  private _formInit(): void {
    $('#readCsv').val('');
    this._showError = false;
    this.showConfirm = false;
    this._confirmCount = 0;
  }

  private _setFormatCsv(): void {
    // ファイル名を作成
    this.csvFileName = `商品一括登録フォーマット.csv`;      

    const csvData: object[] = [
      {
        companyId: '得意先コード',
        companyName: '得意先名',
        name: '商品名',
        nameKana: '商品名かな',
        bottleId: 'ボトルコード',
        bottleName: 'ボトル名',
        triggerId: 'トリガーコード',
        triggerName: 'トリガー名',
        labelId: 'ラベルコード',
        labelName: 'ラベル名',
        bagId: '詰め替え袋コード',
        bagName: '詰め替え袋名',
        inCartonId: '内側カートンコード',
        inCartonName: '内側カートン名',
        outCartonId: '外側カートンコード',
        outCartonName: '外側カートン名',
      },
      {
        companyId: '7tL81CKNpSVoFwl4ut26',
        companyName: 'マイスター',
        name: '例1　本体',
        nameKana: 'れい1 ほんたい',
        bottleId: 'NbvmfcTUtwZBhzt5MvQ0',
        bottleName: ' 120ｍｌ角ボトル',
        triggerId: 'i570di5hzloJaqDXkHxp',
        triggerName: ' JMトリガー　ＴＳ-031',
        labelId: '',
        labelName: '',
        bagId: '',
        bagName: '',
        inCartonId: 'I8cUUFmdu2fGi08uK8k1',
        inCartonName: '10．ﾘｯｸ500ml 12本入Fﾎﾞﾄﾙ 292X252X238',
        outCartonId: '',
        outCartonName: '',
      },
    ];

    let csv = '';

    csvData.forEach((obj: Object) => {
      Object.keys(obj).map((key) => {
        csv += `${obj[key]},`;
      });
      csv = csv.slice( 0, -1);
      csv += '\n';
    });
    csv = csv.slice( 0, -2);


    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([ bom, csv], { "type" : "text/csv" });
    this.csvDataSrc = this._sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
  }

  public selectCsv(fileList: FileList): void {
    if (fileList.length === 0) {
      return;
    }
    this._valueShareService.setLoading(true);
    this._showError = false;
    this._registerProducts = [];

    const reader: FileReader = new FileReader();
    reader.readAsText(fileList[0]);
    reader.onload = () => {
      const dataArr = reader.result.toString().split('\n').slice(1);
      for(const str of dataArr) {

        const arr = str.split(',');

        if(arr[2] !== '' || arr[3] !== '') {
          const detailProduct: DetailProduct = initDetailProduct();

          if (arr[2] === '' || arr[3] === '') {
            console.log(arr);
            this._showError = true;
            this._errorMsg = `「${arr[2]}」に関して、商品名、商品名かなは必ず入力しなければなりません`;
            break;
          }

          if (!this._kanaRegExp.test(arr[3].trim())) {
            console.log(arr);
            this._showError = true;
            this._errorMsg = `「${arr[2]}」に関して、商品名かなには、全角かな・半角英数字・半角記号・半角スペース以外は入力しないでください`;
            break;
          }

          // 得意先
          if(arr[0] === '') {
            detailProduct.companyData.id = null;
            detailProduct.companyData.name = '-';
          } else {
            const arrCompany = this._companyLists.filter(val => val.id === arr[0].trim());
            if(arrCompany.length === 0) {
              console.log(arr);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない得意先コードを入力しています。`;
              break;
            } else {
              detailProduct.companyData = arrCompany[0];
            }
          }

          // ボトル
          if(arr[4] === '') {
            detailProduct.bottleData.id = null;
            detailProduct.bottleData.name = '-';
          } else {
            const arrBottle = this._bottleLists.filter(val => val.id === arr[4].trim());
            if(arrBottle.length === 0) {
              console.log(arr);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない${MaterialTypeJa.bo}コードを入力しています。`;
              break;
            } else {
              detailProduct.bottleData = arrBottle[0];
            }
          }

          // トリガー
          if(arr[6] === '') {
            detailProduct.triggerData.id = null;
            detailProduct.triggerData.name = '-';
          } else {
            const arrTrigger = this._triggerLists.filter(val => val.id === arr[6].trim());
            if(arrTrigger.length === 0) {
              console.log(arr);
              console.log(arr[6]);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない${MaterialTypeJa.tr}コードを入力しています。`;
              break;
            } else {
              detailProduct.triggerData = arrTrigger[0];
            }
          }

          // ラベル
          if(arr[8] === '') {
            detailProduct.labelData.id = null;
            detailProduct.labelData.name = '-';
          } else {
            const arrLabel = this._labelLists.filter(val => val.id === arr[8].trim());
            if(arrLabel.length === 0) {
              console.log(arr);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない${MaterialTypeJa.la}コードを入力しています。`;
              break;
            } else {
              detailProduct.labelData = arrLabel[0];
            }
          }

          // 詰め替え袋
          if(arr[10] === '') {
            detailProduct.bagData.id = null;
            detailProduct.bagData.name = '-';
          } else {
            const arrBag = this._bagLists.filter(val => val.id === arr[10].trim());
            if(arrBag.length === 0) {
              console.log(arr);
              console.log(arr[10]);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない${MaterialTypeJa.ba}コードを入力しています。`;
              break;
            } else {
              detailProduct.bagData = arrBag[0];
            }
          }

          // 内側カートン
          if(arr[12] === '') {
            detailProduct.inCartonData.id = null;
            detailProduct.inCartonData.name = '-';
          } else {
            const arrInCarton = this._cartonLists.filter(val => val.id === arr[12].trim());
            if(arrInCarton.length === 0) {
              console.log(arr);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない${MaterialTypeJa.inCa}コードを入力しています。`;
              break;
            } else {
              detailProduct.inCartonData = arrInCarton[0];
            }
          }

          // 外側カートン
          if(arr[14] === '') {
            detailProduct.outCartonData.id = null;
            detailProduct.outCartonData.name = '-';
          } else {
            const arrOutCarton = this._cartonLists.filter(val => val.id === arr[14].trim());
            if(arrOutCarton.length === 0) {
              console.log(arr);
              console.log(arr[14]);
              this._showError = true;
              this._errorMsg = `「${arr[2]}」に関して、存在しない${MaterialTypeJa.outCa}コードを入力しています。`;
              break;
            } else {
              detailProduct.outCartonData = arrOutCarton[0];
            }
          }

          detailProduct.id = this._afStore.createId();
          detailProduct.name = arr[2].trim();
          detailProduct.nameKana = arr[3].trim();
    
          const product: Product = convertDetailProductToProduct(detailProduct);
          this._registerProducts.push(product);
        }
      };
      if(this._registerProducts.length === 0) {
        console.log(dataArr);
        this._showError = true;
        this._errorMsg = `登録すべきデータがありません。※ 商品名は必ず含めて下さい。`;
      }
      console.log(this._registerProducts);
      this.showConfirm = true;
      this._valueShareService.setLoading(false);
    };
  }

  public submit(): void {
    this._productService.saveProductFromArr(this._registerProducts).subscribe(() => {
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  private _changeConfirmBody(): void {

    let company: string = '';
    let bottle: string = '';
    let trigger: string = '';
    let label: string = '';
    let bag: string = '';
    let inCarton: string = '';
    let outCarton: string = '';

    if(this._registerProducts[this._confirmCount].companyId !== null) {
      company = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.com}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].companyName}</div>
        </div>`;
    }

    if(this._registerProducts[this._confirmCount].bottleId !== null) {
      bottle = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.bo}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].bottleName}</div>
        </div>`;
    }

    if(this._registerProducts[this._confirmCount].triggerId !== null) {
      trigger = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.tr}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].triggerName}</div>
        </div>`;
    }

    if(this._registerProducts[this._confirmCount].labelId !== null) {
      label = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.la}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].labelName}</div>
        </div>`;
    }

    if(this._registerProducts[this._confirmCount].bagId !== null) {
      bag = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.ba}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].bagName}</div>
        </div>`;
    }

    if(this._registerProducts[this._confirmCount].inCartonId !== null) {
      inCarton = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.inCa}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].inCartonName}</div>
        </div>`;
    }

    if(this._registerProducts[this._confirmCount].outCartonId !== null) {
      outCarton = `
        <div class="row">
          <div class="col-4">${MaterialTypeJa.outCa}名</div>
          <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].outCartonName}</div>
        </div>`;
    }


    this.confirmBodyHtml = `
    <div class="container-fluid">
      <p>以下の内容で登録を行います。確認してよろしければ「次へ」を押して下さい。</p>
      ${company}
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this._registerProducts[this._confirmCount].nameKana}</div>
      </div>
      ${bottle}
      ${trigger}
      ${label}
      ${bag}
      ${inCarton}
      ${outCarton}
    </div>`;
  }

  public confirm(isFirst: boolean): void {
    if (this._showError) {
      this._valueShareService.setCompleteModal(this._errorMsg, 20000);
    } else {
      if (isFirst) {
        this._confirmCount = 0;
        this._openConfirmModal();
      }
  
      if (this._confirmCount - 1 === this._registerProducts.length) {
        this.submit();
        this._closeConfirmModal();
        this._formInit();
      } else if (this._confirmCount === this._registerProducts.length) {
        this.confirmBodyHtml = `
        <div class="container-fluid">
          <p>以上の内容で登録を行います。よろしいでしょうか？</p>
        </div>`;
        this._confirmCount += 1;
        this.confirmActionBtn = '登録'
      } else {
        this._changeConfirmBody();
        this._confirmCount += 1;
        this.confirmActionBtn = '次へ'
      }
    }
  }

  private _fetchAllDatas():void {

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this._bottleLists = res;
      this._bottleLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this._cartonLists = res;
      this._cartonLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ca}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this._labelLists = res;
      this._labelLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.la}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this._triggerLists = res;
      this._triggerLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
    });

    this._materialService.fetchMaterialListWhereStatusIsUse(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this._bagLists = res;
      this._bagLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
    });

    this._companyService.fetchCompanies().subscribe((res: Company[]) => {
      this._companyLists = res;
      this._companyLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal(`※ 得意先データの取得に失敗しました。`, 10000);
    });
  }

  private _checkLoaded() {
    if (this._bottleLoaded && this._cartonLoaded && this._labelLoaded && this._triggerLoaded && this._bagLoaded && this._companyLoaded) {
      this._valueShareService.setLoading(false);
    }
  }

  private _openConfirmModal(): void {
    $('#Modal').modal();
  };

  private _closeConfirmModal(): void {
    $('#Modal').modal('hide');
  };
}

