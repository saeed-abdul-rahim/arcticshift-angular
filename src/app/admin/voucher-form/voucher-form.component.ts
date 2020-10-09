import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ADMIN, CATALOG, VOUCHER } from '@constants/adminRoutes';
import { VoucherInterface } from '@models/Voucher';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
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
  nameDanger: boolean;

  voucherRoute = `/${ADMIN}/${CATALOG}/${VOUCHER}`;
  voucher: VoucherInterface;
  addVoucherForm: FormGroup;

  voucherSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const voucherId = this.router.url.split('/').pop();
    if (voucherId !== 'add') {
      this.edit = true;
      this.voucherSubscription = this.shopService.getVoucherById(voucherId).subscribe(voucher => {
        const { code, value,limit,limitTo,valueType,none,minimalOrder,minimumQuantity } = voucher;
        this.addVoucherForm.patchValue({
          name: code, value,limit,limitTo,valueType,none,minimalOrder,minimumQuantity
        });
      });
    }
  }

  ngOnInit(): void {
    this.addVoucherForm = this.formbuilder.group({
      code: ['', Validators.required],
      value: ['', Validators.required],
      limit: ['', ],
      limitTo: ['', ],
      valueType: ['', ],
      none: ['', ],
      minimalOrder: ['', ],
      minimumQuantity: ['', ],

    });
  }

  togglelimit()
  {
   this.showMe=!this.showMe;
  }

  toggleorder()
  {
   this.showMeOrder=!this.showMeOrder;
  }

  togglequantity()
  {
   this.showMeQuantity=!this.showMeQuantity;
  }

  ngOnDestroy(): void {
    if (this.voucherSubscription && !this.voucherSubscription.closed) {
      this.voucherSubscription.unsubscribe();
    }
  }

  get addvoucherFormControls() { return this.addVoucherForm.controls; }

  async onSubmit() {
    const { code,value,limit,limitTo,valueType,none,minimalOrder,minimumQuantity} = this.addvoucherFormControls;
    if (this.addVoucherForm.invalid) {
      if (code.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData = {
      code: code.value,
      value:value.value,
      limit: limit.value,
      limitTo: limitTo.value,
      valueType:valueType.value,
      none:none.value,
      minimalOrder:minimalOrder.value,
      minimumQuantity:minimumQuantity.value

    };
    try {
      if (this.edit) {
        await this.adminService.updateVoucher({
          ...setData,


        });
      } else {
        const data =  await this.adminService.createVoucher({
          ...setData,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${VOUCHER}/${id}`);
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
