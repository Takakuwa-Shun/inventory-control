import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Material, MaterialWithImage } from './../../model/material';
import { MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { LocalStorageService } from './../../service/local-storage-service/local-storage.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
declare const $;

@Component({
  selector: 'app-list-material',
  templateUrl: './list-material.component.html',
  styleUrls: ['./list-material.component.css']
})
export class ListMaterialComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public listMaterial: MaterialWithImage[];
  public csvListMaterial: Material[];
  public titleListMaterial: Material[] = [{
    id: '資材コード',
    name: '資材名',
    nameKana: '資材名かな',
    type: '種別',
    limitCount: 'フラグ',
    imageUrl: '画像パス',
    status: 'ステータス',
  }];
  public selectedMaterilal: string;
  public selectedMaterilalNameJa: string;

  public readonly materials = [
    { value: 'bottle', name: MaterialTypeJa.bo },
    { value: 'trigger', name: MaterialTypeJa.tr },
    { value: 'label', name: MaterialTypeJa.la },
    { value: 'bag', name: MaterialTypeJa.ba },
    { value: 'carton', name: MaterialTypeJa.ca },
  ];

  constructor(
    private router: Router,
    private materialService: MaterialService,
    private localStorage: LocalStorageService,
    private _valueShareService: ValueShareService,
    private _firebaseStorageService: FirebaseStorageService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.filterInit();
    this._fetchMaterialList(this.selectedMaterilal);
  }

  private _setMaterialNameJa(): void {
    switch (this.selectedMaterilal) {
      case this.materials[0].value:
        this.selectedMaterilalNameJa = this.materials[0].name;
        break;
      case this.materials[1].value:
        this.selectedMaterilalNameJa = this.materials[1].name;
        break;
      case this.materials[2].value:
        this.selectedMaterilalNameJa = this.materials[2].name;
        break;
      case this.materials[3].value:
        this.selectedMaterilalNameJa = this.materials[3].name;
        break;
      case this.materials[4].value:
        this.selectedMaterilalNameJa = this.materials[4].name;
        break;
      default:
        this.selectedMaterilalNameJa = '資材一覧';
        break;
    }
  }

  private filterInit(): void {
    if (this.localStorage.getItem('selectedMaterilal')) {
      this.selectedMaterilal = this.localStorage.getItem('selectedMaterilal');
      this._setMaterialNameJa();
    } else {
      this.selectedMaterilal = this.materials[0].value;
      this.selectedMaterilalNameJa = this.materials[0].name;
    }
  }

  private _downloadImages(): void {
    for(const m of this.listMaterial) {
      m.imageSrc = ListMaterialComponent.NO_IMAGE_URL;
      if(m.imageUrl !== '') {
        this._firebaseStorageService.fecthDownloadUrl(m.imageUrl).subscribe((res: string) => {
          m.imageSrc = res;
        }, (err) => {
          console.log(err);
        });
      }
    }
  }

  private _fetchMaterialList(type: string): void {
    this.localStorage.setItem('selectedMaterilal', type);
    this.materialService.fetchMaterialList(type).subscribe((res: Material[]) => {
      this.listMaterial = res;
      this._downloadImages();
      this.csvListMaterial = this.titleListMaterial.concat(this.listMaterial);
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  changeMaterial(type: string){
    this._valueShareService.setLoading(true);;
    this.selectedMaterilal = type;
    this._setMaterialNameJa();
    this.listMaterial = [];
    this._fetchMaterialList(this.selectedMaterilal);
  }

  goDetail(id: string) {
    this.router.navigate(['/material/detail/' + this.selectedMaterilal + '/'+ id]);
  }
}
