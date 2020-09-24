import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DragAndDropDirective } from '@directives/DragAndDrop.directive';
import { AdminService } from '@services/admin/admin.service';
import { MediaService } from '@services/media/media.service';
import { AdminGuard } from '@guards/admin/admin.guard';
import { ComponentsModule } from '@components/components.module';

import { AdminComponentsModule } from './admin-components/admin-components.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { DiscountComponent } from './discount/discount.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { VariantFormComponent } from './variant-form/variant-form.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { VoucherFormComponent } from './voucher-form/voucher-form.component';
import { ListPageComponent } from './list-page/list-page.component';
import { ProductTypeFormComponent } from './product-type-form/product-type-form.component';
import { AttributeFormComponent } from './attribute-form/attribute-form.component';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [
    DragAndDropDirective,
    AdminComponent,
    LoginComponent,
    DashboardComponent,
    ListPageComponent,
    WarehouseComponent,
    DiscountComponent,
    ProductFormComponent,
    VariantFormComponent,
    CollectionFormComponent,
    CategoryFormComponent,
    SaleFormComponent,
    VoucherFormComponent,
    ProductTypeFormComponent,
    AttributeFormComponent,
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
    AngularEditorModule
  ],
  providers: [
    AdminGuard,
    MediaService,
    AdminService
  ]
})
export class AdminModule { }
