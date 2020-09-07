import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from 'app/guards/admin/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', canLoad: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
