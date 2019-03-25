import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Company } from './../../model/company';
import { CompanyService } from './../../service/company-service/company.service';
declare const $;

@Component({
  selector: 'app-list-company',
  templateUrl: './list-company.component.html',
  styleUrls: ['./list-company.component.css']
})
export class ListCompanyComponent implements OnInit {

  public loading = true;

  public completeBody: string; 
  public completeBtnType: string;

  public listCompany: Company[];
  public csvListCompany: Company[];

  constructor(
    private router: Router,
    private companyService: CompanyService,
  ) { }

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
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goDetail(id: string) {
    this.router.navigate(['/company/detail/' + id]);
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
