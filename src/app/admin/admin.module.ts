import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '@components/components.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { DiscountComponent } from './discount/discount.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AdminComponentsModule } from './admin-components/admin-components.module';
import { TileComponent } from './admin-components/tile/tile.component';
import { AddComponent } from './dashboard/add/add.component';


@NgModule({
  declarations: [
    AdminComponent,
    LoginComponent,
    DashboardComponent,
    ProductComponent,
    WarehouseComponent,
    DiscountComponent,
    SidebarComponent,
    NavbarComponent,
    AddComponent
   
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ComponentsModule,
    AdminComponentsModule
  ]
})
export class AdminModule { }
