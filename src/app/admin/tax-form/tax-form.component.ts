import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { taxTypes } from '@models/Tax';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.css']
})
export class TaxFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  loadingDelete: boolean;
  successDelete: boolean;
  edit = true;

  nameDanger: boolean;
  typeDanger: boolean;
  valueDanger: boolean;
  valueTypeDanger: boolean;

  taxForm: FormGroup;
  taxTypes = taxTypes;

  constructor(private formbuilder: FormBuilder) { }

  ngOnInit(): void {
    this.taxForm = this.formbuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      value: [0, Validators.required],
      valueType: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {

  }

  get taxFormControls() { return this.taxForm.controls; }

  async onSubmit() {
    const { name, type, value, valueType } = this.taxFormControls;
    if (this.taxForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      if (type.errors) {
        this.typeDanger = true;
      }
      if (value.errors) {
        this.valueDanger = true;
      }
      if (valueType.errors) {
        this.valueTypeDanger = true;
      }
      return;
    }
  }

  deleteTax() {}

}
