import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { ADD, FULLFILL } from '@constants/routes';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface, ProductData } from '@models/Order';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { countryAlphaList } from '@utils/countryAlphaList';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {

  edit = false;
  totalQuantity = 0;

  fullfillRoute = FULLFILL;

  orderForm: FormGroup;
  order: OrderInterface;
  products: ProductData[] = [];
  settings: GeneralSettings;

  displayedColumns = ['product', 'sku', 'quantity', 'price', 'total'];
  productsSource: MatTableDataSource<ProductData>;

  private orderSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private admin: AdminService, private shop: ShopService, private router: Router, private alert: AlertService) { }

  ngOnInit(): void {
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
    const orderId = this.router.url.split('/').pop();
    if (orderId !== ADD) {
      this.edit = true;
      this.getOrderById(orderId);
    }
  }

  ngOnDestroy(): void {
    if (this.orderSubscription && !this.orderSubscription.closed) {
      this.orderSubscription.unsubscribe();
    }
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

  getOrderById(orderId: string) {
    this.orderSubscription = this.admin.getOrderById(orderId).subscribe(order => {
      this.order = order;
      if (order) {
        this.getTotalQuantity();
        const { data } = order;
        const { productsData } = data;
        this.products = productsData;
        this.productsSource = new MatTableDataSource(productsData);
      }
    }, err => this.handleError(err));
  }

  getTotalQuantity() {
    try {
      this.totalQuantity = this.order.variants.map(v => v.quantity).reduce((acc, curr) => acc + curr, 0);
    } catch (err) {
      this.handleError(err);
    }
  }

  getCountry(alpha3: string) {
    const country = countryAlphaList.find(c => c.alpha3 === alpha3);
    if (country) {
      return country.name;
    } else {
      return '';
    }
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message });
  }

}
