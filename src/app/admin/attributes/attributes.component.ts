import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.css']
})
export class AttributesComponent implements OnInit {

  loading: boolean;
  success: boolean;
  nameDanger: boolean;
  codeDanger: boolean;

  addAttributesForm: FormGroup;

  constructor(private formbuilder: FormBuilder,private adminService: AdminService) { }

  ngOnInit(): void {
    this.addAttributesForm = this.formbuilder.group({
      name: ['', Validators.required],
    });
  }
  get addAttributesFormControls() { return this.addAttributesForm.controls; }

  async onSubmit() {
    const { name } = this.addAttributesFormControls;
    if (this.addAttributesForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
    this.loading = true;
    try {
      await this.adminService.createAttribute({
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
