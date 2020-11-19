import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import cloneDeep from 'lodash/cloneDeep';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';

import { ADD, FULLFILL } from '@constants/routes';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface, ProductData } from '@models/Order';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { countryAlphaList } from '@utils/countryAlphaList';
import { isBothArrEqual, uniqueArr } from '@utils/arrUtils';
import { WarehouseInterface } from '@models/Warehouse';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {

  faEllipsisV = faEllipsisV;
  edit = false;
  trackingLoading = false;
  totalQuantity = 0;
  selectedWarehouseId: string;
  loadingWarehouseId = '';
  showTrackingModal = false;
  editTrackingModal = false;
  trackingCode = '';

  fullfillRoute = FULLFILL;

  orderForm: FormGroup;
  order: OrderInterface;
  products: ProductData[] = [];
  unFullfilledProducts: ProductData[] = [];
  fullfilledProducts: ProductData[][] | any[][] = [];
  warehouses: WarehouseInterface[] = [];
  settings: GeneralSettings;

  displayedColumns = ['product', 'sku', 'quantity', 'price', 'total'];

  private warehouseIds: string[] = [];
  private orderSubscription: Subscription;
  private warehouseSubscription: Subscription;
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
    this.unsubscribeWarehouse();
  }

  private unsubscribeWarehouse() {
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
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

  getWarehouseName(warehouseId: string) {
    return this.warehouses.find(w => w.warehouseId === warehouseId)?.name;
  }

  toggleTrackingModal(warehouseId: string) {
    if (warehouseId) {
      this.showTrackingModal = true;
      const trackingId = this.getTrackingId(warehouseId);
      this.selectedWarehouseId = warehouseId;
      if (trackingId) {
        this.editTrackingModal = true;
        this.trackingCode = trackingId;
      } else {
        this.editTrackingModal = false;
      }
    }
  }

  getTrackingId(warehouseId: string) {
    const { fullfilled } = this.order;
    return fullfilled.find(w => w.warehouseId === warehouseId)?.trackingId;
  }

  async cancelFullfillment(warehouseId: string) {
    this.loadingWarehouseId = warehouseId;
    try {
      await this.admin.cancelFullfillment(this.order.id, warehouseId);
    } catch (err) {
      this.handleError(err);
    }
    this.loadingWarehouseId = '';
  }

  async addTrackingCode() {
    this.trackingLoading = true;
    try {
      await this.admin.addOrderTracking(this.order.id, {
        warehouseId: this.selectedWarehouseId,
        trackingCode: this.trackingCode
      });
      this.showTrackingModal = false;
      this.trackingCode = '';
    } catch (err) {
      this.handleError(err);
    }
    this.trackingLoading = false;
  }

  private getOrderById(orderId: string) {
    this.orderSubscription = this.admin.getOrderById(orderId).subscribe(order => {
      this.order = order;
      if (order) {
        this.getTotalQuantity();
        const { data } = order;
        const { productsData } = data;
        this.getUnFullfilledProducts([...productsData]);
        this.getFullfilledProducts([...productsData]);
        this.products = productsData;
      }
    }, err => this.handleError(err));
  }

  private getUnFullfilledProducts(productsData: ProductData[]) {
    const unFullfilledProducts = cloneDeep(productsData);
    this.unFullfilledProducts = unFullfilledProducts.map(product => {
      const { variantId } = product;
      product.orderQuantity -= this.getVariantFullfilledQuantity(variantId);
      return product;
    });
  }

  private getFullfilledProducts(productsData: ProductData[]) {
    const fullfilledProducts = cloneDeep(productsData);
    const { fullfilled } = this.order;
    const warehouseIds = uniqueArr(fullfilled.map(w => w.warehouseId));
    this.getWarehouseByIds(warehouseIds);
    this.fullfilledProducts = warehouseIds.map(warehouseId => {
      return fullfilledProducts.map(product => {
        const { variantId } = product;
        product.orderQuantity = this.getVariantFullfilledQuantity(variantId, warehouseId);
        return { ...product, warehouseId };
      });
    });
  }

  private getWarehouseByIds(ids: string[]) {
    if (!isBothArrEqual(this.warehouseIds, ids)) {
      this.unsubscribeWarehouse();
      this.warehouseSubscription = this.admin.getWarehousebyIds(ids).subscribe(warehouses => this.warehouses = warehouses);
    }
  }

  private getTotalQuantity() {
    try {
      this.totalQuantity = this.order.variants.map(v => v.quantity).reduce((acc, curr) => acc + curr, 0);
    } catch (err) {
      this.handleError(err);
    }
  }

  private getVariantFullfilledQuantity(variantId: string, warehouseId?: string) {
    let { fullfilled } = this.order;
    if (warehouseId) {
      fullfilled = fullfilled.filter(f => f.warehouseId === warehouseId);
    }
    return fullfilled
      .filter(f => f.variantId === variantId)
      .map(qty => qty.quantity)
      .reduce((acc, curr) => acc + curr, 0);
  }

  private handleError(err: any) {
    this.alert.alert({ message: err.message });
  }

}
