import { Component, OnInit } from '@angular/core';
import { Company, initCompany } from './../../model/company';
import { CompanyService } from './../../service/company-service/company.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-register-company',
  templateUrl: './register-company.component.html',
  styleUrls: ['./register-company.component.css']
})
export class RegisterCompanyComponent implements OnInit {

  public registerCompany: Company;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  constructor(
    private companyService: CompanyService,
    private _valueShareService: ValueShareService,
    private _afStore: AngularFirestore
  ) { }

  ngOnInit() {
    this.formInit();
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
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
    this._valueShareService.setLoading(true);
    this.registerCompany.id = this._afStore.createId();
    this.registerCompany.name = this.registerCompany.name.trim();
    this.registerCompany.nameKana = this.registerCompany.nameKana.trim();

    this.companyService.saveCompany(this.registerCompany).subscribe(() =>{
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.error(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  formInit() :void {
    this.registerCompany = initCompany();
  }
}
