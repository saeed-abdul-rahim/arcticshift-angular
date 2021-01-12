import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { ADD, orderRoute } from '@constants/routes';
import { OrderInterface } from '@models/Order';
import { AdminService } from '@services/admin/admin.service';
import { setTimeout } from '@utils/setTimeout';
import { countryCallCodes } from '@utils/countryCallCodes';
import { UserInterface } from '@models/User';
import { GeneralSettings } from '@models/GeneralSettings';
import { ShopService } from '@services/shop/shop.service';
import { getCountryName } from '@utils/countryList';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit, OnDestroy {

  loading: boolean;
  success: boolean;
  ordersLoading = false;
  edit = false;
  selectedCallCode: string;
  countryCallCodes = countryCallCodes;

  customerForm: FormGroup;
  customer: UserInterface;
  settings: GeneralSettings;
  orders: OrderInterface[];
  ordersSource: MatTableDataSource<OrderInterface>;
  displayedColumns = ['id', 'date', 'status', 'total'];

  getCountryName = getCountryName;

  private ordersSubscription: Subscription;
  private customerSubscription: Subscription;
  private settingsSubscription: Subscription;

  constructor(private formbuilder: FormBuilder, private admin: AdminService, private shop: ShopService,
              private router: Router, private cdr: ChangeDetectorRef) {
    const customerId = this.router.url.split('/').pop();
    this.ordersSource = new MatTableDataSource([]);
    if (customerId !== ADD) {
      this.edit = true;
      this.customerSubscription = this.admin.getUserById(customerId).subscribe(customer => {
        this.customer = customer;
        console.log(this.customer);
        if (customer) {
          this.setForm();
          const { totalOrders } = customer;
          if (totalOrders > 0) {
            this.getOrdersByUserId(customerId);
          }
        }
      });
    }
    this.settingsSubscription = this.shop.getGeneralSettings().subscribe(settings => this.settings = settings);
  }

  ngOnInit(): void {
    this.customerForm = this.formbuilder.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phoneCode: [null],
      phone: ['', this.validatePhone()]
    });
  }

  ngOnDestroy(): void {
    if (this.customerSubscription && !this.customerSubscription.closed) {
      this.customerSubscription.unsubscribe();
    }
    if (this.ordersSubscription && !this.ordersSubscription.closed) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.settingsSubscription && !this.settingsSubscription.closed) {
      this.settingsSubscription.unsubscribe();
    }
  }

  get customerFormControls() { return this.customerForm.controls; }

  async onSubmit() {
    const { firstName, lastName, email, phone, phoneCode } = this.customerFormControls;
    if (this.customerForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      if (this.edit) {
        await this.admin.updateUser(this.customer.id, {
          firstName: firstName.value,
          lastName: lastName.value,
          name: firstName.value + ' ' + lastName.value,
          email: email.value,
          phone: phone.value,
          phoneCode: phoneCode.value,
        });
      } else {
        // Create User API
      }

      this.success = true;
      setTimeout(() => {
        this.success = false;
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      this.success = false;
      console.log(err);
    }
    this.loading = false;
  }

  navigateToOrder(id: string) {
    this.router.navigateByUrl(`${orderRoute}/${id}`);
  }

  private getOrdersByUserId(id: string) {
    this.ordersSubscription = this.admin.getOrdersByUserId(id, 5).subscribe(orders => {
      this.orders = orders;
      this.ordersSource.data = orders;
    });
  }

  private setForm() {
    const { firstName, lastName, phoneCode, phone, email } = this.customer;
    this.customerForm.patchValue({
      firstName,
      lastName,
      phoneCode: phoneCode ? phoneCode : null,
      phone,
      email
    });
  }

  private validatePhone(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value || control.value.match(/^\d{10}$/) ? null : { invalid: true };
  }

}
