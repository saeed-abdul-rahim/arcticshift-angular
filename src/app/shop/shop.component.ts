import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { ProductService } from '@services/product/product.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {

  constructor(private auth: AuthService, private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getProducts();
    this.productService.getAttributesFromDb();
    this.login();
  }

  ngOnDestroy(): void {
    this.productService.destroy();
  }

  async login() {
    await this.auth.getUser();
  }

}
