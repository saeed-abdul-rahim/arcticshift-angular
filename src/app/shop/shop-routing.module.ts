import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FilterProductComponent } from './filter-product/filter-product.component';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ShopComponent } from './shop.component';


const routes: Routes = [
  {
    path: '', component: ShopComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'prod', component: ProductListComponent },
      { path: 'filter', component: FilterProductComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
