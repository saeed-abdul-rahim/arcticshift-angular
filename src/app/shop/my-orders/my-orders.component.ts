import { Component, OnDestroy, OnInit } from '@angular/core';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface } from '@models/Order';
import { AlertService } from '@services/alert/alert.service';
import { NavbarService } from '@services/navbar/navbar.service';
import { OrderService } from '@services/order/order.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit, OnDestroy {

  orders: OrderInterface[];
  settings: GeneralSettings;

  orderSubscription: Subscription;
  settingsSubscription: Subscription;
  scrollSubscription: Subscription;

  constructor(public order: OrderService, private shop: ShopService,
              private nav: NavbarService, private alert: AlertService) {
  }

  ngOnInit(): void {
    this.orderSubscription = this.order.orders.subscribe(
      orders => this.orders = orders,
      error => this.handleError(error)
    );
    this.scrollSubscription = this.nav.getAtScrollBottom().subscribe(bottom => {
      if (bottom) {
        this.order.more();
      }
    });
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnDestroy(): void {
    this.order.destroy();
    if (this.orderSubscription && !this.orderSubscription.closed) {
      this.orderSubscription.unsubscribe();
    }
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

  getItems(order: OrderInterface) {
    const { data } = order;
    if (data) {
      const { productsData } = data;
      if (productsData && productsData.length > 0) {
        return productsData
        .map(product => {
          const {baseProduct, name, orderQuantity} = product;
          return `${orderQuantity} X ${baseProduct.name} - ${name}`;
        }).join(', ');
      }
    }
    return '';
  }

  getTrackingId(order: OrderInterface) {
    const { fullfilled } = order;
    return fullfilled.map(f => f.trackingId).filter(e => e).join(', ');
  }

  getDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toDateString();
  }

  trackByFn(index: number, item: OrderInterface) {
    return item.id;
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message });
  }

}
