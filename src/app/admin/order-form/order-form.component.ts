import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { of } from 'rxjs/internal/observable/of';
import { tap } from 'rxjs/internal/operators/tap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { concat } from 'rxjs/internal/observable/concat';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import cloneDeep from 'lodash/cloneDeep';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';

import { ADD, FULLFILL, orderRoute } from '@constants/routes';
import { GeneralSettings } from '@models/GeneralSettings';
import { OrderInterface, ProductData, VariantQuantity } from '@models/Order';
import { WarehouseInterface } from '@models/Warehouse';
import { VariantExtended, VariantInterface } from '@models/Variant';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { isBothArrEqual, uniqueArr } from '@utils/arrUtils';
import { countryList, CountryListType, CountryStateType, getCountryName } from '@utils/countryList';
import { getSmallestThumbnail } from '@utils/media';
import { countryCallCodes } from '@utils/countryCallCodes';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {

  fullfillRoute = FULLFILL;
  faEllipsisV = faEllipsisV;
  totalQuantity = 0;
  selectedWarehouseId: string;
  loadingWarehouseId = '';

  edit = false;
  successDraft = false;
  addedToCart = false;
  orderCancelled = false;
  hasSaleDiscount = false;
  hasVoucher = false;
  hasShipping = false;
  isStoreOrder = true;

  showVoucherModal = false;
  showTrackingModal = false;
  showRefundModal = false;
  showCaptureModal = false;
  showCustomerModal = false;
  editTrackingModal = false;

  modalLoading = false;
  orderLoading = false;
  saveDraftLoading = false;
  calculateLoading = false;
  cancelOrderLoading = false;
  variantsLoading = false;
  voucherLoading = false;
  saleDiscountLoading = false;
  shippingLoading = false;

  trackingCode = '';
  voucherCode = '';
  refundAmount: number;
  captureAmount: number;
  balanceAmount: number;
  searchKey$ = new Subject<string>();
  variantsSource: MatTableDataSource<VariantExtended>;
  selectedVariants: VariantExtended[] = [];

  shippingAddressCheck = false;
  countryList = countryList;
  countryCallCodes = countryCallCodes;
  billingStates: CountryStateType[] = [];
  shippingStates: CountryStateType[] = [];
  billingForm: FormGroup;
  shippingForm: FormGroup;
  addressFormGroup = {
    firstName: [''],
    lastName: [''],
    email: [''],
    phone: [''],
    phoneCode: [null],
    line1: [''],
    line2: [''],
    state: [null],
    city: [''],
    zip: [''],
    country: [null]
  };

  draftId: string;
  order: OrderInterface;
  products: ProductData[] = [];
  unFullfilledProducts: ProductData[] = [];
  fullfilledProducts: ProductData[][] | any[][] = [];
  warehouses: WarehouseInterface[] = [];
  settings: GeneralSettings;
  variants$: Observable<VariantInterface[]>;
  getCountryName = getCountryName;
  getSmallestThumbnail = getSmallestThumbnail;

  displayedColumns = ['product', 'sku', 'quantity', 'price', 'total'];

  private warehouseIds: string[] = [];
  private draftSubscription: Subscription;
  private orderSubscription: Subscription;
  private warehouseSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private admin: AdminService, private shop: ShopService, private router: Router, private alert: AlertService,
              private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.variantsSource = new MatTableDataSource();
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
    const orderId = this.router.url.split('/').pop();
    if (orderId !== ADD) {

      this.edit = true;
      this.getOrderById(orderId);

    } else {

      this.variants$ = concat(
        of([]), // default items
        this.searchKey$.pipe(
          distinctUntilChanged(),
          tap(() => this.variantsLoading = true),
          switchMap(term => term ? this.admin.searchVariantsByKeyword(term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.variantsLoading = false)
          ) : of([]))
        )
      );

      this.billingForm = this.formBuilder.group(this.addressFormGroup);
      this.shippingForm = this.formBuilder.group(this.addressFormGroup);

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
    this.unsubscribeDraft();
  }

  get billingFormControls() { return this.billingForm.controls; }
  get shippingFormControls() { return this.shippingForm.controls; }

  private unsubscribeWarehouse() {
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
  }

  private unsubscribeDraft() {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
  }

  // Update table and forms for order details card
  selectVariant(variants: VariantInterface[]) {
    const dataSource = variants.map(v => {
      let quantity = 1;
      const variantForm = this.variantsSource.data.find(vs => vs.variantId === v.variantId)?.form;
      if (variantForm) {
        quantity = variantForm.controls.quantity.value;
      }
      return { ...v, form: this.formBuilder.group({
        variantId: [v.id],
        quantity: [quantity]
        })
      };
    });
    this.variantsSource.data = dataSource;
  }

  ngSelectTrackBy(item: VariantInterface) {
    return item.id;
  }

  ngSelectCompare(item: VariantInterface, selected: VariantInterface) {
    return item.id === selected.id;
  }

  setBillingState(country: CountryListType) {
    this.billingFormControls.state.patchValue(null);
    if (!country) {
      this.billingStates = [];
      return;
    }
    this.billingStates = country.states;
  }

  setShippingState(country: CountryListType) {
    this.shippingFormControls.state.patchValue(null);
    if (!country) {
      this.shippingStates = [];
      return;
    }
    this.shippingStates = country.states;
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

  toggleRefundModal() {
    this.showRefundModal = true;
  }

  toggleCaptureModal() {
    this.showCaptureModal = true;
  }

  getTrackingId(warehouseId: string) {
    const { fullfilled } = this.order;
    return fullfilled.find(w => w.warehouseId === warehouseId)?.trackingId;
  }

  async addShippingCharge() {
    try {

    } catch (err) {
      this.handleError(err);
    }
  }

  async toggleVoucher() {
    try {
      if (this.order && this.order.voucherId) {
        this.voucherLoading = true;
        await this.removeVoucher();
      } else {
        this.showVoucherModal = true;
      }
    } catch (err) {
      this.handleError(err);
    }
    this.voucherLoading = false;
  }

  async addVoucher() {
    this.voucherLoading = true;
    this.modalLoading = true;
    try {
      if (!this.draftId) {
        await this.calculate();
      }
      await this.shop.addVoucher(this.draftId, this.voucherCode);
    } catch (err) {
      this.handleError(err);
    }
    this.voucherLoading = false;
    this.modalLoading = false;
  }

  async removeVoucher() {
    if (!this.draftId) { return; }
    this.voucherLoading = true;
    try {
      this.shop.removeVoucher(this.draftId);
    } catch (err) {
      this.handleError(err);
    }
    this.voucherLoading = false;
  }

  async toggleSaleDiscount() {
    this.saleDiscountLoading = true;
    try {
      this.hasSaleDiscount = !this.hasSaleDiscount;
      await this.calculate();
    } catch (err) {
      this.hasSaleDiscount = !this.hasSaleDiscount;
    }
    this.saleDiscountLoading = false;
  }

  async addToCart() {
    let shopId: string;
    if (this.variantsSource.data.length > 0) {
      shopId = this.variantsSource.data[0].shopId;
    } else {
      return;
    }
    this.calculateLoading = true;
    try {
      const variants: VariantQuantity[] = this.variantsSource.data.map(vs => {
        const quantity = vs.form?.controls.quantity.value;
        return {
          variantId: vs.variantId,
          quantity
        };
      });
      await this.shop.addToCart({
        shopId,
        variants
      });
      this.addedToCart = true;
    } catch (err) {
      this.handleError(err);
    }
    this.calculateLoading = false;
  }

  async calculate() {
    try {
      if (this.variantsSource.data.length < 1) {
        return;
      }
      this.calculateLoading = true;
      const variants = this.variantsSource.data.map(vs => {
        const { controls } = vs.form;
        const { variantId, quantity } = controls;
        return {
          variantId: variantId.value,
          quantity: quantity.value,
        };
      });
      const data: OrderInterface = {
        variants
      };
      if (!this.draftId) {
        const { id } = await this.admin.createDraft();
        this.draftId = id;
      }
      await this.admin.addVariants(this.draftId, data);
      await this.admin.getCartTotal(this.draftId, {
        hasSaleDiscount: this.hasSaleDiscount,
        hasShippingRate: this.hasShipping,
        // priceName: this.isStoreOrder ? 'store' : ''
      });
      this.unsubscribeDraft();
      this.draftSubscription = this.admin.getDraftById(this.draftId).subscribe(order => this.order = order);
    } catch (err) {
      this.handleError(err);
    }
    this.calculateLoading = false;
  }

  async createOrder() {
    this.saveDraftLoading = true;
    try {
      const id = await this.admin.createOrder(this.draftId);
      this.successDraft = true;
      setTimeout(() => {
        this.successDraft = false;
        this.cdr.detectChanges();
      }, 2000);
      this.router.navigateByUrl(`/${orderRoute}/${id}`);
    } catch (err) {
      this.handleError(err);
    }
    this.saveDraftLoading = false;
  }

  async cancelOrder() {
    this.cancelOrderLoading = true;
    try {
      await this.admin.cancelOrder(this.order.id);
    } catch (err) {
      this.handleError(err);
    }
    this.cancelOrderLoading = false;
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
    this.modalLoading = true;
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
    this.modalLoading = false;
  }

  async refund() {
    this.modalLoading = true;
    try {
      await this.admin.refund(this.order.id, this.refundAmount);
      this.showRefundModal = false;
    } catch (err) {
      this.handleError(err);
    }
    this.modalLoading = false;
  }

  async capture() {
    this.modalLoading = true;
    try {
      await this.admin.captureAmount(this.order.id, this.captureAmount);
      this.showCaptureModal = false;
    } catch (err) {
      this.handleError(err);
    }
    this.modalLoading = false;
  }

  private getOrderById(orderId: string) {
    this.orderSubscription = this.admin.getOrderById(orderId).subscribe(order => {
      this.order = order;
      if (order) {
        this.getTotalQuantity();
        this.calculateBalance();
        const { data, orderStatus } = order;
        if (orderStatus === 'cancelled') {
          this.orderCancelled = true;
        } else {
          this.orderCancelled = false;
        }
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
      if (product.orderQuantity === 0) {
        return;
      } else {
        return product;
      }
    }).filter(e => e);
  }

  private getFullfilledProducts(productsData: ProductData[]) {
    const fullfilledProducts = cloneDeep(productsData);
    const { fullfilled } = this.order;
    const warehouseIds = uniqueArr(fullfilled.filter(w => w.quantity > 0).map(w => w.warehouseId));
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

  private calculateBalance() {
    const { total, capturedAmount, payment } = this.order;
    const balance = total - capturedAmount;
    const refundData = payment.filter(p => p.type === 'refund');
    const refund = refundData.map(p => p.amount).reduce((acc, curr) => acc + curr, 0);
    this.balanceAmount = balance - refund;
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
    this.alert.alert({ message: err.message || err });
  }

}
