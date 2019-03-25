import { Component, OnInit, Input, Inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { formatDate, Location } from '@angular/common';

@Component({
  selector: 'app-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.css']
})
export class SubHeaderComponent implements OnInit {

  @Input() title: string;
  @Input() showCsv: boolean;
  @Input() showPrint: boolean;
  @Input() csvData: Object[];
  @Input() csvFileName: string;
  @Input() iconImageUrl: string;
  @Input() showImage: boolean = false;

  public csvDataSrc: SafeUrl;

  constructor(
    private _sanitizer: DomSanitizer,
    private _location: Location,
    @Inject(LOCALE_ID) private _locale: string
    ) { }

  ngOnInit() {
  }

  goBack(): void {
    this._location.back();
  }

  print() {
    window.print();
  }

  convertToCsv() {

    // ファイル名を作成
    const date = formatDate(new Date(), "yyyyMMdd_HHmm", this._locale);
    if (this.csvFileName) {
      this.csvFileName = `${this.csvFileName}_${date}.csv`;
    } else {
      this.csvFileName = `${this.title}_${date}.csv`;      
    }

    let csv = '';
    this.csvData.forEach((obj: Object) => {
      Object.keys(obj).map((key) => {
        csv += `${obj[key]},`;
      });
      csv = csv.slice( 0, -1);
      csv += '\n';
    });

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([ bom, csv], { "type" : "text/csv" });
    this.csvDataSrc = this._sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
  }
}
