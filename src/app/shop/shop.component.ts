import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { NavbarService } from '@services/navbar/navbar.service';
import { ProductService } from '@services/product/product.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';
import * as findAnd from 'find-and';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {

  sidebarOpened = false;

  sidebarOpenedSubscription: Subscription;

  data = [
    {
      id: 'hdjksa7dsa90as',
      name: 'MEN',
      subs: [
        {
          id: 'hud8a79',
          name: 'SHIRTS',
          subs: [
            { id: 'hjdksal', name: 'T-SHIRTS', hidden: true },
            { id: 'hds8a98', name: 'SHIRTS', hidden: true }
          ],
          hidden: true
        },
        { id: '898dhah', name: 'PANTS', hidden: true }
      ]
    },
    {
      id: 'hudia8yhusa2eq',
      name: 'WOMEN',
      subs: [
        { id: 'hud8a79', name: 'BAGS', hidden: true },
        { id: '898dhah', name: 'PURSES', hidden: true }
      ]
    }
  ];

  constructor(private auth: AuthService, private product: ProductService, private shop: ShopService, private nav: NavbarService) { }

  ngOnInit(): void {
    this.getSidebarOpened();
    this.shop.getCurrentLocationDetails();
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

  toggleHiddenLink(id: string) {
    const subData = findAnd.returnFound(this.data, {id});
    if (subData.hidden) {
      subData.hidden = false;
    } else {
      subData.hidden = true;
    }
    this.data = findAnd.changeProps(this.data, { id }, { ...subData});
  }

}
