import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from './../../model/location';
import { LocationService } from './../../service/location-service/location.service';
declare const $;

@Component({
  selector: 'app-list-location',
  templateUrl: './list-location.component.html',
  styleUrls: ['./list-location.component.css']
})
export class ListLocationComponent implements OnInit {

  public loading = true;

  public listLocation: Location[];
  public csvListLocation: Location[];

  public completeBody: string; 
  public completeBtnType: string;

  constructor(
    private router: Router,
    private locationService: LocationService,
  ) { }

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
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goDetail(id: string) {
    this.router.navigate(['/location/detail/' + id]);
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
