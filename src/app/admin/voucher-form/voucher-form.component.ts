import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADMIN, DISCOUNT, VOUCHER } from '@constants/routes';
import { VoucherInterface } from '@models/Voucher';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { getTimeObjFromStr, dateToHrMin } from '@utils/datetime';
import { Subscription } from 'rxjs/internal/Subscription';

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
  edit = false;
  showMeEndDate = false;
  nameDanger: boolean;

  voucherRoute = `/${ADMIN}/${DISCOUNT}/${VOUCHER}`;
  voucher: VoucherInterface;
  voucherForm: FormGroup;

  voucherSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService,
              private router: Router, private shopService: ShopService) {
    const voucherId = this.router.url.split('/').pop();
    if (voucherId !== 'add') {
      this.edit = true;
      this.voucherSubscription = this.shopService.getVoucherById(voucherId).subscribe(voucher => {
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
      valueType: [null],
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
  }

  setFormValue() {
    const {
      code, value, valueType, minimumRequirement, totalUsage,
      onePerUser, oncePerOrder, startDate, endDate,
      categoryId, collectionId, productId
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
    const productsLength = categoryId.length === 0 && collectionId.length === 0 && productId.length === 0 ? 'entire' : 'specific';
    this.voucherForm.patchValue({
      code,
      value,
      discountType: valueType,
      valueType: productsLength,
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
      if (code.errors) {
        this.nameDanger = true;
      }
      return;
    }
    try {
      let startDateTime = -1;
      let endDateTime = -1;
      if (startDate.value) {
        startDateTime = Date.parse(startDate.value);
        if (startTime) {
          const { hour, minute } = getTimeObjFromStr(startTime.value);
          startDateTime = new Date(startDateTime).setHours(hour, minute);
        }
      }
      if (endDate.value) {
        endDateTime = Date.parse(endDate.value);
        if (endTime) {
          const { hour, minute } = getTimeObjFromStr(endTime.value);
          endDateTime = new Date(endDateTime).setHours(hour, minute);
        }
      }
      this.loading = true;
      const setData: VoucherInterface = {
        code: code.value,
        value: value.value,
        valueType: discountType.value,
        startDate: startDateTime,
        endDate: endDateCheck.value ? endDateTime : -1,
        minimumRequirement: {
          type: minimumQuantity.value,
          value: minimumQuantity.value === 'orderValue' ? orderValue.value : quantity.value
        },
        totalUsage: limitCheck.value ? limit.value : -1,
        onePerUser: onePerUser.value,
        oncePerOrder: oncePerOrder.value
      };
      if (this.edit) {
        await this.adminService.updateVoucher({
          ...setData,
          voucherId: this.voucher.voucherId
        });
      } else {
        const data = await this.adminService.createVoucher({
          ...setData,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.voucherRoute}/${id}`);
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

  async deleteVoucher() {
    this.loadingDelete = true;
    try {
      const { voucherId } = this.voucher;
      await this.adminService.deleteVoucher(voucherId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.voucherRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

  showModal() {}

}
