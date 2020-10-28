import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADD, ADMIN, DISCOUNT, SALE } from '@constants/routes';
import { CatalogTypeApi } from '@models/Common';
import { AddCatalogEvent, RemoveCatalogEvent } from '@models/Event';
import { SaleDiscountInterface } from '@models/SaleDiscount';
import { ShopInterface } from '@models/Shop';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';

import { ShopService } from '@services/shop/shop.service';
import { dateToHrMin, mergeDateTime } from '@utils/datetime';
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
  modalLoading = false;
  modalSuccess = false;
  showModal = false;
  tabDeleteLoading = false;
  minDate = new Date();

  shopData: ShopInterface;
  saleRoute = `/${ADMIN}/${DISCOUNT}/${SALE}`;
  saleDiscount: SaleDiscountInterface;
  saleForm: FormGroup;

  saleSubscription: Subscription;
  shopSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private admin: AdminService,
              private router: Router, private shop: ShopService, private alert: AlertService) {
    this.shopSubscription = this.admin.getCurrentShop().subscribe(sh => this.shopData = sh);
    const saleId = this.router.url.split('/').pop();
    if (saleId !== ADD) {
      this.edit = true;
      this.saleSubscription = this.shop.getSaleById(saleId).subscribe(sale => {
        if (sale) {
          this.saleDiscount = sale;
          this.setFormValue();
        }
      });
    }
  }

  ngOnInit(): void {
    this.saleForm = this.formbuilder.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
      discountType: ['', Validators.required],
      startDate: [''],
      startTime: [''],
      endDateCheck: [false],
      endDate: [''],
      endTime: ['']
    });
  }

  toggleEnddate() {
    this.showMeEndDate = !this.showMeEndDate;
  }

  ngOnDestroy(): void {
    if (this.saleSubscription && !this.saleSubscription.closed) {
      this.saleSubscription.unsubscribe();
    }
    if (this.shopSubscription && !this.shopSubscription.closed) {
      this.shopSubscription.unsubscribe();
    }
  }

  setFormValue() {
    const { name, valueType, value, startDate, endDate } = this.saleDiscount;
    const startDatetime = startDate && startDate > 0 ? new Date(startDate) : null;
    const endDatetime = endDate && endDate > 0 ? new Date(endDate) : null;
    let startTime = '00:00';
    let endTime = '00:00';
    if (startDatetime) {
      startTime = dateToHrMin(startDatetime);
    }
    if (endDatetime) {
      endTime = dateToHrMin(endDatetime);
    }
    this.saleForm.patchValue({
      name, discountType: valueType, value, startDate: startDatetime, endDate: endDatetime, startTime, endTime
    });
  }

  get saleFormControls() { return this.saleForm.controls; }

  async onSubmit() {
    const { name, value, discountType, startDate, startTime, endDate, endTime, endDateCheck } = this.saleFormControls;
    if (this.saleForm.invalid) {
      return;
    }
    try {
      this.loading = true;
      const setData = {
        code: name.value,
        value: value.value,
        valueType: discountType.value,
        startDate: mergeDateTime(startDate.value, startTime.value),
        endDate: endDateCheck.value ? mergeDateTime(endDate.value, endTime.value) : -1
      };
      if (this.edit) {
        await this.admin.updateSale({
          ...setData,
          saleDiscountId: this.saleDiscount.saleDiscountId

        });
      } else {
        const data = await this.admin.createSale({
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
      await this.admin.deleteSale(saleDiscountId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.saleRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  async addCatalog($event: AddCatalogEvent) {
    try {
      const { type, ids } = $event;
      if (ids.length === 0) {
        this.handleError(`Select ${type} to save`);
      }
      this.modalLoading = true;
      const data: CatalogTypeApi = {
        productId: type === 'product' ? ids : [],
        categoryId: type === 'category' ? ids : [],
        collectionId: type === 'collection' ? ids : []
      };
      await this.admin.addCatalogToSaleDiscount(this.saleDiscount.id, data);
      this.showModal = false;
      this.modalSuccess = true;
      setInterval(() => this.modalSuccess = false, 2000);
    } catch (err) {
      this.handleError(err);
    }
    this.modalLoading = false;
  }

  async removeCatalog($event: RemoveCatalogEvent) {
    try {
      const { type, id } = $event;
      if (!id) { return; }
      this.tabDeleteLoading = true;
      const data: CatalogTypeApi = {
        productId: type === 'product' ? [id] : [],
        categoryId: type === 'category' ? [id] : [],
        collectionId: type === 'collection' ? [id] : []
      };
      await this.admin.removeCatalogFromSaleDiscount(this.saleDiscount.id, data);
    } catch (err) {
      this.handleError(err);
    }
    this.tabDeleteLoading = false;
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
