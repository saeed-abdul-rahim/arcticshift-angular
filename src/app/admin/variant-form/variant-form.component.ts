import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ADMIN, CATALOG, VARIANT } from '@constants/adminRoutes';
import { VariantInterface } from '@models/Variant';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-variant-form',
  templateUrl: './variant-form.component.html',
  styleUrls: ['./variant-form.component.css']
})
export class VariantFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  loadingDelete = false;
  successDelete = false;
  edit = true;

  nameDanger: boolean;
  sizeDanger: boolean;
  priceDanger: boolean;

  variantRoute = `/${ADMIN}/${CATALOG}/${VARIANT}`;
  variant: VariantInterface;
  addVariantForm: FormGroup;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService,private router: Router) { }

  ngOnInit(): void {
    console.log('variant');
    this.addVariantForm = this.formbuilder.group({
      size: ['', Validators.required],
      price: ['', Validators.required],
      strikePrice: [''],
      sku: ['', Validators.required]
    });
  }

  get addVariantFormControls() { return this.addVariantForm.controls; }

  async onSubmit() {
    const { size } = this.addVariantFormControls;
    if (this.addVariantForm.invalid) {
      if (size.errors) {
        this.sizeDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateVariant({
          size: size.value,

        });
      } else {
      const data = await this.adminService.createVariant({
          size: size.value,
        });
        if (data.id) {
          const { id } = data;
          this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${VARIANT}/${id}`);
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

  async deleteVariant() {
    this.loadingDelete = true;
    try {
      const { variantId } = this.variant;
      await this.adminService.deleteVariant(variantId);
      this.success = true;
      setTimeout(() => this.success = false, 2000);
      this.router.navigateByUrl(this.variantRoute);
    } catch (err) {
      console.log(err);
    }
    this.loadingDelete = false;
  }

}
