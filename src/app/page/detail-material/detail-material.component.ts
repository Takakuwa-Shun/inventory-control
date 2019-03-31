import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from 'src/app/service/material-service/material.service';
import { InventoryService } from 'src/app/service/inventory-service/inventory.service';
import { HttpResponse } from '@angular/common/http';
import { Material, initMaterial, MaterialStatus } from 'src/app/model/material';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-detail-material',
  templateUrl: './detail-material.component.html',
  styleUrls: ['./detail-material.component.css']
})
export class DetailMaterialComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public readonly MaterialStatus = MaterialStatus;
  public material: Material;
  public registerMaterial: Material;

  public readonly materialType =  [MaterialTypeJa.bo, MaterialTypeJa.ca, MaterialTypeJa.la, MaterialTypeJa.tr, MaterialTypeJa.ba];
  public readonly limitCountPattern: string = '^[1-9][0-9]*$';
  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '修正';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public readonly deleteBody = '削除を行うと、この資材に関する在庫ログも削除されます。本当に削除しますか？';
  public readonly deleteBtn = '削除';

  public isInitInputImage: boolean;
  public imageSrc: string = DetailMaterialComponent.NO_IMAGE_URL;
  public _selectedImage: File;

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private _firebaseStorageService: FirebaseStorageService,
    private _valueShareService: ValueShareService,
    private _inventoryService: InventoryService
  ) {
    this._valueShareService.setLoading(true);
  }

  ngOnInit() {
    this.material = initMaterial();
    this.registerMaterial = initMaterial();
    this.fetchMaterialDetail();
    this.isInitInputImage = true;
  }

  private fetchMaterialDetail() :void {
    const materialId = this.route.snapshot.paramMap.get('id');
    const type = this.route.snapshot.paramMap.get('type');
    this.materialService.fetchMaterialById(materialId, type).subscribe((res: Material) => {
      if (res) {
        this.material = res;
        this.registerMaterial = Object.assign({}, this.material);

        if (this.material.imageUrl !== '') {
          console.log(this.material.imageUrl);
          this._firebaseStorageService.fecthDownloadUrl(this.material.imageUrl).subscribe((url) => {
            this.imageSrc = url;
          });
        }
        this._valueShareService.setLoading(false);;
      } else {
        this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
      }
    }, (err: HttpResponse<string>) => {
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  createBody(){
    const fileName = this._selectedImage ? this._selectedImage.name : '未選択';

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録を修正しますか？</p>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerMaterial.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerMaterial.nameKana}</div>
      </div>
      <div class="row">
        <div class="col-4">タイプ</div>
        <div class="col-8 pull-left">${this.registerMaterial.type}</div>
      </div>
      <div class="row">
        <div class="col-4">フラグ</div>
        <div class="col-8 pull-left">${this.registerMaterial.limitCount}</div>
      </div>
      <div class="row">
        <div class="col-4">画像</div>
        <div class="col-8 pull-left">${fileName}</div>
      </div>
      <div class="row">
        <div class="col-4">ステータス</div>
        <div class="col-8 pull-left">${this.registerMaterial.status}</div>
      </div>
    </div>`;
    console.log(this.registerMaterial);
    console.log(this._selectedImage);
  }

  submit(): void {
    this._valueShareService.setLoading(true);;
    this.registerMaterial.name = this.registerMaterial.name.trim();
    this.registerMaterial.nameKana = this.registerMaterial.nameKana.trim();
    this.registerMaterial.type = this.registerMaterial.type.trim();
    this.registerMaterial.limitCount = Number(this.registerMaterial.limitCount);

    if (this._selectedImage === undefined) {
      this._saveMaterial(this.registerMaterial);
    } else {
      const filePath = this.materialService.getFilePath(this._selectedImage, new Date);
      this.registerMaterial.imageUrl = filePath;
      const material = Object.assign({}, this.registerMaterial);

      if(this.material.imageUrl !== '') {
        this._firebaseStorageService.deleteFile(this.material.imageUrl).subscribe(() => {

        }, (err) => {
          console.log(err);
          this._valueShareService.setCompleteModal('※ 変更前の画像の削除に失敗しました。', 5000);
        });
      }

      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {

        this._saveMaterial(material);

        this._firebaseStorageService.fecthDownloadUrl(this.material.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }, (err) => {
        console.error(err);
        this._valueShareService.setCompleteModal('※ 登録に失敗しました。', 5000);
      });


    }
  }

  private _saveMaterial(material: Material): void {
    this.materialService.saveMaterial(material).subscribe((res) => {
      this._valueShareService.setCompleteModal('修正が完了しました。', 5000, 'btn-outline-success');

      this.material = this.registerMaterial;
      this.registerMaterial = Object.assign({}, this.material);

      if (this.material.imageUrl !== '') {
        this._firebaseStorageService.fecthDownloadUrl(this.material.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 修正に失敗しました');
    });
  }

  public changeStatus(): void {
    if (this.material.status === MaterialStatus.use) {
      this.material.status = MaterialStatus.noUse;
      this.registerMaterial.status = MaterialStatus.noUse;
      this._selectedImage = undefined;
      this.isInitInputImage = true;
    } else {
      this.material.status = MaterialStatus.use;
      this.registerMaterial.status = MaterialStatus.use;
    }
  }

  delete(): void {
    this._valueShareService.setLoading(true);;
    this._inventoryService.deleteMaterialAndAllInventoris(this.material.id, this.material.type).subscribe((res) => {
      if(this.material.imageUrl !== '') {
        this._firebaseStorageService.deleteFile(this.material.imageUrl).subscribe(() => {
          this._valueShareService.setCompleteModal('削除が完了しました。5秒後に自動的に一覧へ遷移します。', 5000, 'btn-outline-success');
    
          setTimeout(() =>{
            this.goBack();
          },5000);
        }, (err) => {
          console.log(err);
          this._valueShareService.setCompleteModal('※ 変更前の画像の削除に失敗しました。', 5000);
        });
      } else {
        this._valueShareService.setCompleteModal('削除が完了しました。', 5000, 'btn-outline-success');
  
        setTimeout(() =>{
          this.goBack();
        },5000);
      }
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 削除に失敗しました。');
    });
  }

  goBack(): void {
    this.router.navigate(['/material/list']);
  }

  public imageLoadFailed() {
    this._valueShareService.setCompleteModal('※ 画像の読み込みに失敗しました。', 5000);
  }

  public selectImage(file: File) {
    this._selectedImage = file;
    this.isInitInputImage = false;
  }
}
