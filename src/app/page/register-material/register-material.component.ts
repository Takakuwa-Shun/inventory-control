import { Component, OnInit } from '@angular/core';
import { Material, initMaterial } from './../../model/material'
import { MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { AngularFirestore } from 'angularfire2/firestore';
declare const $;

@Component({
  selector: 'app-register-material',
  templateUrl: './register-material.component.html',
  styleUrls: ['./register-material.component.css']
})
export class RegisterMaterialComponent implements OnInit {
  public loading = false;

  public registerMaterial: Material;
  private readonly _typeDefault = '資材タイプを選択してください';
  public readonly materialType =  [this._typeDefault, MaterialTypeJa.bo, MaterialTypeJa.ca, MaterialTypeJa.la, MaterialTypeJa.tr, MaterialTypeJa.ba];

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';
  public readonly limitCountPattern: string = '^[1-9][0-9]*$';
  public readonly typePattern: string = '^(?!.*' + this._typeDefault + ').*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  public completeBody: string; 
  public completeBtnType: string;

  public isInitInputImage: boolean;
  private _selectedImage: File;

  constructor(
    private materialService: MaterialService,
    private _firebaseStorageService: FirebaseStorageService,
    private _afStore: AngularFirestore
  ) { }

  ngOnInit() {
    this.formInit();
  }

  createBody() {
    const fileName = this._selectedImage ? this._selectedImage.name : '未選択';

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerMaterial.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerMaterial.nameKana}</div>
      </div>
      <div class="row">
        <div class="col-4">フラグ</div>
        <div class="col-8 pull-left">${this.registerMaterial.limitCount}</div>
      </div>
      <div class="row">
        <div class="col-4">タイプ</div>
        <div class="col-8 pull-left">${this.registerMaterial.type}</div>
      </div>
      <div class="row">
        <div class="col-4">画像</div>
        <div class="col-8 pull-left">${fileName}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this.loading = true;
    this.registerMaterial.id = this._afStore.createId();
    this.registerMaterial.name = this.registerMaterial.name.trim();
    this.registerMaterial.nameKana = this.registerMaterial.nameKana.trim();
    this.registerMaterial.limitCount = Number(this.registerMaterial.limitCount);

    if (this._selectedImage === undefined) {
      this.registerMaterial.imageUrl = '';
      this._saveMaterial(this.registerMaterial);
    } else {
      const filePath = this.materialService.getFilePath(this._selectedImage, new Date);
      this.registerMaterial.imageUrl = filePath;
      const material = Object.assign({}, this.registerMaterial);
      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {
        this._saveMaterial(material);
      }, (err) => {
        console.error(err);
        this.completeBody = '※ 登録に失敗しました。';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      });
    }
  }

  private _saveMaterial(material: Material): void {
    this.materialService.saveMaterial(material).subscribe(() => {
      this.completeBody = '登録が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();
    }, (err) => {
      console.error(err);
      this.completeBody = '※ 登録に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  formInit() :void {
    this.registerMaterial =initMaterial();
    this.registerMaterial.type = this._typeDefault;
    this.isInitInputImage = true;

    this._selectedImage = undefined;
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
