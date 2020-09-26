import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from 'app/guards/admin/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { VariantFormComponent } from './variant-form/variant-form.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { VoucherFormComponent } from './voucher-form/voucher-form.component';
import { ListPageComponent } from './list-page/list-page.component';
<<<<<<< HEAD
import { WarehouseComponent } from './warehouse/warehouse.component';
import { ProductTypeFormComponent } from './product-type-form/product-type-form.component';
import { AttributeFormComponent } from './attribute-form/attribute-form.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
=======
import {
  ADD,
  CATALOG,
  CATEGORY,
  COLLECTION,
  CUSTOMER,
  DASHBOARD,
  DISCOUNT,
  GIFTCARD,
  LOGIN,
  ORDER,
  PRODUCT,
  PRODUCTATTRIBUTE,
  PRODUCTTYPE,
  SALE,
  SHIPPING,
  STAFF,
  VARIANT,
  VOUCHER,
  WAREHOUSE
} from '@constants/adminRoutes';
>>>>>>> 72169a17a4b68d545e78677f7aae3d16c9dcdac5


const routes: Routes = [
  { path: LOGIN, component: LoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { path: '', redirectTo: DASHBOARD, pathMatch: 'full' },
      { path: DASHBOARD, component: DashboardComponent },
      {
        path: CATALOG,
        children: [
          { path: '', redirectTo: PRODUCT, pathMatch: 'full' },
          {
            path: PRODUCT,
            children: [
              { path: '', component: ListPageComponent },
              { path: ADD, component: ProductFormComponent },
              {
                path: ':id', component: ProductFormComponent,
                children: [
                  {
                    path: VARIANT,
                    children: [
                      { path: '', component: VariantFormComponent },
                      { path: ':id', component: VariantFormComponent }
                    ]
                  }
                ]
              },
            ]
          },
          {
            path: CATEGORY,
            children: [
              { path: '', component: ListPageComponent },
              { path: ADD, component: CategoryFormComponent },
              { path: ':id', component: CategoryFormComponent }
            ]
          },
          {
            path: COLLECTION,
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add', component: CollectionFormComponent },
              { path: ':id', component: CollectionFormComponent }
            ]
          }
        ]
      },
      {
        path: ORDER,
        children: [
          { path: '', component: ListPageComponent },
          // { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: CUSTOMER,
        children: [
          { path: '', component: ListPageComponent },
          // { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: DISCOUNT,
        children: [
          { path: '', redirectTo: 'sale', pathMatch: 'full' },
          {
            path: SALE,
            children: [
              { path: '', component: ListPageComponent },
              { path: ADD, component: SaleFormComponent },
              { path: ':id', component: SaleFormComponent }
            ]
          },
          {
            path: VOUCHER,
            children: [
              { path: '', component: ListPageComponent },
              { path: ADD, component: VoucherFormComponent },
              { path: ':id', component: VoucherFormComponent }
            ]
          },
          {
            path: GIFTCARD,
            children: [
              { path: '', component: ListPageComponent },
              { path: ADD },
              { path: ':id' }
            ]
          }
        ]
      },
      {
        path: PRODUCTATTRIBUTE,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD },
          { path: ':id' }
        ]
      },
      {
        path: PRODUCTTYPE,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD },
          { path: ':id' }
        ]
      },
      {
        path: SHIPPING,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD },
          { path: ':id' }
        ]
      },
      {
        path: WAREHOUSE,
        children: [
          { path: '', component: ListPageComponent },
<<<<<<< HEAD
          { path: 'add',component:WarehouseComponent },
=======
          { path: ADD },
>>>>>>> 72169a17a4b68d545e78677f7aae3d16c9dcdac5
          { path: ':id' }
        ]
      },
      {
        path: STAFF,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD },
          { path: ':id' }
        ]
      },
      { path: 'product-type', component: ProductTypeFormComponent },
      { path: 'attribute', component: AttributeFormComponent },
      { path: 'customer', component: CustomerFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
