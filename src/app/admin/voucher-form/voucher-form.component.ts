import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-voucher-form',
  templateUrl: './voucher-form.component.html',
  styleUrls: ['./voucher-form.component.css']
})
export class VoucherFormComponent implements OnInit {

  nameDanger: boolean;


  addVoucherForm: FormGroup;

  constructor(private formbuilder: FormBuilder) { }

  ngOnInit(): void {
    this.addVoucherForm = this.formbuilder.group({
      name: ['', Validators.required]
    });
  }
  get addvoucherFormControls() { return this.addVoucherForm.controls; }

  async onSubmit() {
    const { name } = this.addvoucherFormControls;
    if (this.addVoucherForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      return;
    }
  }

}
