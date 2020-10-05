import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  edit = true;
  nameDanger: boolean;

  addVoucherForm: FormGroup;

  voucherSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private mediaService: MediaService, private adminService: AdminService,
              private router: Router, private route: ActivatedRoute, private shopService: ShopService) {
    const voucherId = this.router.url.split('/').pop();
    if (voucherId !== 'add') {
      this.edit = true;
      this.voucherSubscription = this.shopService.getVoucherById(voucherId).subscribe(voucher => {
        const { code, value } = voucher;
        this.addVoucherForm.patchValue({
          name: code, value
        });
      });
    }
  }

  ngOnInit(): void {
    this.addVoucherForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }


  ngOnDestroy(): void {
    if (this.voucherSubscription && !this.voucherSubscription.closed) {
      this.voucherSubscription.unsubscribe();
    }
  }

  get addvoucherFormControls() { return this.addVoucherForm.controls; }

  async onSubmit() {
    const { name } = this.addvoucherFormControls;
    if (this.addVoucherForm.invalid) {
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

        });
      } else {
        await this.adminService.createSale({
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

}
