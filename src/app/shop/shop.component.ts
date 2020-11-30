import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { CartService } from '@services/cart/cart.service';
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

  constructor(private auth: AuthService, private product: ProductService, private shop: ShopService,
              private nav: NavbarService, private cart: CartService) { }

  ngOnInit(): void {
    this.login();
    this.getSidebarOpened();
    this.auth.getUserDocument();
    this.shop.getCurrentLocationDetails();
    this.shop.setCategories();
    this.shop.setCollections();
    this.shop.setSaleDiscounts();
    this.product.getProducts();
    this.product.getAttributesFromDb();
    window.addEventListener('scroll', this.scrollEvent, true);
  }

  ngOnDestroy(): void {
    this.product.destroy();
    this.cart.destroy();
    if (this.sidebarOpenedSubscription && !this.sidebarOpenedSubscription.closed) {
      this.sidebarOpenedSubscription.unsubscribe();
    }
    window.removeEventListener('scroll', this.scrollEvent, true);
  }

  async login() {
    await this.auth.isAuthenticated();
  }

  getSidebarOpened() {
    this.sidebarOpenedSubscription = this.nav.getSidebarOpened().subscribe(open => this.sidebarOpened = open);
  }

  scrollEvent = (event: any): void => {
    const n = event.srcElement.scrollTop + event.srcElement.offsetHeight;
    const max = event.srcElement.scrollHeight;
    if (n === max) {
      this.nav.setAtScrollBottom(true);
    } else {
      this.nav.setAtScrollBottom(false);
    }
  }

}
