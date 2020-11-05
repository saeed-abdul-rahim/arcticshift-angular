import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { ProductService } from '@services/product/product.service';
import { ShopService } from '@services/shop/shop.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {

  constructor(private auth: AuthService, private product: ProductService, private shop: ShopService) { }

  ngOnInit(): void {
    this.shop.getCurrentLocationDetails();
    this.shop.setSaleDiscounts();
    this.product.getProducts();
    this.product.getAttributesFromDb();
    this.login();
  }

  ngOnDestroy(): void {
    this.product.destroy();
  }

  async login() {
    await this.auth.getUser();
  }

}
