import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { Fullfill, OrderInterface, ProductData, VariantQuantity } from '@models/Order';
import { AlertService } from '@services/alert/alert.service';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { VariantInterface } from '@models/Variant';
import { isBothArrEqual, uniqueArr } from '@utils/arrUtils';
import { WarehouseInterface } from '@models/Warehouse';

@Component({
  selector: 'app-fullfill-form',
  templateUrl: './fullfill-form.component.html',
  styleUrls: ['./fullfill-form.component.css']
})
export class FullfillFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;

  fullfillForm: FormGroup;
  order: OrderInterface;
  products: ProductData[] = [];
  variants: VariantInterface[];
  warehouses: WarehouseInterface[] = [];

  displayedColumns = ['product', 'sku', 'quantity'];
  productsSource: MatTableDataSource<ProductData>;

  orderSubscription: Subscription;
  variantSubscription: Subscription;
  warehouseSubscription: Subscription;

  constructor(private admin: AdminService, private shop: ShopService,
              private router: Router, private alert: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    const routeSplit = this.router.url.split('/');
    routeSplit.pop();
    const orderId = routeSplit.pop();
    this.fullfillForm = this.formBuilder.group({});
    this.getOrderById(orderId);
  }

  ngOnDestroy(): void {
    if (this.orderSubscription && !this.orderSubscription.closed) {
      this.orderSubscription.unsubscribe();
    }
    this.unsubscribeVariants();
  }

  unsubscribeVariants() {
    if (this.variantSubscription && !this.variantSubscription.closed) {
      this.variantSubscription.unsubscribe();
    }
  }

  unsubscribeWarehouses() {
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
  }

  async fullfill() {
    if (this.fullfillForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      const { controls } = this.fullfillForm;
      const fullfilled = Object.keys(controls).map(variantId => {
        const fullfill = {};
        const warehouseForm = controls[variantId] as FormGroup;
        Object.keys(warehouseForm.controls).map(warehouseId => {
          Object.assign(fullfill, {
            variantId,
            warehouseId,
            quantity: warehouseForm.controls[warehouseId].value ? Number(warehouseForm.controls[warehouseId].value) : 0
          });
        });
        return fullfill as Fullfill;
      });
      await this.admin.fullfillOrder(this.order.id, { fullfilled });
      this.success = true;
      setInterval(() => this.success = false, 2000);
    } catch (err) {
      this.handleError(err);
    }
    this.loading = false;
  }

  // ORDERED FUNCTIONS -> Order -> Variant -> Warehouse ---------------------------------------------

  getOrderById(orderId: string) {
    this.orderSubscription = this.admin.getOrderById(orderId).subscribe(order => {
      this.order = order;
      if (order) {
        const { data, variants } = order;
        const { productsData } = data;
        this.getVariants(variants);
        this.products = productsData.filter(product => !this.isFullfilledVariant(product.variantId));
      }
    }, err => this.handleError(err));
  }

  getVariants(variants: VariantQuantity[]) {
    this.unsubscribeVariants();
    const variantIds = variants.map(v => v.variantId);
    this.variantSubscription = this.shop.getVariantByIds(variantIds).subscribe(vs => {
      this.variants = vs;
      if (vs) {
        const warehousesObjs = vs.map(v => {
          if (v.warehouseQuantity) {
            return Object.keys(v.warehouseQuantity);
          }
        });
        const warehouseIds = uniqueArr([].concat(...warehousesObjs));
        this.getWarehouseByIds(warehouseIds);
      }
    });
  }

  getWarehouseByIds(warehouseIds: string[]) {
    this.unsubscribeWarehouses();
    this.warehouseSubscription = this.admin.getWarehousebyIds(warehouseIds).subscribe(warehouses => {
      if (warehouses) {
        const oldWarehouseIds = this.warehouses.map(w => w.id);
        this.warehouses = warehouses;
        if (!isBothArrEqual(warehouseIds, oldWarehouseIds)) {
          this.setDisplayedColumns();
          warehouses.forEach(warehouse => this.displayedColumns.push(warehouse.id));
          this.createForm();
          this.updateForm();
          this.productsSource = new MatTableDataSource(this.products);
        }
      }
    });
  }

  // --------------------------------------------------------------------------------------------------------

  createForm() {
    const variantFormKey: any = {};
    this.variants.forEach(variant => {
      const { variantId } = variant;
      if (this.isFullfilledVariant(variantId)) { return; }
      const formWarehouseKey: any = {};
      this.warehouses.forEach(warehouse => Object.assign(formWarehouseKey, {
        [warehouse.id]: [0, [this.validateQuantity(warehouse.id, variantId)]]
      }));
      Object.assign(variantFormKey, { [variantId]: this.formBuilder.group(formWarehouseKey) });
    });
    this.fullfillForm = this.formBuilder.group(variantFormKey);
  }

  updateForm() {
    const { fullfilled } = this.order;
    fullfilled.forEach(fullfill => {
      try {
        const { variantId, warehouseId, quantity } = fullfill;
        if (this.isFullfilledVariant(variantId)) { return; }
        const variantForm = this.fullfillForm.controls[variantId] as FormGroup;
        if (quantity && quantity > 0) {
          variantForm.controls[warehouseId].patchValue(quantity);
        }
      } catch (err) {
        this.handleError(err);
      }
    });
  }

  getWarehouseQuantity(variantId: string, warehouseId: string) {
    const variant = this.variants.find(v => v.id === variantId);
    return variant.warehouseQuantity[warehouseId];
  }

  getFullfilledQuantity(variantId: string) {
    return this.order.fullfilled
      .filter(p => p.variantId === variantId)
      .map(p => p.quantity)
      .reduce((acc, curr) => acc + curr, 0);
  }

  validateQuantity(warehouseId: string, variantId: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const quantity = Number(control.value);
      if (quantity < 0) {
        return { incorrect: true };
      }
      const variant = this.variants.find(v => v.id === variantId);
      if (quantity > variant.warehouseQuantity[warehouseId]) {
        return { incorrect: true };
      }
      const { variants } = this.order;
      const orderedVariant = variants.find(v => v.variantId === v.variantId);
      if (quantity > orderedVariant.quantity) {
        return { incorrect: true };
      }
      return null;
    };
  }

  isFullfilledVariant(variantId: string) {
    const orderVariantQty = this.order.variants.find(v => v.quantity);
    if (!orderVariantQty) { return false; }
    return this.getFullfilledQuantity(variantId) === orderVariantQty.quantity;
  }

  isFormControlValid(variantId: string, warehouseId: string) {
    const warehouseGroup = this.fullfillForm.controls[variantId] as FormGroup;
    const warehousControl = warehouseGroup.controls;
    return warehousControl[warehouseId].invalid;
  }

  setDisplayedColumns() {
    this.displayedColumns = ['product', 'sku', 'quantity'];
  }

  trackByFn(index: number, item: WarehouseInterface) {
    return item.id;
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message || err });
  }

}
