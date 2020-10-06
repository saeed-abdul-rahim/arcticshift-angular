import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADD, ADMIN, CATALOG, PRODUCTTYPE } from '@constants/adminRoutes';
import { ProductTypeInterface } from '@models/ProductType';
import { TaxInterface } from '@models/Tax';
import { AdminService } from '@services/admin/admin.service';
import { AuthService } from '@services/auth/auth.service';
import { ShopService } from '@services/shop/shop.service';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type-form.component.html',
  styleUrls: ['./product-type-form.component.css']
})
export class ProductTypeFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  nameDanger: boolean;

  productTypeRoute = `/${ADMIN}/${CATALOG}/${PRODUCTTYPE}`;
  productType: ProductTypeInterface;
  productTypeForm: FormGroup;

  tax$: Observable<TaxInterface[]>;
  userSubscription: Subscription;
  productTypeSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService, private authService: AuthService,
              private router: Router, private shopService: ShopService) {
    this.userSubscription = this.authService.getCurrentUserStream().subscribe(user => {
      if (user) {
        const { shopId } = user;
        this.tax$ = this.shopService.getAllTaxByShopIdAndType(shopId, 'product');
      }
    });
    const productTypeId = this.router.url.split('/').pop();
    if (productTypeId !== ADD) {
      this.edit = true;
      this.productTypeSubscription = this.shopService.getProductTypeById(productTypeId).subscribe(productType => {
        const { name, taxId, productAttributeId, variantAttributeId } = productType;
        this.productTypeForm.patchValue({
          name,
          tax: taxId,
          productAttributes: productAttributeId,
          variantAttributes: variantAttributeId
        });
      });
    }
  }

  ngOnInit(): void {
    this.productTypeForm = this.formbuilder.group({
      name: ['', Validators.required],
      tax: [''],
      productAttributes: [''],
      variantAttributes: ['']
    });
  }

  ngOnDestroy(): void {
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  get productTypeFormControls() { return this.productTypeForm.controls; }

  async onSubmit() {
    const { name, tax } = this.productTypeFormControls;
    if (this.productTypeForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateProductType({
          name: name.value,
          taxId: tax.value
        });
      } else {
        await this.adminService.createProductType({
          name: name.value,
          taxId: tax.value
        });
      }

      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }

  async deleteProductType() {
    this.loadingDelete = true;
    try {
      const { productTypeId } = this.productType;
      await this.adminService.deleteVariant(productTypeId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.productTypeRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

}
