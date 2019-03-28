import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { CompanyService } from 'src/app/service/company-service/company.service';
import { HttpResponse } from '@angular/common/http';
import { Company } from 'src/app/model/company';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;


@Component({
  selector: 'app-detail-company',
  templateUrl: './detail-company.component.html',
  styleUrls: ['./detail-company.component.css']
})
export class DetailCompanyComponent implements OnInit {

  public company: Company;
  public registerCompany: Company;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '修正確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '修正';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public readonly deleteBody = '一部商品がこの得意先を参照している可能性があります。本当に削除しますか？';
  public readonly deleteBtn = '削除';

  constructor(
    private route : ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
  }

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
        <div class="col-8 pull-left">${this.registerCompany.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerCompany.nameKana}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this._valueShareService.setLoading(true);;
    this.registerCompany.name = this.registerCompany.name.trim();
    this.registerCompany.nameKana = this.registerCompany.nameKana.trim();

    this.companyService.saveCompany(this.registerCompany).subscribe((res) => {
      this._valueShareService.setCompleteModal('修正が完了しました。', 5000, 'btn-outline-success');

      this.company = this.registerCompany;
      this.registerCompany = Object.assign({}, this.company);
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 修正に失敗しました。');
    });
  }

  delete(): void {
    this._valueShareService.setLoading(true);;
    this.companyService.deleteCompany(this.company.id).subscribe((res) => {
      this._valueShareService.setCompleteModal('削除が完了しました。5秒後に自動的に一覧へ遷移します。', 5000, 'btn-outline-success');

      setTimeout(() =>{
        this.goBack();
      },5000);

    }, (err: HttpResponse<string>) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 削除に失敗しました。');
    });
  }

  goBack(): void {
    this.router.navigate(['/company/list']);
  }
}
