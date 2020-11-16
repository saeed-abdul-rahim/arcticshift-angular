import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CART, CHECKOUT, PRODUCT, WISHLIST } from '@constants/routes';
import { AuthGuard } from '@guards/auth/auth.guard';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { VariantComponent } from './variant/variant.component';
import { WishlistComponent } from './wishlist/wishlist.component';


const routes: Routes = [
  {path: 'sign', component: SignInComponent},
  {
    path: '', component: ShopComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: `${PRODUCT}/:title/:id`, component: VariantComponent },
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
