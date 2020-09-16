import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-variant-form',
  templateUrl: './variant-form.component.html',
  styleUrls: ['./variant-form.component.css']
})
export class VariantFormComponent implements OnInit {

  nameDanger: boolean;
  sizeDanger: boolean;
  priceDanger: boolean;

  addVariantForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

   ngOnInit(): void {
    this.addVariantForm = this.formbuilder.group({
      size: ['', Validators.required],
      price: ['', Validators.required],
      strikePrice: [''],
      sku: ['', Validators.required]
    });
  }

  get addVariantFormControls() { return this.addVariantForm.controls; }

  async onSubmit() {
    const { size } = this.addVariantFormControls;
    if (this.addVariantForm.invalid) {
      if (size.errors) {
        this.sizeDanger = true;
      }
      return;
    }
  }

}
