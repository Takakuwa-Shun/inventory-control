import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate} from '@angular/common';
import { firestore } from 'firebase';
import { MaterialTypeEn, MaterialTypeJa, convertEnToJa } from './../../model/material-type';
import { LocationService } from './../../service/location-service/location.service';
import { Location } from './../../model/location';
import { Inventory, initInventory } from './../../model/inventory';
import { InventoryService } from './../../service/inventory-service/inventory.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service';
import { ExcelServiceService } from './../../service/excel-service/excel-service.service';
import { ExcelSheet } from './../../model/excel-sheet';

interface Backup {
  bottle?: Inventory[][];
  trigger?: Inventory[][];
  label?: Inventory[][];
  carton?: Inventory[][];
  bag?: Inventory[][];
};

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {

  public readonly listTarget = [ MaterialTypeJa.all, MaterialTypeJa.bo, MaterialTypeJa.tr, MaterialTypeJa.la, MaterialTypeJa.ba, MaterialTypeJa.ca];   

  public readonly listRange = [
    { value:  1, name: "1日分" },
    { value:  3, name: "3日分" },
    { value:  7, name: "7日分" },
  ];

  public selectedTargetType: string;
  public selectedRange: number;

  private readonly _locationCountMap: object = {};
  private _backupInventory: Inventory[][];
  private _backupAllInventory: Backup;

  private _locationLoaded: boolean = false;
  private _inventoryLoaded: boolean = false;

  constructor(
    @Inject(LOCALE_ID) private _locale: string,
    private _valueShareService: ValueShareService,
    private _inventoryService: InventoryService,
    private _locationService: LocationService,
    private _excelServiceService: ExcelServiceService,
  ) { }

  ngOnInit() {
    this.selectedTargetType = MaterialTypeJa.all;
    this.selectedRange = 1;
    this._init();
  }

  private _init(): void {
    this._backupInventory = [];
    this._backupAllInventory = {
      bottle : null,
      trigger: null,
      label : null,
      carton : null,
      bag : null 
    };
  }

  public create(): void {
    this._valueShareService.setLoading(true);
    this._init();
    if(!this._locationLoaded) {
      this._fetchAllLocations();
    }
    if (this.selectedTargetType === MaterialTypeJa.all) {
      this._fetchBackupInventory(MaterialTypeEn.bo, true);
      this._fetchBackupInventory(MaterialTypeEn.tr, true);
      this._fetchBackupInventory(MaterialTypeEn.la, true);
      this._fetchBackupInventory(MaterialTypeEn.ca, true);
      this._fetchBackupInventory(MaterialTypeEn.ba, true);
    } else {
      this._fetchBackupInventory(this.selectedTargetType, false);
    }
  }

  private _exportFile() {
    if(this._inventoryLoaded && this._locationLoaded) {
      this._inventoryLoaded = false;

      if (this.selectedTargetType === MaterialTypeJa.all) {
        let showError = false;
        for (const key of Object.keys(this._backupAllInventory)) {
          const dataset: ExcelSheet[] = [];
          const backupInventory: Inventory[][] = this._backupAllInventory[key];
          for (const list of backupInventory) {
            if(list.length > 0) {
              const e = this._setExcelSheet(list);
              dataset.push(e);
            }
          }
          console.log(dataset);
          if(dataset.length > 0) {
            this._excelServiceService.exportAsExcelFile(dataset, `${convertEnToJa(key)}のバックアップ`);
          } else {
            showError = true;
          }
        }
        if(showError) {
          this._valueShareService.setLoading(false);
          this._valueShareService.setCompleteModal('※ 一部、バックアップすべきデータが存在しません。設定を変更して再度お試し下さい。', 10000);
        } 
      } else {
        const dataset: ExcelSheet[] = [];
        for (const list of this._backupInventory) {
          if(list.length > 0) {
            const e = this._setExcelSheet(list);
            dataset.push(e);
          }
        }
        if(dataset.length > 0) {
          this._excelServiceService.exportAsExcelFile(dataset, `${this.selectedTargetType}のバックアップ`);
        } else {
          this._valueShareService.setLoading(false);
          this._valueShareService.setCompleteModal('※ バックアップすべきデータが存在しません。設定を変更して再度お試し下さい。', 10000);
        }
      }
    }
  }

  private _setExcelSheet(list: Inventory[]): ExcelSheet {
    const json = [];
    for (const i of list) {
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
      Object.keys(this._locationCountMap).map((locationId: string) => {
        data[this._locationCountMap[locationId]] = `${i.locationCount[locationId]}`;
      });
      data["全倉庫合計"] = i.sumCount;
      json.push(data);
    }

    const excelSheet: ExcelSheet = {
      sheetName: list[0].targetName,
      json: json
    };
    return excelSheet;
  }

  private _fetchAllLocations():void {
    this._locationService.fetchLocations().subscribe((res: Location[]) => {
      for (const l of res) {
        this._locationCountMap[l.id] = l.name;
      }
      this._locationLoaded = true;
      this._exportFile();
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 倉庫のデータの取得に失敗しました。', 10000);
    });
  }

  private _fetchBackupInventory(type: string, isAll: boolean):void {
    this._inventoryService.fetchBackupInventory(type, this.selectedRange).subscribe((res: Object) => {
      const list: Inventory[][] = [];
      for (const key of Object.keys(res)){
        list.push(res[key] as Inventory[]);
      }

      if(isAll) {
        switch(type) {
          case MaterialTypeEn.bo:
          case MaterialTypeJa.bo:
            this._backupAllInventory.bottle = list;
            break;
          case MaterialTypeEn.tr:
          case MaterialTypeJa.tr:
            this._backupAllInventory.trigger = list;
            break;
          case MaterialTypeEn.la:
          case MaterialTypeJa.la:
            this._backupAllInventory.label = list;
            break;
          case MaterialTypeEn.ca:
          case MaterialTypeJa.ca:
            this._backupAllInventory.carton = list;
            break;
          case MaterialTypeEn.ba:
          case MaterialTypeJa.ba:
            this._backupAllInventory.bag = list;
            break;
          default:
            console.log(`typeおかしいぞ: ${type}`);
        }

        if(this._backupAllInventory.bottle !== null &&
           this._backupAllInventory.trigger !== null &&
           this._backupAllInventory.label !== null &&
           this._backupAllInventory.carton !== null &&
           this._backupAllInventory.bag !== null) {
            this._inventoryLoaded = true;
            this._exportFile();
        }
      } else {
        this._backupInventory = list;
        this._inventoryLoaded = true;
        this._exportFile();
      }
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ バックアップデータの取得に失敗しました。', 10000);
    });
  }

}
