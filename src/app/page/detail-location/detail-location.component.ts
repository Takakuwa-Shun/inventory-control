import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { LocationService } from 'src/app/service/location-service/location.service';
import { Location, initLocation } from './../../model/location';
declare const $;

@Component({
  selector: 'app-detail-location',
  templateUrl: './detail-location.component.html',
  styleUrls: ['./detail-location.component.css']
})
export class DetailLocationComponent implements OnInit {

  public loading = true;

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

  public completeBody: string;
  public completeBtnType: string;
  private _deleted: boolean = false;

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
  ) {}

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
        this.loading = false;
      }  else {
        this.completeBody = '※ ロードに失敗しました';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      }
    }, (err) => {
      console.log(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
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
    this.loading = true;
    this.registerLocation.name = this.registerLocation.name.trim();
    this.registerLocation.nameKana = this.registerLocation.nameKana.trim();

    this.locationService.saveLocation(this.registerLocation).subscribe((res) => {
      this.completeBody = '修正が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();

      this.location = this.registerLocation;
      this.registerLocation = Object.assign({}, this.location);
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 修正に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  delete(): void {
    this.loading = true;
    this.locationService.deleteLocation(this.location.id).subscribe((res) => {
      this._deleted = true;
      this.completeBody = '削除が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();

      setTimeout(() =>{
        this.backToList();
      },3000);
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 削除に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goBack(): void {
    this.router.navigate(['/location/list']);
  }

  backToList(): void {
    if (this._deleted) {
      this._deleted = false;
      this.goBack();
    }
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
