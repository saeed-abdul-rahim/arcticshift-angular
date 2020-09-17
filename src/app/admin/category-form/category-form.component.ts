import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {

  nameDanger: boolean;


  addCategoryForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

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
  }

}


