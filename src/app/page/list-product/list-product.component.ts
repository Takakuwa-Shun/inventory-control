import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { Product, ProductWithImage } from 'src/app/model/product';
import { ValueShareService } from './../../service/value-share-service/value-share.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { Company } from 'src/app/model/company';
declare const $;

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent implements OnInit {

  private static readonly NO_IMAGE_URL = './../../../assets/no-image.png';

  public listProduct: ProductWithImage[];
  private _listProductObj: object = {};
  private _allListProduct: ProductWithImage[];
  public listCompany: Company[];
  constructor(
    private router: Router,
    private _companyService: CompanyService,
    private productService: ProductService,
    private _valueShareService: ValueShareService,
    private _firebaseStorageService: FirebaseStorageService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.fetchAllCompanies();
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

  private _downloadImages() {
    for(const p of this.listProduct) {
      p.imageSrc = ListProductComponent.NO_IMAGE_URL;
      if(p.imageUrl !== '') {
        this._firebaseStorageService.fecthDownloadUrl(p.imageUrl).subscribe((res: string) => {
          p.imageSrc = res;
        }, (err) => {
          console.log(err);
        });
      }
    }
  }

  public autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  public selectCompany(data: Company) {
    if (typeof data !== 'string') {
      this._valueShareService.setLoading(true);
      if(data.id === '') {
        this._fetchAllProductList();
      } else {
        this._fetchProductListFilteringCompany(data);
      }
    }
  }

  private _setListProduct(product: Product[]): void {
    this.listProduct = product;
    this._downloadImages();
    this._valueShareService.setLoading(false);
  }

  private _fetchAllProductList(): void {
    if(this._allListProduct && this._allListProduct.length > 0) {
      this._setListProduct(this._allListProduct);
    } else {
      this.productService.fetchAllProducts().subscribe((res: Product[]) => {
        this._allListProduct = res;
        this._setListProduct(res);
      }, (err) => {
        console.log(err);
        this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
      });
    }
  }

  private _fetchProductListFilteringCompany(company: Company): void {
    if(this._listProductObj[company.id]) {
      this._setListProduct(this._listProductObj[company.id]);
    } else {
      this.productService.fetchProductListFilteringCompany(company.id).subscribe((res: Product[]) => {
        this._listProductObj[company.id] = res;
        this._setListProduct(res);
      }, (err) => {
        console.log(err);
        this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
      });
    }
  }

  goDetail(id: string) {
    this.router.navigate(['/product/detail/' + id]);
  }  
}
