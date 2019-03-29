import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { LocationService } from 'src/app/service/location-service/location.service';
import { Location, initLocation } from './../../model/location';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-detail-location',
  templateUrl: './detail-location.component.html',
  styleUrls: ['./detail-location.component.css']
})
export class DetailLocationComponent implements OnInit {

  public location: Location;
  public registerLocation: Location;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '修正';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public readonly deleteBody = '本当に削除してもよろしいですか？';;
  public readonly deleteBtn = '削除';

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
  }

  ngOnInit() {
    this.location = initLocation();
    this.registerLocation = initLocation();
    this.fetchLocationDetail();
  }

  private fetchLocationDetail() :void {
    const locationId = this.route.snapshot.paramMap.get('id');
    this.locationService.fetchDetailLocation(locationId).subscribe((res: Location) => {
      if (res) {
        this.location = res;
        this.registerLocation = Object.assign({}, this.location);
        this._valueShareService.setLoading(false);;
      }  else {
        this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
      }
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録を修正しますか？</p>
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
    this._valueShareService.setLoading(true);;
    this.registerLocation.name = this.registerLocation.name.trim();
    this.registerLocation.nameKana = this.registerLocation.nameKana.trim();

    this.locationService.saveLocation(this.registerLocation).subscribe((res) => {
      this._valueShareService.setCompleteModal('修正が完了しました。', 5000, 'btn-outline-success');

      this.location = this.registerLocation;
      this.registerLocation = Object.assign({}, this.location);
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 修正に失敗しました。');
    });
  }

  delete(): void {
    this._valueShareService.setLoading(true);
    this.locationService.deleteLocation(this.location.id).subscribe((res) => {
      this._valueShareService.setCompleteModal('削除が完了しました。5秒後に自動的に一覧へ遷移します。', 5000, 'btn-outline-success');

      setTimeout(() =>{
        this.goBack();
      },5000);
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 削除に失敗しました。');
    });
  }

  goBack(): void {
    this.router.navigate(['/location/list']);
  }
}
