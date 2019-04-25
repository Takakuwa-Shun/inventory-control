import { Injectable, Inject, LOCALE_ID} from '@angular/core';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ExcelSheet } from './../../model/excel-sheet';
import { ValueShareService } from './../../service/value-share-service/value-share.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Injectable({
  providedIn: 'root'
})
export class ExcelServiceService {

  constructor(
    @Inject(LOCALE_ID) private _locale: string,
    private _valueShareService: ValueShareService,
  ) { }

  public exportAsExcelFile(excelSheet: ExcelSheet[], excelFileName: string): void {
    const worksheets = {};
    const sheetNames = [];
    for(const e of excelSheet) {
      if(e.sheetName.length > 32) {
        e.sheetName = e.sheetName.slice(0,31);
      }

      worksheets[e.sheetName] = XLSX.utils.json_to_sheet(e.json);
      sheetNames.push(e.sheetName);
    }

    const workbook: XLSX.WorkBook = {
      Sheets: worksheets,
      SheetNames: sheetNames
    };
    const excelBuffer: BlobPart = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }


  private saveAsExcelFile(buffer: BlobPart, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    const date = formatDate(new Date(), "yyyyMMdd_HHmm", this._locale);
    FileSaver.saveAs(data, `${fileName}_${date}.xlsx`);
    this._valueShareService.setLoading(false);
  }
}
