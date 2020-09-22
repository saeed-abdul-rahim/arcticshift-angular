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
import { WarehouseComponent } from './warehouse/warehouse.component';
import { ProductTypeFormComponent } from './product-type-form/product-type-form.component';
import { AttributeFormComponent } from './attribute-form/attribute-form.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { path: 'list-page', component: ListPageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'catalog',
        children: [
          { path: '', redirectTo: 'product', pathMatch: 'full' },
          {
            path: 'product',
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add', component: ProductFormComponent },
              {
                path: ':id', component: ProductFormComponent,
                children: [
                  {
                    path: 'variant',
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
            path: 'category',
            children: [
              { path: '' },
              { path: 'add', component: CategoryFormComponent },
              { path: ':id' }
            ]
          },
          {
            path: 'collection',
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add', component: CollectionFormComponent },
              { path: ':id' }
            ]
          }
        ]
      },
      {
        path: 'orders',
        children: [
          { path: '' },
          // { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'customers',
        children: [
          { path: 'list' },
          // { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'discounts',
        children: [
          { path: '', redirectTo: 'sales', pathMatch: 'full' },
          {
            path: 'sales',
            children: [
              { path: '' },
              { path: 'add', component: SaleFormComponent },
              { path: ':id' }
            ]
          },
          {
            path: 'vouchers',
            children: [
              { path: '' },
              { path: 'add', component: VoucherFormComponent },
              { path: ':id' }
            ]
          },
          {
            path: 'gift-cards',
            children: [
              { path: '' },
              { path: 'add' },
              { path: ':id' }
            ]
          }
        ]
      },
      {
        path: 'product-attributes',
        children: [
          { path: '' },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'product-types',
        children: [
          { path: '' },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'shipping',
        children: [
          { path: '' },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'warehouse',
        children: [
          { path: '' },
          { path: 'add', component: WarehouseComponent },
          { path: ':id' }
        ]
      },
      {
        path: 'staff',
        children: [
          { path: '' },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      { path: 'product-type', component: ProductTypeFormComponent },
      { path: 'attribute', component: AttributeFormComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
