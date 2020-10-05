import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AdminNavService, Url } from '@services/admin-nav/admin-nav.service';

import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faTv } from '@fortawesome/free-solid-svg-icons/faTv';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons/faBoxOpen';
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
import { faBoxes } from '@fortawesome/free-solid-svg-icons/faBoxes';
import { faPercent } from '@fortawesome/free-solid-svg-icons/faPercent';
import { faTag } from '@fortawesome/free-solid-svg-icons/faTag';
import { faShapes } from '@fortawesome/free-solid-svg-icons/faShapes';
import { faSquare } from '@fortawesome/free-solid-svg-icons/faSquare';
import { faShippingFast } from '@fortawesome/free-solid-svg-icons/faShippingFast';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons/faWarehouse';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons/faDollarSign';
import { faIdBadge } from '@fortawesome/free-solid-svg-icons/faIdBadge';

import {
  CATALOG,
  CATEGORY,
  COLLECTION,
  CUSTOMER,
  DASHBOARD,
  DISCOUNT,
  ORDER,
  PRODUCT,
  PRODUCTATTRIBUTE,
  PRODUCTTYPE,
  SALE,
  SHIPPING,
  STAFF,
  TAX,
  VOUCHER,
  WAREHOUSE
} from '@constants/adminRoutes';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  faBars = faBars;
  faTimes = faTimes;
  faTv = faTv;
  faShoppingCart = faShoppingCart;
  faUsers = faUsers;
  faBoxOpen = faBoxOpen;
  faBox = faBox;
  faBoxes = faBoxes;
  faPercent = faPercent;
  faTag = faTag;
  faShapes = faShapes;
  faSquare = faSquare;
  faShippingFast = faShippingFast;
  faWarehouse = faWarehouse;
  faDollarSign = faDollarSign;
  faIdBadge = faIdBadge;

  dashboardRoute = DASHBOARD;
  orderRoute = ORDER;
  customerRoute = CUSTOMER;
  productRoute = PRODUCT;
  categoryRoute = CATEGORY;
  collectionRoute = COLLECTION;
  saleRoute = SALE;
  voucherRoute = VOUCHER;
  productAttributeRoute = PRODUCTATTRIBUTE;
  productTypeRoute = PRODUCTTYPE;
  shippingRoute = SHIPPING;
  warehouseRoute = WAREHOUSE;
  taxRoute = TAX;
  staffRoute = STAFF;

  currentUrl: Url;
  currentPath: string;
  urlSubscription: Subscription;

  collapseShow = 'hidden';
  showCatalog = false;
  showDiscount = false;
  showConfiguration = false;

  constructor(private adminNavService: AdminNavService, private router: Router) {
    this.urlSubscription = this.adminNavService.getCurrentUrl().subscribe(url => {
      this.currentUrl = url;
      this.setCurrentPath();
      const { split } = this.currentUrl;
      if (split.includes(CATALOG)) {
        this.showCatalog = true;
      } else if (split.includes(DISCOUNT)) {
        this.showDiscount = true;
      } else if (!split.includes(DASHBOARD) && !split.includes(CUSTOMER) && !split.includes(ORDER)) {
        this.showConfiguration = true;
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.urlSubscription && !this.urlSubscription.closed) {
      this.urlSubscription.unsubscribe();
    }
  }

  toggleCollapseShow(classes: string) {
    this.collapseShow = classes;
  }

  toggleCatalog() {
    this.showCatalog = !this.showCatalog;
  }

  toggleDiscount() {
    this.showDiscount = !this.showDiscount;
  }

  toggleConfiguration() {
    this.showConfiguration = !this.showConfiguration;
  }

  navigate(type: string) {
    const path = this.adminNavService.getRoute(type);
    this.router.navigateByUrl(path);
  }

  setCurrentPath() {
    const { currentUrl } = this;
    const { split } = currentUrl;
    this.currentPath = this.adminNavService.getNavRoutes().find(r => split.includes(r));
  }

}
