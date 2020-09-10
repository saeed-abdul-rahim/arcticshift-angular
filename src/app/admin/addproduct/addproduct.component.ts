import { Component, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-addproduct',
  templateUrl: './addproduct.component.html',
  styleUrls: ['./addproduct.component.css']
})
export class AddproductComponent implements OnInit {

  faCheckCircle = faCheckCircle;

  nameDanger: boolean;
  typeDanger: boolean;

  addProductForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

  ngOnInit(): void {
    this.addProductForm = this.formbuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['', Validators.required]
    });
  }
  get addProductFormControls() { return this.addProductForm.controls }

 async onSubmit() {
    const { name, type } = this.addProductFormControls;
    if (this.addProductForm.invalid) {
      if (name.errors) {
        this.nameDanger = true
      }
      if (type.errors) {
        this.typeDanger = true;
      }
      return;
    }
  }
}

