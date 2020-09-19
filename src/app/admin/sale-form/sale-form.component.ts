import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit {

  loading: boolean;
  success: boolean;
  nameDanger: boolean;

  addSaleForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

  ngOnInit(): void {
    this.addSaleForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }
  get addSaleFormControls() { return this.addSaleForm.controls; }

  async onSubmit() {
    const { name } = this.addSaleFormControls;
    if (this.addSaleForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
  }
}
