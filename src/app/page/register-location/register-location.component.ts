import { Component, OnInit } from '@angular/core';
import { Location, initLocation } from './../../model/location';
import { LocationService } from './../../service/location-service/location.service';
import { HttpResponse } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-register-location',
  templateUrl: './register-location.component.html',
  styleUrls: ['./register-location.component.css']
})
export class RegisterLocationComponent implements OnInit {

  public registerLocation: Location;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  constructor(
    private locationService: LocationService,
    private _valueShareService: ValueShareService,
    private _afStore: AngularFirestore
  ) { }

  ngOnInit() {
    this.formInit();
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerLocation.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerLocation.nameKana}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this._valueShareService.setLoading(true);
    this.registerLocation.id = this._afStore.createId();
    this.registerLocation.name = this.registerLocation.name.trim();
    this.registerLocation.nameKana = this.registerLocation.nameKana.trim();
    this.locationService.saveLocation(this.registerLocation).subscribe((res) =>{
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err: HttpResponse<string>) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  formInit() :void {
    this.registerLocation = initLocation();
  }
}
