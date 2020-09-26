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


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
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
              { path: '', component: ListPageComponent },
              { path: 'add', component: CategoryFormComponent },
              { path: ':id', component: CategoryFormComponent }
            ]
          },
          {
            path: 'collection',
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add', component: CollectionFormComponent },
              { path: ':id', component: CollectionFormComponent }
            ]
          }
        ]
      },
      {
        path: 'order',
        children: [
          { path: '', component: ListPageComponent },
          // { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'customer',
        children: [
          { path: '', component: ListPageComponent },
          // { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'discount',
        children: [
          { path: '', redirectTo: 'sales', pathMatch: 'full' },
          {
            path: 'sale',
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add', component: SaleFormComponent },
              { path: ':id', component: SaleFormComponent }
            ]
          },
          {
            path: 'voucher',
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add', component: VoucherFormComponent },
              { path: ':id', component: VoucherFormComponent }
            ]
          },
          {
            path: 'gift-card',
            children: [
              { path: '', component: ListPageComponent },
              { path: 'add' },
              { path: ':id' }
            ]
          }
        ]
      },
      {
        path: 'product-attribute',
        children: [
          { path: '', component: ListPageComponent },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'product-type',
        children: [
          { path: '', component: ListPageComponent },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'shipping',
        children: [
          { path: '', component: ListPageComponent },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'warehouse',
        children: [
          { path: '', component: ListPageComponent },
          { path: 'add' },
          { path: ':id' }
        ]
      },
      {
        path: 'staff',
        children: [
          { path: '', component: ListPageComponent },
          { path: 'add' },
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
