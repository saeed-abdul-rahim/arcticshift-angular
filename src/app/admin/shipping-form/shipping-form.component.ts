import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-shipping-form',
  templateUrl: './shipping-form.component.html',
  styleUrls: ['./shipping-form.component.css']
})
export class ShippingFormComponent implements OnInit {

  loading = false;
  success = false; 

  nameDanger: boolean;

  addShippingForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  get addShippingFormControls() { return this.addShippingForm.controls; }

  async onSubmit() {
    const { name, price } = this.addShippingFormControls;
    if (this.addShippingForm.invalid) {
      if (name.errors) {
        this.nameDanger = true;
      }
      // if (price.errors) {
      //   this.priceDanger = true;
      // }
      // return;
    }
  }
    // this.loading = true;
    // try {
      // if (this.edit) {
      //   await this.adminService.updateShipping({
      //     name: name.value,
      //     price: price.value
      //   });
      // }
      // else {
      //   const data = await this.adminService.createShipping({
      //     name: name.value,
      //     price: price.value
      //   });
        // if (data.id) {
        //   const { id } = data;
        //   this.router.navigateByUrl(`/${ADMIN}/${CATALOG}/${SIPPING}/${id}`);
        // }
  //     }

  //     this.success = true;
  //     setTimeout(() => this.success = false, 2000);
  //   } catch (err) {
  //     this.success = false;
  //     console.log(err);
  //   }
  //   this.loading = false;
  // }

// }
