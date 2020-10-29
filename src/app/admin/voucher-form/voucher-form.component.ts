import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { ADD, voucherRoute } from '@constants/routes';
import { AddCatalogEvent, RemoveCatalogEvent } from '@models/Event';
import { VoucherInterface } from '@models/Voucher';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { dateToHrMin, mergeDateTime } from '@utils/datetime';
import { CatalogTypeApi } from '@models/Common';
import { ShopInterface } from '@models/Shop';

@Component({
  selector: 'app-voucher-form',
  templateUrl: './voucher-form.component.html',
  styleUrls: ['./voucher-form.component.css']
})
export class VoucherFormComponent implements OnInit, OnDestroy {

  loading = false;
  success = false;
  loadingDelete = false;
  successDelete = false;
  showModal = false;
  modalLoading = false;
  modalSuccess = false;
  tabDeleteLoading = false;
  edit = false;
  showMeEndDate = false;
  minDate = new Date();

  shopData: ShopInterface;
  voucherRoute = voucherRoute;
  voucher: VoucherInterface;
  voucherForm: FormGroup;

  voucherSubscription: Subscription;
  shopSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private admin: AdminService,
              private router: Router, private shop: ShopService, private alert: AlertService) {
    this.shopSubscription = this.admin.getCurrentShop().subscribe(sh => this.shopData = sh);
    const voucherId = this.router.url.split('/').pop();
    if (voucherId !== ADD) {
      this.edit = true;
      this.voucherSubscription = this.shop.getVoucherById(voucherId).subscribe(voucher => {
        if (voucher) {
          this.voucher = voucher;
          this.setFormValue();
        }
      });
    }
  }

  ngOnInit(): void {
    this.voucherForm = this.formbuilder.group({
      code: ['', Validators.required],
      value: ['', Validators.required],
      discountType: [''],
      minimumQuantity: [''],
      orderValue: [null],
      orderType: [null],
      oncePerOrder: [null],
      quantity: [null],
      limitCheck: [false],
      limit: [''],
      onePerUser: [''],
      startDate: [''],
      startTime: [''],
      endDate: [''],
      endTime: [''],
      endDateCheck: [false],
    });
  }

  ngOnDestroy(): void {
    if (this.voucherSubscription && !this.voucherSubscription.closed) {
      this.voucherSubscription.unsubscribe();
    }
    if (this.shopSubscription && !this.shopSubscription.closed) {
      this.shopSubscription.unsubscribe();
    }
  }

  setFormValue() {
    const {
      code, value, valueType, orderType, minimumRequirement, totalUsage,
      onePerUser, oncePerOrder, startDate, endDate
    } = this.voucher;
    const limit = totalUsage > 0 ? totalUsage : null;
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
    this.voucherForm.patchValue({
      code,
      value,
      discountType: valueType,
      orderType,
      limitCheck: totalUsage > 0 ? true : false,
      limit,
      minimumQuantity: minimumRequirement && minimumRequirement.type,
      orderValue: minimumRequirement && minimumRequirement.type === 'orderValue' ? minimumRequirement.value : null,
      quantity: minimumRequirement && minimumRequirement.type === 'quantity' ? minimumRequirement.value : null,
      onePerUser,
      oncePerOrder,
      startDate: startDatetime,
      startTime,
      endDate: endDatetime,
      endTime
    });
  }

  toggleEnddate() {
    this.showMeEndDate = !this.showMeEndDate;
  }

  get voucherFormControls() { return this.voucherForm.controls; }

  async onSubmit() {
    const {
      code,
      value,
      discountType,
      orderType,
      minimumQuantity,
      orderValue,
      quantity,
      limit,
      limitCheck,
      onePerUser,
      oncePerOrder,
      startDate,
      startTime,
      endDate,
      endTime,
      endDateCheck
    } = this.voucherFormControls;
    if (this.voucherForm.invalid) {
      return;
    }
    try {
      this.loading = true;
      const setData: VoucherInterface = {
        code: code.value,
        value: value.value,
        valueType: discountType.value,
        orderType: orderType.value,
        startDate: mergeDateTime(startDate.value, startTime.value),
        endDate: endDateCheck.value ? mergeDateTime(endDate.value, endTime.value) : -1,
        minimumRequirement: {
          type: minimumQuantity.value,
          value: minimumQuantity.value === 'orderValue' ? orderValue.value : quantity.value
        },
        totalUsage: limitCheck.value ? limit.value : -1,
        onePerUser: onePerUser.value,
        oncePerOrder: oncePerOrder.value,
      };
      if (this.edit) {
        await this.admin.updateVoucher({
          ...setData,
          voucherId: this.voucher.voucherId
        });
      } else {
        const data = await this.admin.createVoucher({
          ...setData,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`${this.voucherRoute}/${id}`);
        }
      }

      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      this.handleError(err);
    }
    this.loading = false;
  }

  async deleteVoucher() {
    this.loadingDelete = true;
    try {
      const { voucherId } = this.voucher;
      await this.admin.deleteVoucher(voucherId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.voucherRoute);
    } catch (err) {
      this.handleError(err);
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
      await this.admin.addCatalogToVoucher(this.voucher.id, data);
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
      await this.admin.removeCatalogFromVoucher(this.voucher.id, data);
    } catch (err) {
      this.handleError(err);
    }
    this.tabDeleteLoading = false;
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
