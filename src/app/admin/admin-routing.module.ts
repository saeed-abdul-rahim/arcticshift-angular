import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from 'app/guards/admin/admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TileComponent } from './admin-components/tile/tile.component';
import { CardComponent } from './admin-components/card/card.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', canLoad: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent }
    ]
  },

  { path: 'tile', component: TileComponent },
  { path: 'card', component: CardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
