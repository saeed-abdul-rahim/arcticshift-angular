import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADMIN, DISCOUNT, VOUCHER } from '@constants/adminRoutes';
import { VoucherInterface } from '@models/Voucher';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
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
      quantity: [null],
      limitCheck: [false],
      limit: [''],
      onePerUser: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnDestroy(): void {
    if (this.voucherSubscription && !this.voucherSubscription.closed) {
      this.voucherSubscription.unsubscribe();
    }
  }

  setFormValue() {
    const { code, value, valueType, minimumRequirement, totalUsage, onePerUser, startDate, endDate } = this.voucher;
    const { type } = minimumRequirement;
    this.voucherForm.patchValue({
      code,
      value,
      discountType: valueType,
      limitCheck: totalUsage > 0 ? true : false,
      limit: totalUsage,
      minimumQuantity: type,
      orderValue: type === 'orderValue' ? minimumRequirement.value : null,
      quantity: type === 'quantity' ? minimumRequirement.value : null,
      onePerUser,
      startDate,
      endDate
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
      onePerUser,
      startDate,
      endDate
    } = this.voucherFormControls;
    if (this.voucherForm.invalid) {
      if (code.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData: VoucherInterface = {
      code: code.value,
      value: value.value,
      valueType: discountType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      minimumRequirement: {
        type: minimumQuantity.value,
        value: minimumQuantity.value === 'orderValue' ? orderValue.value : quantity.value
      },
      totalUsage: limit.value,
      onePerUser: onePerUser.value

    };

    try {
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
}
