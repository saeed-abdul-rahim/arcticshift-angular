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
  showMe = false;
  showMeOrder = false;
  showMeQuantity = false;
  showMeEndDate = false;
  nameDanger: boolean;

  voucherRoute = `/${ADMIN}/${DISCOUNT}/${VOUCHER}`;
  voucher: VoucherInterface;
  addVoucherForm: FormGroup;

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
    this.addVoucherForm = this.formbuilder.group({
      code: ['', Validators.required],
      value: ['', Validators.required],
      discountType:[''],
      minimumRequirement:[],
      limit:[''],
      onePerUser:[''],
      startDate:[''],
      endDate:['']
    });
  }

  ngOnDestroy(): void {
    if (this.voucherSubscription && !this.voucherSubscription.closed) {
      this.voucherSubscription.unsubscribe();
    }
  }

  setFormValue() {
    const { code, value,valueType,startDate,endDate } =this.voucher;
    this.addVoucherForm.patchValue({
       code, value, discountType:valueType,startDate,endDate
    });
  }

  togglelimit()
  {
   this.showMe = !this.showMe;
  }

  toggleorder()
  {
   this.showMeOrder = !this.showMeOrder;
  }

  togglequantity()
  {
   this.showMeQuantity = !this.showMeQuantity;
  }

  toggleEnddate()
  {
   this.showMeEndDate = !this.showMeEndDate;
  }


  get addvoucherFormControls() { return this.addVoucherForm.controls; }

  async onSubmit() {
    const { code,value,discountType,minimumRequirement,limit,onePerUser,startDate,endDate} = this.addvoucherFormControls;
    if (this.addVoucherForm.invalid) {
      if (code.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData = {
      code: code.value,
      value: value.value,
      valueType: discountType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      minimumRequirement: minimumRequirement.value,
      totalUsage:limit.value,
      onePerUser:onePerUser.value
      
    };
   
    try {
      if (this.edit) {
           await this.adminService.updateVoucher({
          ...setData,
          voucherId: this.voucher.voucherId

        });
      } else {
        const data =  await this.adminService.createVoucher({
          ...setData,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${DISCOUNT}/${VOUCHER}/${id}`);
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
