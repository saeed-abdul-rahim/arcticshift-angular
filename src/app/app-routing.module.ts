import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from './guards/admin/admin.guard';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./shop/shop.module').then(m => m.ShopModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [AdminGuard],
    runGuardsAndResolvers: 'always'
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
