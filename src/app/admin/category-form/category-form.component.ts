import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  loading = false;
  success = false;
  nameDanger: boolean;


  addCategoryForm: FormGroup;

  constructor(private formbuilder: FormBuilder, private adminService: AdminService) { }

  ngOnInit(): void {
    this.addCategoryForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }
  get addCategoryFormControls() { return this.addCategoryForm.controls; }

  async onSubmit() {
    const { name } = this.addCategoryFormControls;
    if (this.addCategoryForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
  
  this.loading = true;
  try {
    await this.adminService.createCategory({
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


