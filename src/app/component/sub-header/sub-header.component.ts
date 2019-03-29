import { Component, OnInit, Input, Inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { formatDate, Location } from '@angular/common';
import { firestore } from 'firebase';
import { Material } from './../../model/material';
import { Product } from './../../model/product';
import { Company } from './../../model/company';
import { Inventory } from './../../model/inventory';
import { Memo } from './../../model/memo';
import { User } from './../../model/user';

const type = {
  in : 'inventory',
  ma: 'material',
  user: 'user',
  memo: 'memo',
  pr: 'product',
  lo: 'location',
  com: 'company',
  err: 'error', 
}

@Component({
  selector: 'app-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.css']
})
export class SubHeaderComponent implements OnInit {

  @Input() title: string;
  @Input() showCsv: boolean;
  @Input() showPrint: boolean;
  @Input() csvData: object[];
  @Input() csvFileName: string;
  @Input() iconImageUrl: string;
  @Input() showImage: boolean = false;

  public csvDataSrc: SafeUrl;

  constructor(
    private _sanitizer: DomSanitizer,
    private _location: Location,
    @Inject(LOCALE_ID) private _locale: string
    ) { }

  ngOnInit() {
  }

  goBack(): void {
    this._location.back();
  }

  print() {
    window.print();
  }

  convertToCsv() {

    // ファイル名を作成
    const date = formatDate(new Date(), "yyyyMMdd_HHmm", this._locale);
    if (this.csvFileName) {
      this.csvFileName = `${this.csvFileName}_${date}.csv`;
    } else {
      this.csvFileName = `${this.title}_${date}.csv`;      
    }

    const dataType = this._checkType(this.csvData[0]);
    let csv: string;

    switch(dataType) {
      case type.in:
        csv = this._setInventryCsv(this.csvData);
        break;
      case type.pr:
        csv = this._setProductCsv(this.csvData);
        break;
      case type.ma:
        csv = this._setMaterialCsv(this.csvData);
        break;
      case type.user:
        csv = this._setUserCsv(this.csvData);
        break;
      case type.memo:
        csv = this._setMemoCsv(this.csvData);
        break;
      case type.com:
        csv = this._setCompanyCsv(this.csvData);
        break;
      case type.lo:
        csv = this._setCompanyCsv(this.csvData);
        break;
      default:
        console.error('typeおかしいよ : ' + type);
        break;
    }

    // console.log(csv)

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const option: BlobPropertyBag = { "type" : "text/csv" };
    const blob = new Blob([ bom, csv], option);
    this.csvDataSrc = this._sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
  }

  private _checkType(obj: object): string{

    // 在庫の場合
    if('targetName' in obj) {
      return type.in;
    }

    // 商品の場合
    if('companyName' in obj) {
      return type.pr;
    }

    // 資材の場合
    if('type' in obj) {
      return type.ma;
    }

    // 備考の場合
    if('content' in obj) {
      return type.memo;
    }

    // ユーザーの場合
    if('displayName' in obj) {
      return type.user;
    }

    // 得意先の場合
    if('name' in obj) {
      return type.com;
    }

    // 倉庫の場合
    if('name' in obj) {
      return type.lo;
    }

    // どれでもない
    return type.err;
  }

  private _setMaterialCsv(list: object[]): string {
    let csv = '';
    list.forEach((obj: object) => {
      const m = obj as Material;
      csv += `${m.name}, ${m.nameKana}, ${m.type}, ${m.limitCount}, ${m.imageUrl}\n`;
    });
    return csv;
  }

  private _setProductCsv(list: object[]): string {
    let csv = '';
    list.forEach((obj: object) => {
      const p = obj as Product;
      csv += `${p.companyName}, ${p.name}, ${p.nameKana}, ${p.imageUrl}, ${p.bottleName}, ${p.triggerName}, ${p.labelName}, ${p.bagName}, ${p.inCartonName}, ${p.outCartonName}\n`;
    });
    return csv;
  }

  private _setUserCsv(list: object[]): string {
    let csv = '';
    list.forEach((obj: object) => {
      const u = obj as User;
      csv += `${u.displayName}, ${u.email}\n`;
    });
    return csv;
  }

  private _setMemoCsv(list: object[]): string {
    let csv = '';
    list.forEach((obj: object) => {
      const m = obj as Memo;
      csv += `${m.content}\n`;
    });
    return csv;
  }

  private _setCompanyCsv(list: object[]): string {
    let csv = '';
    list.forEach((obj: object) => {
      const c = obj as Company;
      csv += `${c.name}, ${c.nameKana}\n`;
    });
    return csv;
  }

  private _setInventryCsv(list: object[]): string {
    const locationNameObj = list[0]['locationCount'];
    let csv = '';
    let cnt = 0;
    for (const obj of list) {
      const i = obj as Inventory;

      let locationCountCsv: string = '';
      Object.keys(locationNameObj).map((locationId: string) => {
        locationCountCsv += `${i.locationCount[locationId]}, `;
      });
      locationCountCsv = locationCountCsv.slice( 0, -1);

      let date;
      if (cnt === 0) {
        date = i.date;
      } else {
        date = formatDate(new firestore.Timestamp(i.date['seconds'], i.date['nanoseconds']).toDate(), "yy年MM月dd日", this._locale);
      }
      csv += `${date}, ${i.userName}, ${i.targetName}, ${i.addCount}, ${i.actionType}, ${i.actionDetail}, ${i.memo}, ${locationCountCsv}${i.sumCount}\n`;
      ++cnt;
    }

    return csv;
  }
}
