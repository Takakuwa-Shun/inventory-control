import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';
import { Inventory } from '../../model/inventory';
import { Location } from './../../model/location';
import { Material, initMaterial } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from '../../model/material-type';
import { InventoryService } from './../../service/inventory-service/inventory.service';
import { LocationService } from './../../service/location-service/location.service';
import { LocalStorageService } from './../../service/local-storage-service/local-storage.service';
import { MaterialService } from './../../service/material-service/material.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service';
declare const $;

interface CheckLocation extends Location {
  checked: boolean;
}

@Component({
  selector: 'app-list-inventory',
  templateUrl: './list-inventory.component.html',
  styleUrls: ['./list-inventory.component.css']
})
export class ListInventoryComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public listInventory: Inventory[] = [];
  public locationNameMap: object = {};

  public listSelectedLocation: Location[];
  private _bottleLists: Material[];
  private _cartonLists: Material[];
  private _labelLists: Material[];
  private _triggerLists: Material[];
  private _bagLists: Material[];
  public searchList: Material[] = [];
  public selectedTargetType: string;
  public selectedTarget: Material = initMaterial();
  public isTargetSelected: boolean;
  public listLocationForFilter: CheckLocation[] = [];
  public selectedLocationIds: string[];

  public imageSrc: string;
  public showLimit: number;

  public startDate: Date;
  public endDate: Date;
  public startDateStr: string;
  public endDateStr: string;
  public showDateAlert: boolean;

  public targetSearchPlaceholder: string = '先に資材タイプを選択してください。';
  public targetNoMatchFoundText: string = '検索できません。先に資材タイプを選択してください。';

  public showTarget: Material;
  public showTargetAlert: boolean;

  public noNext: boolean = false;
  public noPrevious: boolean = false;

  public readonly listTarget = [
    { value: MaterialTypeEn.bo, name: MaterialTypeJa.bo },
    { value: MaterialTypeEn.tr, name: MaterialTypeJa.tr },
    { value: MaterialTypeEn.la, name: MaterialTypeJa.la },
    { value: MaterialTypeEn.ba, name: MaterialTypeJa.ba },
    { value: MaterialTypeEn.ca, name: MaterialTypeJa.ca },
  ];

  public readonly listLimit = [10, 30, 50];

  constructor(
    private inventoryService: InventoryService,
    private _locationService: LocationService,
    private _localStorage: LocalStorageService,
    private _materialService: MaterialService,
    private _firebaseStorageService: FirebaseStorageService,
    private _valueShareService: ValueShareService,
    @Inject(LOCALE_ID) private _locale: string
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.selectedTarget.name = '検索欄から選択して下さい';
    this.showLimit = 10;

    this.showTargetAlert = false;
    this.isTargetSelected = false;
    this.showDateAlert = false;
    this.imageSrc = ListInventoryComponent.NO_IMAGE_URL;

    this._filterInit();
    this._fetchAllLocations();
  }

  public search(): void {
    this._valueShareService.setLoading(true);
    this.showTarget = this.selectedTarget;

    this.selectedLocationIds = [];
    for(const l of this.listLocationForFilter) {
      if(l.checked) {
        this.selectedLocationIds.push(l.id);
      }
    }
    this._localStorage.setItem('selectedTargetType', this.selectedTargetType);
    this._localStorage.setItem('startDateStr', this.startDateStr);
    this._localStorage.setObject('selectedLocationIds', this.selectedLocationIds);
    this._localStorage.setObject('showTarget', this.showTarget);
    this._downloadImage();
    this._setListSelectedLocation();
    this._fetchInventoryList();
  }

  private _downloadImage() {
    if (this.showTarget && this.showTarget.imageUrl) {
      this._firebaseStorageService.fecthDownloadUrl(this.showTarget.imageUrl).subscribe((res: string) => {
        this.imageSrc = res;
      }, (err) => {
        console.error(err);
        this.imageSrc = ListInventoryComponent.NO_IMAGE_URL;
        this._valueShareService.setCompleteModal('※ 画像の取得に失敗しました。');
      });
    } else {
      this.imageSrc = ListInventoryComponent.NO_IMAGE_URL;
    }
  }

  private _filterInit(): void {

    if (this._localStorage.getItem('startDateStr')) {
      this.startDateStr = formatDate(this._localStorage.getItem('startDateStr'), "yyyy-MM-dd", this._locale);
    } else {
      this.startDateStr = formatDate(new Date('2019/03/01'), "yyyy-MM-dd", this._locale);
    }
    this.endDateStr = formatDate(new Date(), "yyyy-MM-dd", this._locale);
    this.changeDate();

    if (this._localStorage.getItem('selectedTargetType')) {
      this.selectedTargetType = this._localStorage.getItem('selectedTargetType');
    } else {
      this.selectedTargetType = this.listTarget[0].value;
    }
    this.changeTargetType();

    if (this._localStorage.getObject('selectedLocationIds')) {
      this.selectedLocationIds = this._localStorage.getObject('selectedLocationIds');
    } else { 
      this.selectedLocationIds = [];
    }

    if (this._localStorage.getObject('showTarget')) {
      this.showTarget = this._localStorage.getObject('showTarget');
      this.changeTarget(this.showTarget);
    } else {
      this.showTarget = initMaterial();
    }
    this._downloadImage();
  }

  public getFollowingList(isNext: boolean) {
    this._valueShareService.setLoading(true);;
    this.inventoryService.fetchFollowingInventoryLists(isNext, this.selectedTargetType, this.showTarget.id, this.startDate, this.endDate, this.showLimit, this.selectedLocationIds)
    .subscribe((res: Inventory[]) => {
      if (res.length > 0) {
        this.noNext = false;
        this.noPrevious = false;
        this.listInventory = res;
      } else {
        if (isNext) {
          this.noNext = true;
        } else {
          this.noPrevious = true;
        }
      }
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  public changeDate() {
    this.startDate = new Date(this.startDateStr);
    this.endDate = new Date(this.endDateStr);

    this.startDate.setHours(0, 0, 0);
    this.endDate.setHours(23, 59, 59, 999);

    if (this.startDate > this.endDate) {
      this.showDateAlert = true;
    } else {
      this.showDateAlert = false;
    }
  }

  public autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  public changeTarget(data): void {
    if (typeof data === 'string') {
      this.showTargetAlert = true;
      this.isTargetSelected = false;
    } else {
      this.isTargetSelected = true;
      this.showTargetAlert = false;
      this.selectedTarget = data;
    }
  }

  public changeTargetType(): void {
    this.isTargetSelected = false;
    this.selectedTarget = null;
    $('#search-target').val('');

    switch(this.selectedTargetType) {
      case MaterialTypeEn.bo:
        this.targetSearchPlaceholder = `${MaterialTypeJa.bo}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.bo}はありません。`;
        return this._fetchAllBottles();
      case MaterialTypeEn.ca:
        this.targetSearchPlaceholder = `${MaterialTypeJa.ca}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.ca}はありません。`;
        return this._fetchAllCartons();
      case MaterialTypeEn.la:
        this.targetSearchPlaceholder = `${MaterialTypeJa.la}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.la}はありません。`;
        return this._fetchAllLabels();
      case MaterialTypeEn.tr:
        this.targetSearchPlaceholder = `${MaterialTypeJa.tr}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.tr}はありません。`;
        return this._fetchAllTriggers();
      case MaterialTypeEn.ba:
        this.targetSearchPlaceholder = `${MaterialTypeJa.ba}を検索してください`;
        this.targetNoMatchFoundText = `該当する${MaterialTypeJa.ba}はありません。`;
        return this._fetchAllBags();
      default:
        console.error('タイプおかしい : ' + this.selectedTargetType);
        this.targetSearchPlaceholder = '先に資材タイプを選択してください。';
        this.targetNoMatchFoundText = '検索できません。先に資材タイプを選択してください。';
    }
  }

  private _fetchInventoryList(): void {
    this.inventoryService.fetchInventoryListsByTargetIdAndDate(this.selectedTargetType, this.showTarget.id, this.startDate, this.endDate, this.showLimit, this.selectedLocationIds)
    .subscribe((res: Inventory[]) => {
      this.noNext = false;
      this.noPrevious = false;
      this.listInventory = res;
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  private _fetchAllBottles():void {
    if(this._bottleLists) {
      this.searchList = this._bottleLists;
    } else {
      this._valueShareService.setLoading(true);;
      this._materialService.fetchMaterialList(MaterialTypeEn.bo).subscribe((res: Material[]) => {
        this._bottleLists = res;
        this.searchList = this._bottleLists;
        this._valueShareService.setLoading(false);;
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.bo}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllCartons():void {
    if (this._cartonLists) {
      this.searchList = this._cartonLists;
    } else {
      this._valueShareService.setLoading(true);;
      this._materialService.fetchMaterialList(MaterialTypeEn.ca).subscribe((res: Material[]) => {
        this._cartonLists = res;
        this.searchList = this._cartonLists;
        this._valueShareService.setLoading(false);;
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ca}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllLabels():void {
    if (this._labelLists) {
      this.searchList = this._labelLists;
    } else {
      this._valueShareService.setLoading(true);;
      this._materialService.fetchMaterialList(MaterialTypeEn.la).subscribe((res: Material[]) => {
        this._labelLists = res;
        this.searchList = this._labelLists;
        this._valueShareService.setLoading(false);;
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.la}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllTriggers():void {
    if(this._triggerLists) {
      this.searchList = this._triggerLists;
    } else {
      this._valueShareService.setLoading(true);;
      this._materialService.fetchMaterialList(MaterialTypeEn.tr).subscribe((res: Material[]) => {
        this._triggerLists = res;
        this.searchList = this._triggerLists;
        this._valueShareService.setLoading(false);;
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.tr}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllBags():void {
    if(this._bagLists) {
      this.searchList = this._bagLists;
    } else {
      this._valueShareService.setLoading(true);;
      this._materialService.fetchMaterialList(MaterialTypeEn.ba).subscribe((res: Material[]) => {
        this._bagLists = res;
        this.searchList = this._bagLists;
        this._valueShareService.setLoading(false);;
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal(`※ ${MaterialTypeJa.ba}データの取得に失敗しました。`, 10000);
      });
    }
  }

  private _fetchAllLocations():void {
    this._locationService.fetchLocations().subscribe((res: Location[]) => {
      for (const l of res) {
        const cl : CheckLocation = {
          id: l.id,
          name: l.name,
          nameKana: l.nameKana,
          isFactory: l.isFactory,
          checked: this.selectedLocationIds.includes(l.id)
        };
        this.listLocationForFilter.push(cl);
      }
      this._setListSelectedLocation();
      this._fetchInventoryList();

      // csvのため
      for (const l of res) {
        this.locationNameMap[l.id] = l.name;
      }

      this._valueShareService.setLoading(false);
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 倉庫のデータの取得に失敗しました。', 10000);
    });
  }

  private _setListSelectedLocation() {
    if (this.listLocationForFilter && this.listLocationForFilter.length > 0) {
      this.listSelectedLocation = [];
      for(const l of this.listLocationForFilter) {
        if(l.checked) {
          this.listSelectedLocation.push(l);
        }
      }
    }
  }
}
