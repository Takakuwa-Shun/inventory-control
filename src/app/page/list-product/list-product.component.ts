import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { Product } from 'src/app/model/product';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
import { Company } from 'src/app/model/company';
declare const $;

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent implements OnInit {

  public listProduct: Product[];
  public csvListProduct: Product[];
  public listCompany: Company[];
  private _selectedCompany: Company;

  public readonly titleListProduct: Product[] = [{
    id: '商品コード',
    name: '商品名',
    nameKana: '商品名かな',
    imageUrl: '画像パス',
    companyId: '得意先コード',
    companyName: '得意先名',
    bottleId: 'ボトルコード',
    bottleName: 'ボトル名',
    inCartonId: '内側カートンコード',
    inCartonName: '内側カートン名',
    outCartonId: '外側カートンコード',
    outCartonName: '外側カートン名',
    labelId: 'ラベルコード',
    labelName: 'ラベル名',
    triggerId: 'トリガーコード',
    triggerName: 'トリガー名',
    bagId: '詰め替え袋コード',
    bagName: '詰め替え袋名',
  }];

  constructor(
    private router: Router,
    private _companyService: CompanyService,
    private productService: ProductService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.fetchAllCompanies();
    this.csvListProduct = this.titleListProduct;
  }

  private fetchAllCompanies(): void {
    this._companyService.fetchCompanies().subscribe((res: Company[]) => {
      this.listCompany = res;
      const noCompany: Company = {
        id: null,
        name: '得意先なし',
        nameKana: ''
      };
      const allCompany: Company = {
        id: '',
        name: '全ての得意先',
        nameKana: ''
      };
      this.listCompany.unshift(allCompany);
      this.listCompany.unshift(noCompany);
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 得意先のロードに失敗しました。');
    });
  }

  public autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  public selectCompany(data: Company) {
    this._valueShareService.setLoading(true);
    this._selectedCompany = data;
    if(data.id === '') {
      this._fetchProductList();
    } else {
      this._fetchProductListFilteringCompany(data);
    }
  }

  private _fetchProductList(): void {
    this.productService.fetchAllProducts().subscribe((res: Product[]) => {
      this.listProduct = res;
      this.csvListProduct = this.titleListProduct.concat(this.listProduct);
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  private _fetchProductListFilteringCompany(company: Company): void {
    this.productService.fetchProductListFilteringCompany(company.id).subscribe((res: Product[]) => {
      this.listProduct = res;
      this.csvListProduct = this.titleListProduct.concat(this.listProduct);
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
    });
  }

  goDetail(id: string) {
    this.router.navigate(['/product/detail/' + id]);
  }  
}
