import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartComponent } from './cart/cart.component';
import { CategoryComponent } from './category/category.component';
import { CollectionComponent } from './collection/collection.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop.component';
import { VariantComponent } from './variant/variant.component';
import { WishlistComponent } from './wishlist/wishlist.component';


const routes: Routes = [
  {
    path: '', component: ShopComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'product/:id', component: VariantComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'collection', component: CollectionComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'cart', component: CartComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
