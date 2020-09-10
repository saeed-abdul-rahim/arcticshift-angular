import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from 'app/guards/admin/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminComponent } from './admin.component';


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
              { path: 'add' },
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
          { path: ':id' }
        ]
      },
      {
        path: 'customers',
        children: [
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
