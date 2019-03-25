import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { CompanyService } from 'src/app/service/company-service/company.service';
import { HttpResponse } from '@angular/common/http';
import { Company } from 'src/app/model/company';
declare const $;


@Component({
  selector: 'app-detail-company',
  templateUrl: './detail-company.component.html',
  styleUrls: ['./detail-company.component.css']
})
export class DetailCompanyComponent implements OnInit {

  public loading = true;

  public company: Company;
  public registerCompany: Company;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '修正確認';
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
    private companyService: CompanyService,
  ) {}

  ngOnInit() {
    this.company = {
      id: null,
      name: null,
      nameKana: null,
    }
    this.registerCompany = {
      id: null,
      name: null,
      nameKana: null,
    }
    this.fetchCompanyDetail();
  }

  private fetchCompanyDetail() :void {
    const companyId = this.route.snapshot.paramMap.get('id');
    this.companyService.fetchDetailCompany(companyId).subscribe((res: Company) => {
      if (res) {
        this.company = res;
        this.registerCompany = Object.assign({}, this.company);
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
        <div class="col-4">コード</div>
        <div class="col-8 pull-left">${this.company.id}</div>
      </div>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerCompany.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerCompany.nameKana}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this.loading = true;
    this.registerCompany.name = this.registerCompany.name.trim();
    this.registerCompany.nameKana = this.registerCompany.nameKana.trim();

    this.companyService.saveCompany(this.registerCompany).subscribe((res) => {
      this.completeBody = '修正が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();

      this.company = this.registerCompany;
      this.registerCompany = Object.assign({}, this.company);
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 修正に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  delete(): void {
    this.loading = true;
    this.companyService.deleteCompany(this.company.id).subscribe((res) => {
      this._deleted = true;
      this.completeBody = '削除が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();

      setTimeout(() =>{
        this.backToList();
      },3000);

    }, (err: HttpResponse<string>) => {
      this.completeBody = '※ 削除に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goBack(): void {
    this.router.navigate(['/company/list']);
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
