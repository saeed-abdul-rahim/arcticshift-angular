import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { ADMIN, DISCOUNT, SALE } from '@constants/adminRoutes';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { AdminService } from '@services/admin/admin.service';

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
  showMeEndDate = false;
  edit = false;

  nameDanger: boolean;

  saleRoute = `/${ADMIN}/${DISCOUNT}/${SALE}`;
  saleDiscount: SaleDiscountInterface;
  addSaleForm: FormGroup;


  saleSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService,
              private router: Router, private shopService: ShopService) {
    const saleId = this.router.url.split('/').pop();
    if (saleId !== 'add') {
      this.edit = true;
      this.saleSubscription = this.shopService.getSaleById(saleId).subscribe(sale => {
        if (sale) {
          this.saleDiscount = sale;
          this.setFormValue();
        }
      });
    }
  }

  ngOnInit(): void {
    this.addSaleForm = this.formbuilder.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
      discountType: ['', Validators.required],
      startDate: ['',]

    });
  }

  toggleEnddate()
  {
   this.showMeEndDate = !this.showMeEndDate;
  }

  ngOnDestroy(): void {
    if (this.saleSubscription && !this.saleSubscription.closed) {
      this.saleSubscription.unsubscribe();
    }
  }

  setFormValue() {
    const { name,valueType,value,startDate } =this.saleDiscount;
    this.addSaleForm.patchValue({
      name, discountType:valueType,value,startDate
    });
  }

  get addSaleFormControls() { return this.addSaleForm.controls; }

  async onSubmit() {
    const { name, value, discountType,startDate } = this.addSaleFormControls;
    if (this.addSaleForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData = {
      code: name.value,
      value: value.value,
      valueType: discountType.value,
      startDate: startDate.value,
     
    };
    try {
      if (this.edit) {
        await this.adminService.updateSale({
         ...setData,
          saleDiscountId:this.saleDiscount.saleDiscountId
          
        });
      } else {
        const data = await this.adminService.createSale({
       ...setData,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${DISCOUNT}/${SALE}/${id}`);
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
      const { saleDiscountId } = this.saleDiscount;
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
