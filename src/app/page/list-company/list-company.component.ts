import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Company } from './../../model/company';
import { CompanyService } from './../../service/company-service/company.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-list-company',
  templateUrl: './list-company.component.html',
  styleUrls: ['./list-company.component.css']
})
export class ListCompanyComponent implements OnInit {

  public listCompany: Company[];
  public csvListCompany: Company[];

  constructor(
    private router: Router,
    private companyService: CompanyService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.csvListCompany = [{
      id: '得意先コード',
      name: '得意先名',
      nameKana: '得意先名かな'
    }];

    this.fetchAllCompany();
  }

  private fetchAllCompany(): void {
    this.companyService.fetchCompanies().subscribe((res: Company[]) => {
      this.listCompany = res;
      this.csvListCompany = this.csvListCompany.concat(this.listCompany);
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  goDetail(id: string) {
    this.router.navigate(['/company/detail/' + id]);
  }
}
