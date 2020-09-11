import { Component, OnInit } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { inOut } from 'app/animations/inOut';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  animations: [inOut]
})
export class AddProductComponent implements OnInit {

  faCheckCircle = faCheckCircle;

  loading: boolean;
  success: boolean;
  nameDanger: boolean;

  addProductForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

  ngOnInit(): void {
    this.addProductForm = this.formbuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }
  get addProductFormControls() { return this.addProductForm.controls; }

 async onSubmit() {
    const { name } = this.addProductFormControls;
    if (this.addProductForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
  }
}

