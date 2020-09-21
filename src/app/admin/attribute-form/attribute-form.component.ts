import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute-form.component.html',
  styleUrls: ['./attribute-form.component.css']
})
export class AttributeFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  nameDanger: boolean;
  codeDanger: boolean;

  addAttributeForm: FormGroup;

  constructor(private formbuilder: FormBuilder,private adminService: AdminService) { }

  ngOnInit(): void {
    this.addAttributeForm = this.formbuilder.group({
      name: ['', Validators.required],
    });
  }
  get addAttributeFormControls() { return this.addAttributeForm.controls; }

  async onSubmit() {
    const { name } = this.addAttributeFormControls;
    if (this.addAttributeForm.invalid) {
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
