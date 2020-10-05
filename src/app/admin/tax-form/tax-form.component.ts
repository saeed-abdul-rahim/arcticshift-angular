import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADMIN, TAX } from '@constants/adminRoutes';
import { valueTypes } from '@models/Common';
import { TaxInterface, taxTypes } from '@models/Tax';
import { AdminService } from '@services/admin/admin.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.css']
})
export class TaxFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete: boolean;
  successDelete: boolean;
  edit = false;

  nameDanger: boolean;
  typeDanger: boolean;
  valueDanger: boolean;
  valueTypeDanger: boolean;

  taxRoute = `/${ADMIN}/${TAX}`;
  tax: TaxInterface;
  taxForm: FormGroup;
  taxTypes = taxTypes;
  valueTypes = valueTypes;

  taxSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private router: Router,
              private adminService: AdminService, private shopService: ShopService) {
    const taxId = this.router.url.split('/').pop();
    if (taxId !== 'add') {
      this.edit = true;
      this.taxSubscription = this.shopService.getTaxesById(taxId).subscribe(tax => {
        if (tax) {
          this.tax = tax;
          this.setFormValue();
        }
      });
    }
  }

  ngOnInit(): void {
    this.taxForm = this.formbuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      value: [0, Validators.required],
      valueType: ['fixed', Validators.required]
    });
  }

  ngOnDestroy(): void {

  }

  setFormValue() {
    const { name, type, value, valueType } = this.tax;
    this.taxForm.patchValue({
      name, type, value, valueType
    });
  }

  get taxFormControls() { return this.taxForm.controls; }

  async onSubmit() {
    const { name, type, value, valueType } = this.taxFormControls;
    if (this.taxForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      if (type.errors) {
        this.typeDanger = true;
      }
      if (value.errors) {
        this.valueDanger = true;
      }
      if (valueType.errors) {
        this.valueTypeDanger = true;
      }
      return;
    }
    this.loading = true;
    const setData = {
      name: name.value,
      type: type.value,
      value: value.value,
      valueType: valueType.value
    };
    try {
      if (this.edit) {
        await this.adminService.updateTax({
          ...setData,
          taxId: this.tax.taxId
        });
      }
      else {
        const data = await this.adminService.createTax(setData);
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${this.taxRoute}/${id}`);
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

  async deleteTax() {
    this.loadingDelete = true;
    try {
      const { taxId } = this.tax;
      await this.adminService.deleteTax(taxId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.taxRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

}
