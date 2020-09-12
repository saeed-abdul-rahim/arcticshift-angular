import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ComponentsModule } from '@components/components.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { DiscountComponent } from './discount/discount.component';
import { AdminComponentsModule } from './admin-components/admin-components.module';
import { AddProductComponent } from './add-product/add-product.component';
import { AdminGuard } from '@guards/admin/admin.guard';



@NgModule({
  declarations: [
    AdminComponent,
    LoginComponent,
    DashboardComponent,
    ProductComponent,
    WarehouseComponent,
    DiscountComponent,
    AddProductComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ComponentsModule,
    AdminComponentsModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [
    AdminGuard
  ]
})
export class AdminModule { }
