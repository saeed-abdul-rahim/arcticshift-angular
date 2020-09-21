import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {

  loading: boolean;
  success: boolean;
  nameDanger: boolean;

  addWarehouseForm: FormGroup;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService) { }

  ngOnInit(): void {
    this.addWarehouseForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }
  get addWarehouseFormControls() { return this.addWarehouseForm.controls; }

  async onSubmit() {
    const { name } = this.addWarehouseFormControls;
    if (this.addWarehouseForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      await this.adminService.createWarehouse({
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
