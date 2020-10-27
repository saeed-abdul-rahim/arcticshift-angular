import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from '@guards/admin/admin.guard';
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
  TAX,
  VARIANT,
  VOUCHER,
  WAREHOUSE
} from '@constants/routes';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { AttributeFormComponent } from './attribute-form/attribute-form.component';
import { ShippingFormComponent } from './shipping-form/shipping-form.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { VariantFormComponent } from './variant-form/variant-form.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { VoucherFormComponent } from './voucher-form/voucher-form.component';
import { ListPageComponent } from './list-page/list-page.component';
import { ProductTypeFormComponent } from './product-type-form/product-type-form.component';
import { TaxFormComponent } from './tax-form/tax-form.component';
import { CatalogTabListComponent } from './admin-components/catalog-tab-list/catalog-tab-list.component';


const routes: Routes = [
  { path: LOGIN, component: LoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { path: 'tab', component: CatalogTabListComponent },
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
              { path: ':id', component: ProductFormComponent },
              { path: `:id/${VARIANT}/${ADD}`, component: VariantFormComponent },
              { path: `:id/${VARIANT}/:id`, component: VariantFormComponent },
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
              { path: ADD, component: CollectionFormComponent },
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
          // { path: 'add', component: CustomerFormComponent },
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
          { path: ADD, component: AttributeFormComponent },
          { path: ':id', component: AttributeFormComponent }
        ]
      },
      {
        path: PRODUCTTYPE,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD, component: ProductTypeFormComponent },
          { path: ':id', component: ProductTypeFormComponent }
        ]
      },
      {
        path: SHIPPING,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD, component: ShippingFormComponent },
          { path: ':id', component: ShippingFormComponent }
        ]
      },
      {
        path: WAREHOUSE,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD , component: WarehouseComponent },
          { path: ':id', component: WarehouseComponent }
        ]
      },
      {
        path: TAX,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD , component: TaxFormComponent },
          { path: ':id', component: TaxFormComponent }
        ]
      },
      {
        path: STAFF,
        children: [
          { path: '', component: ListPageComponent },
          { path: ADD },
          { path: ':id' }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
