import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { NavbarService } from '@services/navbar/navbar.service';
import { ProductService } from '@services/product/product.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {

  sidebarOpened = false;

  sidebarOpenedSubscription: Subscription;

  constructor(private auth: AuthService, private product: ProductService, private shop: ShopService, private nav: NavbarService) { }

  ngOnInit(): void {
    this.getSidebarOpened();
    this.shop.getCurrentLocationDetails();
    this.shop.getGeneralSettingsFromDb();
    this.shop.setCategories();
    this.shop.setCollections();
    this.shop.setSaleDiscounts();
    this.product.getProducts();
    this.product.getAttributesFromDb();
    this.login();
  }

  ngOnDestroy(): void {
    this.product.destroy();
    if (this.sidebarOpenedSubscription && !this.sidebarOpenedSubscription.closed) {
      this.sidebarOpenedSubscription.unsubscribe();
    }
  }

  async login() {
    await this.auth.getUser();
  }

  getSidebarOpened() {
    this.sidebarOpenedSubscription = this.nav.getSidebarOpened().subscribe(open => this.sidebarOpened = open);
  }

}
