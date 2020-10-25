import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  shippingAddressCheck = false;

  billingForm: FormGroup;
  shippingForm: FormGroup;
  addressFormGroup = {
    line1: ['', Validators.required],
    line2: [''],
    state: ['', Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required],
    country: ['', Validators.required]
  };

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.billingForm = this.formBuilder.group({
      ...this.addressFormGroup,
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: [null, Validators.required],
    });
    this.shippingForm = this.formBuilder.group(this.addressFormGroup);
    this.clearShippingAddressValidators();
  }

  get shippingFormControls() {
    return this.shippingForm.controls;
  }

  get billingFormControls() {
    return this.billingForm.controls;
  }

  setShippingAddressValidators() {
    Object.keys(this.addressFormGroup).forEach(key => {
      if (key !== 'line2') {
        this.shippingForm.get(key).setValidators([Validators.required]);
      }
    });
  }

  clearShippingAddressValidators() {
    this.shippingForm.clearValidators();
  }

  toggleShippingAddressCheck() {
    if (this.shippingAddressCheck) {
      this.setShippingAddressValidators();
    } else {
      this.clearShippingAddressValidators();
    }
  }

}
