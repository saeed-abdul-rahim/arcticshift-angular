import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type-form.component.html',
  styleUrls: ['./product-type-form.component.css']
})
export class ProductTypeFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  nameDanger: boolean;

  addProductTypeForm: FormGroup;

  constructor(private formbuilder: FormBuilder,private adminService: AdminService) { }

  ngOnInit(): void {
    this.addProductTypeForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }
  get addProductTypeFormControls() { return this.addProductTypeForm.controls; }

  async onSubmit() {
    const { name } = this.addProductTypeFormControls;
    if (this.addProductTypeForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      await this.adminService.createProductType({
        name: name.value,
        
      });
      this.success = true;
      setTimeout(() => this.success = false, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }
}
