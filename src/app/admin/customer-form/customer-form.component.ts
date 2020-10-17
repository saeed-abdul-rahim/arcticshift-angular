import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  edit = false;
  nameDanger: boolean;

  addCustomerForm: FormGroup;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService) { }

  ngOnInit(): void {
    this.addCustomerForm = this.formbuilder.group({});
  }

  get customerFormControls() { return this.addCustomerForm.controls; }

  async onSubmit() {
    const { name } = this.customerFormControls;
    if (this.addCustomerForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.adminService.updateVariant({
          name: name.value,

        });
      } else {
        await this.adminService.createVariant({
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
