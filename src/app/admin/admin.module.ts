import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { StorageService } from '@services/storage/storage.service';
import { ShopService } from '@services/shop/shop.service';
import { AdminNavService } from '@services/admin-nav/admin-nav.service';
import { AdminGuard } from '@guards/admin/admin.guard';
import { ComponentsModule } from '@components/components.module';

import { AdminComponentsModule } from './admin-components/admin-components.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { VariantFormComponent } from './variant-form/variant-form.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { VoucherFormComponent } from './voucher-form/voucher-form.component';
import { ListPageComponent } from './list-page/list-page.component';
import { ProductTypeFormComponent } from './product-type-form/product-type-form.component';
import { AttributeFormComponent } from './attribute-form/attribute-form.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { TaxFormComponent } from './tax-form/tax-form.component';
import { ShippingFormComponent } from './shipping-form/shipping-form.component';
import { OrderFormComponent } from './order-form/order-form.component';




@NgModule({
  declarations: [
    AdminComponent,
    LoginComponent,
    NavbarComponent,
    SidebarComponent,
    DashboardComponent,
    ListPageComponent,
    WarehouseComponent,
    ProductFormComponent,
    VariantFormComponent,
    CollectionFormComponent,
    CategoryFormComponent,
    SaleFormComponent,
    VoucherFormComponent,
    ProductTypeFormComponent,
    AttributeFormComponent,
    CustomerFormComponent,
    TaxFormComponent,
    ShippingFormComponent,
    OrderFormComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    ComponentsModule,
    AdminComponentsModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AngularEditorModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  ],
  providers: [
    AdminGuard,
    MediaService,
    AdminService,
    ShopService,
    AdminNavService,
    StorageService
  ]
})
export class AdminModule { }
