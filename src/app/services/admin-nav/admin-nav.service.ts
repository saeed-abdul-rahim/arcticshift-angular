import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { Subscription } from 'rxjs/internal/Subscription';

import {
  ADMIN,
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
} from '@constants/routes';

export type Url = {
  endPath: string,
  split: string[],
  url: string
};

@Injectable()
export class AdminNavService {

  private urlSubscription: Subscription;
  private url: BehaviorSubject<Url> = new BehaviorSubject<Url> (null);

  url$ = this.url.asObservable();

  constructor(private router: Router) {
    const initUrl = this.router.url;
    this.url.next({
      url: initUrl,
      split: initUrl.split('/'),
      endPath: initUrl.split('/').pop()
    });
    this.urlSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const { url } = event;
      const split = url.split('/');
      const endPath = url.split('/').pop();
      this.url.next({
        url, split, endPath
      });
    });
  }

  destroy() {
    if (this.urlSubscription && !this.urlSubscription.closed) {
      this.urlSubscription.unsubscribe();
    }
  }

  getRoute(type: string) {
    if (type === PRODUCT || type === CATEGORY || type === COLLECTION) {
      return `/${ADMIN}/${CATALOG}/${type}`;
    } else if (type === SALE || type === VOUCHER) {
      return `/${ADMIN}/${DISCOUNT}/${type}`;
    } else {
      return `/${ADMIN}/${type}`;
    }
  }

  getCurrentUrl() {
    return this.url$;
  }

  getNavRoutes() {
    return [
      DASHBOARD, ORDER, CUSTOMER, PRODUCT, CATEGORY, COLLECTION, SALE, VOUCHER, PRODUCTATTRIBUTE,
      PRODUCTTYPE, SHIPPING, WAREHOUSE, STAFF, TAX
    ];
  }

}
