import { Component, OnInit} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Material } from './../../model/material';
import { MaterialTypeJa } from './../../model/material-type';
import { AngularFirestore } from '@angular/fire/firestore';
import { MaterialService } from './../../service/material-service/material.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-register-material-from-file',
  templateUrl: './register-material-from-file.component.html',
  styleUrls: ['./register-material-from-file.component.scss']
})
export class RegisterMaterialFromFileComponent implements OnInit {

  private readonly _nameKanaPattern: RegExp = /^[ -~-ぁ-ん-ー]*$/;
  private readonly _materialType =  [MaterialTypeJa.bo, MaterialTypeJa.ca, MaterialTypeJa.la, MaterialTypeJa.tr, MaterialTypeJa.ba];

  public csvDataSrc: SafeUrl;
  public csvFileName: string;
  private _registerMaterials: Material[];

  public confirmBodyHtml: string;
  public confirmActionBtn: string;

  public showConfirm: boolean;
  private _confirmCount: number;

  private _showError: boolean;
  private _errorMsg: string;

  constructor(
    private _sanitizer: DomSanitizer,
    private _materialService: MaterialService,
    private _valueShareService: ValueShareService,
    private _afStore: AngularFirestore
  ) { }

  ngOnInit() {
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
    this.csvFileName = `資材一括登録フォーマット.csv`;      

    const csvData: object[] = [
      {
      name: '資材名',
      nameKana: '資材名かな',
      type: '種別',
      limitCount: 'フラグ',
      },
      {
      name: '例1ボトル',
      nameKana: 'れい１ぼとる',
      type: 'ボトル',
      limitCount: '1000',
      },
      {
      name: '例2カートン',
      nameKana: 'れい2かーとん',
      type: 'カートン',
      limitCount: '1000',
      },
      {
      name: '例3ラベル',
      nameKana: 'れい3らべる',
      type: 'ラベル',
      limitCount: '1000',
      },
      {
      name: '例4トリガー',
      nameKana: 'れい4とりがー',
      type: 'トリガー',
      limitCount: '1000',
      },
      {
      name: '例5詰替え袋',
      nameKana: 'れい5つめかえぶくろ',
      type: '詰め替え袋',
      limitCount: '1000',
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
    this._registerMaterials = [];

    const reader: FileReader = new FileReader();
    reader.readAsText(fileList[0]);
    reader.onload = () => {
      const dataArr = reader.result.toString().split('\n').slice(1);
      for(const str of dataArr) {

      const arr = str.split(',');

      if (arr.length !== 4) {
        this._showError = true;
        this._errorMsg = 'フォーマットに従い、1行につき4項目のデータを入力して下さい';
        break;
      }

      // NaN, 0<= の場合
      if (!(Number(arr[3]) > 0)) {
        this._showError = true;
        this._errorMsg = 'フラグには1以上の半角数字のみを入力して下さい。';
        break;
      }

      // タイプチェック
      if (this._materialType.indexOf(arr[2]) === -1) {
        this._showError = true;
        this._errorMsg = '種別にはボトル、カートン、ラベル、トリガー、詰め替え袋のいずれかの値を入力して下さい。';
        break;
      }

      const material: Material = {
        id: this._afStore.createId(),
        name: arr[0].trim(),
        nameKana: arr[1].trim(),
        type: arr[2],
        limitCount: Number(arr[3]),
        imageUrl: ''
      }
      this._registerMaterials.push(material);
      };
      console.log(dataArr);
      console.log(this._registerMaterials);
      this.showConfirm = true;
      this._valueShareService.setLoading(false);
    };
  }

  public submit(): void {
    this._materialService.saveMaterialFromArr(this._registerMaterials).subscribe(() => {
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  private _changeConfirmBody(): void {
    this.confirmBodyHtml = `
    <div class="container-fluid">
      <p>以下の内容で登録を行います。確認してよろしければ「次へ」を押して下さい。</p>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this._registerMaterials[this._confirmCount].name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this._registerMaterials[this._confirmCount].nameKana}</div>
      </div>
      <div class="row">
        <div class="col-4">フラグ</div>
        <div class="col-8 pull-left">${this._registerMaterials[this._confirmCount].limitCount}</div>
      </div>
      <div class="row">
        <div class="col-4">タイプ</div>
        <div class="col-8 pull-left">${this._registerMaterials[this._confirmCount].type}</div>
      </div>
    </div>`;
  }

  public confirm(isFirst: boolean): void {
    if (this._showError) {
      this._valueShareService.setCompleteModal(this._errorMsg, 10000);
    } else {
      if (isFirst) {
        this._confirmCount = 0;
        this._openConfirmModal();
      }
  
      if (this._confirmCount - 1 === this._registerMaterials.length) {
        this.submit();
        this._closeConfirmModal();
        this._formInit();
      } else if (this._confirmCount === this._registerMaterials.length) {
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

  private _openConfirmModal(): void {
    $('#Modal').modal();
  };

  private _closeConfirmModal(): void {
    $('#Modal').modal('hide');
  };
}

