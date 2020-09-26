import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { Subscription } from 'rxjs/internal/Subscription';

export type Url = {
  endPath: string,
  split: string[],
  url: string
};

@Injectable()
export class AdminNavService {

  private urlSubscription: Subscription;
  private adminPath = '/admin';
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
    if (type === 'product' || type === 'category' || type === 'collection') {
      return `${this.adminPath}/catalog/${type}`;
    } else if (type === 'sale' || type === 'voucher') {
      return `${this.adminPath}/discount/${type}`;
    } else {
      return `${this.adminPath}/${type}`;
    }
  }

  getCurrentUrl() {
    return this.url$;
  }

  getNavRoutes() {
    return [
      'dashboard', 'order', 'customer', 'product', 'category', 'collection', 'sale', 'voucher',
      'product-attribute', 'product-type', 'shipping', 'warehouse', 'staff'
    ];
  }

}
