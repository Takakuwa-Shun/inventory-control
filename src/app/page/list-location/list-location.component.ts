import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from './../../model/location';
import { LocationService } from './../../service/location-service/location.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-list-location',
  templateUrl: './list-location.component.html',
  styleUrls: ['./list-location.component.css']
})
export class ListLocationComponent implements OnInit {

  public listLocation: Location[];
  public csvListLocation: Location[];

  constructor(
    private router: Router,
    private locationService: LocationService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.csvListLocation = [{
      id: '倉庫コード',
      name: '倉庫名',
      nameKana: '倉庫名かな',
    }];
    this.fetchAllLocations();
  }

  private fetchAllLocations(): void {
    this.locationService.fetchLocations().subscribe((res: Location[]) => {
      this.listLocation = res;
      this.csvListLocation = this.csvListLocation.concat(this.listLocation);
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  goDetail(id: string) {
    this.router.navigate(['/location/detail/' + id]);
  }
}
