import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CART, CATEGORY, CHECKOUT, COLLECTION, PRODUCT, WISHLIST } from '@constants/routes';
import { AuthGuard } from '@guards/auth/auth.guard';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop.component';
import { VariantComponent } from './variant/variant.component';
import { WishlistComponent } from './wishlist/wishlist.component';


const routes: Routes = [
  {
    path: '', component: ShopComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: `${CATEGORY}/:title/:id`, component: HomeComponent },
      { path: `${COLLECTION}/:title/:id`, component: HomeComponent },
      { path: `${PRODUCT}/:title/:id`, component: VariantComponent },
      { path: WISHLIST, component: WishlistComponent, canActivate: [AuthGuard] },
      { path: CART, component: CartComponent, canActivate: [AuthGuard] },
      { path: CHECKOUT, component: CheckoutComponent, canActivate: [AuthGuard] }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
