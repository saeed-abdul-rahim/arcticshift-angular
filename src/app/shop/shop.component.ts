import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '@services/product/product.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts();
    this.productService.getAttributesFromDb();
  }

  ngOnDestroy(): void {
    this.productService.destroy();
  }

}
