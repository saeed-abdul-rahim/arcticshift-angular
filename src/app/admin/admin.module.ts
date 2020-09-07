import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { SettingsComponent } from './settings/settings.component';
import { DiscountComponent } from './discount/discount.component';


@NgModule({
  declarations: [
    AdminComponent,
    LoginComponent,
    DashboardComponent,
    ProductComponent,
    WarehouseComponent,
    SettingsComponent,
    DiscountComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
