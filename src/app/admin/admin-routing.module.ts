import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from 'app/guards/admin/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';
import { ProductFormComponent } from './product-form/product-form.component';


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
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list' },
              { path: 'add', component: ProductFormComponent },
              { path: 'detail/:id' }
            ]
          },
          {
            path: 'category',
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list' },
              { path: 'add' },
              { path: 'detail/:id' }
            ]
          },
          {
            path: 'collection',
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list' },
              { path: 'add' },
              { path: 'detail/:id' }
            ]
          }
        ]
      },
      {
        path: 'orders',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          // { path: 'add' },
          { path: 'detail/:id' }
        ]
      },
      {
        path: 'customers',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          // { path: 'add' },
          { path: 'detail/:id' }
        ]
      },
      {
        path: 'discounts',
        children: [
          { path: '', redirectTo: 'sales', pathMatch: 'full' },
          {
            path: 'sales',
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list' },
              { path: 'add' },
              { path: 'detail/:id' }
            ]
          },
          {
            path: 'vouchers',
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list' },
              { path: 'add' },
              { path: 'detail/:id' }
            ]
          },
          {
            path: 'gift-cards',
            children: [
              { path: '', redirectTo: 'list', pathMatch: 'full' },
              { path: 'list' },
              { path: 'add' },
              { path: 'detail/:id' }
            ]
          }
        ]
      },
      {
        path: 'product-attributes',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          { path: 'add' },
          { path: 'detail/:id' }
        ]
      },
      {
        path: 'product-types',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          { path: 'add' },
          { path: 'detail/:id' }
        ]
      },
      {
        path: 'shipping',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          { path: 'add' },
          { path: 'detail/:id' }
        ]
      },
      {
        path: 'warehouse',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          { path: 'add' },
          { path: 'detail/:id' }
        ]
      },
      {
        path: 'staff',
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          { path: 'list' },
          { path: 'add' },
          { path: 'detail/:id' }
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
