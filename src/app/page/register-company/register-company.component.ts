import { Component, OnInit } from '@angular/core';
import { Company, initCompany } from './../../model/company';
import { CompanyService } from './../../service/company-service/company.service';
import { AngularFirestore } from 'angularfire2/firestore';
declare const $;

@Component({
  selector: 'app-register-company',
  templateUrl: './register-company.component.html',
  styleUrls: ['./register-company.component.css']
})
export class RegisterCompanyComponent implements OnInit {

  public loading = false;

  public registerCompany: Company;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';
  
  public completeBody: string; 
  public completeBtnType: string;

  constructor(
    private companyService: CompanyService,
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
    this.loading = true;
    this.registerCompany.id = this._afStore.createId();
    this.registerCompany.name = this.registerCompany.name.trim();
    this.registerCompany.nameKana = this.registerCompany.nameKana.trim();

    this.companyService.saveCompany(this.registerCompany).subscribe(() =>{
      this.completeBody = '登録が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();
    }, (err) => {
      this.completeBody = '※ 登録に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  formInit() :void {
    this.registerCompany = initCompany();
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
