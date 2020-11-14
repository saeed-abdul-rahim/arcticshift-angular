import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AdminService } from '@services/admin/admin.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {

  orderForm: FormGroup;

  constructor(private admin: AdminService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {}

  async onSubmit() {}

}
