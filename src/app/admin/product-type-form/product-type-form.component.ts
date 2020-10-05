import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN, CATALOG, PRODUCTTYPE } from '@constants/adminRoutes';
import { ProductTypeInterface } from '@models/ProductType';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
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
  edit = true;

  nameDanger: boolean;

  productTypeRoute = `/${ADMIN}/${CATALOG}/${PRODUCTTYPE}`;
  productType: ProductTypeInterface;
  productTypeForm: FormGroup;
  productTypeSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const productTypeId = this.router.url.split('/').pop();
    if (productTypeId !== 'add') {
      this.edit = true;
      this.productTypeSubscription = this.shopService.getCollectionById(productTypeId).subscribe(productType => {
        const { name } = productType;
        this.productTypeForm.patchValue({
          name,

        });
      });
    }
  }

  ngOnInit(): void {
    this.productTypeForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.productTypeSubscription && !this.productTypeSubscription.closed) {
      this.productTypeSubscription.unsubscribe();
    }
  }

  get productTypeFormControls() { return this.productTypeForm.controls; }

  async onSubmit() {
    const { name } = this.productTypeFormControls;
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

        });
      } else {
        await this.adminService.createProductType({
          name: name.value,

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
