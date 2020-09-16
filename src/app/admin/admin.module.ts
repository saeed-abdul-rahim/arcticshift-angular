import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DragAndDropDirective } from '@directives/DragAndDrop.directive';
import { ComponentsModule } from '@components/components.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { DiscountComponent } from './discount/discount.component';
import { AdminComponentsModule } from './admin-components/admin-components.module';
import { ProductFormComponent } from './product-form/product-form.component';
import { AdminGuard } from '@guards/admin/admin.guard';
import { MediaService } from '@services/media/media.service';
import { VariantFormComponent } from './variant-form/variant-form.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';



@NgModule({
  declarations: [
    DragAndDropDirective,
    AdminComponent,
    LoginComponent,
    DashboardComponent,
    WarehouseComponent,
    DiscountComponent,
    ProductFormComponent,
    VariantFormComponent,
    CollectionFormComponent
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
    AdminGuard,
    MediaService
  ]
})
export class AdminModule { }
