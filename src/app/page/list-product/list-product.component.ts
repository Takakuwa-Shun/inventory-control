import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './../../service/product-service/product.service';
import { Product } from 'src/app/model/product';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent implements OnInit {

  public listProduct: Product[];
  public csvListProduct: Product[];

  constructor(
    private router: Router,
    private productService: ProductService,
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
   }

  ngOnInit() {
    this.csvListProduct = [{
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
    this.fetchAllProducts();
  }

  private fetchAllProducts(): void {
    this.productService.fetchAllProducts().subscribe((res: Product[]) => {
      this.listProduct = res;
      this.csvListProduct = this.csvListProduct.concat(this.listProduct);
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
