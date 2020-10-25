import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CART, CATEGORY, CHECKOUT, COLLECTION, PRODUCT, WISHLIST } from '@constants/routes';
import { CartComponent } from './cart/cart.component';
import { CategoryComponent } from './category/category.component';
import { CheckoutComponent } from './checkout/checkout.component';
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
      { path: `${PRODUCT}/:title/:id`, component: VariantComponent },
      { path: CATEGORY, component: CategoryComponent },
      { path: COLLECTION, component: CollectionComponent },
      { path: WISHLIST, component: WishlistComponent },
      { path: CART, component: CartComponent },
      { path: CHECKOUT, component: CheckoutComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
