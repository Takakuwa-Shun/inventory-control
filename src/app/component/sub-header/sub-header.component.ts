import { Component, OnInit, Input, Inject, LOCALE_ID } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { Location as AngularLocation } from '@angular/common';
import { firestore } from 'firebase';
import { Location } from './../../model/location';
import { Material } from './../../model/material';
import { Product } from './../../model/product';
import { Company } from './../../model/company';
import { Inventory } from './../../model/inventory';
import { Memo } from './../../model/memo';
import { User } from './../../model/user';
import { ExcelServiceService } from './../../service/excel-service/excel-service.service';
import { ExcelSheet } from './../../model/excel-sheet';

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
  @Input() showExcel: boolean;
  @Input() showPrint: boolean;
  @Input() excelData: object[];
  @Input() locationNameMap: object;
  @Input() iconImageUrl: string;
  @Input() showImage: boolean = false;

  public excelDataSrc: SafeUrl;

  constructor(
    private _location: AngularLocation,
    @Inject(LOCALE_ID) private _locale: string,
    private _excelServiceService: ExcelServiceService,
    ) { }

  ngOnInit() {
  }

  goBack(): void {
    this._location.back();
  }

  print() {
    window.print();
  }

  convertToExcel() {
    const dataType = this._checkType(this.excelData[0]);

    switch(dataType) {
      case type.in:
        this._exportInventorySheet(this.excelData);
        break;
      case type.pr:
        this._exportProductSheet(this.excelData);
        break;
      case type.ma:
        this._exportMaterialSheet(this.excelData);
        break;
      case type.user:
        this._exportUserSheet(this.excelData);
        break;
      case type.memo:
        this._exportMemoSheet(this.excelData);
        break;
      case type.com:
        this._exportCompanySheet(this.excelData);
        break;
      case type.lo:
        this._exportLocationSheet(this.excelData);
        break;
      default:
        console.error('typeおかしいよ : ' + type);
        break;
    }
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

    // 倉庫の場合
    if('isFactory' in obj) {
      return type.lo;
    }

    // 得意先の場合
    if('name' in obj) {
      return type.com;
    }

    // どれでもない
    return type.err;
  }

  private _exportMaterialSheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const m = obj as Material;
      const data = {
        "資材コード" : m.id,
        "資材名": m.name,
        "資材名かな": m.nameKana,
        "種別": m.type,
        "フラグ": m.limitCount,
        "画像パス": m.imageUrl,
        "ステータス": m.status,
      };
      json.push(data);
    }

    const title = list[0] as Material;

    const excelSheet: ExcelSheet[] = [{
      sheetName: `${title.type}一覧`,
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, `${title.type}一覧`);
  }

  private _exportProductSheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const p = obj as Product;

      if(p.companyId === null) {
        p.companyId = '';
      }

      if(p.bottleId === null) {
        p.bottleId = '';
      }

      if(p.triggerId === null) {
        p.triggerId = '';
      }

      if(p.labelId === null) {
        p.labelId = '';
      }

      if(p.bagId === null) {
        p.bagId = '';
      }

      if(p.inCartonId === null) {
        p.inCartonId = '';
      }

      if(p.outCartonId === null) {
        p.outCartonId = '';
      }

      const data = {
        "得意先コード" : p.companyId,
        "得意先名": p.companyName,
        "商品名": p.name,
        "商品名かな": p.nameKana,
        "画像パス": p.imageUrl,
        "ボトルコード": p.bottleId,
        "ボトル名": p.bottleName,
        "トリガーコード": p.triggerId,
        "トリガー名": p.triggerName,
        "ラベルコード": p.labelId,
        "ラベル名": p.labelName,
        "詰め替え袋コード": p.bagId,
        "詰め替え袋名": p.bagName,
        "内側カートンコード": p.inCartonId,
        "内側カートン名": p.inCartonName,
        "外側カートンコード": p.outCartonId,
        "外側カートン名": p.outCartonName,
      };
      json.push(data);
    }

    const excelSheet: ExcelSheet[] = [{
      sheetName: '商品一覧',
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, '商品一覧');
  }

  private _exportUserSheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const u = obj as User;
      const data = {
        "担当者名" : u.displayName,
        "メールアドレス": u.email,
      };
      json.push(data);
    }

    const excelSheet: ExcelSheet[] = [{
      sheetName: '担当者一覧',
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, '担当者一覧');
  }

  private _exportMemoSheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const m = obj as Memo;
      const data = {
        "備考内容" : m.content,
      };
      json.push(data);
    }

    const excelSheet: ExcelSheet[] = [{
      sheetName: '備考一覧',
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, '備考一覧');
  }

  private _exportCompanySheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const c = obj as Company;
      const data = {
        "得意先コード" : c.id,
        "得意先名" : c.name,
        "得意先名かな" : c.nameKana,
      };
      json.push(data);
    }

    const excelSheet: ExcelSheet[] = [{
      sheetName: '得意先一覧',
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, '得意先一覧');
  }

  private _exportLocationSheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const l = obj as Location;
      const data = {
        "倉庫コード" : l.id,
        "倉庫名" : l.name,
        "倉庫名かな" : l.nameKana,
      };
      json.push(data);
    }

    const excelSheet: ExcelSheet[] = [{
      sheetName: '倉庫一覧',
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, '倉庫一覧');
  }

  private _exportInventorySheet(list: object[]): void {
    const json = [];
    for (const obj of list) {
      const i = obj as Inventory;
      const date = formatDate(new firestore.Timestamp(i.date['seconds'], i.date['nanoseconds']).toDate(), "yy年MM月dd日", this._locale);
      const data = {
        "日付": date,
        "担当者": i.userName,
        "対象の名前": i.targetName,
        "数量": i.addCount,
        "作業項目": i.actionType,
        "作業詳細": i.actionDetail,
        "備考": i.memo,
      };
      Object.keys(this.locationNameMap).map((locationId: string) => {
        data[this.locationNameMap[locationId]] = `${i.locationCount[locationId]}`;
      });
      data["全倉庫合計"] = i.sumCount;
      json.push(data);
    }

    const title = list[0] as Inventory;

    const excelSheet: ExcelSheet[] = [{
      sheetName: `${title.targetName}一覧`,
      json: json
    }];

    this._excelServiceService.exportAsExcelFile(excelSheet, `${title.targetName}一覧`);
  }

  private _setInventryCsv(list: object[]): string {
    const locationNameObj = list[0]['locationCount'];
    let csv = '';
    let cnt = 0;
    for (const obj of list) {
      const i = obj as Inventory;

      let locationCountCsv: string = '';
      Object.keys(locationNameObj).map((locationId: string) => {
        locationCountCsv += `${i.locationCount[locationId]},`;
      });
      locationCountCsv = locationCountCsv.slice( 0, -1);

      let date;
      if (cnt === 0) {
        date = i.date;
      } else {
        date = formatDate(new firestore.Timestamp(i.date['seconds'], i.date['nanoseconds']).toDate(), "yy年MM月dd日", this._locale);
      }
      csv += `${date},${i.userName},${i.targetName},${i.addCount},${i.actionType},${i.actionDetail},${i.memo},${locationCountCsv}${i.sumCount}\n`;
      ++cnt;
    }

    return csv;
  }
}
