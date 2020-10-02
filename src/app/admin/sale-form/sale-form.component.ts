import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN, CATALOG, SALE } from '@constants/adminRoutes';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete = false;
  successDelete = false;
  edit = false;

  nameDanger: boolean;

  saleRoute = `/${ADMIN}/${CATALOG}/${SALE}`;
  sale: SaleDiscountInterface;
  addSaleForm: FormGroup;


  saleSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const saleId = this.router.url.split('/').pop();
    if (saleId !== 'add') {
      this.edit = true;
      this.saleSubscription = this.shopService.getSaleById(saleId).subscribe(sale => {
        const { name, value } = sale;
        this.addSaleForm.patchValue({
          name, value

        });
      });
    }
  }

  ngOnInit(): void {
    this.addSaleForm = this.formbuilder.group({
      name: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    if (this.saleSubscription && !this.saleSubscription.closed) {
      this.saleSubscription.unsubscribe();
    }
  }

  get addSaleFormControls() { return this.addSaleForm.controls; }

  async onSubmit() {
    const { name, value } = this.addSaleFormControls;
    if (this.addSaleForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateSale({
          name: name.value,
          value: value.value
        });
      } else {
       const data = await this.adminService.createSale({
          name: name.value,
          value: value.value
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${SALE}/${id}`);
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

  async deleteSale() {
    this.loadingDelete = true;
    try {
      const { saleDiscountId } = this.sale;
      await this.adminService.deleteSale(saleDiscountId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.saleRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

}
