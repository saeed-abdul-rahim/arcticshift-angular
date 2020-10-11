import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { VARIANT } from '@constants/adminRoutes';
import { AttributeJoinInterface } from '@models/Attribute';
import { ProductInterface } from '@models/Product';
import { VariantInterface } from '@models/Variant';
import { WarehouseInterface } from '@models/Warehouse';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-variant-form',
  templateUrl: './variant-form.component.html',
  styleUrls: ['./variant-form.component.css']
})
export class VariantFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete = false;
  successDelete = false;
  edit = true;

  nameDanger: boolean;
  sizeDanger: boolean;
  priceDanger: boolean;

  variantRoute: string;
  variantForm: FormGroup;

  product: ProductInterface;
  variant: VariantInterface;
  variants: VariantInterface[] = [];
  attributes: AttributeJoinInterface[] = [];
  warehouses: WarehouseInterface[] = [];

  productSubscription: Subscription;
  variantsSubscription: Subscription;
  productTypeSubscription: Subscription;
  attributeSubscription: Subscription;
  warehouseSubscription: Subscription;
  inventorySubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService, private shopService: ShopService,
              private router: Router) {
    const { url } = this.router;
    const urlSplit = url.split('/');
    const productId = urlSplit[urlSplit.indexOf(VARIANT) - 1];
    this.warehouseSubscription = this.adminService.getWarehousesByShopId().subscribe(warehouses => this.warehouses = warehouses);
    this.productSubscription = this.shopService.getProductById(productId).subscribe(product => {
      this.product = product;
      const { productTypeId } = product;
      this.productTypeSubscription = this.shopService.getProductTypeById(productTypeId)
        .subscribe(productType => {
          const { variantAttributeId } = productType;
          this.variantsSubscription = this.shopService.getAttributeAndValuesByIds(variantAttributeId)
            .subscribe(attributes => {
              this.attributes = attributes;
              this.setAttributeForm();
            });
        });
    });
    this.variantsSubscription = this.shopService.getVariantsByProductId(productId)
      .subscribe(variants => this.variants = variants);
    urlSplit.pop();
    this.variantRoute = urlSplit.join('/');
  }

  ngOnInit(): void {
    this.variantForm = this.formbuilder.group({
      attributes: new FormArray([]),
      size: ['', Validators.required],
      price: [''],
      strikePrice: [''],
      sku: [''],
      trackInventory: [false],
      warehouse: new FormArray([])
    });
  }

  ngOnDestroy(): void {
    if (this.productSubscription && !this.productSubscription.closed) {
      this.productSubscription.unsubscribe();
    }
    if (this.variantsSubscription && !this.variantsSubscription.closed) {
      this.variantsSubscription.unsubscribe();
    }
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
    if (this.warehouseSubscription && !this.warehouseSubscription.closed) {
      this.warehouseSubscription.unsubscribe();
    }
    if (this.inventorySubscription && !this.inventorySubscription.closed) {
      this.inventorySubscription.unsubscribe();
    }
  }

  setAttributeForm() {
    this.variantFormControls.attributes.reset();
    this.attributes.forEach(attr => {
      let defaultValue = '';
      if (this.variant && this.variant.attributeValueId) {
        defaultValue = this.product.attributeValueId.find(id => id === attr.attributeValueId.find(vId => vId === id));
      }
      this.attributeForm.push(this.formbuilder.group({
        attributeValueId: [defaultValue]
      }));
    });
  }

  get variantFormControls() { return this.variantForm.controls; }
  get attributeForm() { return this.variantForm.controls.attributes as FormArray; }

  async onSubmit() {
    const { size } = this.variantFormControls;
    if (this.variantForm.invalid) {
      if (size.errors) {
        this.sizeDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateVariant({
          size: size.value,

        });
      } else {
        const data = await this.adminService.createVariant({
          size: size.value,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.variantRoute}/${id}`);
        }
      }

      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }

  async deleteVariant() {
    this.loadingDelete = true;
    try {
      const { variantId } = this.variant;
      await this.adminService.deleteVariant(variantId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.variantRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

}
