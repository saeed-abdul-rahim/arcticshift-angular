import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-variant-form',
  templateUrl: './variant-form.component.html',
  styleUrls: ['./variant-form.component.css']
})
export class VariantFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  edit = true;
  nameDanger: boolean;
  sizeDanger: boolean;
  priceDanger: boolean;


  addVariantForm: FormGroup;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService) { }

  ngOnInit(): void {
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
        await this.adminService.createVariant({
          size: size.value,

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
