import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from 'src/app/service/material-service/material.service';
import { HttpResponse } from '@angular/common/http';
import { Material, initMaterial } from 'src/app/model/material';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
declare const $;

@Component({
  selector: 'app-detail-material',
  templateUrl: './detail-material.component.html',
  styleUrls: ['./detail-material.component.css']
})
export class DetailMaterialComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public loading = true;

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
  public readonly deleteBody = '本当に削除してもよろしいですか？';;
  public readonly deleteBtn = '削除';

  public completeBody: string;
  public completeBtnType: string;
  private _deleted: boolean = false;

  public isInitInputImage: boolean;
  public imageSrc: string = DetailMaterialComponent.NO_IMAGE_URL;
  public _selectedImage: File;

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private _firebaseStorageService: FirebaseStorageService,
  ) {}

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
        this.loading = false;
      } else {
        this.completeBody = '※ ロードに失敗しました';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      }
    }, (err: HttpResponse<string>) => {
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  createBody(){
    const fileName = this._selectedImage ? this._selectedImage.name : '未選択';

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録を修正しますか？</p>
      <div class="row">
        <div class="col-4">コード</div>
        <div class="col-8 pull-left">${this.material.id}</div>
      </div>
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
    </div>`;
  }

  submit(): void {
    this.loading = true;
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
          this.completeBody = '※ 変更前の画像の削除に失敗しました。';
          this.completeBtnType = 'btn-danger';
          this.openCompleteModal();
        });
      }

      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {

        this._saveMaterial(material);

        this._firebaseStorageService.fecthDownloadUrl(this.material.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }, (err) => {
        console.error(err);
        this.completeBody = '※ 登録に失敗しました。';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      });


    }
  }

  private _saveMaterial(material: Material): void {
    this.materialService.saveMaterial(material).subscribe((res) => {
      this.completeBody = '修正が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();

      this.material = this.registerMaterial;
      this.registerMaterial = Object.assign({}, this.material);

      if (this.material.imageUrl !== '') {
        this._firebaseStorageService.fecthDownloadUrl(this.material.imageUrl).subscribe((url) => {
          this.imageSrc = url;
        });
      }
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 修正に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  delete(): void {
    this.loading = true;
    this.materialService.deleteMaterial(this.material.id, this.material.type).subscribe((res) => {
      if(this.material.imageUrl !== '') {
        this._firebaseStorageService.deleteFile(this.material.imageUrl).subscribe(() => {
          this._deleted = true;
          this.completeBody = '削除が完了しました。';
          this.completeBtnType = 'btn-outline-success';
          this.openCompleteModal();
    
          setTimeout(() =>{
            this.backToList();
          },3000);
        }, (err) => {
          console.log(err);
          this.completeBody = '※ 変更前の画像の削除に失敗しました。';
          this.completeBtnType = 'btn-danger';
          this.openCompleteModal();
        });
      } else {
        this._deleted = true;
        this.completeBody = '削除が完了しました。';
        this.completeBtnType = 'btn-outline-success';
        this.openCompleteModal();
  
        setTimeout(() =>{
          this.backToList();
        },3000);
      }
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 削除に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goBack(): void {
    this.router.navigate(['/material/list']);
  }

  backToList(): void {
    if (this._deleted) {
      this._deleted = false;
      this.goBack();
    }
  }

  public imageLoadFailed() {
    this.completeBody = '※ 画像の読み込みに失敗しました。';
    this.completeBtnType = 'btn-danger';
    this.openCompleteModal();
  }

  public selectImage(file: File) {
    this._selectedImage = file;
    this.isInitInputImage = false;
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
