import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './../../service/product-service/product.service';
import { Product } from 'src/app/model/product';
declare const $;

@Component({
  selector: 'app-list-product',
  templateUrl: './list-product.component.html',
  styleUrls: ['./list-product.component.css']
})
export class ListProductComponent implements OnInit {

  public loading = true;

  public completeBody: string; 
  public completeBtnType: string;

  public listProduct: Product[];
  public csvListProduct: Product[];

  constructor(
    private router: Router,
    private productService: ProductService,
  ) { }

  ngOnInit() {
    this.csvListProduct = [{
      id: '商品コード',
      name: '商品名',
      nameKana: '商品名かな',
      lot: '商品入り数',
      imageUrl: '画像パス',
      companyId: '得意先コード',
      companyName: '得意先名',
      bottleId: 'ボトルコード',
      bottleName: 'ボトル名',
      cartonId: 'カートンコード',
      cartonName: 'カートン名',
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
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  goDetail(id: string) {
    this.router.navigate(['/product/detail/' + id]);
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
