import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Material } from './../../model/material';
import { MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { LocalStorageService } from './../../service/local-storage-service/local-storage.service';
declare const $;

@Component({
  selector: 'app-list-material',
  templateUrl: './list-material.component.html',
  styleUrls: ['./list-material.component.css']
})
export class ListMaterialComponent implements OnInit {

  public loading = true;
  public completeBody: string; 
  public completeBtnType: string;

  public listMaterial: Material[];
  public titleListMaterial: Material[] = [{
    id: '資材コード',
    name: '資材名',
    nameKana: '資材名かな',
    type: '種別',
    limitCount: 'フラグ',
    imageUrl: '画像パス'
  }];
  public csvListMaterial: Material[];
  public selectedMaterilal: string;
  public selectedMaterilalNameJa: string;

  public readonly materials = [
    { value: 'bottle', name: MaterialTypeJa.bo },
    { value: 'carton', name: MaterialTypeJa.ca },
    { value: 'label', name: MaterialTypeJa.la },
    { value: 'trigger', name: MaterialTypeJa.tr },
    { value: 'bag', name: MaterialTypeJa.ba },
  ];

  constructor(
    private router: Router,
    private materialService: MaterialService,
    private localStorage: LocalStorageService,
  ) { }

  ngOnInit() {
    this.filterInit();
    this.fetchMaterialLists(this.selectedMaterilal);
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

  public fetchMaterialLists(type: string): void {
    this.localStorage.setItem('selectedMaterilal', type);
    this.materialService.fetchMaterialLists(type).subscribe((res: Material[]) => {
      this.listMaterial = res;
      this.csvListMaterial = this.titleListMaterial.concat(this.listMaterial);
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  changeMaterial(type: string){
    this.loading = true;
    this.selectedMaterilal = type;
    this._setMaterialNameJa();
    this.listMaterial = [];
    this.fetchMaterialLists(this.selectedMaterilal);
  }

  goDetail(id: string) {
    this.router.navigate(['/material/detail/' + this.selectedMaterilal + '/'+ id]);
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
